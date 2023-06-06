from aiogram import *
import asyncio
import dotenv
import os


async def main():
    dotenv.load_dotenv()
    token = os.getenv("TOKEN")

    router = Router()
    dp = Dispatcher()
    dp.include_router(router)

    bot = Bot(token, parse_mode="HTML")
    print("Bot started!")
    await dp.start_polling(bot)


if __name__ == '__main__':
    asyncio.run(main())