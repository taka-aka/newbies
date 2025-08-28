document.addEventListener("DOMContentLoaded", function () {
    const img = document.getElementById("clickimage");
    // const modal = document.getElementById('reminderModal');
    // const openReminder = document.getElementById("creReminder");
    // const closeReminder = document.getElementById('closeBtn');
    // const saveBtn = document.getElementById('saveBtn');
    // const reminderText = document.getElementById('reminderText');
    // const reminderDate = document.getElementById('reminderDate');    
    // const reminderTime = document.getElementById('reminderTime');
    // const reminderList = document.getElementById('reminderList');
    // const deleteModal = document.getElementById('deleteModal');
    // const openDeleReminder = document.getElementById('deleReminder');
    // const closeDeleReminder = document.getElementById('closeDeleBtn');
    // const deleteList = document.getElementById('deleteList');
    const today = document.getElementById('today').textContent;
    const modal = document.getElementById('reminderModal');
    const reminderText = document.getElementById('reminderText');
    const modalTitle = document.getElementById('modalTitle');
    const deleteBtn = document.getElementById('deleteReminderBtn');
    const cancelBtn = document.getElementById('cancelBtn');
    const saveBtn = document.getElementById('saveBtn');

    const imgList = [ "/static/img/usagi1.png",
                      "/static/img/usagi2.png",
                      "/static/img/usagi3.png",
                      "/static/img/usagi4.png"];
    img.src = imgList[0];

    img.addEventListener('click', () => {
      var current = img.src.split('/').pop(); // 今の画像ファイル名
      var random = Math.floor( Math.random() * (3 + 1 - 1) ) + 1;
      while(imgList[random].includes(current)) random = Math.floor( Math.random() * (3 + 1 - 1) ) + 1;
      img.src = imgList[random];
    });

    const remindersData = [];      //jsonファイルに保存
    let currentDay = null;
    let editingReminderIndex = null;

    // Helper: 保存時にサーバーに送る処理は未実装。ローカルのみの簡易版

    function openModal(day, reminderIndex = null) {
        currentDay = day;
        editingReminderIndex = reminderIndex;
        if (reminderIndex !== null) {
            // 編集モード
            modalTitle.textContent = `リマインダー編集（${day}日）`;
            reminderText.value = remindersData[day][reminderIndex];
            deleteBtn.style.display = 'inline-block';
        } else {
            // 追加モード
            modalTitle.textContent = `リマインダー追加（${day}日）`;
            reminderText.value = '';
            deleteBtn.style.display = 'none';
        }
        modal.classList.add('active');
        reminderText.focus();
    }

    function closeModal() {
        modal.classList.remove('active');
        currentDay = null;
        editingReminderIndex = null;
        reminderText.value = '';
    }

    // カレンダーの日付セルクリック時の処理
    document.querySelectorAll('.calendar-table td').forEach(td => {
        td.addEventListener('click', e => {
            const day = td.getAttribute('data-day');
            if (!day) return;

            // クリックされた箇所がリマインダーなら編集、そうでなければ追加
            if (e.target.classList.contains('reminder-item')) {
                const remindersForDay = remindersData[day] || [];
                const reminderTextClicked = e.target.textContent;
                const index = remindersForDay.findIndex(r => r.startsWith(reminderTextClicked));
                if(index !== -1) {
                    openModal(day, index);
                }
            } else {
                openModal(day);
            }
        });
    });

    cancelBtn.addEventListener('click', closeModal);

    deleteBtn.addEventListener('click', () => {
        if (currentDay !== null && editingReminderIndex !== null) {
            remindersData[currentDay].splice(editingReminderIndex, 1);
            if (remindersData[currentDay].length === 0) {
                delete remindersData[currentDay];
            }
            refreshReminders();
            closeModal();
        }
    });

    // openDeleReminder.addEventListener('click', async () => {
    //   deleteModal.style.display = 'flex';
    //   const res = await fetch("/get_reminders");
    //   const reminders = await res.json();
    //   deleteList.innerHTML = "";
    //   reminders.forEach((r, index) => {
    //     const btn = document.createElement("button");
    //     btn.textContent = `${r.date} ${r.time} - ${r.text}`;
    //     //delete action
    //     btn.addEventListener('click', async () =>{
    //       if (confirm(`「${r.date} ${r.time} - ${r.text}」を削除しますか？`)) {
    //         const res = await fetch("/delete_reminder", {
    //           method: "POST",
    //           headers: {"Content-Type": "application/json"},
    //           body: JSON.stringify({index})
    //         });
    //         const data = await res.json();
    //           if (data.status === "success") {
    //             alert(`${r.date} ${r.time} - ${r.text}を削除しました`);
    //               renderReminders(data.reminders);
    //               deleteModal.style.display = 'none';
    //         } else {
    //           alert("削除に失敗しました");
    //         }
    //       }
    //     });

    //     deleteList.appendChild(btn);
    //   });
    // });
    // closeDeleReminder.addEventListener('click', () => {
    //     deleteModal.style.display = 'none';
    // });

    saveBtn.addEventListener('click', () => {
        const text = reminderText.value.trim();
        if (!text) {
            alert('内容を入力してください');
            return;
        }
        if (currentDay === null) return;

        if (!remindersData[currentDay]) {
            remindersData[currentDay] = [];
        }

        if (editingReminderIndex !== null) {
            // 編集モード
            remindersData[currentDay][editingReminderIndex] = text;
        } else {
            // 追加モード
            remindersData[currentDay].push(text);
        }
        refreshReminders();
        closeModal();
    });

    function refreshReminders() {
        for (const day in remindersData) {
            const container = document.getElementById(`reminders-${day}`);
            if (container) {
                container.innerHTML = '';
                remindersData[day].forEach(text => {
                    const div = document.createElement('div');
                    div.className = 'reminder-item';
                    div.textContent = text.length > 20 ? text.slice(0,20) + '…' : text;
                    div.title = text;
                    div.setAttribute('data-day', day);
                    container.appendChild(div);
                });
            }
        }
    }

    const cells = document.querySelectorAll(".calendar-cell");

    cells.forEach(cell => {
        cell.addEventListener("click", function () {
            const selectedDate = this.dataset.date;
            openReminderModal(selectedDate);
        });
    });

    function openReminderModal(date) {
        const data = getReminderData();
        const reminders = data[date] || [];

        let modalHtml = `
            <div class="modal-backdrop" id="modalBackdrop">
                <div class="modal-content-box">
                    <h2>${date} のリマインダー</h2>
                    <ul id="reminderListInModal">
        `;

        reminders.forEach((reminder, index) => {
            modalHtml += `
                <li>
                    <span class="reminder-text" data-index="${index}">${reminder}</span>
                    <button class="edit-btn" data-index="${index}">✏️</button>
                    <button class="delete-btn" data-index="${index}">🗑️</button>
                </li>`;
        });

        modalHtml += `
                    </ul>
                    <input type="text" id="reminderInput" placeholder="新しいリマインダーを追加"><br>
                    <button id="saveReminderBtn">追加</button>
                    <button id="closeReminderBtn">閉じる</button>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML("beforeend", modalHtml);

        document.getElementById("closeReminderBtn").onclick = () => {
            document.getElementById("modalBackdrop").remove();
        };

        document.getElementById("saveReminderBtn").onclick = () => {
            const content = document.getElementById("reminderInput").value.trim();
            if (content !== "") {
                saveReminder(date, content);
                document.getElementById("modalBackdrop").remove();
            }
        };

        document.querySelectorAll(".delete-btn").forEach(btn => {
            btn.onclick = () => {
                const index = btn.dataset.index;
                deleteReminder(date, index);
                document.getElementById("modalBackdrop").remove();
            };
        });

        document.querySelectorAll(".edit-btn").forEach(btn => {
            btn.onclick = () => {
                const index = btn.dataset.index;
                const newContent = prompt("リマインダーを編集:", reminders[index]);
                if (newContent !== null && newContent.trim() !== "") {
                    editReminder(date, index, newContent.trim());
                    document.getElementById("modalBackdrop").remove();
                }
            };
        });
    }

    function saveReminder(date, content) {
        const data = getReminderData();
        if (!data[date]) data[date] = [];
        data[date].push(content);
        localStorage.setItem("reminders", JSON.stringify(data));
        displayReminders();
    }

    // saveBtn.addEventListener('click', async () => {
    //   const text = reminderText.value.trim();
    //   const date = reminderDate.value;
    //   const time = reminderTime.value;

    //   if (text === "" || date === "" || time === ""){
    //     alert("内容・日付・時刻を入力してください");
    //     return;
    //   }
    //   //save in Flask
    //   const res = await fetch("/add_reminder", {
    //     method: "POST",
    //     headers: {"Content-Type": "application/json"},
    //     body: JSON.stringify({text, date, time})
    //   });

    //   const data = await res.json();
    //   if (data.status === "success") {
    //     renderReminders(data.reminders);
    //     modal.style.display = 'none';
    //   } else {
    //     alert("保存に失敗しました");
    //   }
    // });

    function deleteReminder(date, index) {
        const data = getReminderData();
        data[date].splice(index, 1);
        if (data[date].length === 0) delete data[date];
        localStorage.setItem("reminders", JSON.stringify(data));
        displayReminders();
    }

    function editReminder(date, index, newContent) {
        const data = getReminderData();
        data[date][index] = newContent;
        localStorage.setItem("reminders", JSON.stringify(data));
        displayReminders();
    }

    function getReminderData() {
        return JSON.parse(localStorage.getItem("reminders") || "{}");
    }

    function displayReminders() {
        const data = getReminderData();
        document.querySelectorAll(".calendar-cell").forEach(cell => {
            const date = cell.dataset.date;
            const reminders = data[date] || [];

            let existing = cell.querySelector(".reminder-preview");
            if (existing) existing.remove();

            if (reminders.length > 0) {
                const preview = document.createElement("div");
                preview.className = "reminder-preview";
                preview.innerText = reminders[0].slice(0, 20);
                cell.appendChild(preview);
            }
        });
    }

    displayReminders();

    








    // openReminder.addEventListener('click', () => {
    //     modal.style.display = 'flex';
    //     reminderText.value = ""; //reset TextBox
    // });

    // closeReminder.addEventListener('click', () => {
    //     modal.style.display = 'none';
    // });

    // saveBtn.addEventListener('click', async () => {
    //   const text = reminderText.value.trim();
    //   const date = reminderDate.value;
    //   const time = reminderTime.value;

    //   if (text === "" || date === "" || time === ""){
    //     alert("内容・日付・時刻を入力してください");
    //     return;
    //   }
    //   //save in Flask
    //   const res = await fetch("/add_reminder", {
    //     method: "POST",
    //     headers: {"Content-Type": "application/json"},
    //     body: JSON.stringify({text, date, time})
    //   });

    //   const data = await res.json();
    //   if (data.status === "success") {
    //     renderReminders(data.reminders);
    //     modal.style.display = 'none';
    //   } else {
    //     alert("保存に失敗しました");
    //   }
    // });
    
    // display lists
    // function renderReminders(reminders) {
    //   reminderList.innerHTML = "";
    //   sortList(reminders);
    //   reminders.forEach(r => {
    //   const li = document.createElement("li");
    //     li.textContent = `${r.date} ${r.time} - ${r.text}`;
    //     reminderList.appendChild(li);
    //   });

    //   renderTodayReminders(reminders);
    // }
    
    // function renderTodayReminders(reminders) {
    //   // const
    //   const todayList = document.getElementById("todayList");
    //   todayList.innerHTML = "";
    //   const todays = reminders.filter(r => r.date === today);
    //   if (todays.length === 0) {
    //     todayList.innerHTML = "<li>予定はありません</li>";
    //   } else {
    //     todays.forEach(r => {
    //       const li = document.createElement("li");
    //       li.textContent = `${r.time} - ${r.text}`;
    //       todayList.appendChild(li);
    //     });
    //   }
    // }

    // // ページ読み込み時に取得
    // async function loadReminders() {
    //   const res = await fetch("/get_reminders");
    //   const data = await res.json();
    //   renderReminders(data);
    // }
    // loadReminders();

    // //delete button action
    // openDeleReminder.addEventListener('click', async () => {
    //   deleteModal.style.display = 'flex';
    //   const res = await fetch("/get_reminders");
    //   const reminders = await res.json();
    //   deleteList.innerHTML = "";
    //   reminders.forEach((r, index) => {
    //     const btn = document.createElement("button");
    //     btn.textContent = `${r.date} ${r.time} - ${r.text}`;
    //     //delete action
    //     btn.addEventListener('click', async () =>{
    //       if (confirm(`「${r.date} ${r.time} - ${r.text}」を削除しますか？`)) {
    //         const res = await fetch("/delete_reminder", {
    //           method: "POST",
    //           headers: {"Content-Type": "application/json"},
    //           body: JSON.stringify({index})
    //         });
    //         const data = await res.json();
    //           if (data.status === "success") {
    //             alert(`${r.date} ${r.time} - ${r.text}を削除しました`);
    //               renderReminders(data.reminders);
    //               deleteModal.style.display = 'none';
    //         } else {
    //           alert("削除に失敗しました");
    //         }
    //       }
    //     });

    //     deleteList.appendChild(btn);
    //   });
    // });
    // closeDeleReminder.addEventListener('click', () => {
    //     deleteModal.style.display = 'none';
    // });

    // 背景をクリックで閉じる
    // window.addEventListener('click', (event) => {
    //   if (event.target === modal) modal.style.display = 'none';
    //   if (event.target === deleteModal) deleteModal.style.display = 'none';
    // });

});

function sortList(reminders){
  reminders.sort((a, b) => {
    if(a.date < b.date) return -1;
    if(a.date > b.date) return 1;
    if(a.time < b.time) return -1;
    if(a.time > b.time) return 1;
    return 0;
  });
}

