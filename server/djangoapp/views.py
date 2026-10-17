import json
import logging

from django.http import JsonResponse
from django.contrib.auth import login, authenticate, logout
from django.contrib.auth.models import User
from django.views.decorators.csrf import csrf_exempt

logger = logging.getLogger(__name__)


# Login
@csrf_exempt
def login_user(request):
    if request.method != 'POST':
        return JsonResponse(
            {'error': 'POST request required'},
            status=405
        )

    try:
        data = json.loads(request.body)
        username = data.get('userName')
        password = data.get('password')

        user = authenticate(
            request,
            username=username,
            password=password
        )

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


# Logout
@csrf_exempt
def logout_request(request):
    logout(request)
    return JsonResponse({'userName': ''})


# Registration
@csrf_exempt
def registration(request):
    if request.method != 'POST':
        return JsonResponse(
            {'error': 'POST request required'},
            status=405
        )

    try:
        data = json.loads(request.body)
        username = data.get('userName')
        password = data.get('password')
        email = data.get('email', '')

        if not username or not password:
            return JsonResponse({
                'error': 'Username and password are required'
            }, status=400)

        if User.objects.filter(username=username).exists():
            return JsonResponse({
                'error': 'Username already exists'
            }, status=400)

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