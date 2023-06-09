from core.db.database import Database

db = Database()

def get_grade_notifications_state(user_id):
    if db.get_grade_notification(user_id) == 1:
        return "🟢"
    else:
        return "🔴"

def get_deadline_notifications_state(user_id):
    deadline_state = db.get_deadline_notification(user_id)
    if deadline_state != 0:
        deadline_state = str(deadline_state)+" hour(-s) before"
    else:
        deadline_state='🔴'
    return deadline_state

def get_user_token(user_id):
    return db.get_token(user_id)