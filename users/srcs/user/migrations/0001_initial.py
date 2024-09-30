# Generated by Django 5.0.6 on 2024-09-27 16:04

from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='User',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('username', models.CharField(max_length=20, unique=True)),
                ('email', models.EmailField(max_length=382, unique=True)),
                ('emailVerified', models.BooleanField(default=False)),
                ('emailTokenVerification', models.CharField(max_length=100, null=True)),
                ('emailTokenVerificationExpiration', models.DateTimeField(null=True)),
                ('avatar', models.TextField(null=True)),
                ('password', models.CharField(max_length=50, null=True)),
                ('last_login', models.DateTimeField(null=True)),
            ],
        ),
    ]