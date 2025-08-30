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
def send_notification(token: str, title: str, body: str):
    try:
        message = messaging.Message(
        #  notification=messaging.Notification(
        #      title='title',
        #      body='ああ',
        #  ),
        
        token=token,
        webpush=messaging.WebpushConfig(
            headers={
                "TTL": "3600"
            },
            notification=messaging.WebpushNotification(
                title=title,
                body=body
            )
        )
    )

         # Send a message to the device corresponding to the provided
         # registration token.
        response = messaging.send(message)
         # Response is a message ID string.
        print('Successfully sent message:', response)
    except Exception as e:
        print("Failed to send notification:", e)
