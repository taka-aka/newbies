from flask import Flask, render_template, request
import calendar
from datetime import datetime

app = Flask(__name__) 

@app.route('/')
def index():
    year = request.args.get('year', type=int) 
    month = request.args.get('month', type=int)
    today = datetime.today

    # デフォルトの今月のカレンダー
    if not year or not month:
        year = today.year
        month = today.month

    # Pythonにあるカレンダーモジュールを使用しています。
    cal = calendar.Calendar(firstweekday=6) #日曜始まりの週
    month_days = cal.monthdayscalendar(year, month) #その月の日付
    month_name = calendar.month_name[month] #[month]は、1~12月の(英語表記)を格納するリスト

    # 今日の日付にしたいことを投入できる。(その日にマーカーをつけたりできる)
    today_day = today.day if (year == today.year and month == today.month) else None

    #HTMLに必要な変数をまとめて渡す。
    return render_template('calendar.html',
                       year=year,
                       month=month,
                       month_name=month_name,
                       month_days=month_days,
                       today=today.strftime("%Y-%m-%d"),
                       today_day=today_day,
                       bonus="50ポイント",
                       reminders={})  # ← ここを追加！

    #デバッグがしやすくなる。（らしい）
if __name__ == '__main__':
    app.run(debug=True)
