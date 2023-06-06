from aiogram import Router, types
from aiogram.filters import Command
from aiogram.fsm.context import FSMContext
from aiogram.utils.keyboard import *
from core.db.database import Database
from core.utils.statesform import StepsForm
from core.utils.helpers import *

router = Router()


@router.message(Command("start"))
async def get_moodle_token(message: types.Message, state: FSMContext):
    db = Database()
    user_id = message.from_user.id

    if not db.has_token(user_id) or not db.user_exists(user_id):
        k_button = ReplyKeyboardBuilder()
        k_button.button(text="How to find token?")
        k_button.adjust(1)
        await message.answer("Enter your token", reply_markup=k_button.as_markup(resize_keyboard=True))
        await state.set_state(StepsForm.GET_MOODLE_TOKEN)


@router.message(StepsForm.GET_MOODLE_TOKEN)
async def save_moodle_token(message: types.Message, state: FSMContext):
    db = Database()
    if db.user_exists(message.from_user.id):
        db.update_token(user_id=message.from_user.id, token=message.text)
    else:
        db.insert_token(user_id=message.from_user.id, token=message.text)
    await define_token(message)
    await state.clear()
