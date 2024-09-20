from django.contrib import admin
from .models import ChatRoom, ChatMessage, User, BlockedUser, Friend
# Register your models here.

admin.site.register(User)
admin.site.register(BlockedUser)
admin.site.register(Friend)
admin.site.register(ChatRoom)
admin.site.register(ChatMessage)
