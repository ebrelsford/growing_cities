from django import forms
from django.contrib import admin

from ckeditor.widgets import CKEditorWidget
from imagekit.admin import AdminThumbnail

from .models import Partner


class PartnerForm(forms.ModelForm):
    text = forms.CharField(required=False, widget=CKEditorWidget)

    class Meta:
        model = Partner


class PartnerAdmin(admin.ModelAdmin):
    admin_thumbnail = AdminThumbnail(image_field='thumbnail')
    form = PartnerForm
    list_display = ('name', 'admin_thumbnail', 'order',)
    list_editable = ('order',)
    search_fields = ('name', 'text',)


admin.site.register(Partner, PartnerAdmin)

