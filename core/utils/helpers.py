from aiogram import types, Router
from aiogram.filters import Text
from core.api.api import Api
from core.db.database import Database

router = Router()
db = Database()


@router.message(Text("How to find token?", ignore_case=True))
async def find_moodle_token(message: types.Message):
    await message.answer("To find your token you should go to your moodle profile, "
                         "click on the settings at the top right corner, "
                         "select security keys and copy \"Moodle web service\"")


async def define_token(message: types.Message):
    full_name = db.get_full_name(message.from_user.id)
    barcode = db.get_barcode(message.from_user.id)
    print(str(full_name) + " " + str(barcode))
    await message.answer(f"ID: <pre>{message.from_user.id}</pre>\n" +
                         f"\nToken: <pre>{message.text}</pre>\n" +
                         f"\nBarcode: <pre>{barcode}</pre>\n" +
                         f"\nName: <pre>{full_name}</pre>\n",
                         parse_mode="HTML")


def create_grades_string(course_id, user_id):
    api = Api()

    token = db.get_token(user_id)
    course = api.get_course(token, course_id)
    course_grades = api.get_course_grades(token, course_id)

    answer: str = course['name'].split('|')[0] + "\nTeacher:" + course['name'].split('|')[1] + "\n\n"
    # regterm = {
    #     'mid': 0,
    #     'end': 0
    # }

    for assignment in course_grades:
        answer += f"*{assignment['name']}*" + " → " + assignment['grade'] + "\n"
    # if str(assignment['name']).lower().__contains__("endterm"):
    #         regterm['end'] = assignment['percentageformatted'].split(" ")[0]
    #     if str(assignment['name']).lower().__contains__("midterm"):
    #         regterm['mid'] = assignment['percentageformatted'].split(" ")[0]
    #
    # Поменять на get из api endpoint
    # try:
    #     if float(regterm['mid']) > 0 and float(regterm['end']) > 0:
    #         term: float = (float(regterm['mid']) + float(regterm['end'])) / 2
    #         answer += "\n\nREGISTER TERM: " + str(round(term, 2))
    #         answer += get_final_grade_info(term)
    # except Exception as ex:
    #     print(f"[ERROR] Couldn't get regterm grade for User {user_id}\n{ex}")

    return answer


def get_final_grade_info(term_grade):
    scholarship: float = round(((70 - term_grade * 0.6) / 0.4), 2)
    retake: float = round(((50 - term_grade * 0.6) / 0.4), 2)

    print(term_grade)
    print(str(scholarship) + " " + str(retake))

    answer: str = "\n"

    if retake <= 50:
        answer += "To avoid retake: FINAL > 50\n"
    else:
        answer += "To avoid retake: FINAL > " + str(retake) + "\n"

    if scholarship <= 50:
        answer += "To save scholarship: FINAL > 50"
    else:
        answer += "To save scholarship: FINAL > " + str(scholarship)

    return answer
