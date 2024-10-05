from django.urls import include, path

urlpatterns = [
	path('cli-api/', include('cli_api.urls'))
]
