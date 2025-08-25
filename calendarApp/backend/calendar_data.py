from datetime import date

class CalendarData:
    def __init__(self):
        self.login_bonus = {}  # 日付ごとのボーナス

    def add_bonus(self, day):
        self.login_bonus[day] = "✔"

    def get_bonus(self, day):
        return self.login_bonus.get(day, "")
