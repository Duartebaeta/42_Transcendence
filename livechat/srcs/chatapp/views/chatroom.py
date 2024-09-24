import json

from django.http import JsonResponse

from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from django.views import View

from shared.util import load_json_request

from django.core.serializers import serialize

from chatapp.models import User, ChatRoom, ChatMessage

from chatapp.serializers import ChatMessageSerializer

from shared.jwt_manager import AccessJWTManager

@method_decorator(csrf_exempt, name='dispatch')
class ChatRoomView(View):
	@csrf_exempt
	def post(self, request):
		access_token = request.headers.get('Authorization').split(' ')[1]
		if access_token is None:
			return JsonResponse(status=401, data={'errors': ['No access token given']})
		success, decoded_token, errors = AccessJWTManager.authenticate(access_token)
		if not success:
			return JsonResponse(status=401, data={'errors': errors})
		user_id = decoded_token.get('user_id')
		if user_id is None or user_id == '':
			return JsonResponse(status=400, data={'errors': ['No user id in the given token']})
		if not User.objects.filter(id=user_id).exists():
			return JsonResponse(status=400, data={'errors': ['There is no user with such id(Where did you get this boy -.-)']})

		json_request, err = load_json_request(request)
		if err is not None:
			return JsonResponse(status=400, data={'errors': [err]})

		otherUsername = json_request.get('user')
		print(otherUsername)
		if otherUsername is None or otherUsername == '':
			return JsonResponse(status=400, data={'errors': ['No username given to friend a user(How do i know who you wanna friend dumb dumb)']})
		otherUser = User.objects.filter(username=otherUsername).first()
		if otherUser is None:
			return JsonResponse(status=400, data={'errors': ['No such user with that username']})

		user1 = User.objects.filter(id=min(user_id, otherUser.id)).first()
		if user1 is None:
			return JsonResponse(status=400, data={'errors': ['No such user with that id']})
		user2 = User.objects.filter(id=max(user_id, otherUser.id)).first()

		try:
			chatroom = ChatRoom.objects.get(user1=user1, user2=user2)
		except ChatRoom.DoesNotExist:
			chatroom, _ = ChatRoom.objects.get_or_create(
			    user1=user1,
					user2=user2,
					name=f'{user1.id}-{user2.id}'
			)
			return JsonResponse(status=201, data={'message': 'Chatroom created'})
		messages = ChatMessage.objects.filter(room=chatroom)[0:30]
		return JsonResponse(status=200, data={"messages": ChatMessageSerializer(messages, many=True).data}, safe=False)
