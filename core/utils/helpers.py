from aiogram import types, Router
from aiogram.filters import Text
from core.api.api import Api
from core.db.database import Database
from core.utils.gpa import get_gpa_by_grade
from datetime import datetime, timezone, timedelta
import time

router = Router()
db = Database()


@router.message(Text("How to find token?", ignore_case=True))
async def find_moodle_token(message: types.Message):
    await message.answer("To find your token you should go to your moodle profile, "
                         "click on the settings at the top right corner, "
                         "select security keys and copy \"Moodle web service\"")


async def define_token(message: types.Message):
    await db.create_connection()
    full_name = await db.get_full_name(message.from_user.id)
    barcode = await db.get_barcode(message.from_user.id)
    print(str(full_name) + " " + str(barcode))
    await message.answer(f"ID: <pre>{message.from_user.id}</pre>\n" +
                         f"\nToken: <pre>{message.text}</pre>\n" +
                         f"\nBarcode: <pre>{barcode}</pre>\n" +
                         f"\nName: <pre>{full_name}</pre>\n",
                         parse_mode="HTML")


async def create_grades_string(course_id, user_id):
    api = Api()
    await db.create_connection()

    token = await db.get_token(user_id)
    course = await api.get_course(token, course_id)
    course_grades = await api.get_course_grades(token, course_id)

    answer: str = course['name'].split('|')[0] + "\nTeacher:" + course['name'].split('|')[1] + "\n\n"

    answer2 = "\n"
    regmid: float = 0
    regend: float = 0
    final: float = 0

    for assignment in course_grades:
        answer2 += f"*{assignment['name']}*" + " → " + assignment['grade'] + "\n"

        try:
            if str(assignment['name']).lower().__contains__("register midterm"):
                regmid = float(assignment['grade'])
            if str(assignment['name']).lower().__contains__("register endterm"):
                regend = float(assignment['grade'])
            if str(assignment['name']).lower().__contains__("register final"):
                final = float(assignment['grade'])
        except Exception as ex:
            pass

    total = round((regmid+regend)*0.3 + final*0.4)
    if regend >= 25 and regmid >= 25 and (regend + regmid)/2 >= 50 and final >= 50:
        answer += f"*TOTAL* → {total}\n" \
                  f"*GPA* → {get_gpa_by_grade(total)}\n\n"

    if final < 50:
        answer += get_final_grade_info((regmid + regend) / 2)

    answer += answer2
    return answer


async def create_deadlines_string(user_id) -> str:
    await db.create_connection()
    api = Api()
    token = await db.get_token(user_id)
    answer: str = "*Upcoming deadlines:*\n\n"
    deadlines = await api.get_deadlines(token)

    for deadline in deadlines:
        time = get_time_string_by_unix(deadline['remaining'])
        if time is not None:
            time_left = time['remaining']
            date = time['deadline']
            answer += f"📅 *{deadline['name']}* | Time left → {time_left} | Date → {date}\n"

    return answer


def get_time_string_by_unix(unix_time):
    months = {
        1: "Jan",
        2: "Feb",
        3: "Mar",
        4: "Apr",
        5: "May",
        6: "Jun",
        7: "Jul",
        8: "Aug",
        9: "Sep",
        10: "Oct",
        11: "Nov",
        12: "Dec"
    }

    deadline = datetime.fromtimestamp(unix_time)
    remaining = deadline - datetime.utcnow() - timedelta(seconds=21600)

    year = deadline.strftime("%y")
    month = months[int(deadline.strftime("%m"))]
    day = deadline.strftime("%d")
    h = deadline.strftime("%H")
    m = deadline.strftime("%M")

    if remaining.total_seconds() <= 0:
        return

    return {
        "deadline": f"{int(day)} {month} {2000 + int(year)}, {h}:{m}",
        "remaining": str(remaining).split('.')[0] + ""
    }


def get_final_grade_info(term_grade):
    if term_grade < 50:
        return "RETAKE" + "\n"

    scholarship: float = round(((70 - term_grade * 0.6) / 0.4), 2)
    retake: float = round(((50 - term_grade * 0.6) / 0.4), 2)
    answer: str = ""

    if retake <= 50:
        answer += "To avoid retake: FINAL > 50\n"
    else:
        answer += "To avoid retake: FINAL > " + str(retake) + "\n"

    if scholarship <= 50:
        answer += "To save scholarship: FINAL > 50\n"
    else:
        answer += "To save scholarship: FINAL > " + str(scholarship) + "\n"

    return answer


async def change_grade_notification_state(user_id):
    await db.create_connection()
    grade_notification_state = await db.get_grade_notification(user_id)
    if grade_notification_state == 0:
        await db.change_grade_notification(user_id, 1)
    else:
        await db.change_grade_notification(user_id, 0)


async def change_deadline_notification_state(user_id):
    await db.create_connection()
    states = [1, 2, 3, 6, 12, 24, 36, 0]
    deadline_notification_state = await db.get_deadline_notification(user_id)
    await db.change_deadlines_notification(user_id, states[(states.index(deadline_notification_state) + 1) % len(states)])


async def delete_user(user_id):
    await db.create_connection()
    await db.delete_token(user_id)
