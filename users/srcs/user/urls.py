from django.urls import path

from user.views.me import Me
from user.views.sign_up import SignUp
from user.views.sign_in import SignIn
from user.views.change_username import ChangeUsername
from user.views.change_password import ChangePassword
from user.views.change_avatar import ChangeAvatar
from user.views.activate import Activate
from user.views.refresh_jwt_token import RefreshJwtToken

from user_management import settings

urlpatterns = [
	path('me/', Me.as_view(), name='me'),
	path('sign-up/', SignUp.as_view(), name='signup'),
	path('sign-in/', SignIn.as_view(), name='signin'),
	path('change-username/', ChangeUsername.as_view(), name='changeusername'),
	path('change-password/', ChangePassword.as_view(), name='changepassword'),
	path('change-avatar/', ChangeAvatar.as_view(), name='changeavatar'),
	path('refresh_jwt/', RefreshJwtToken.as_view(), name='refreshjwt'),
	path('activate/<uidb64>/<token>/', Activate.as_view(), name='activate'),
]
