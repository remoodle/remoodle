from core.db.database import Database
import asyncio


async def start_loop(bot):
    while True:
        await iterate_users_grades(bot)
        await asyncio.sleep(3600)


async def iterate_users_grades(bot):
    print("Checking new grades...")
    db = Database()
    await db.create_connection()
    user_ids = await db.get_all_user_ids()

    if user_ids is None:
        pass
    else:
        for user_id in user_ids:
            await notify_user_grades_difference(user_id, bot)


async def notify_user_grades_difference(user_id, bot):
    db = Database()
    await db.create_connection()
    user_changed_grades = await db.get_grades_difference(user_id)

    if len(user_changed_grades) == 0:
        return
    else:
        for changed_grade in user_changed_grades:
            if changed_grade['old_grade'] < 0:
                grade_state = "NEW GRADE"
                grade = str(changed_grade['new_grade'])
            else:
                grade_state = "UPDATED GRADE"
                grade = str(changed_grade['old_grade']) + ' → ' + str(changed_grade['new_grade'])

            message_text = f"🌟 *{grade_state}* 🌟\n"\
                           + changed_grade['course_name']+'|'+ changed_grade['course_teacher'] + '\n\n'\
                           + f"*{changed_grade['assignment_name']}*" + '\n' + 'Grade: '\
                           + grade
            await bot.send_message(chat_id=user_id, text=message_text, parse_mode="Markdown")
            await bot.send
