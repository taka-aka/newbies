document.addEventListener("DOMContentLoaded", function () {
    const img = document.getElementById("clickimage");
    const modal = document.getElementById('reminderModal');
    const openReminder = document.getElementById("creReminder");
    const closeReminder = document.getElementById('closeBtn');
    const saveBtn = document.getElementById('saveBtn');
    const reminderText = document.getElementById('reminderText');
    const reminderDate = document.getElementById('reminderDate');    
    const reminderTime = document.getElementById('reminderTime');
    const reminderList = document.getElementById('reminderList');
    const deleteModal = document.getElementById('deleteModal');
    const openDeleReminder = document.getElementById('deleReminder');
    const closeDeleReminder = document.getElementById('closeDeleBtn');
    const deleteList = document.getElementById('deleteList');
    const today = document.getElementById('today').textContent;

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

    openReminder.addEventListener('click', () => {
        modal.style.display = 'flex';
        reminderText.value = ""; //reset TextBox
    });

    closeReminder.addEventListener('click', () => {
        modal.style.display = 'none';
    });

    saveBtn.addEventListener('click', async () => {
      const text = reminderText.value.trim();
      const date = reminderDate.value;
      const time = reminderTime.value;

      if (text === "" || date === "" || time === ""){
        alert("内容・日付・時刻を入力してください");
        return;
      }
      //save in Flask
      const res = await fetch("/add_reminder", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({text, date, time})
      });

      const data = await res.json();
      if (data.status === "success") {
        renderReminders(data.reminders);
        modal.style.display = 'none';
      } else {
        alert("保存に失敗しました");
      }
    });
    
    // display lists
    function renderReminders(reminders) {
      reminderList.innerHTML = "";
      sortList(reminders);
      reminders.forEach(r => {
      const li = document.createElement("li");
        li.textContent = `${r.date} ${r.time} - ${r.text}`;
        reminderList.appendChild(li);
      });

      renderTodayReminders(reminders);
    }
    
    function renderTodayReminders(reminders) {
      // const
      const todayList = document.getElementById("todayList");
      todayList.innerHTML = "";
      const todays = reminders.filter(r => r.date === today);
      if (todays.length === 0) {
        todayList.innerHTML = "<li>予定はありません</li>";
      } else {
        todays.forEach(r => {
          const li = document.createElement("li");
          li.textContent = `${r.time} - ${r.text}`;
          todayList.appendChild(li);
        });
      }
    }

    // ページ読み込み時に取得
    async function loadReminders() {
      const res = await fetch("/get_reminders");
      const data = await res.json();
      renderReminders(data);
    }
    loadReminders();

    //delete button action
    openDeleReminder.addEventListener('click', async () => {
      deleteModal.style.display = 'flex';
      const res = await fetch("/get_reminders");
      const reminders = await res.json();
      deleteList.innerHTML = "";
      reminders.forEach((r, index) => {
        const btn = document.createElement("button");
        btn.textContent = `${r.date} ${r.time} - ${r.text}`;
        //delete action
        btn.addEventListener('click', async () =>{
          if (confirm(`「${r.date} ${r.time} - ${r.text}」を削除しますか？`)) {
            const res = await fetch("/delete_reminder", {
              method: "POST",
              headers: {"Content-Type": "application/json"},
              body: JSON.stringify({index})
            });
            const data = await res.json();
              if (data.status === "success") {
                alert(`${r.date} ${r.time} - ${r.text}を削除しました`);
                  renderReminders(data.reminders);
                  deleteModal.style.display = 'none';
            } else {
              alert("削除に失敗しました");
            }
          }
        });

        deleteList.appendChild(btn);
      });
    });
    closeDeleReminder.addEventListener('click', () => {
        deleteModal.style.display = 'none';
    });

    // 背景をクリックで閉じる
    window.addEventListener('click', (event) => {
      if (event.target === modal) modal.style.display = 'none';
      if (event.target === deleteModal) deleteModal.style.display = 'none';
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

