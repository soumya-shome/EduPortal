from django.shortcuts import render
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json

def index(request):
    return render(request, 'homepage/index.html')

def register(request):
    return render(request, 'homepage/register.html')

def my_api(request):
    data = {
        'message': 'Hello, this is your API response!',
        'items': ['Item 1', 'Item 2', 'Item 3']
    }
    return JsonResponse(data)

def api_data(request):
    return render(request, 'homepage/api_data.html')
    # response = requests.get('http://127.0.0.1:8000/api/')  # URL of the API endpoint
    # data = response.json()
    # return render(request, 'homepage/api_data.html', {'data': data})

# # If you want to avoid CSRF checks for this view
# @csrf_exempt  # (OPTIONAL, but only for development. Not recommended for production.)
# def login_verification(request):
#     if request.method == 'POST':
#         # Since the data is sent as JSON, you need to parse it
#         data = json.loads(request.body.decode('utf-8'))
#         username = data.get('username')
#         password = data.get('password')

#         # Check credentials (example check)
#         if username == 'admin' and password == 'admin':
#             return JsonResponse({'status': 'success'})
#         else:
#             return JsonResponse({'status': 'error'})

#     return JsonResponse({'status': 'invalid request'}, status=400)



@csrf_exempt  # Exempting CSRF only for development, use CSRF token in production
def login_verification(request):
    print("Request method: ", request)
    if request.method == 'POST':
        try:
            data = json.loads(request.body.decode('utf-8'))
            username = data.get('username')
            password = data.get('password')

            # Example: Hardcoded credential check
            if username == 'admin' and password == 'admin':
                # return render(request, 'homepage/api_data.html')
                return JsonResponse({'status': 'success', 'message': 'Login successful'})
            else:
                return JsonResponse({'status': 'error', 'message': 'Invalid credentials'}, status=401)
        except json.JSONDecodeError:
            return JsonResponse({'status': 'error', 'message': 'Invalid JSON format'}, status=400)
    return JsonResponse({'status': 'error', 'message': 'Invalid request method'}, status=405)
