from aiogram import *
import logging
import asyncio
import dotenv
import os
from core.api.api import Api
from core.db.database import Database
from core.handlers.notification_handlers.grade_notification_handler import start_loop
from core.handlers.user_handlers import callback_handlers, command_handlers

db = Database()
api = Api()
dotenv.load_dotenv()
token = os.getenv("TELEGRAM_BOT_TOKEN")
bot = Bot(token, parse_mode="HTML")


async def main():
    await db.create_connection()
    await db.create_tables()

    dp = Dispatcher()

    print("Bot started!")
    dp.include_routers(callback_handlers.router, command_handlers.router)
    await dp.start_polling(bot)


async def start():
    asyncio.create_task(main())
    # asyncio.create_task(start_loop(bot))
    await asyncio.Event().wait()


if __name__ == '__main__':
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    )
    asyncio.run(start())
