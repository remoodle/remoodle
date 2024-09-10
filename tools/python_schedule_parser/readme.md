# Course Schedule Extractor

This Python script extracts course schedule data from PDF files of Astana IT Univercity and saves it into a JSON file.

## Requirements

- Python 3.x
- pdfplumber

You can install the required Python packages using the following command:

```bash
pip install -r requirements.txt
```

Or use venv in needed

```bash
python3 -m venv schedule_env
schedule_env\Scripts\activate
source schedule_env/bin/activate
pip install -r requirements.txt
```

## Usage

1. Place your PDF files containing course schedules in a directory named `pdf_files`.
2. Run the script using the following command:
   ```bash
   python3 extract_schedule.py
   ```
3. Find your generated JSON file in the current directory.
