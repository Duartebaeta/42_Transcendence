from django.db import models
from user_management import settings
# Create your models here.

class User(models.Model):
	username = models.CharField(max_length=settings.USERNAME_MAX_LENGTH, unique=True)

	email = models.EmailField(max_length=settings.EMAIL_MAX_LENGTH, unique=True)
	emailVerified = models.BooleanField(default=False)
	emailTokenVerification = models.CharField(max_length=settings.EMAIL_VERIFICATION_TOKEN_MAX_LENGTH, null=True)
	emailTokenVerificationExpiration = models.DateTimeField(null=True)
	avatar = models.TextField(null=True)
	password = models.CharField(max_length=settings.PASSWORD_MAX_LENGTH, null=True)
	last_login = models.DateTimeField(null=True)

	def get_email_field_name(self):
		return self.email
