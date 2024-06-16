from aiogram import F
from aiogram.types import CallbackQuery
from core.keyboards.user_menu import *
from core.utils.helpers import *
from core.utils.db_utils import delete_user
from core.db.database import User

router = Router()


@router.callback_query(F.data == "deadlines")
async def deadlines_handler(call: CallbackQuery):
    deadlines_string = await create_deadlines_string(call.message.chat.id)
    await call.message.edit_text(text=deadlines_string,
                                 parse_mode="Markdown",
                                 reply_markup=refresh_deadlines_menu())
    await call.answer()

@router.callback_query(F.data == "deadlines_message_refresh")
async def deadlines_refresh_handler(call: CallbackQuery):
    deadlines_string = await create_deadlines_string(call.message.chat.id)
    await call.message.edit_text(text=deadlines_string,
                                 parse_mode="Markdown",
                                 reply_markup=refresh_deadlines_message())
    await call.answer()



@router.callback_query(F.data == "other")
async def settings_handler(call: CallbackQuery):
    settings_markup = await other()
    await call.message.edit_text("Settings:",
                                 reply_markup=settings_markup)
    await call.answer()


@router.callback_query(F.data == "grade_notifications")
async def grades_settings_handler(call: CallbackQuery):
    user = User.objects(telegram_id=call.message.chat.id)[0]
    await change_grade_notification_state(user)
    settings_markup = await settings(user)
    await call.message.edit_reply_markup(reply_markup=settings_markup)
    await call.answer()


@router.callback_query(F.data == "deadline_notifications")
async def deadlines_settings_handler(call: CallbackQuery):
    user = User.objects(telegram_id=call.message.chat.id)[0]
    await change_deadline_notification_state(user)
    settings_markup = await settings(user)
    await call.message.edit_reply_markup(reply_markup=settings_markup)
    await call.answer()


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


@router.callback_query(F.data == "close_settings")
async def close_settings(call: CallbackQuery):
    await call.message.delete()


@router.callback_query(F.data == "grades")
async def grades_handler(call: CallbackQuery):
    await call.message.edit_text("Choose course:",
                                 reply_markup=await grades_menu(call.message.chat.id))
    await call.answer()


# @router.callback_query(F.data == "grades_menu_all_courses")
# async def all_grades_handler(call: CallbackQuery):
#     await call.message.edit_text("Choose course:",
#                                  reply_markup=await grades_menu(call.message.chat.id))
#     await call.answer()
#
#
# @router.callback_query(F.data == "grades_menu_current_courses")
# async def current_grades_handler(call: CallbackQuery):
#     await call.message.edit_text("Choose course:",
#                                  reply_markup=await grades_menu(call.message.chat.id))
#     await call.answer()
#

@router.callback_query(F.data.startswith("course_"))
async def course_grades_handler(call: CallbackQuery):
    try:
        await call.message.edit_text(str(await create_grades_string(call.data.split("_")[1], call.message.chat.id)),
                                    parse_mode="Markdown",
                                    reply_markup=refresh_grades_menu(call.data))
        
    except Exception as e:
        await call.answer()


@router.callback_query(F.data == "back_to_menu")
async def back_to_menu_handler(call: CallbackQuery):
    user = User.objects(telegram_id=call.message.chat.id)[0]
    full_name = user.full_name
    
    # full_name = await db.get_full_name(call.message.chat.id)
    await call.message.edit_text(text=f"Hello, *{full_name}*\nSelect an option: ",
                                 reply_markup=main_menu(),
                                 parse_mode="Markdown")
    await call.answer()

@router.callback_query(F.data == "refresh_deadlines_menu")
async def refresh_deadlines_menu_handler(call: CallbackQuery):
    deadlines_string = await create_deadlines_string(call.message.chat.id)
    await call.message.edit_text(text=deadlines_string,
                                 parse_mode="Markdown",
                                 reply_markup=refresh_deadlines_menu())
    await call.answer()


@router.callback_query(F.data == "back_to_grades")
async def back_to_grades_handler(call: CallbackQuery):
    await call.message.edit_text("Choose group of courses:",
                                 reply_markup=await grades_menu(call.message.chat.id))
    await call.answer()


@router.callback_query(F.data == "back_to_settings")
async def back_to_settings_handler(call: CallbackQuery):
    settings_markup = await other(call.message.chat.id)
    await call.message.edit_text("Settings:", reply_markup=settings_markup)
    await call.answer()
