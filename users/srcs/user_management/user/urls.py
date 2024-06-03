from django.urls import path

from user.views.sign_up import SignUp
from user.views.sign_in import SignIn

from user_management import settings

urlpatterns = [
	path('signup/', SignUp.as_view(), name='signup'),
	path('signin/', SignIn.as_view(), name='signin'),
]
