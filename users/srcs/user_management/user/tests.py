import json

from django.test import TestCase
from django.urls import reverse

from user.models import User

from user_management import settings
# Create your tests here.


class TestSignUp(TestCase):
	
	def run_test(self, username, email, password, expected_status, expected_errors):
		data = {
			'username':username,
			'email':email,
			'password':password,
		}
		url = reverse('signup')
		json_data = json.dumps(data)
		result = self.client.post(url, json_data, content_type='application/json')
		if result.status_code != 201 and expected_status == 201:
			print(result.json())
		self.assertEqual(expected_status, result.status_code)
		if expected_errors:
			self.assertEqual(expected_errors, result.json()['errors'])
	
	def test_signup_invalid_username(self):
		usernames = [
			(None, 'Username is empty'),
			('', 'Username is empty'),
			('x' * (settings.USERNAME_MIN_LENGTH - 1),
				f'Username is too short (minimum size {settings.USERNAME_MIN_LENGTH})'),
			('x' * (settings.USERNAME_MAX_LENGTH + 1),
				f'Username is too big (maximum size {settings.USERNAME_MAX_LENGTH})'),
			('Test1+', 'Username needs to be alpha numerical'),
		]
		password = 'UsernamePass_123'
		expected_status = 400
		number = 1
		for username, errors in usernames:
			email = 'a' + number.__str__() + '@a.pt'
			expected_errors = [errors]
			number += 1
			self.run_test(username,
					email,
					password,
					expected_status,
					expected_errors)
			
	def test_signup_valid_username(self):
		usernames = [
			'Fii',
			'fii',
			'FII',
			'fialexan',
			'fialexan42',
			'42fialexan',
			'x' * settings.USERNAME_MAX_LENGTH,
		]
		password = 'Username_Pass_123'
		expected_status = 201
		number = 1
		for username in usernames:
			email = 'a' + number.__str__() + '@a.pt'
			number += 1
			self.run_test(
					username,
					email,
					password,
					expected_status,
					expected_errors=None
					)
	
	def test_signup_invalid_email(self):
		emails = [
			(None, 'Email is empty'),
			('', 'Email is empty'),
			('x' * (settings.EMAIL_MAX_LENGTH + 1),
				f'Email is too big (maximum size {settings.EMAIL_MAX_LENGTH})'),
			('fialexanexample.pt', "Email doesn't have @"),
			('fialexan@@example.pt', 'Email contains more than one @'),
			('@example.pt', 'Email starts with @'),
			('fialexan@example..pt', 'Email contains a trailing comma'),
			('x' * (settings.EMAIL_RECIPIENT_MAX_LENGTH + 1) + '@example.pt',
				f'Email recipient name is too big (maximum size {settings.EMAIL_RECIPIENT_MAX_LENGTH})'),
			('fialexan+@example.pt', 'Email recipient name contains an invalid character'),
			('fialexan@' + ('x' * (settings.EMAIL_DOMAIN_MAX_LENGTH + 1)) + '.pt',
				f'Email domain name is too big (maximum size {settings.EMAIL_DOMAIN_MAX_LENGTH})'),
			('fialexan@example+.pt', 'Email domain name contains a forbidden character'),
			('fialexan@example.' + ('x' * (settings.EMAIL_TOP_LEVEL_DOMAIN_MAX_LENGTH + 1)),
				f'Email top level domain name is too big (maximum size {settings.EMAIL_TOP_LEVEL_DOMAIN_MAX_LENGTH})'),
		]
		
		number = 1
		password = 'Email_Pass_123'
		expected_status = 400
		for email, errors in emails:
			username = 'Fii' + number.__str__()
			expected_errors = [errors]
			number += 1
			self.run_test(
					username,
					email,
					password,
					expected_status,
					expected_errors
					)

	def test_signup_valid_email(self):
		emails = [
			'x' * settings.EMAIL_RECIPIENT_MAX_LENGTH + '@' + 'x' * settings.EMAIL_DOMAIN_MAX_LENGTH + '.' + 'x' * settings.EMAIL_TOP_LEVEL_DOMAIN_MAX_LENGTH,
			'fii@example.pt',
			'fialexan42@example.pt',
			'fialexan.42@example.pt',
			'fialan@example-example.pt'
		]
		number = 1
		password = 'Email_Pass_123'
		expected_status = 201
		for email in emails:
			username = 'Fii' + number.__str__()
			number += 1
			self.run_test(
				username,
				email,
				password,
				expected_status,
				expected_errors=None
			)
	
	def test_signup_invalid_password(self):
		passwords = [
			(None, 'Password is empty'),
			('', 'Password is empty'),
			('x' * (settings.PASSWORD_MIN_LENGTH - 1),
				f'Password is too short (minimum size {settings.PASSWORD_MIN_LENGTH})'),
			('x' * (settings.PASSWORD_MAX_LENGTH + 1),
				f'Password is too big (maximum size {settings.PASSWORD_MAX_LENGTH})'),
			('OlaAmigosAdeus', 'Password must contain atleast 1 number'),
			('OLAAMIGOS1234', 'Password must contain atleast 1 lowercase letter'),
			('olaamigos123456789', 'Password must contain atleast 1 uppercase letter'),
			('OlaAmigos1234Adeu<\s', 'Password must contain atleast 1 special character (*-_+)'),
		]
		number = 1
		expected_status = 400
		for password, error in passwords:
			username = 'Fii' + number.__str__()
			email = 'fii' + number.__str__() + '@example.pt'
			number += 1
			expected_error = [error]
			self.run_test(
				username,
				email,
				password,
				expected_status,
				expected_error
			)

	def test_signup_valid_password(self):
		passwords = [
			'OlaAmigos-1',
			'1234567890aS+',
			'*EUChamoME1234',
			'TestPAss_18237189372198329837129837',
			'x' * (settings.PASSWORD_MIN_LENGTH - 3) + 'A1-',
			'x' * (settings.PASSWORD_MAX_LENGTH - 3) + 'A2+',
			'+*-_-+__+*-+*+--___-a+*-+-*16*-+*++*T',
			'NormalLookingPassword++8520',
		]
		number = 1
		expected_status = 201
		for password in passwords:
			username = 'Fii' + number.__str__()
			email = 'fii' + number.__str__() + '@example.pt'
			number += 1
			self.run_test(
				username,
				email,
				password,
				expected_status,
				expected_errors=None
			)
