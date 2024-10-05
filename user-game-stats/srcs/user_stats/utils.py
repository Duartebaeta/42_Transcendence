from user_stats.models import Match
from user_stats.models import User

def get_last_five_matches(user):
		last_matches = Match.objects.filter(player=user).order_by("-time")[:5]
		last_matches_points = []

		for match in last_matches:
			last_matches_points.append(match.player_score)

		if len(last_matches_points) == 1:
			last_matches_points.append(0)
		return last_matches_points

def get_user_stats(user_id):
	user = User.objects.filter(id=user_id).first()
	last_matches_points = get_last_five_matches(user)
	data = {
		'username': user.username,
		'avatar': user.avatar,
		'gamesPlayed': user.wins + user.losses,
		'wins': user.wins,
		'losses': user.losses,
		'tournamentWins': user.tournament_wins,
		'points': last_matches_points
	}
	return data