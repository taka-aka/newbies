
from datetime import date, datetime
import json
import os
from apscheduler.schedulers.background import BackgroundScheduler

from backend import manegeReminder
from backend import notification_system
from backend import token_db
from dateutil.relativedelta import relativedelta

def my_job():
    print("ジョブが実行されました")
    reminder_datas = manegeReminder.load_reminders()
    dt_now = datetime.now().strftime("%H:%M")
    token_data= token_db.load_tokens()
    token = token_data["token"]

    for reminder_data in reminder_datas :

       reminder_date =reminder_data["date"] + reminder_data["time"]
       reminder_time = datetime.strptime(reminder_date, "%Y-%m-%d%H:%M").replace(second=0, microsecond=0)
       reminder_title = reminder_data["text"]
       #  reminder_token = reminder_data[i]["token"]
      
       
      
       
       if dt_now == (reminder_time - relativedelta(days=1)).strftime("%H:%M"):
              print(token)
              notification_system.send_notification(token,"1日前の通知だよ",reminder_title) 
              
       if dt_now == (reminder_time - relativedelta(hours=1)).strftime("%H:%M"):
              notification_system.send_notification(token,"1時間前の通知だよ",reminder_title) 
             
       if dt_now == (reminder_time - relativedelta(minutes=5)).strftime("%H:%M"):
              notification_system.send_notification(token,"5分前の通知だよ",reminder_title)     
             
       

    
    # print(f"Job executed at {datetime.datetime.now()}")

def start():
    scheduler = BackgroundScheduler()

    scheduler.add_job(my_job, 'interval', seconds=60)
    scheduler.start()
    print("スケジューラーを開始しました")

