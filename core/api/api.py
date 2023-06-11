import asyncio
from core.api.moodleapi import MoodleApi
from core.api.openidapi import OpenIdApi


class Api(MoodleApi, OpenIdApi):
    def __init__(self):
        super().__init__()
