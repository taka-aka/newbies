from flask import Flask, render_template, request, jsonify
from backend.calendar_data import CalendarData
from backend import manegeReminder
from datetime import date, datetime
import calendar
from backend import likeData


app = Flask(__name__)
data = CalendarData()

today = date.today()
data.add_bonus(today)
thistime = datetime.now().strftime("%H:%M:%S")  # 現在時刻を文字列に

@app.route("/")
def index():
    year = request.args.get('year', type=int) or today.year
    month = request.args.get('month', type=int) or today.month
    bonus = data.get_bonus(today)
    cal = calendar.Calendar(firstweekday=6) #日曜始まりの週
    month_days = cal.monthdayscalendar(year, month) #その月の日付
    month_name = calendar.month_name[month]
    today_cell = today.day if (year == today.year and month == today.month) else None
    if not year or not month:
        year = today.year
        month = today.month

    return render_template("index.html", 
                           year=year,
                           month=month,
                           month_name=month_name,
                           month_days=month_days,
                           bonus=bonus,
                           today=today,
                           thistime=thistime,
                           today_cell = today_cell,
                           reminders={}
                           )
    

@app.route("/get_reminders")
def get_reminders():
    return jsonify(manegeReminder.load_reminders())

@app.route("/add_reminder", methods=["POST"])
def add_reminder():
    data = request.get_json()
    text = data.get("text")
    date = data.get("date")
    time = data.get("time")
    if not text or not date:
        return jsonify({"status": "error", "message": "空のリマインダーは保存できません"}), 400

    reminders = manegeReminder.add_reminder(text, date, time)
    return jsonify({"status": "success", "reminders": reminders})

@app.route("/delete_reminder", methods=["POST"])
def delete_reminder():
    data = request.json
    reminder_id = data.get("id")
    if reminder_id is None:
        return jsonify({"status": "error", "message": "IDが指定されていません"}), 400

    reminders = manegeReminder.load_reminders()
    new_reminders = [r for r in reminders if r["id"] != reminder_id]

    if len(new_reminders) == len(reminders):
        return jsonify({"status": "error", "message": "指定IDのリマインダーが見つかりません"}), 400

    manegeReminder.save_reminders(new_reminders)
    return jsonify({"status": "success", "reminders": new_reminders})


@app.route("/update_reminder", methods=["POST"])
def update_reminder():
    data = request.json
    id = data.get("id")
    text = data.get("text")
    date = data.get("date")
    time = data.get("time")
    reminders = manegeReminder.load_reminders()

    for i, r in enumerate(reminders):
        if r["id"] == id:
            reminders[i] = {"id": id, "text": text, "date": date, "time": time}
            manegeReminder.save_reminders(reminders)
            return jsonify({"status": "success", "reminders": reminders})

    return jsonify({"status": "error", "message": "指定IDのリマインダーが見つかりません"}), 400

##### うさぎの好感度 #############################
@app.route("/get_like")
def get_like():
    like = likeData.load_like()
    return jsonify({"like": like})

@app.route("/increase_like", methods=["POST"])
def increase_like():
    data = request.get_json()
    amount = data.get("amount", 0)
    current = likeData.load_like()
    new_like = current + amount
    likeData.save_like(new_like)
    return jsonify({"like": new_like})



if __name__ == "__main__":
    app.run(debug=True)
