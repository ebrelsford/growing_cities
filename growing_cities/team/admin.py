from django import forms
from django.contrib import admin

from ckeditor.widgets import CKEditorWidget
from imagekit.admin import AdminThumbnail

from .models import TeamMember


class TeamMemberForm(forms.ModelForm):
    bio = forms.CharField(widget=CKEditorWidget)


class TeamMemberAdmin(admin.ModelAdmin):
    admin_thumbnail = AdminThumbnail(image_field='thumbnail')
    form = TeamMemberForm
    list_display = ('name', 'order', 'admin_thumbnail',)
    search_fields = ('name',)


admin.site.register(TeamMember, TeamMemberAdmin)
