from core.db.database import Database

db = Database()


async def get_grade_notifications_state(user_id):
    await db.create_connection()
    grade_notification_state = await db.get_grade_notification(user_id)
    if grade_notification_state == 1:
        return "🟢"
    else:
        return "🔴"


async def get_deadline_notifications_state(user_id):
    await db.create_connection()
    deadline_notification_state = await db.get_deadline_notification(user_id)
    if deadline_notification_state != 0:
        deadline_notification_state = str(deadline_notification_state)+" hour(-s) before"
    else:
        deadline_notification_state = '🔴'
    return deadline_notification_state


async def get_user_token(user_id):
    await db.create_connection()
    return await db.get_token(user_id)