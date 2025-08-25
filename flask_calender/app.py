from flask import Flask, render_template, request
import calendar
from datetime import datetime

app = Flask(__name__)

@app.route('/')
def index():
    year = request.args.get('year', type=int)
    month = request.args.get('month', type=int)
    today = datetime.today()
    if not year or not month:
        year = today.year
        month = today.month

    cal = calendar.Calendar(firstweekday=6)
    month_days = cal.monthdayscalendar(year, month)
    month_name = calendar.month_name[month]

    # 今日の日付を渡す（表示月と一致する場合のみ）
    today_day = today.day if (year == today.year and month == today.month) else None

    return render_template('calendar.html',
                       year=year,
                       month=month,
                       month_name=month_name,
                       month_days=month_days,
                       today=today.strftime("%Y-%m-%d"),
                       today_day=today_day,
                       bonus="50ポイント",
                       reminders={})  # ← ここを追加！

if __name__ == '__main__':
    app.run(debug=True)
