from datetime import date, datetime
import json
import os
from backend import manegeReminder
from backend import notification_system
from backend import token_db
from dateutil.relativedelta import relativedelta

def my_job():
    print("ジョブが実行されました")

   
    reminder_datas = manegeReminder.load_reminders()
    dt_now = datetime.now().strftime("%Y-%m-%d %H:%M")
    token_data= token_db.load_tokens()
    token = token_data["token"]

    # 送信済み通知の読み込み
    sent_file = os.path.join(os.path.dirname(__file__), '../sent_notifications.json')
    if os.path.exists(sent_file):
        with open(sent_file, 'r', encoding='utf-8') as f:
            try:
                sent_notifications = set(json.load(f))
            except Exception:
                sent_notifications = set()
    else:
        sent_notifications = set()

    def save_sent_notification(key):
        sent_notifications.add(key)
        with open(sent_file, 'w', encoding='utf-8') as f:
            json.dump(list(sent_notifications), f, ensure_ascii=False)

    for reminder_data in reminder_datas :
       reminder_date =reminder_data["date"] + reminder_data["time"]
       reminder_time = datetime.strptime(reminder_date, "%Y-%m-%d%H:%M").replace(second=0, microsecond=0)
       reminder_title = reminder_data["text"]
       #  reminder_token = reminder_data[i]["token"]
      
       # デバッグ用出力
       print(f"dt_now: {dt_now}, reminder_time: {reminder_time.strftime('%Y-%m-%d %H:%M')}, hour_minute: {reminder_time.strftime('%H:%M')}")

       # 既存の相対通知
       key_1day = f"{(reminder_time - relativedelta(days=1)).strftime('%Y-%m-%d %H:%M')}_1day_{reminder_title}"
       key_1hour = f"{(reminder_time - relativedelta(hours=1)).strftime('%Y-%m-%d %H:%M')}_1hour_{reminder_title}"
       key_5min = f"{(reminder_time - relativedelta(minutes=5)).strftime('%Y-%m-%d %H:%M')}_5min_{reminder_title}"

       if dt_now == (reminder_time - relativedelta(days=1)).strftime("%Y-%m-%d %H:%M") and key_1day not in sent_notifications:
        save_sent_notification(key_1day)
        notification_system.send_notification(token,"1日前の通知だよ",reminder_title)
       if dt_now == (reminder_time - relativedelta(hours=1)).strftime("%Y-%m-%d %H:%M") and key_1hour not in sent_notifications:
        save_sent_notification(key_1hour)
        notification_system.send_notification(token,"1時間前の通知だよ",reminder_title)
       if dt_now == (reminder_time - relativedelta(minutes=5)).strftime("%Y-%m-%d %H:%M") and key_5min not in sent_notifications:
        save_sent_notification(key_5min)
        notification_system.send_notification(token,"5分前の通知だよ",reminder_title)
        

    # 毎日決まった時刻に1回だけ通知
    now_hour_minute = datetime.now().strftime("%H:%M")
    key_1008 = f"{date.today().strftime('%Y-%m-%d')}_定時10:08"
    key_1200 = f"{date.today().strftime('%Y-%m-%d')}_定時12:00"
    key_1500 = f"{date.today().strftime('%Y-%m-%d')}_定時15:00"
    key_2100 = f"{date.today().strftime('%Y-%m-%d')}_定時21:00"
    if now_hour_minute == "09:00" and key_1008 not in sent_notifications:
        print("9:00通知条件一致！")
        save_sent_notification(key_1008)
        notification_system.send_notification(token, "おはよう！よていかくにんしない？", "きょうもがんばろ！")
    if now_hour_minute == "12:00" and key_1200 not in sent_notifications:
        print("12:00通知条件一致！")
        save_sent_notification(key_1200)
        notification_system.send_notification(token, "おひるだよ〜", "ごはんたべながら、かれんだーみない？")
    if now_hour_minute == "15:00" and key_1500 not in sent_notifications:
        print("15:00通知条件一致！")
        notification_system.send_notification(token, "おやつのじかんだ~！", "かれんだーもみてほしいなー")
        save_sent_notification(key_1500)
    if now_hour_minute == "21:00" and key_2100 not in sent_notifications:
        print("21:45通知条件一致！")
        save_sent_notification(key_1200)
        notification_system.send_notification(token, "ねむたいな〜", "ぼくはねむいけど、きみがよていをいれるまでおきてるね")
       

def startNotification(scheduler):
    
    print("startNotificationが呼ばれました")
    try:
        if scheduler.running:
            print("すでにスケジューラーは起動しています")
            return
        # 既に同じジョブが登録されていないか確認
        if not scheduler.get_job('my_job'):
            scheduler.add_job(my_job, 'interval', seconds=60, id='my_job')
            print("ジョブを登録しました")
        scheduler.start()
        print("スケジューラーを開始しました") 
    except Exception as e:
        print("スケジューラーの状態確認中にエラーが発生しました:", e)