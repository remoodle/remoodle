import requests
import dotenv
import os


class OpenIdApi:
    openid_api_link = "https://login.microsoftonline.com/"

    payload = {
        'client_id': '',
        'client_secret': '',
        'scope': '',
        'username': '',
        'password': '',
        'grant_type': 'password'
    }

    def __init__(self):
        dotenv.load_dotenv()
        self.openid_api_link += f"{os.getenv('AZURE_TENANT')}/oauth2/v2.0/token"
        self.payload['client_id'] = os.getenv('AZURE_CLIENT_ID')
        self.payload['client_secret'] = os.getenv('AZURE_CLIENT_SECRET')
        self.payload['scope'] = os.getenv('AZURE_CLIENT_SCOPE') + ' openid offline_access'

    async def validate_openid_account(self, login, password):
        if await self.get_openid_token(login, password) is None:
            return False
        return True

    async def get_openid_token(self, login, password):
        payload = self.payload
        payload['username'] = login
        payload['password'] = password

        azure_response = requests.post(self.openid_api_link, data=payload).json()

        try:
            if azure_response['error'] == 'invalid_grant' or str(azure_response['error_description']).__contains__(
                    'invalid username or password'):
                return None
        except Exception:
            pass

        return azure_response
