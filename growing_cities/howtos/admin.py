from django import forms
from django.contrib import admin

from ckeditor.widgets import CKEditorWidget
from imagekit.admin import AdminThumbnail

from .models import HowTo


class HowToForm(forms.ModelForm):
    text = forms.CharField(required=False, widget=CKEditorWidget)

    class Meta:
        model = HowTo


class HowToAdmin(admin.ModelAdmin):
    admin_thumbnail = AdminThumbnail(image_field='thumbnail')
    form = HowToForm
    list_display = ('name', 'admin_thumbnail', 'order',)
    search_fields = ('name', 'text',)


admin.site.register(HowTo, HowToAdmin)
