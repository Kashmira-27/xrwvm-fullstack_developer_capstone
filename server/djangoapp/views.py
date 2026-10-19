import json
import logging

from django.http import JsonResponse
from django.contrib.auth import login, authenticate, logout
from django.contrib.auth.models import User
from django.views.decorators.csrf import csrf_exempt

from .restapis import get_request, analyze_review_sentiments, post_review

logger = logging.getLogger(__name__)


@csrf_exempt
def login_user(request):
    if request.method != 'POST':
        return JsonResponse({'error': 'POST request required'}, status=405)

    try:
        data = json.loads(request.body)
        username = data.get('userName')
        password = data.get('password')

        user = authenticate(request, username=username, password=password)

        if user is not None:
            login(request, user)
            return JsonResponse({
                'userName': username,
                'status': 'Authenticated'
            })

        return JsonResponse({
            'userName': username or '',
            'status': 'Invalid credentials'
        }, status=401)

    except (json.JSONDecodeError, TypeError):
        return JsonResponse({'error': 'Invalid JSON'}, status=400)


@csrf_exempt
def logout_request(request):
    logout(request)
    return JsonResponse({'userName': ''})


@csrf_exempt
def registration(request):
    if request.method != 'POST':
        return JsonResponse({'error': 'POST request required'}, status=405)

    try:
        data = json.loads(request.body)
        username = data.get('userName')
        password = data.get('password')
        email = data.get('email', '')

        if not username or not password:
            return JsonResponse(
                {'error': 'Username and password are required'},
                status=400
            )

        if User.objects.filter(username=username).exists():
            return JsonResponse(
                {'error': 'Username already exists'},
                status=400
            )

        user = User.objects.create_user(
            username=username,
            password=password,
            email=email
        )
        login(request, user)

        return JsonResponse({
            'userName': user.username,
            'status': 'Authenticated'
        })

    except (json.JSONDecodeError, TypeError):
        return JsonResponse({'error': 'Invalid JSON'}, status=400)


def get_dealerships(request, state="All"):
    endpoint = (
        "/fetchDealers"
        if state == "All"
        else f"/fetchDealers/{state}"
    )

    dealerships = get_request(endpoint)

    if dealerships is None:
        return JsonResponse(
            {"error": "Unable to fetch dealerships"},
            status=502
        )

    return JsonResponse(dealerships, safe=False)


def get_dealer_details(request, dealer_id):
    details = get_request(f"/fetchDealer/{dealer_id}")

    if details is None:
        return JsonResponse(
            {"error": "Unable to fetch dealer details"},
            status=502
        )

    return JsonResponse(details, safe=False)


def get_dealer_reviews(request, dealer_id):
    reviews = get_request(f"/fetchReviews/dealer/{dealer_id}")

    if reviews is None:
        return JsonResponse(
            {"error": "Unable to fetch dealer reviews"},
            status=502
        )

    if isinstance(reviews, list):
        for review in reviews:
            text = review.get("review", "")
            if text:
                review["sentiment"] = analyze_review_sentiments(text)

    return JsonResponse(reviews, safe=False)


# Fetch car makes and models
def get_cars(request):
    cars = get_request("/get_cars")

    if cars is None:
        return JsonResponse(
            {"error": "Unable to fetch car makes and models"},
            status=502
        )

    return JsonResponse(cars, safe=False)


@csrf_exempt
def add_review(request):
    if request.method != 'POST':
        return JsonResponse({'error': 'POST request required'}, status=405)

    if not request.user.is_authenticated:
        return JsonResponse({'error': 'Authentication required'}, status=401)

    try:
        data = json.loads(request.body)
        result = post_review(data)

        if result is None:
            return JsonResponse(
                {'error': 'Unable to submit review'},
                status=502
            )

        return JsonResponse(result, safe=False)

    except (json.JSONDecodeError, TypeError):
        return JsonResponse({'error': 'Invalid JSON'}, status=400)