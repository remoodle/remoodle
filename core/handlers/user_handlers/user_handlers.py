from aiogram import Router, types
from aiogram.filters import Command
from aiogram.fsm.context import FSMContext
from aiogram.utils.keyboard import *
from core.db.database import Database
from core.api.api import Api
from core.keyboards.user_menu import *
from core.utils.statesform import StepsForm
from core.utils.helpers import *

router = Router()


@router.message(Command("start"))
async def get_moodle_token(message: types.Message, state: FSMContext):
    db = Database()
    api = Api()
    user_id = message.from_user.id

    if not db.has_token(user_id):
        k_button = ReplyKeyboardBuilder()
        k_button.button(text="How to find token?")
        k_button.adjust(1)
        await message.answer("Enter your token: ", reply_markup=k_button.as_markup(resize_keyboard=True))
        await state.set_state(StepsForm.GET_MOODLE_TOKEN)
    else:
        user = api.get_user_info(db.get_token(user_id))
        print(user)
        await message.answer(
            text=f"Hello, **{user['full_name']}**\nSelect an option: ",
            reply_markup=main_menu()
        )


@router.message(StepsForm.GET_MOODLE_TOKEN)
async def save_moodle_token(message: types.Message, state: FSMContext):
    if message.text.lower().__contains__("how to find token?"):
        await find_moodle_token(message)
        await message.answer("Enter your token: ")
        await state.clear()
        await state.set_state(StepsForm.GET_MOODLE_TOKEN)
    else:
        db = Database()
        if db.user_exists(message.from_user.id):
            db.update_token(user_id=message.from_user.id, token=message.text)
        else:
            db.insert_token(user_id=message.from_user.id, token=message.text)
        await define_token(message)
        await state.clear()
        await get_moodle_token(message, state)

