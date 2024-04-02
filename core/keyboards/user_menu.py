from aiogram.types import InlineKeyboardMarkup, InlineKeyboardButton, WebAppInfo
from core.encoder.chiper import Enigma
from core.utils.helpers import get_grade_notifications_state, get_deadline_notifications_state
from core.moodle.moodleservice import Service
from core.db.database import User


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
                text="Map",
                web_app=WebAppInfo(url="https://yuujiso.github.io/aitumap/")
            ),
            InlineKeyboardButton(
                text="Other",
                callback_data="other"
            )
        ]

    ])

    return kb

async def grades_menu(user_id):
    user = User.objects(telegram_id=user_id)[0]
    token = Enigma.decrypt(user.hashed_token)
    courses = await Service.get_relative_courses(token)
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
            callback_data="back_to_menu"
        )
    ])
    kb = InlineKeyboardMarkup(inline_keyboard=inline_keyboard)
    return kb


async def settings(user):
    deadline_state = await get_deadline_notifications_state(user)
    grades_state = await get_grade_notifications_state(user)

    kb = InlineKeyboardMarkup(inline_keyboard=[
        [
            InlineKeyboardButton(
                text="Deadline notifications " + deadline_state,
                callback_data="deadline_notifications"
            )
        ],
        [
            InlineKeyboardButton(
                text="Grades notifications " + grades_state,
                callback_data="grade_notifications"
            )
        ],
        [
            InlineKeyboardButton(
                text="Close",
                callback_data="close_settings"
            )
        ]
    ])

    return kb


async def other():

    kb = InlineKeyboardMarkup(inline_keyboard=[
        [
            InlineKeyboardButton(
                text="User agreement",
                url="https://docs.google.com/document/d/1Itst8gLUUwoKhBws1h8MW7Ceup5Z1-5FKL4KYFzEQPA/edit?usp=sharing"
            )

        ],
        [
            InlineKeyboardButton(
                text="Contact us",
                url="https://t.me/+ltR0DSdwf6c4MTFi"
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
