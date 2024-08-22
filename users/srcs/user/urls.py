from django.urls import path

from user.views.sign_up import SignUp
from user.views.sign_in import SignIn
from user.views.change_username import ChangeUsername
from user.views.change_password import ChangePassword

from user_management import settings

urlpatterns = [
	path('sign-up/', SignUp.as_view(), name='signup'),
	path('sign-in/', SignIn.as_view(), name='signin'),
	path('change-username/', ChangeUsername.as_view(), name='changeusername'),
	path('change-password/', ChangePassword.as_view(), name='changepassword'),
]