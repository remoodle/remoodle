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
        await message.answer("Enter your token: ", reply_markup=k_button.as_markup(resize_keyboard=True,
                                                                                   one_time_keyboard=True))
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
            print(message.text)
            print(message.from_user.id)
            db.insert_token(user_id=message.from_user.id, token=message.text)
        await define_token(message)
        await state.clear()
        await start(message, state)


@router.callback_query(Text(text="deadlines"))
async def deadlines_handler(call: CallbackQuery):
    await call.message.edit_text(text=create_deadlines_string(call.message.chat.id),
                                 parse_mode="Markdown",
                                 reply_markup=back(callback_data="back_to_menu"))
    await call.answer()


@router.callback_query(Text(text="gpa"))
async def gpa_handler(call: CallbackQuery):
    await call.answer("Coming soon")


@router.callback_query(Text(text="settings"))
async def settings_handler(call: CallbackQuery):
    await call.message.edit_text("Settings:",
                                 reply_markup=settings(call.message.chat.id))
    await call.answer()


@router.callback_query(Text(text="grades_notifications_settings"))
async def grades_settings_handler(call: CallbackQuery):
    user_id = call.message.chat.id
    change_grade_notification_state(user_id)
    await  call.message.edit_reply_markup(reply_markup=settings((user_id)))
    await call.answer()


@router.callback_query(Text(text="deadlines_notifications_settings"))
async def deadlines_settings_handler(call: CallbackQuery):
    user_id = call.message.chat.id
    change_deadline_notification_state(user_id)
    await  call.message.edit_reply_markup(reply_markup=settings((user_id)))
    await call.answer()


@router.callback_query(Text(text="token_settings"))
async def token_change_handler(call: CallbackQuery):
    user_id = call.message.chat.id
    delete_user(user_id)
    await call.answer("send /start")
    await call.message.delete()


@router.callback_query(Text(text="contact_us_menu"))
async def contact_us_handler(call: CallbackQuery):
    await call.message.edit_text("@y_abdrakhmanov\n@dek_kar",
                                 reply_markup=back("back_to_menu"))


@router.callback_query(Text(text="grades"))
async def grades_handler(call: CallbackQuery):
    await call.message.edit_text("Choose group of courses:",
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
                                 parse_mode="Markdown",
                                 reply_markup=back("back_to_grades"))
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
    await call.message.edit_text("Choose group of courses:",
                                 reply_markup=grades_menu())
    await call.answer()