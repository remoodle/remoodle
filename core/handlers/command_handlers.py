from aiogram.filters import Command
from aiogram.fsm.context import FSMContext
from aiogram.utils.keyboard import ReplyKeyboardBuilder
from core.keyboards.user_menu import *
from core.utils.statesform import StepsForm
from core.utils.helpers import *
from main import db

router = Router()

@router.message(Command("start"))
async def start(message: types.Message, state: FSMContext):
    await db.create_connection()
    user_id = message.from_user.id

    if (message.chat.type != "private"):
        await message.answer("This method is not allowed in groups!")
        return

    has_token = await db.has_token(user_id)
    if not has_token:
        k_button = ReplyKeyboardBuilder()
        k_button.button(text="How to find token?")
        k_button.adjust(1)
        await message.answer("Hello!\nEnter your Token: ", reply_markup=k_button.as_markup(resize_keyboard=True,
                                                                                           one_time_keyboard=True))
        await state.set_state(StepsForm.GET_MOODLE_TOKEN)
    else:
        full_name = await db.get_full_name(user_id)
        await message.answer(
            text=f"Hello, *{full_name}*\nSelect an option: ",
            parse_mode='Markdown',
            reply_markup=main_menu()
        )


@router.message(Command("users"))
async def admin_get_users(message: types.Message, state: FSMContext):
    user_id = message.from_user.id

    if user_id not in (749243435, 1055088454):
        return

    await db.create_connection()
    users = await db.get_all_users()
    answer = ""

    for user in users:
        answer += f"{user[2]} - {user[3]} | {user[0]}\n"

    answer += f"\n\nCOUNT: {len(users)}"

    await message.answer(answer, parse_mode="HTML")


# @router.message(Command("send_invites"))
# async def send_invites(message: types.Message, state: FSMContext):
#     user_id = message.from_user.id

#     if user_id != 749243435:
#         return

#     await db.create_connection()
#     users = await db.get_all_users()

# for user in users:
#     userid = user[0]
#     requests.get(f"https://api.telegram.org/bot6024219964:AAE3e2RBAbGa38MLG4_Z4ylhZiPsZUIzwvc/sendMessage", params={"chat_id": userid, "parse_mode": "markdown", "text": "Привет, я создал канал где cмогу пообщаться с пользователями про бота и его дальнейших обновлениях: [тык](https://t.me/+ltR0DSdwf6c4MTFi)"})

@router.message(Command("gift"))
async def gift(message: types.Message, state: FSMContext):
    await db.create_connection()

    command_parts = message.text.split()

    if len(command_parts) < 3:
        await message.reply("Используйте команду в этом формате:\n /gift @username [сообщение]")
        return

    username = command_parts[1]
    chat_id = await db.telegram_username_to_id(command_parts[1])
    gift_message = " ".join(command_parts[2:])

    if len(gift_message) > 110:
        await message.reply("Максимальное количество символов в одном сообщении 110)")
        return

    try:
        await bot.send_photo(chat_id, photo=f'https://picgen.wsehl.dev/ny-card?moodbot=1&text={gift_message}',
                             caption='☃️ Вам пришла открытка ☃️',
                             has_spoiler=True)
        await bot.send_sticker(chat_id,
                               sticker='CAACAgQAAxkBAAELEPdljyRqR4WDk8p5pGM43fBSh9HjmQACnxEAAqbxcR57wYUDyflSITQE')
        await message.reply(f"Gift sent to {username} successfully!")
    except Exception as e:
        if not chat_id:
            reason = 'User is not registered in BoodleMot'
        await message.reply(f"Failed to send gift to {username} \n{reason}")
        await bot.send_sticker(chat_id=message.chat.id,
                               sticker="CAACAgQAAxkBAAELEPtljzcjyMHrntx-movvm0TGMejrsAACWRIAAqbxcR5xRKqTi3F9aTQE")
        print(e)


@router.message(Command("pidor"))
async def pidorCommand(message: types.Message, state: FSMContext):
    await message.answer("Сам ты пидор)")


@router.message(Command("deadlines"))
async def deadlinesCommand(message: types.Message, state: FSMContext):
    await db.create_connection()
    user_id = message.from_user.id
    has_token = await db.has_token(user_id)

    if not has_token:
        await message.answer("You are not authorized!")
    else:
        deadlines_string = await create_deadlines_string(message.from_user.id)
        await message.answer(text=deadlines_string, parse_mode="Markdown")

@router.message(StepsForm.GET_MOODLE_TOKEN)
async def save_moodle_token(message: types.Message, state: FSMContext):
    await db.create_connection()
    if message.text.lower().__contains__("how to find token?"):
        await find_moodle_token(message)
        await message.answer("Enter your token: ")
        await state.clear()
        await state.set_state(StepsForm.GET_MOODLE_TOKEN)
    else:
        api = Api()
        if await api.validate_moodle_user_token(message.text):
            await db.insert_token(user_id=message.from_user.id, token=message.text)
            await db.insert_to_telegram_table(chat_id=message.from_user.id, username=(await bot.get_chat(message.from_user.id)).username)
            await define_token(message)
            await state.clear()
            # await start(message, state)
        else:
            await message.answer("Your token is invalid!\nEnter your token: ")
            await state.clear()
            await state.set_state(StepsForm.GET_MOODLE_TOKEN)
