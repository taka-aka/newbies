let rabbitLike = 0;
let flag = true;

document.addEventListener("DOMContentLoaded", () => {
  const nameModal = document.getElementById("nameModal");
  const nameInput = document.getElementById("nameInput");
  const saveNameBtn = document.getElementById("saveNameBtn");
  const changeNameBtn = document.getElementById("changeNameBtn");
  const msgBox = document.getElementById("rabbitMessage");
  
  async function r_loadReminders() {
      const res = await fetch("/get_name");
      const data = await res.json();
      if(!data.username) nameModal.style.display = "flex";
      else msgBox.textContent = `${data.username}さんやっほ～`;
  }
  r_loadReminders();

  //初回名前登録
  saveNameBtn.addEventListener("click", async () => {
    const inputName = nameInput.value.trim();
    if (!inputName || !(/^[ぁ-んー゛゜]+$/.test(inputName))) {
      alert("うさぎはひらがなしか読めません🐇");
      return;
    }
    const res = await fetch("/set_name", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({ "username": inputName })
    });
    const data = await res.json();
    if(data.status === "success") {
      rabbitSayHello(inputName);
      nameModal.style.display = "none";
    } else {
      alert("保存に失敗しました: " + data.message);
    }
  }); //save

  changeNameBtn.addEventListener("click", async () => {
    let name = prompt("名前を変更するよ（ひらがなのみ）");
    if (!name || !(/^[ぁ-んー゛゜]+$/.test(name))) {
      alert("うさぎはひらがなしか読めません🐇");
      return;
    }

    const res = await fetch("/set_name", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({ "username": name })
    });

    const data = await res.json();
    if(data.status === "success") {
      nameModal.style.display = "none";
      flag = false;
      rabbitSayHello(name);
    } else {
      alert("保存に失敗しました: " + data.message);
    }    
  });


  function rabbitSayHello(name) {
    const msgBox = document.getElementById("rabbitMessage");
    if(msgBox) {
      if(flag) msgBox.textContent = `${name}さんはじめまして～`;
      else msgBox.textContent = `${name}さんだね！覚えたよ～`;
    }
  }





  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
let like = 0; // ここは JSONからload_like() した値を使う
let talkData = {};
let currentIndex = 0;
let currentTalk = [];
const talkBtn = document.getElementById("talkBtn");
const closeTalkBtn = document.getElementById("closeTalkBtn");

async function loadTalkData() {
  const res = await fetch("/static/talk.json");
  talkData = await res.json();
}

function getTalkLevel(like) {
  if (like < 10) return "low";
  if (like < 30) return "mid";
  return "high";
}

async function startTalk() {
  await loadTalkData();
  const level = getTalkLevel(rabbitLike);
  currentTalk = talkData[level];
  // console.log(currentTalk)
  currentIndex = 0;
  showTalk();
  document.getElementById("talkModal").classList.remove("hidden");
}

function showTalk() {
  const msgBox = document.getElementById("talkMessage");
  const optBox = document.getElementById("talkOptions");
  optBox.innerHTML = "";

  const current = currentTalk[currentIndex];
  if (!current) {
    closeTalk();
    return;
  }

  msgBox.textContent = current.text;

  if (current.options) {
    current.options.forEach(opt => {
      const btn = document.createElement("button");
      btn.textContent = opt;
      btn.onclick = () => {
        // 選択肢によって好感度変化とか
        if (opt === "はい" || opt === "もちろん！") rabbitLike += 5;
        if (opt === "いいえ" || opt === "たぶん…") rabbitLike -= 2;
        save_like(like); // ← Python側と繋ぐならここ
        nextTalk();
      };
      optBox.appendChild(btn);
    });
  } else {
    msgBox.onclick = nextTalk; // クリックで次へ
  }
}

function nextTalk() {
  currentIndex++;
  showTalk();
}

function closeTalk() {
  document.getElementById("talkModal").classList.add("hidden");
}

// イベント登録
talkBtn.addEventListener("click", async () => {
  startTalk();
});
closeTalkBtn.addEventListener("click", async () => {
  closeTalk();
});





});///DOM////////////////////////////////////////////////////////////////////////////////////////////////////////////

// 初期ロード
async function loadLike() {
  try {
    const res = await fetch("/get_like");
    const data = await res.json();
    rabbitLike = data.like || 0;
    updateLikeDisplay();
  } catch (err) {
    console.error(err);
  }
}

// 好感度を増やす
async function increaseLike(amount) {
  try {
    const res = await fetch("/increase_like", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount })
    });
    const data = await res.json();
    rabbitLike = data.like;
    updateLikeDisplay();
  } catch (err) {
    console.error(err);
  }
}

// 表示更新
function updateLikeDisplay() {
  const display = document.getElementById("like-display");
  if (!display) return;
  const hearts = "🥕".repeat(Math.floor(rabbitLike / 5));
  display.textContent = hearts + ` (${rabbitLike})`;
  if (rabbitLike === 10 || rabbitLike === 30) {
    if (rabbitLike === 10) document.getElementById("likeMessage").textContent = `好感度が ${rabbitLike} になりました！ \n うさぎはあなたのことが気になるみたい！`;
    else document.getElementById("likeMessage").textContent = `好感度が ${rabbitLike} になりました！ \n うさぎはあなたのことが好きみたい！`;
    const modal = new bootstrap.Modal(document.getElementById("likeModal"));
    modal.show();
  }
}

function getLike(){
  if(rabbitLike < 10) return 1;
  if(rabbitLike < 30) return 2;
  if(rabbitLike >= 30) return 3;
}

document.addEventListener("DOMContentLoaded", loadLike);
