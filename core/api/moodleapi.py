import requests
import time


class MoodleApi:
    moodle_api_link = "https://moodle.astanait.edu.kz/webservice/rest/server.php?wstoken="

    async def get_user_info(self, token):
        response = requests.get(f"{self.moodle_api_link}{token}"
                                f"&wsfunction=core_webservice_get_site_info&moodlewsrestformat=json")
        response = response.json()
        try:
            if response['errorcode'] == 'invalidtoken':
                return None
        except Exception:
            pass

        return {
            "barcode": response['username'].split('@')[0],
            "full_name": response['fullname'],
            "user_id": response['userid']
        }

    async def validate_moodle_user_token(self, token):
        user_info = await self.get_user_info(token)
        if user_info is None:
            return False
        return True

    async def get_user_all_courses(self, token):
        user_info = await self.get_user_info(token)
        user_id = user_info['user_id']
        response = requests.get(f"{self.moodle_api_link}{token}"
                                f"&wsfunction=core_enrol_get_users_courses&moodlewsrestformat=json&userid={user_id}")
        response = response.json()

        data = []

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

    async def get_user_relative_courses(self, token):
        courses = await self.get_user_all_courses(token)
        current_time = int(time.time())
        data = []

        for course in courses:
            if course['end_date'] > current_time:
                data.append(course)

        return data

    async def get_course(self, token, course_id):
        response = requests.get(f"{self.moodle_api_link}{token}"
                                f"&wsfunction=core_course_get_courses_by_field&moodlewsrestformat=json"
                                f"&field=id&value={course_id}")
        response = response.json()['courses'][0]

        return {
            "course_id": response['id'],
            "name": response['displayname'],
            "category": response['categoryname'],
            "start_date": response['startdate'],
            "end_date": response['enddate']
        }

    async def get_course_content(self, token, course_id):
        response = requests.get(f"{self.moodle_api_link}{token}"
                                f"&wsfunction=core_course_get_contents&moodlewsrestformat=json&courseid={course_id}")

        response = response.json()
        data = []

        for week in response:
            assignments = week['modules']
            for assignment in assignments:
                data.append(assignment)

        return data

    async def get_courses_grade(self, token):
        user_info = await self.get_user_info(token)
        user_id = user_info['user_id']
        response = requests.get(f"{self.moodle_api_link}{token}"
                                f"&wsfunction=gradereport_overview_get_course_grades&moodlewsrestformat=json"
                                f"&userid={user_id}")

        response = response.json()
        response = response['grades']
        data = []

        course_names = {}
        courses = await self.get_user_all_courses(token)
        for course in courses:
            course_names[course['id']] = course['name']

        for grade in response:
            data.append({
                "course_id": grade['courseid'],
                "name": course_names[grade['courseid']],
                "grade": grade['grade']
            })

        return data

    async def get_course_grades(self, token, course_id):
        user_info = await self.get_user_info(token)
        user_id = user_info['user_id']

        response = requests.get(f"{self.moodle_api_link}{token}"
                                f"&wsfunction=gradereport_user_get_grade_items&moodlewsrestformat=json"
                                f"&userid={user_id}&courseid={course_id}")
        response = response.json()
        response = response['usergrades'][0]['gradeitems']
        data = []

        for ass in response:

            if ass["itemname"] is None:
                continue

            if str(ass['percentageformatted']).__contains__('-'):
                grade = "None"
            else:
                grade = ass['percentageformatted'].split(' ')[0]

            if len(ass["itemname"]) <= 25 and len(ass['itemname']) > 3:
                name = ass['itemname']
            elif len(ass["itemname"]) > 25:
                name = ass['itemname'][:25] + "... "
            else:
                continue

            data.append({
                "id": int(ass['id']),
                "name": name,
                "course_id": course_id,
                "grade": grade
            })

        return data

    async def get_deadlines(self, token):
        response = requests.get(f"{self.moodle_api_link}{token}"
                                f"&wsfunction=core_calendar_get_calendar_upcoming_view&moodlewsrestformat=json", timeout=10)
        
        if not response:
            return null
        
        response = response.json()
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