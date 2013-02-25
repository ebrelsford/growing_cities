from django import forms
from django.contrib import admin

from ckeditor.widgets import CKEditorWidget

from .models import Product


class ProductForm(forms.ModelForm):
    text = forms.CharField(widget=CKEditorWidget)

class ProductAdmin(admin.ModelAdmin):
    form = ProductForm
    list_display = ('name',)

admin.site.register(Product, ProductAdmin)
