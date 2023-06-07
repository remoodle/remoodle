from aiogram.types import InlineKeyboardMarkup, InlineKeyboardButton

from core.api.api import Api
from core.db.database import Database


def main_menu():
    kb = InlineKeyboardMarkup(inline_keyboard=[
        [
            InlineKeyboardButton(
                text="Deadlines",
                callback_data="deadlines"
            ),
        ],
        [
            InlineKeyboardButton(
                text="Grades",
                callback_data="grades"
            )
        ],
        [
            InlineKeyboardButton(
                text="GPA",
                callback_data="gpa"
            ),
            InlineKeyboardButton(
                text="Settings",
                callback_data="settings"
            )
        ]
    ])

    return kb


def grades_menu():
    kb = InlineKeyboardMarkup(inline_keyboard=[
        [
            InlineKeyboardButton(
                text="All courses",
                callback_data="grades_menu_all_courses"
            ),
            InlineKeyboardButton(
                text="Current courses",
                callback_data="grades_menu_current_courses"
            )
        ],
        [
            InlineKeyboardButton(
                text="Back ←",
                callback_data="back_to_menu"
            )
        ]
    ])

    return kb


def grades_menu_all_courses(user_id):
    db = Database()
    api = Api()
    token = db.get_token(user_id)
    courses = api.get_user_courses(token)
    inline_keyboard = []

    for course in courses:
        inline_keyboard.append([
            InlineKeyboardButton(
                text=course['shortname'].split("|")[0],
                callback_data=f"course_{course['id']}"
            )
        ])

    inline_keyboard.append([
        InlineKeyboardButton(
            text="Back ←",
            callback_data="back_to_grades"
        )
    ])

    kb = InlineKeyboardMarkup(inline_keyboard=inline_keyboard)
    return kb


def grades_menu_current_courses(user_id):
    db = Database()
    api = Api()
    token = db.get_token(user_id)
    courses = api.get_user_relative_courses(token)
    inline_keyboard = []

    for course in courses:
        inline_keyboard.append([
            InlineKeyboardButton(
                text=course['shortname'].split("|")[0],
                callback_data=f"course_{course['id']}"
            )
        ])

    inline_keyboard.append([
        InlineKeyboardButton(
            text="Back ←",
            callback_data="back_to_grades"
        )
    ])

    kb = InlineKeyboardMarkup(inline_keyboard=inline_keyboard)
    return kb


def back():
    kb = InlineKeyboardMarkup(inline_keyboard=[
        [
            InlineKeyboardButton(
                text="Back",
                callback_data="back_to_menu"
            )
        ]
    ])

    return kb