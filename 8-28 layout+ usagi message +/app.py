from flask import Flask, render_template, request, jsonify
from backend.calendar_data import CalendarData
from backend import manegeReminder
from datetime import date
import calendar

app = Flask(__name__)
data = CalendarData()

today = date.today()
data.add_bonus(today)

@app.route("/")
def index():
    year = request.args.get('year', type=int) 
    month = request.args.get('month', type=int)

    if not year or not month:
        year = today.year
        month = today.month

    bonus = data.get_bonus(today)
    cal = calendar.Calendar(firstweekday=6) #日曜始まりの週
    month_days = cal.monthdayscalendar(year, month) #その月の日付
    month_name = calendar.month_name[month]
    today_cell = today.day if (year == today.year and month == today.month) else None

    return render_template("index.html", 
                           year=year,
                           month=month,
                           month_name=month_name,
                           month_days=month_days,
                           bonus=bonus,
                           today=today,
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
    if not text or not date or not time:
        return jsonify({"status": "error", "message": "空のリマインダーは保存できません"}), 400

    reminders = manegeReminder.add_reminder(text, date, time)
    return jsonify({"status": "success", "reminders": reminders})

@app.route("/delete_reminder", methods=["POST"])
def delete_reminder():
    data = request.json
    index = data.get("index")

    try:
        index = int(index)
    except (TypeError, ValueError):
        return jsonify({"error": "indexは整数で指定してください"}), 400

    reminders = manegeReminder.load_reminders()
    if 0 <= index < len(reminders):
        del reminders[index]
        manegeReminder.save_reminders(reminders)
        return jsonify({"message": "リマインダーを削除しました"})
    else:
        return jsonify({"error": "無効なindexです"}), 400

if __name__ == "__main__":
    app.run(debug=True)
