from rest_framework import serializers
from chatapp.models import ChatMessage

class ChatMessageSerializer(serializers.ModelSerializer):
	class Meta:
		model = ChatMessage
		fields = ('id', 'user', 'room', 'message', 'date')
