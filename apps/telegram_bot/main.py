from aiogram import *
import logging
import asyncio
from core.handlers import callback_handlers
from core.handlers import command_handlers
from core.config.config import BOT_TOKEN

bot = Bot(BOT_TOKEN, parse_mode="HTML")


async def main():
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
