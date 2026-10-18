import requests
import os
from dotenv import load_dotenv
from urllib.parse import quote

load_dotenv()

backend_url = os.getenv(
    'backend_url', default="http://localhost:3030"
).rstrip('/')

sentiment_analyzer_url = os.getenv(
    'sentiment_analyzer_url',
    default="http://localhost:5050/"
).rstrip('/') + '/'


def get_request(endpoint, **kwargs):
    request_url = backend_url + endpoint
    print("GET request to:", request_url)

    try:
        response = requests.get(request_url, params=kwargs)
        response.raise_for_status()
        return response.json()
    except Exception as e:
        print("Network exception occurred:", e)
        return None


def analyze_review_sentiments(text):
    endpoint = sentiment_analyzer_url + "analyze/" + quote(text, safe='')
    try:
        response = requests.get(endpoint)
        response.raise_for_status()
        return response.json()
    except Exception as e:
        print("Sentiment analysis exception occurred:", e)
        return None


def post_review(data_dict):
    request_url = backend_url + "/insert_review"
    try:
        response = requests.post(request_url, json=data_dict)
        response.raise_for_status()
        return response.json()
    except Exception as e:
        print("Review submission exception occurred:", e)
        return None
