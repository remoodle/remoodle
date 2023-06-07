from aiogram.filters import Command
from aiogram.fsm.context import FSMContext
from aiogram.types import CallbackQuery
from aiogram.utils.keyboard import ReplyKeyboardBuilder
from core.keyboards.user_menu import *
from core.utils.statesform import StepsForm
from core.utils.helpers import *
from main import db


router = Router()


@router.message(Command("start"))
async def start(message: types.Message, state: FSMContext):
    user_id = message.from_user.id

    if not db.has_token(user_id):
        k_button = ReplyKeyboardBuilder()
        k_button.button(text="How to find token?")
        k_button.adjust(1)
        await message.answer("Enter your token: ", reply_markup=k_button.as_markup(resize_keyboard=True))
        await state.set_state(StepsForm.GET_MOODLE_TOKEN)
    else:
        full_name = db.get_full_name(user_id)
        await message.answer(
            text=f"Hello, *{full_name}*\nSelect an option: ",
            parse_mode='Markdown',
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
        if db.user_exists(message.from_user.id):
            db.update_token(user_id=message.from_user.id, token=message.text)
        else:
            db.insert_token(user_id=message.from_user.id, token=message.text)
        await define_token(message)
        await state.clear()
        await start(message, state)


@router.callback_query(Text(text="deadlines"))
async def deadlines_handler(call: CallbackQuery):
    await call.message.edit_text(text="Your deadlines:",
                                 reply_markup=back())
    await call.answer()


@router.callback_query(Text(text="grades"))
async def grades_handler(call: CallbackQuery):
    await call.message.edit_text("Choose course group:",
                                 reply_markup=grades_menu())
    await call.answer()


@router.callback_query(Text(text="grades_menu_all_courses"))
async def all_grades_handler(call: CallbackQuery):
    await call.message.edit_text("Choose course:",
                                 reply_markup=grades_menu_all_courses(call.message.chat.id))
    await call.answer()


@router.callback_query(Text(text="grades_menu_current_courses"))
async def current_grades_handler(call: CallbackQuery):
    await call.message.edit_text("Choose course:",
                                 reply_markup=grades_menu_current_courses(call.message.chat.id))
    await call.answer()


@router.callback_query(Text(contains="course_"))
async def course_grades_handler(call: CallbackQuery):
    await call.message.edit_text(str(create_grades_string(call.data.split("_")[1], call.message.chat.id)),
                                 reply_markup=back())
    await call.answer()


@router.callback_query(Text(text="back_to_menu"))
async def back_to_menu_handler(call: CallbackQuery):
    full_name = db.get_full_name(call.message.chat.id)
    await call.message.edit_text(text=f"Hello, *{full_name}*\nSelect an option: ",
                                 reply_markup=main_menu(),
                                 parse_mode="Markdown")
    await call.answer()


@router.callback_query(Text(text="back_to_grades"))
async def back_to_grades_handler(call: CallbackQuery):
    await call.message.edit_reply_markup(reply_markup=grades_menu())
    await call.answer()