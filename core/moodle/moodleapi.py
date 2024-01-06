import aiohttp


class Api:
    __url = "https://moodle.astanait.edu.kz/webservice/rest/server.php"

    @staticmethod
    async def get_user_info(token):
        async with aiohttp.ClientSession() as session:
            async with session.get( Api.__url, params = { 
                    'wstoken': token, 
                    'wsfunction': 'core_webservice_get_site_info',
                    'moodlewsrestformat': 'json'
                }) as response:
                response_json = await response.json()
                
                try:
                    if response_json['errorcode'] == 'invalidtoken':
                        return False
                except TypeError:
                    pass
                
                return response_json
    
    @staticmethod
    async def get_user_courses(token):
        user_info = await Api.get_user_info(token)
        
        if not user_info:
            return []
        
        async with aiohttp.ClientSession() as session:
            async with session.get( Api.__url, params = { 
                    'wstoken': token, 
                    'wsfunction': 'core_enrol_get_users_courses',
                    'moodlewsrestformat': 'json',
                    'userid': user_info['userid']
                }) as response:
                response_json = await response.json()
                
                try:
                    if response_json['errorcode'] == 'invalidtoken':
                        return False
                except TypeError:
                    pass
                
                return response_json
                    
    @staticmethod
    async def get_course(token, course_id):
        async with aiohttp.ClientSession() as session:
            async with session.get( Api.__url, params = { 
                    'wstoken': token, 
                    'wsfunction': 'core_course_get_courses_by_field',
                    'moodlewsrestformat': 'json',
                    'field': 'id',
                    'value': course_id
                }) as response:
                response_json = await response.json()
                
                try:
                    if response_json['errorcode'] == 'invalidtoken':
                        return False
                except TypeError:
                    pass
                
                return response_json
                
    @staticmethod
    async def get_course_grades(token, course_id):
        user_info = await Api.get_user_info(token)
        
        if not user_info:
            return []
        
        data = []
        
        async with aiohttp.ClientSession() as session:
            async with session.get( Api.__url, params = { 
                    'wstoken': token, 
                    'wsfunction': 'gradereport_user_get_grade_items',
                    'moodlewsrestformat': 'json',
                    'userid': user_info['userid'],
                    'courseid': course_id
                }) as response:
                
                response_json = await response.json()
                
                try:
                    if response_json['errorcode'] == 'invalidtoken':
                        return False
                except TypeError:
                    pass
                
                return response_json
                
    @staticmethod
    async def get_deadlines(token):
        async with aiohttp.ClientSession() as session:
            async with session.get( Api.__url, params = { 
                    'wstoken': token, 
                    'wsfunction': 'core_calendar_get_calendar_upcoming_view',
                    'moodlewsrestformat': 'json',
                }, timeout=aiohttp.ClientTimeout(total=10)) as response:
                
                response_json = await response.json()
                
                try:
                    if response_json['errorcode'] == 'invalidtoken':
                        return False
                except TypeError:
                    pass
                
                return response_json
            