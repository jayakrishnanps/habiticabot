#!/usr/bin/env python3
"""
This Python file is for creating tasks in the Habitica app.
Follows cleaning, dev practices, clever code etc.
"""

import os
import sys
import argparse
import requests

def load_dotenv():
    env_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), '.env')
    if os.path.exists(env_path):
        with open(env_path, 'r') as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith('#'):
                    key, _, value = line.partition('=')
                    if key and value:
                        os.environ.setdefault(key.strip(), value.strip().strip('"\''))

def create_task(payload):
    load_dotenv()
    user_id = os.environ.get("HABITICA_USER_ID")
    api_key = os.environ.get("HABITICA_API_KEY")
    client_name = os.environ.get("HABITICA_CLIENT_NAME", "local-cli")

    if not user_id or not api_key:
        print("Error: HABITICA_USER_ID and HABITICA_API_KEY environment variables must be set.")
        sys.exit(1)

    url = "https://habitica.com/api/v3/tasks/user"
    headers = {
        "x-api-user": user_id,
        "x-api-key": api_key,
        "x-client": f"{user_id}-{client_name}",
        "Content-Type": "application/json"
    }

    try:
        response = requests.post(url, json=payload, headers=headers)
        response.raise_for_status()
        
        data = response.json()
        task_id = data.get("data", {}).get("id")
        
        print(f"Successfully created {payload.get('type')} task!")
        print(f"Task Text: {payload.get('text')}")
        print(f"Task ID: {task_id}")
        return task_id

    except requests.exceptions.HTTPError as e:
        print(f"API Error: {e.response.status_code}")
        print(f"   Details: {e.response.text}")
        return None
    except Exception as e:
        print(f"An unexpected error occurred: {e}")
        return None

def main():
    parser = argparse.ArgumentParser(description="Create a new task in Habitica.")
    
    parser.add_argument("text", help="The text/title of the task")
    parser.add_argument("-t", "--type", choices=["habit", "daily", "todo"], required=True, help="Type of task (habit, daily, todo)")
    parser.add_argument("--priority", type=float, choices=[0.1, 1.0, 1.5, 2.0], help="Task priority (0.1=Trivial, 1=Easy, 1.5=Medium, 2=Hard)")
    parser.add_argument("--attribute", choices=["str", "int", "per", "con"], help="Stat attribute to tie to the task")
    parser.add_argument("--notes", help="Extra notes or description for the task")
    parser.add_argument("--tags", nargs="+", help="List of tag UUIDs to attach to the task")

    parser.add_argument("--up", action="store_true", help="Enable positive (+) clicks for a habit")
    parser.add_argument("--down", action="store_true", help="Enable negative (-) clicks for a habit")

    parser.add_argument("--frequency", choices=["daily", "weekly", "monthly", "yearly"], help="Frequency of a daily task")
    parser.add_argument("--every-x", type=int, dest="everyX", help="Repeat every X days/weeks/etc.")

    parser.add_argument("--due", help="Due date for a todo (YYYY-MM-DD format)")

    args = parser.parse_args()

    payload = {
        "text": args.text,
        "type": args.type
    }

    if args.priority is not None:
        payload["priority"] = args.priority
    if args.attribute:
        payload["attribute"] = args.attribute
    if args.notes:
        payload["notes"] = args.notes
    if args.tags:
        payload["tags"] = args.tags

    if args.type == "habit":
        if args.up or args.down:
            payload["up"] = args.up
            payload["down"] = args.down
    elif args.type == "daily":
        if args.frequency:
            payload["frequency"] = args.frequency
        if args.everyX is not None:
            payload["everyX"] = args.everyX
    elif args.type == "todo":
        if args.due:
            payload["date"] = args.due

    create_task(payload)

def create_predefined_tasks():
    tasks = [
        {
            "text": "Drink water",
            "type": "habit",
            "priority": 0.1,
            "attribute": "con",
            "up": True,
            "down": False
        },
        {
            "text": "Mock test",
            "type": "habit",
            "priority": 1.5,
            "attribute": "int",
            "up": True,
            "down": False
        },
        {
            "text": "SSC CGL preparation",
            "type": "daily",
            "frequency": "daily",
            "everyX": 1,
            "priority": 2,
            "attribute": "int",
            "startDate": "2026-06-14",
            "checklist": [
                {"text": "aptitude", "completed": False},
                {"text": "reasoning", "completed": False},
                {"text": "mock test", "completed": False},
                {"text": "revision", "completed": False}
            ]
        },
        {
            "text": "Morning run",
            "type": "daily",
            "frequency": "daily",
            "everyX": 1,
            "priority": 2,
            "attribute": "str",
            "startDate": "2026-06-14"
        },
        {
            "text": "Exercise",
            "type": "daily",
            "frequency": "weekly",
            "everyX": 1,
            "startDate": "2026-06-14",
            "priority": 1.5,
            "attribute": "str",
            "repeat": {"su": True, "m": False, "t": True, "w": False, "th": True, "f": False, "s": True}
        },
        {
            "text": "Errands",
            "type": "daily",
            "frequency": "daily",
            "everyX": 1,
            "priority": 1,
            "attribute": "con",
            "startDate": "2026-06-14",
            "checklist": [
                {"text": "house cleaning", "completed": False},
                {"text": "hair and face exercise", "completed": False},
                {"text": "eyes massage on face", "completed": False},
                {"text": "vitamin D and biotin tablets", "completed": False}
            ]
        },
        {
            "text": "Diary",
            "type": "daily",
            "frequency": "daily",
            "everyX": 1,
            "priority": 1,
            "attribute": "int",
            "startDate": "2026-06-14"
        }
    ]

    for task in tasks:
        create_task(task)

if __name__ == "__main__":
    create_predefined_tasks()
