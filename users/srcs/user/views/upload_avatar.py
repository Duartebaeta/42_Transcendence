from django.views.generic import DetailView, FormView
from django.urls import reverse_lazy
from django.shortcuts import render
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator

from .forms import PostImage
from user.models import User

@method_decorator(csrf_exempt, name='dispatch')
class UploadAvatar(DetailView):
    model = User
    form_class = PostImage
    template_name = "upload_avatar.html"

@method_decorator(csrf_exempt, name='dispatch')
class UploadAvatar(FormView):
    form_class = PostImage
    template_name = 'upload_avatar.html'
    success_url = '/'  # Redirect after successful upload

    def form_valid(self, form):
        form.instance.user = self.request.user
        form.save()
        return super().form_valid(form)
