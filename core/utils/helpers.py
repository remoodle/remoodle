import asyncio
from aiogram import types, Router, Bot
from core.db.database import User
from core.moodle.moodleservice import Service
from core.utils.gpa import get_gpa_by_grade
from core.encoder.chiper import Enigma
from datetime import datetime
import requests
from core.config.config import BOT_TOKEN, ALERTS_TOKEN, ALERTS_HOST

router = Router()
token = BOT_TOKEN
bot = Bot(token, parse_mode="HTML")


async def find_moodle_token(message: types.Message):
    await message.answer("To find your token you should go to your moodle profile, "
                         "click on the settings at the top right corner, "
                         "select security keys and copy \"Moodle web service\"")


async def send_alert(topic: str, message: str):
    url = f"{ALERTS_HOST}/new"
    headers = {
        "Authorization": "Bearer " + ALERTS_TOKEN
    }
    alert_data = {
        "topic": topic,
        "message": message
    }
    try:
        await requests.post(url, headers=headers, json=alert_data)
    except Exception as e:
        print(f"Error sending alert: {e}")


async def define_token(message: types.Message):
    user = User.objects(telegram_id=message.chat.id)[0]
    full_name = user.full_name
    barcode = user.barcode
        
    asyncio.create_task(send_alert("users", f"Новый юзер:\n{full_name}\n{barcode}"))
    
    await message.answer(f"Welcome, <b>{full_name}</b>!\nType /start to begin using ReMoodle Bot\n\n<pre>ID:\n{message.from_user.id}\n" +
                         f"\nToken:\n{message.text}\n" +
                         f"\nBarcode:\n{barcode}</pre>",
                         parse_mode="HTML")


async def create_grades_string(course_id, user_id):

    user = User.objects(telegram_id=user_id)[0]
    token = Enigma.decrypt(user.hashed_token)
    course = await Service.get_course(token, course_id)
    course_grades = await Service.get_course_grades(token, course_id)

    answer: str = course['name'].split('|')[0] + "\nTeacher:" + course['name'].split('|')[1] + "\n\n"

    answer2 = "\n"
    regmid: float = 0
    regend: float = 0
    final: float = 0

    for assignment in course_grades:
        answer2 += f"*{assignment['name']}*" + " → " + assignment['grade'] + "\n"
        
        if str(assignment['name']).lower().__contains__("attendance"):
            answer2 += "\n"

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
                  f"*GPA* → {get_gpa_by_grade(total)}\n"

    if final < 50:
        answer += get_final_grade_info((regmid + regend) / 2)

    answer += answer2
    return answer


async def create_deadlines_string(user_id) -> str:
    user = User.objects(telegram_id=user_id)[0]
    token = Enigma.decrypt(user.hashed_token)
    deadlines = await Service.get_deadlines(token)
    
    if deadlines is not None and len(deadlines) < 1:
        return "*You have no active deadlines* 🥰"
    
    if deadlines is None:
        return "*Moodle API is currently unavailable* 😨"
    
    
    answer: str = "*Upcoming deadlines* 👉🏻👈🏻\n\n"

    for i, deadline in enumerate(deadlines):
        if str(deadline['deadline_name']).lower().__contains__("attendance"):
            continue
        time = get_time_string_by_unix(deadline['remaining'])
        
        if time is not None:
            time_left = time['remaining']
            date = time['deadline']
            is_firing = "📅"
            
            if time['is_firing']:
                is_firing = "🔥"
            
            answer += f"{is_firing}  *{deadline['deadline_name'][:-7]}*  |  {deadline['course_name']}  |  Date → {date}  |  " \
                      f"Time left → *{time_left}*\n\n"

    return answer


def get_time_string_by_unix(unix_time):
    months = {
        1: "Jan", 2: "Feb", 3: "Mar", 4: "Apr", 5: "May", 6: "Jun",
        7: "Jul", 8: "Aug", 9: "Sep", 10: "Oct", 11: "Nov", 12: "Dec"
    }

    unix_time = int(unix_time)
    deadline = datetime.fromtimestamp(unix_time + 18000)
    deadline_remaining = datetime.fromtimestamp(unix_time)
    remaining = deadline_remaining - datetime.utcnow()
    
    if remaining.total_seconds() <= 0:
        return
    
    is_firing = False
    if remaining.total_seconds() > 0: # 10800 = 3 hours
        is_firing = True

    deadline_str = deadline.strftime("%d %b")
    return {
        "deadline": f"{deadline_str}, {deadline.strftime('%H:%M')}",
        "remaining": str(remaining).split('.')[0],
        "is_firing": is_firing
    }


def get_final_grade_info(term_grade):
    if term_grade < 50:
        return ""

    scholarship: float = round(((70 - term_grade * 0.6) / 0.4), 2)
    retake: float = round(((50 - term_grade * 0.6) / 0.4), 2)
    increased: float = round(((90 - term_grade * 0.6) / 0.4), 2)
    answer: str = ""

    if retake <= 50:
        answer += "🔴 Avoid retake: *final > 50.0*\n"
    else:
        answer += "🔴 Aavoid retake: *final > " + str(retake) + "*\n"

    if scholarship <= 50:
        answer += "🟢 Save scholarship: *final > 50.0*\n"
    else:
        answer += "🟢 Save scholarship: *final > " + str(scholarship) + "*\n"
        
    if increased <= 50:
        answer += "🔵 Increased scholarship: *final > 50.0*\n"
    else:
        if increased > 100:
            answer += f"🔵 Increased scholarship unreachable ({increased})\n"
        else:
            answer += "🔵 Increased scholarship: *final > " + str(increased) + "*\n"

    return answer

async def get_deadline_notifications_state(user):
    deadline_notification_state = user.deadlines_notification
    if deadline_notification_state != 0:
        deadline_notification_state = str(deadline_notification_state)+" hour(-s) before"
    else:
        deadline_notification_state = '🔴'
    return deadline_notification_state

async def get_grade_notifications_state(user):
    grade_notification_state = user.grades_notification
    if grade_notification_state == 1:
        return "🟢"
    else:
        return "🔴"


async def change_grade_notification_state(user):
    grade_notification_state = user.grades_notification
    user.grades_notification = not grade_notification_state
    user.save()


async def change_deadline_notification_state(user):
    states = [1, 2, 3, 6, 12, 24, 0]
    deadline_notification_state = user.deadlines_notification
    user.deadlines_notification = states[(states.index(deadline_notification_state) + 1) % len(states)]
    user.save()


async def get_telegram_username(telgram_id):
    user = await bot.get_chat(telgram_id)
    return user.username

