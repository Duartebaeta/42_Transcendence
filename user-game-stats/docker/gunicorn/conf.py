"""
Gunicorn config file
"""

# Django App
wsgi_app = 'user_game_stats.wsgi:application'

# Workers
workers = 4

# Bind to address/socket
bind = '0.0.0.0:8080'

keyfile = '/app/ssl/private.key'
certfile = '/app/ssl/certificate.crt'

# Don't let it detach and go to background
daemon = False