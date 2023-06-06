from aiogram.filters.state import State, StatesGroup


class StepsForm(StatesGroup):
    GET_MOODLE_TOKEN = State()