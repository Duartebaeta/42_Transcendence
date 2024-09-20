from string import ascii_letters as s_ascii_letters
from string import digits as s_digits

from django.contrib.sites.shortcuts import get_current_site
from django.template.loader import render_to_string
from django.utils.http import urlsafe_base64_encode
from django.utils.encoding import force_bytes
from django.contrib.auth.tokens import default_token_generator
from django.core.mail import EmailMessage
from django.conf import settings

from user.models import User

def send_verification_email(request, user):
  from_email = settings.DEFAULT_FROM_EMAIL
  current_site = get_current_site(request)
  mail_subject = 'Activate Your 42-Transcendence Account'
  message = render_to_string('accounts/emails/account_verification_email.html', {
    'user': user,
    'domain': current_site.domain,
    'uid': urlsafe_base64_encode(force_bytes(user.pk)),
    'token': default_token_generator.make_token(user),
  })
  to_email = user.email
  email = EmailMessage(mail_subject, message, from_email, to=[to_email])
  email.send(fail_silently=False)

def is_valid_username(username):
	if username is None or username == '':
		return False, 'Username is empty'
	if len(username) < settings.USERNAME_MIN_LENGTH:
		return False, f'Username is too short (minimum size {settings.USERNAME_MIN_LENGTH})'
	if len(username) > settings.USERNAME_MAX_LENGTH:
		return False, f'Username is too big (maximum size {settings.USERNAME_MAX_LENGTH})'
	if not username.isalnum():
		return False, 'Username needs to be alpha numerical'
	if User.objects.filter(username=username).exists():
		return False, 'Username is already taken'
	return True, None

def is_valid_email(email):
	if email is None or email == '':
		return False, 'Email is empty'
	if User.objects.filter(email=email).exists():
		return False, 'Email is already in use'
	if len(email) > settings.EMAIL_MAX_LENGTH:
		return False, f'Email is too big (maximum size {settings.EMAIL_MAX_LENGTH})'
	if not '@' in email:
		return False, "Email doesn't have @"
	if email.count('@') > 1:
		return False, 'Email contains more than one @'
	if email[0] == '@':
		return False, 'Email starts with @'
	if '..' in email:
		return False, 'Email contains a trailing comma'
	email_divided = email.rsplit('@', 1)
	if len(email_divided[0]) > settings.EMAIL_RECIPIENT_MAX_LENGTH:
		return False, f'Email recipient name is too big (maximum size {settings.EMAIL_RECIPIENT_MAX_LENGTH})'
	for char in email_divided[0]:
		if char not in f'{s_ascii_letters}{s_digits}.':
			return False, 'Email recipient name contains an invalid character'
	domain_name, top_level_domain = email_divided[1].rsplit('.', 1);
	if len(domain_name) > settings.EMAIL_DOMAIN_MAX_LENGTH:
		return False, f'Email domain name is too big (maximum size {settings.EMAIL_DOMAIN_MAX_LENGTH})'
	for char in domain_name:
		if char not in f'{s_ascii_letters}{s_digits}-':
			return False, 'Email domain name contains a forbidden character'
	if len(top_level_domain) > settings.EMAIL_TOP_LEVEL_DOMAIN_MAX_LENGTH:
		return False, f'Email top level domain name is too big (maximum size {settings.EMAIL_TOP_LEVEL_DOMAIN_MAX_LENGTH})'
	return True, None

def is_valid_password(password):
	if password is None or password == '':
		return False, 'Password is empty'
	if len(password) < settings.PASSWORD_MIN_LENGTH:
		return False, f'Password is too short (minimum size {settings.PASSWORD_MIN_LENGTH})'
	if len(password) > settings.PASSWORD_MAX_LENGTH:
		return False, f'Password is too big (maximum size {settings.PASSWORD_MAX_LENGTH})'
	if not any(char.isdigit() for char in password):
		return False, 'Password must contain atleast 1 number'
	if not any(char.islower() for char in password):
		return False, 'Password must contain atleast 1 lowercase letter'
	if not any(char.isupper() for char in password):
		return False, 'Password must contain atleast 1 uppercase letter'
	if not any(char in '*-_+' for char in password):
		return False, 'Password must contain atleast 1 special character (*-_+)'
	return True, None