from django import forms
from user.models import User

class PostImage(forms.ModelForm):
    class Meta:
        model = User
        fields = ["avatarImg", "email"]
