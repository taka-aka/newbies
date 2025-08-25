from flask import Flask, render_template, request,jsonify
from backend.calendar_data import CalendarData
from backend import manegeReminder
from datetime import date

app = Flask(__name__)
data = CalendarData()

today = date.today().isoformat()
data.add_bonus(today)

@app.route("/")
def index():
    bonus = data.get_bonus(today)
    return render_template("index.html", bonus=bonus, today=today)
    
# @app.route("/get_todayReminders")
# def get_todayReminders():
#     reminders = manegeReminder.load_reminders()
#     todayList = [r for r in reminders if r["date"] == str(today)]
#     return jsonify(todayList)

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
  reminders = manegeReminder.load_reminders()
  if 0 <= index < len(reminders):
      reminders.pop(index)
      manegeReminder.save_reminders(reminders)
      return jsonify({"status": "success", "reminders": reminders})
  return jsonify({"status": "error", "message": "Invalid index"})

if __name__ == "__main__":
    app.run(debug=True)
