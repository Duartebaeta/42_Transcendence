import json
from shared.util import load_json_request

from django.http import JsonResponse

from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from django.views import View

from shared.util import load_json_request

from chatapp.models import User, ChatRoom, ChatMessage

@method_decorator(csrf_exempt, name='dispatch')
class Notification(View):
	@csrf_exempt
	def post(self, request):
		json_request, err = load_json_request(request)
		if err not None:
			return JsonResponse(status=400, data={'errors': [err]})

		user_id = json_request.get('user_id')
		text = json_request.get('text')

		if user_id is None or user_id == '':
			return JsonResponse(status=400, data={'errors': ['No user_id was given']})
		if text is None or text == '':
			return JsonResponse(status=400, data={'errors': ['No text was given']})
		if not User.objects.filter(id=user_id).exists():
			return JsonResponse(status=400, data={'errors': ['No user has such id']})
		user = User.objects.filter(id=user_id).first()
		
		chatroom_name = f'{user.id}-999'
		chatroom = ChatRoom.objects.filter(name=chatroom_name).first()
		if chatroom is None:
			return JsonResponse(status=400, data={'errors': ['No chatroom was found']})

		game_manager = User.objects.filter(id=999).first()
		message = ChatMessage.objects.create(user=game_manager, room=chatroom, message=text)
		try:
			message.save()
		except Exception as e:
			return JsonResponse(status=400, data={'errors': [str(e)]})
		return JsonResponse(status=200, data={'message': ['Message was sent succesfully! Wow so proud of you :)']})