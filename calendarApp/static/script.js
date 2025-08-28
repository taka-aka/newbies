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


    // ページ読み込み時に取得
    async function loadReminders() {
      const res = await fetch("/get_reminders");
      const data = await res.json();
      refreshReminders();
    }
    loadReminders();

    img.addEventListener('click', () => {
      var current = img.src.split('/').pop(); // 今の画像ファイル名
      var random = Math.floor( Math.random() * (3 + 1 - 1) ) + 1;
      while(imgList[random].includes(current)) random = Math.floor( Math.random() * (3 + 1 - 1) ) + 1;
      img.src = imgList[random];
    });

    let currentDay = null;
    let editReminderIndex = null;
    let editReminder = null;

    function openModal(day, reminderToEdit = null) {
        currentDay = day;
        editReminder = reminderToEdit;
        if (editReminder !== null) {
            // 編集モード
            modalTitle.textContent = `リマインダー編集（${day}）`;
            reminderText.value = editReminder.text;
            deleteBtn.style.display = 'inline-block';
        } else {
            // 追加モード
            modalTitle.textContent = `リマインダー追加（${day}）`;
            reminderText.value = '';
            deleteBtn.style.display = 'none';
        }
        modal.style.display ='flex'
        reminderText.focus();
    }

    function closeModal() {
        modal.style.display = 'none';
        currentDay = null;
        editReminderIndex = null;
        reminderText.value = '';
    }

    // ここで document に一度だけクリックリスナー
    document.addEventListener('click', async function(e) {
        const res = await fetch("/get_reminders");
        const reminders = await res.json();
        const td = e.target.closest('.calendar-table td');
        if (!td) return;

        const date = td.getAttribute('data-date');
        if (!date) return;

        if (e.target.classList.contains('reminder-item')) {
            const index = reminders.findIndex(r => r.text === e.target.title && r.date === date);
            if (index !== -1) {
                editReminderIndex = index;
                openModal(date, reminders[index]);
            }
        } else {
            openModal(date);
        }
    });


    cancelBtn.addEventListener('click', closeModal);

    deleteBtn.addEventListener('click', async () => {
        if (editReminder !== null && editReminderIndex !== null) {
            if(!confirm(`「 ${editReminder.text}」を削除しますか？`)) return;

            const res = await fetch('/delete_reminder', {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({id: editReminder.id})
            });

            const data = await res.json();
            if (data.status === "success") {
              alert(`「${editReminder.text}」を削除しました`);
              // 現在のセルだけ削除
              const container = document.getElementById(`reminders-${editReminder.date}`);
              if (container) {
                const divs = Array.from(container.children);
                divs.forEach(div => {
                  if (div.title === editReminder.text) {
                    container.removeChild(div);
                  }
                });
              }

              refreshReminders();
              closeModal();
            } else {
              alert("削除に失敗しました: " + data.message);
            }
        }
    });

    saveBtn.addEventListener('click', async () => {
        const text = reminderText.value.trim();
        const date = currentDay
        if (!text) {
            alert('内容を入力してください');
            return;
        }
        if (currentDay === null) return;

        if(editReminder !== null && editReminderIndex !== null) {
            const res = await fetch("/update_reminder", {
              method: "POST",
              headers: {"Content-Type": "application/json"},
              body: JSON.stringify({
                id: editReminder.id,
                date: editReminder.date,
                text: text
            })
          });
          const data = await res.json();
            if (data.status === "success") {
                refreshReminders(data.reminders);
                closeModal();
            } else {
                alert("更新に失敗しました: " + data.message);
            }
        }else{
          const res = await fetch("/add_reminder", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({text, date})
          });

          const data = await res.json();
          if (data.status === "success") {
            refreshReminders(data.reminders);
            modal.style.display = 'none';
          } else {
            alert("保存に失敗しました: " + data.message);
          }
        }
        refreshReminders();
        closeModal();
    });
    

    async function refreshReminders() {
     try {
        const res = await fetch("/get_reminders");
        const reminders = await res.json();

        // 日付ごとに整理
        const remindersByDay = {};
        reminders.forEach(r => {
            const day = r.date;
            if (!remindersByDay[day]) remindersByDay[day] = [];
            remindersByDay[day].push(r.text);
        });

        // カレンダーに反映
        for (const day in remindersByDay) {
            const container = document.getElementById(`reminders-${day}`);
            if (container) {
                container.innerHTML = '';
                remindersByDay[day].forEach(text => {
                    const div = document.createElement('div');
                    div.className = 'reminder-item';
                    div.textContent = text.length > 20 ? text.slice(0,20) + '…' : text;
                    div.title = text;
                    div.setAttribute('data-day', day);
                    container.appendChild(div);
                });
            }
        }
      } catch (err) {
        console.error(err);
      }
    }

    // 背景をクリックで閉じる
    window.addEventListener('click', (event) => {
      if (event.target === modal) modal.style.display = 'none';
    });

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

