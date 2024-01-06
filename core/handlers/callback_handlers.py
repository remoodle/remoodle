from aiogram import F
from aiogram.types import CallbackQuery
from core.keyboards.user_menu import *
from core.utils.helpers import *
from main import db

router = Router()


@router.callback_query(F.data == "deadlines")
async def deadlines_handler(call: CallbackQuery):
    deadlines_string = await create_deadlines_string(call.message.chat.id)
    await call.message.edit_text(text=deadlines_string,
                                 parse_mode="Markdown",
                                 reply_markup=back(callback_data="back_to_menu"))
    await call.answer()


@router.callback_query(F.data == "settings")
async def settings_handler(call: CallbackQuery):
    settings_markup = await settings(call.message.chat.id)
    await call.message.edit_text("Settings:",
                                 reply_markup=settings_markup)
    await call.answer()


@router.callback_query(F.data == "grades_notifications_settings")
async def grades_settings_handler(call: CallbackQuery):
    await call.answer("Currently unavailable")
    # user_id = call.message.chat.id
    # await change_grade_notification_state(user_id)
    # settings_markup = await settings(user_id)
    # await call.message.edit_reply_markup(reply_markup=settings_markup)
    # await call.answer()


@router.callback_query(F.data == "deadlines_notifications_settings")
async def deadlines_settings_handler(call: CallbackQuery):
    await call.answer("Currently unavailable")
    # user_id = call.message.chat.id
    # await change_deadline_notification_state(user_id)
    # settings_markup = await settings(user_id)
    # await  call.message.edit_reply_markup(reply_markup=settings_markup)
    # await call.answer()


@router.callback_query(F.data == "change_token_yes")
async def token_change_handler(call: CallbackQuery):
    user_id = call.message.chat.id
    await delete_user(user_id)
    await call.answer("send /start")
    await call.message.delete()


@router.callback_query(F.data == "token_settings")
async def token_change_confirmation(call: CallbackQuery):
    await call.message.edit_text(text="*Change token*\nAre you sure?",
                                 reply_markup=change_token_confirmation(),
                                 parse_mode="Markdown")


@router.callback_query(F.data == "contact_us_menu")
async def contact_us_handler(call: CallbackQuery):
    await call.message.edit_text(text="Contact us for:\n→ Report Bugs\n→ Collaboration\n→ Advertisement",
                                 reply_markup=contacts())


@router.callback_query(F.data == "grades")
async def grades_handler(call: CallbackQuery):
    await call.message.edit_text("Choose group of courses:",
                                 reply_markup=grades_menu())
    await call.answer()


@router.callback_query(F.data == "grades_menu_all_courses")
async def all_grades_handler(call: CallbackQuery):
    await call.message.edit_text("Choose course:",
                                 reply_markup=await grades_menu_all_courses(call.message.chat.id))
    await call.answer()


@router.callback_query(F.data == "grades_menu_current_courses")
async def current_grades_handler(call: CallbackQuery):
    await call.message.edit_text("Choose course:",
                                 reply_markup=await grades_menu_current_courses(call.message.chat.id))
    await call.answer()


@router.callback_query(F.data.startswith("course_"))
async def course_grades_handler(call: CallbackQuery):
    await call.message.edit_text(str(await create_grades_string(call.data.split("_")[1], call.message.chat.id)),
                                 parse_mode="Markdown",
                                 reply_markup=back("back_to_grades"))
    await call.answer()


@router.callback_query(F.data == "back_to_menu")
async def back_to_menu_handler(call: CallbackQuery):
    full_name = await db.get_full_name(call.message.chat.id)
    await call.message.edit_text(text=f"Hello, *{full_name}*\nSelect an option: ",
                                 reply_markup=main_menu(),
                                 parse_mode="Markdown")
    await call.answer()


@router.callback_query(F.data == "back_to_grades")
async def back_to_grades_handler(call: CallbackQuery):
    await call.message.edit_text("Choose group of courses:",
                                 reply_markup=grades_menu())
    await call.answer()


@router.callback_query(F.data == "back_to_settings")
async def back_to_grades_handler(call: CallbackQuery):
    settings_markup = await settings(call.message.chat.id)
    await call.message.edit_text("Settings:", reply_markup=settings_markup)
    await call.answer()
