// 正しいURLからFirebase SDKをインポートします
importScripts("https://www.gstatic.com/firebasejs/8.10.1/firebase-app.js");
importScripts(
  "https://www.gstatic.com/firebasejs/8.10.1/firebase-messaging.js"
);

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

// バックグラウンドで通知を受け取ったときの処理（オプション）
messaging.onBackgroundMessage((payload) => {
  console.log(
    "[firebase-messaging-sw.js] Received background message ",
    payload
  );

  // payload.dataが存在するかチェック
  const notificationTitle = payload.data?.title || "通知";
  const notificationOptions = {
    body: payload.data?.body || "",
    icon: "/static/img/usagi_what.png", // アイコン画像のパス
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
