# Generated by Django 5.0.6 on 2024-09-27 16:25

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='User',
            fields=[
                ('id', models.IntegerField(primary_key=True, serialize=False)),
                ('username', models.CharField(max_length=20, unique=True)),
                ('avatar', models.TextField(null=True)),
                ('wins', models.IntegerField(default=0)),
                ('losses', models.IntegerField(default=0)),
                ('tournament_wins', models.IntegerField(default=0)),
            ],
        ),
        migrations.CreateModel(
            name='Match',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('won', models.BooleanField(null=True)),
                ('player_score', models.IntegerField(null=True)),
                ('opponent_score', models.IntegerField(null=True)),
                ('time', models.DateTimeField(null=True)),
                ('opponent', models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='opponent', to='user_stats.user')),
                ('player', models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, related_name='player', to='user_stats.user')),
            ],
        ),
    ]