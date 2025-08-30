let rabbitLike = 0;

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
  const hearts = "♡".repeat(Math.floor(rabbitLike / 5));
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