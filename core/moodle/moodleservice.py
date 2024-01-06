import time
import asyncio
from core.moodle.moodleapi import Api

class Service:
    
    @staticmethod
    async def get_user_info(token):
        response = await Api.get_user_info(token)
        
        if not response:
            return False
        
        return {
            "barcode": response['username'].split('@')[0],
            "full_name": response['fullname'],
            "user_id": response['userid']
        }
        
    @staticmethod
    async def validate_token(token):
        response = await Api.get_user_info(token)
        
        if response:
            return True
        
        return False
    
    @staticmethod
    async def get_courses(token):
        response = await Api.get_user_courses(token)
        
        if len(response) < 1:
            return False
        
        data = []
        current_time = int(time.time())
        
        for course in response:
            data.append({
                "id": course['id'],
                "name": course['displayname'],
                "enrolled_user_count": course['enrolledusercount'],
                "category": course['category'],
                "completed": course['completed'],
                "start_date": course['startdate'],
                "end_date": course['enddate']
            })
            
        return data
    
    @staticmethod
    async def get_relative_courses(token):
        response = await Service.get_courses(token)
        current_time = int(time.time)
        
        return [i for i in response if i['end_date'] > current_time]
    
    @staticmethod
    async def get_course(token, course_id):
        response = await Api.get_course(token, course_id)
        
        if not response:
            return False
        
        return {
            "course_id": response['id'],
            "name": response["displayname"],
            "category": response["categoryname"],
            "start_date": response['startdate'],
            "end_date": response['enddate']
        }
        
    @staticmethod
    async def get_course_grades(token, course_id):
        response = await Api.get_course_grades(token, course_id)
        
        if not response:
            return False
        
        response = response['usergrades'][0]['gradeitems']
        data = []
        
        for assignment in response:
            if (assignment['itemname'] is None) or (assignment['itemname'] == ''):
                continue

            if str(assignment['percentageformatted']).__contains__('-'):
                grade = "None"
            else:
                grade = assignment['percentageformatted'].split(' ')[0]

            if len(assignment["itemname"]) <= 25 and len(assignment['itemname']) > 3:
                name = assignment['itemname']
            elif len(assignment["itemname"]) > 25:
                name = assignment['itemname'][:25] + "... "
            else:
                continue
            
            data.append({
                "id": int(assignment['id']),
                "name": name,
                "course_id": course_id,
                "grade": grade
            })

        return data
    
    @staticmethod
    async def get_deadlines(token):
        try:
            response = await Api.get_deadlines(token)
        except asyncio.TimeoutError:
            print("[ERROR] Moodle Timeout after 10'000 ms")
            return 
        
        if not response:
            return None
        
        deadlines = response['events']
        data = []
        
        for event in deadlines:
            data.append({
                'id': event['id'],
                'course_name': str(event['course']['shortname']).split(' |')[0],
                'deadline_name': event['name'],
                'remaining': event['timestart']
            })
            
        return data
            