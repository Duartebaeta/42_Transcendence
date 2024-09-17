import json

from django.http import JsonResponse

def load_json_request(request):
	try:
		return json.loads(request.body.decode('utf-8')), None
	except UnicodeDecodeError:
		return None, JsonResponse(status=400, data={'errors': ['Invalid UTF-8 encoded bytes']})
	except json.JSONDecodeError:
		return None, JsonResponse(status=400, data={'errors': ['Invalid JSON data format']});
