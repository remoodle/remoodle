import os
import pdfplumber
import json


def get_schedule_page(page):
    schedule = {}
    current_day = None
    headers = None

    for row in page.extract_table():
        if not headers:
            headers = row
            continue
        if row[0] is not None:
            current_day = row[0]
        else:
            row[0] = current_day

        entry = {
            "start": row[1].split("-")[0],
            "end": row[1].split("-")[1],
            "title": row[2],
            "type": row[4],
            "classroom": row[3],
            "teacher": row[5]
        }

        if current_day in schedule:
            # Check if the current entry can be merged with the previous entry
            if schedule[current_day] and schedule[current_day][-1]["title"] == entry["title"] \
                    and schedule[current_day][-1]["type"] == entry["type"] \
                    and schedule[current_day][-1]["classroom"] == entry["classroom"] \
                    and schedule[current_day][-1]["teacher"] == entry["teacher"]:
                # Merge by updating the end time of the previous entry
                schedule[current_day][-1]["end"] = entry["end"]
            else:
                schedule[current_day].append(entry)
        else:
            schedule[current_day] = [entry]

    return schedule


def extract_schedule_from_pdf(pdf_path):
    schedule = {}

    with pdfplumber.open(pdf_path) as pdf:
        current_group = None
        current_schedule = []

        for page in pdf.pages:
            text = page.extract_text()
            lines = text.split("\n")
            
            for line in lines:
                if line.startswith("Group"):
                    if current_group is not None:
                        schedule[current_group] = current_schedule
                    current_group = line.split(" ")[1]
            current_schedule = get_schedule_page(page)

        if current_group is not None:
            schedule[current_group] = current_schedule

    return schedule

def save_schedule_to_json(schedule, json_file):
    with open(json_file, 'w') as f:
        json.dump(schedule, f, indent=4)

def process_pdf_directory(directory):
    all_schedule = {}

    for filename in os.listdir(directory):
        if filename.endswith(".pdf"):
            pdf_path = os.path.join(directory, filename)
            schedule = extract_schedule_from_pdf(pdf_path)
            all_schedule.update(schedule)

    json_file = os.path.join("./", "all_course_schedule.json")
    save_schedule_to_json(all_schedule, json_file)
    print("All schedule data has been saved to", json_file)

# Directory containing PDF files
pdf_directory = "./pdf_files"
process_pdf_directory(pdf_directory)
