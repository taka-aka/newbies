import firebase_admin
from firebase_admin import credentials, messaging


cred = credentials.Certificate("newbies-2f68d-firebase-adminsdk-fbsvc-e43871ac79.json")
firebase_admin.initialize_app(cred)

# This registration token comes from the client FCM SDKs.

# 初期化済みかどうかを確認して、まだなら初期化
if not firebase_admin._apps:
    cred = credentials.Certificate("newbies-2f68d-firebase-adminsdk-fbsvc-e43871ac79.json")
    firebase_admin.initialize_app(cred)

# See documentation on defining a message payload.
icon_url = "http://localhost:5000/static/img/usagi_what.png"  # ここに使いたい画像のURLを指定
def send_notification(token: str, title: str, body: str, icon_url: str = None):
    try:
        notification_kwargs = {
            "title": title,
            "body": body
        }
        if icon_url:
            notification_kwargs["icon"] = icon_url

        message = messaging.Message(
            token=token,
            webpush=messaging.WebpushConfig(
                headers={
                    "TTL": "3600"
                },
                data= notification_kwargs
            )
        )

        response = messaging.send(message)
        print('Successfully sent message:', response)
    except Exception as e:
        print("Failed to send notification:", e)
