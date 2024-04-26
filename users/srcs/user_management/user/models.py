from django.db import models
from user_management import settings
# Create your models here.

class User(models.Model):
	username = models.CharField(max_length=settings.USERNAME_MAX_LENGTH, unique=True)
	email = models.EmailField(max_length=settings.EMAIL_MAX_LENGTH, unique=True)
	password = models.CharField(max_length=settings.PASSWORD_MAX_LENGTH, null=True)
	