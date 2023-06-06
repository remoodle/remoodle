from aiogram import *
import logging
import asyncio
import dotenv
import os
from core.utils import helpers
from core.handlers.user_handlers import user_handlers


async def main():
    dotenv.load_dotenv()
    token = os.getenv("TOKEN")

    router = Router()
    dp = Dispatcher()
    dp.include_router(router)

    bot = Bot(token, parse_mode="HTML")
    print("Bot started!")
    dp.include_routers(user_handlers.router, helpers.router)
    await dp.start_polling(bot)


if __name__ == '__main__':
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    )
    asyncio.run(main())