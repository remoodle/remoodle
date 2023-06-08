from aiogram import Router, Bot
from aiogram.filters import Command
from aiogram.filters import Text
from aiogram.types import Message, ReplyKeyboardRemove, CallbackQuery

from core.keyboards.test import *
from core.keyboards.user_menu import main_menu

router = Router()  # [1]


@router.message(Command("start"))  # [2]
async def cmd_start(message: Message):


@router.callback_query(Text(text="ten"))
async def test1(call: CallbackQuery, bot: Bot):
    await call.message.edit_reply_markup(reply_markup=test2())
    await call.answer()

@router.callback_query(Text(text="ad"))
async def test1(call: CallbackQuery, bot: Bot):
    await call.cmd_start()
    await call.answer()


@router.message(Text(text="да", ignore_case=True))
async def answer_yes(message: Message):
    await message.answer(
        "Сочувствую",
        reply_markup=ReplyKeyboardRemove()
    )


@router.message(Text(text="нет", ignore_case=True))
async def answer_no(message: Message):
    await message.answer(
        "Отлично",
        reply_markup=ReplyKeyboardRemove()
    )