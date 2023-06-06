from aiogram import types

@dp.message_handler(Text(equals="How to find token?", ignore_case=True))
async def find_moodle_token(message: types.Message):
    await message.answer("To find your token you should go to your moodle profile, "
                         "click on the settings at the top right corner, "
                         "select security keys and copy \"Moodle web service\"")


async def define_token(message: types.Message):
    await message.answer("Your specified token is: " + message.text)