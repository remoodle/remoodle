import asyncio
from moodleapi import MoodleApi
from openidapi import OpenIdApi


class Api(MoodleApi, OpenIdApi):
    def __init__(self):
        super().__init__()


api = Api()
print(asyncio.run(api.validate_openid_account('220129@astanait.edu.kz', 'Asselptr76')))