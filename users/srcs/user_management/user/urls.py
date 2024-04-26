from django.urls import path

from user.views.sign_up import SignUp

from user_management import settings

urlpatterns = [
	path('signup/', SignUp.as_view(), name='signup'),
]
