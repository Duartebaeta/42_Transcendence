import json

def load_json_request(request):
	try:
		return json.loads(request.body.decode('utf-8')), None
	except UnicodeDecodeError:
		return None, 'Invalid UTF-8 encoded bytes'
	except json.JSONDecodeError:
		return None, 'Invalid JSON data format'
