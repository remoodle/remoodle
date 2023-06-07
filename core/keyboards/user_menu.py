from aiogram.types import InlineKeyboardMarkup, InlineKeyboardButton


def main_menu():
    kb = InlineKeyboardMarkup(inline_keyboard=[
        [
            InlineKeyboardButton(
                text="**Deadlines**", callback_data="deadlines"
            ),
        ],
        [
            InlineKeyboardButton(
                text="**Grades**", callback_data="grades"
            )
        ],
        [
            InlineKeyboardButton(
                text="**GPA**", callback_data="gpa"
            ),
            InlineKeyboardButton(
                text="**Settings**", callback_data="settings"
            )
        ]
    ])

    return kb
