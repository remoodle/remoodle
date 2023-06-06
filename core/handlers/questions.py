from aiogram import Router
from aiogram.filters import Command
from aiogram.filters import Text
from aiogram.types import Message, ReplyKeyboardRemove

from core.keyboards.for_questions import get_yes_no_kb

router = Router()  # [1]


@router.message(Command("start"))  # [2]
async def cmd_start(message: Message):
    await message.answer(
        "Вас зовут Ельнур?",
        reply_markup=get_yes_no_kb()
    )


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