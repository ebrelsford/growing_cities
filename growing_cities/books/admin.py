from django import forms
from django.contrib import admin

from ckeditor.widgets import CKEditorWidget
from imagekit.admin import AdminThumbnail

from .models import Book


class BookForm(forms.ModelForm):
    text = forms.CharField(required=False, widget=CKEditorWidget)

    class Meta:
        model = Book


class BookAdmin(admin.ModelAdmin):
    admin_thumbnail = AdminThumbnail(image_field='thumbnail')
    form = BookForm
    list_display = ('name', 'admin_thumbnail', 'order',)
    search_fields = ('name', 'text',)


admin.site.register(Book, BookAdmin)
