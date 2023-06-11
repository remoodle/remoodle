from aiogram.types import InlineKeyboardMarkup, InlineKeyboardButton

from core.api.api import Api
from core.utils.keyboard_utils import *


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


async def grades_menu_all_courses(user_id):
    api = Api()
    token = await get_user_token(user_id)
    courses = await api.get_user_all_courses(token)
    inline_keyboard = []

    for course in courses:
        inline_keyboard.append([
            InlineKeyboardButton(
                text=course['name'].split("|")[0],
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


async def grades_menu_current_courses(user_id):
    api = Api()
    token = await get_user_token(user_id)
    courses = await api.get_user_relative_courses(token)
    inline_keyboard = []

    for course in courses:
        inline_keyboard.append([
            InlineKeyboardButton(
                text=course['name'].split("|")[0],
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


async def settings(user_id):
    grades_state = await get_grade_notifications_state(user_id)
    deadline_state = await get_deadline_notifications_state(user_id)

    kb = InlineKeyboardMarkup(inline_keyboard=[
        [
            InlineKeyboardButton(
                text=f"Grades notifications: {grades_state}",
                callback_data="grades_notifications_settings"
            ),
        ],
        [
            InlineKeyboardButton(
                text=f"Deadline notifications {deadline_state}",
                callback_data="deadlines_notifications_settings"
            )
        ],
        [
            InlineKeyboardButton(
                text="Contact us",
                callback_data="contact_us_menu"
            ),
            InlineKeyboardButton(
                text="Log out",
                callback_data="token_settings"
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


def change_token_confirmation():
    kb = InlineKeyboardMarkup(inline_keyboard=[
        [
            InlineKeyboardButton(
                text="Yes",
                callback_data="change_token_yes"
            ),
            InlineKeyboardButton(
                text="No",
                callback_data="back_to_settings"
            )
        ],
    ])

    return kb


def contacts():
    # <a href="https://t.me/y_abdrakhmanov">Yelnur Abdrakhmanov</a>

    kb = InlineKeyboardMarkup(inline_keyboard=[
        [
            InlineKeyboardButton(
                text="Yelnur Abdrakhmanov",
                url="https://t.me/y_abdrakhmanov"
            )
        ],
        [
            InlineKeyboardButton(
                text="Karen Ananyan",
                url="https://t.me/dek_kar"
            )
        ],
        [
            InlineKeyboardButton(
                text="Back ←",
                callback_data="back_to_settings"
            )
        ]
    ])

    return kb


def back(callback_data: str):
    kb = InlineKeyboardMarkup(inline_keyboard=[
        [
            InlineKeyboardButton(
                text="Back ←",
                callback_data=callback_data
            )
        ]
    ])

    return kb