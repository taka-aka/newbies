document.addEventListener("DOMContentLoaded", function () {
  const img = document.getElementById("clickimage");
  const reminderTime = document.getElementById("reminderTime");
  const today = document.getElementById("today").textContent;
  const modal = document.getElementById("reminderModal");
  const reminderText = document.getElementById("reminderText");
  const modalTitle = document.getElementById("modalTitle");
  const deleteBtn = document.getElementById("deleteReminderBtn");
  const cancelBtn = document.getElementById("cancelBtn");
  const saveBtn = document.getElementById("saveBtn");
  const msgBox = document.getElementById("rabbitMessage");

  // 今日の予定だけを #todayList に表示
  async function showTodayReminders() {
    try {
      const res = await fetch("/get_reminders");
      const reminders = await res.json();
      const today = new Date();
      const yyyy = today.getFullYear();
      const mm = String(today.getMonth() + 1).padStart(2, "0");
      const dd = String(today.getDate()).padStart(2, "0");
      const todayStr = `${yyyy}-${mm}-${dd}`;

      const todayList = document.getElementById("todayList");
      todayList.innerHTML = ""; // 一旦リセット

      const todaysReminders = reminders.filter((r) => r.date === todayStr);
      sortList(todaysReminders);

      if (todaysReminders.length === 0) {
        const li = document.createElement("li");
        li.textContent = "今日の予定はありません。";
        todayList.appendChild(li);
      } else {
        todaysReminders.forEach((r) => {
          const li = document.createElement("li");
          li.textContent = `${r.time} - ${r.text}`;
          todayList.appendChild(li);
        });
      }
    } catch (err) {
      console.error("今日の予定の取得に失敗しました", err);
    }
  }

  // ページ読み込み時に取得
  async function loadReminders() {
    const res = await fetch("/get_reminders");
    const data = await res.json();
    refreshReminders();
  }
  loadReminders();
  showTodayReminders();

  const imgList = [
    [
      "/static/img/usagi_hozon.png",
      "/static/img/usagi_uwagaki.png",
      "/static/img/usagi_delete.png",
    ],
    [
      "/static/img/usagi_normal.png",
      "/static/img/usagi_good.png",
      "/static/img/usagi_sleep.png",
      "/static/img/usagi_what.png",
    ], //好感度0~9
    [
      "/static/img/usagi_relax.png",
      "/static/img/usagi_clean.png",
      "/static/img/usagi_outdoor.png",
      "/static/img/usagi_happy.png",
    ], //10~29
    [
      "/static/img/usagi_play.png",
      "/static/img/usagi_real.png",
      "/static/img/usagi_eat.png",
      "/static/img/usagi_study.png",
    ], //30~
  ];
  img.src = imgList[1][0];

  // メッセージリスト
  const reminder_messages = [
    "リマインダーを登録したよ！",
    "リマインダーを上書きしたよ！",
    "リマインダーを消したよ！",
  ];

  const messages = [
    "ぴょんぴょん🐰",
    "今日もがんばってえらい！",
    "zzz...",
    "予定、忘れてない？📅", //好感度0~10
    "おやすみも大事～",
    "おそうじしよっと...",
    "おでかけするの好き？",
    "きょうも来てくれてありがとう！", //11~20
    "ぼくやきゅう好きなんだ！",
    "！！！！！！！！！！",
    "おやつたべた？🥕",
    "おべんきょうもしなくちゃね", //21~30
  ];
  msgBox.textContent = messages[0][0];

  function change_img(index1, index2) {
    img.src = imgList[index1][index2];
  }
  function change_reminderMsg(index) {
    if (msgBox) {
      msgBox.textContent = reminder_messages[index];
      msgBox.classList.add("show");
    }
  }
  function change_msg(index) {
    if (msgBox) {
      msgBox.textContent = messages[index];
      msgBox.classList.add("show");
    }
  }

  img.addEventListener("click", () => {
    setImageByLike();

    function setImageByLike() {
      const available = getLike();
      const availableList = imgList.slice(1, available + 1).flat();
      console.log(availableList);
      if (availableList.length > 0) {
        var random = Math.floor(Math.random() * availableList.length);
        var current = img.src.split("/").pop();
        while (availableList[random].includes(current))
          random = Math.floor(Math.random() * availableList.length);
        img.src = availableList[random];
        setMsgByLike(random);
      }
    }

    function setMsgByLike(index) {
      if (msgBox) {
        msgBox.textContent = messages[index];
        msgBox.classList.add("show");
      }
    }
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
      reminderTime.value = editReminder.time;
      reminderText.value = editReminder.text;
      deleteBtn.style.display = "inline-block";
    } else {
      // 追加モード
      modalTitle.textContent = `リマインダー追加（${day}）`;
      reminderText.value = "";
      deleteBtn.style.display = "none";
    }
    modal.style.display = "flex";
    reminderText.focus();
  }

  function closeModal() {
    modal.style.display = "none";
    currentDay = null;
    editReminderIndex = null;
    reminderText.value = "";
  }

  // ここで document に一度だけクリックリスナー
  document.addEventListener("click", async function (e) {
    const res = await fetch("/get_reminders");
    const reminders = await res.json();
    const td = e.target.closest(".calendar-table td");
    if (!td) return;

    const date = td.getAttribute("data-date");
    if (!date) return;

    if (e.target.classList.contains("reminder-item")) {
      const index = reminders.findIndex(
        (r) => r.text === e.target.title && r.date === date
      );
      if (index !== -1) {
        editReminderIndex = index;
        openModal(date, reminders[index]);
      }
    } else {
      openModal(date);
    }
  });

  cancelBtn.addEventListener("click", closeModal);

  deleteBtn.addEventListener("click", async () => {
    if (editReminder !== null && editReminderIndex !== null) {
      if (
        !confirm(
          `「 ${editReminder.text}-${editReminder.time}」を削除しますか？`
        )
      )
        return;

      const res = await fetch("/delete_reminder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: editReminder.id }),
      });

      const data = await res.json();
      if (data.status === "success") {
        alert(`「${editReminder.text}-${editReminder.time}」を削除しました`);
        change_img(0, 2);
        change_reminderMsg(2);
        // 現在のセルだけ削除
        const container = document.getElementById(
          `reminders-${editReminder.date}`
        );
        if (container) {
          const divs = Array.from(container.children);
          divs.forEach((div) => {
            if (
              div.title === editReminder.text &&
              div.getAttribute("data-time") === editReminder.time
            ) {
              container.removeChild(div);
            }
          });
        }
        await refreshReminders();
        await showTodayReminders();
        closeModal();
      } else {
        alert("削除に失敗しました: " + data.message);
      }
    }
  });

  saveBtn.addEventListener("click", async () => {
    const text = reminderText.value.trim();
    const time = reminderTime.value;
    const date = currentDay;
    if (!text || !time) {
      alert("内容を入力してください");
      return;
    }
    if (currentDay === null) return;

    if (editReminder !== null && editReminderIndex !== null) {
      const res = await fetch("/update_reminder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editReminder.id,
          date: editReminder.date,
          text: text,
          time: time,
        }),
      });
      const data = await res.json();
      if (data.status === "success") {
        change_img(0, 1);
        change_reminderMsg(1);
        refreshReminders(data.reminders);
        closeModal();
      } else {
        alert("更新に失敗しました: " + data.message);
      }
    } else {
      const res = await fetch("/add_reminder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, date, time }),
      });

      const data = await res.json();
      if (data.status === "success") {
        refreshReminders(data.reminders);
        modal.style.display = "none";
        increaseLike(1);
        change_img(0, 0);
        change_reminderMsg(0);
        await showTodayReminders();
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
      reminders.forEach((r) => {
        const day = r.date;
        if (!remindersByDay[day]) remindersByDay[day] = [];
        remindersByDay[day].push({ text: r.text, time: r.time });
      });
      sortList(reminders);

      // カレンダーに反映
      for (const day in remindersByDay) {
        const container = document.getElementById(`reminders-${day}`);
        if (container) {
          container.innerHTML = "";
          remindersByDay[day].forEach((reminder) => {
            const div = document.createElement("div");
            div.className = "reminder-item";
            div.textContent =
              reminder.text.length > 20
                ? reminder.text.slice(0, 20) + "…"
                : reminder.text;
            div.title = reminder.text;
            div.setAttribute("data-day", day);
            div.setAttribute("data-time", reminder.time);
            container.appendChild(div);
          });
        }
      }
    } catch (err) {
      console.error(err);
    }
  }

  // 背景をクリックで閉じる
  window.addEventListener("click", (event) => {
    if (event.target === modal) modal.style.display = "none";
  });
});

function sortList(reminders) {
  reminders.sort((a, b) => {
    if (a.time < b.time) return -1;
    if (a.time > b.time) return 1;
    return 0;
  });
}
