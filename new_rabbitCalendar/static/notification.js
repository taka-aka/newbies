// importScripts("https://www.gstatic.com/firebasejs/8.10.1/firebase-app.js");
// importScripts(
//   "https://www.gstatic.com/firebasejs/8.10.1/firebase-messaging.js"
// );
// importScripts(
//   "https://www.gstatic.com/firebasejs/8.10.1/firebase-firestore.js"
// );

// ★★★ここにあなたのFirebaseプロジェクトの設定を貼り付けてください★★★
const firebaseConfig = {
  apiKey: "AIzaSyB-XcH5jSmiu0TfqBmcH-Zj2B9ka3b6l5o",
  authDomain: "newbies-2f68d.firebaseapp.com",
  projectId: "newbies-2f68d",
  storageBucket: "newbies-2f68d.firebasestorage.app",
  messagingSenderId: "14560235622",
  appId: "1:14560235622:web:b29a412c59093440261da7",
};
// ★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★

// Firebaseを初期化
firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();
const db = firebase.firestore();

// ★★★ここにあなたのVAPIDキーを貼り付けてください★★★
messaging.usePublicVapidKey(
  "BE5pLSFmAbkNOQshXIbhIL_9B8r8HPc9JSgyL8a9fpGDCKgMzRbXXGIDL8mmlZ-KdvmE0DV9RSZkxvdNmXMPDug"
);
// ★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★

const permissionBtn = document.getElementById("permission-btn");
permissionBtn.addEventListener("click", () => {
  console.log("1. ボタンがクリックされました。");

  Notification.requestPermission()
    .then((permission) => {
      if (permission === "granted") {
        console.log("2. 通知の許可が得られました。トークンを取得します...");
        return messaging.getToken();
      } else {
        console.error("通知の許可が得られませんでした。");
      }
    })
    .then((token) => {
      if (token) {
        console.log("3. トークンが取得できました:", token);
        fetch("/send_token", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ token: token }),
        })
          .then((res) => res.json())
          .then((data) => {
            console.log("トークン送信完了: " + data.status);
          });
        console.log("4. Firestoreへの保存を開始します...");

        // トークンをFirestoreに保存
        db.collection("fcmTokens")
          .doc(token)
          .set({
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
          })
          .then(() => {
            console.log("5. Firestoreへの保存が成功しました！");
            alert(
              "トークンの保存が完了しました！Firestoreを確認してください。"
            );
          })
          .catch((err) => {
            // Firestoreへの保存でエラーが起きたら、これを表示
            console.error(
              "★★★Firestoreへの保存中にエラーが発生しました★★★",
              err
            );
            alert(
              "Firestoreへの保存中にエラーが発生しました。コンソールを確認してください。"
            );
          });
      } else {
        console.log("トークンが取得できませんでした。");
      }
    })
    .catch((err) => {
      console.error("★★★トークン取得中にエラーが発生しました★★★", err);
    });
});
navigator.serviceWorker.register("/static/firebase-messaging-sw.js");
