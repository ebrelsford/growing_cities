from django import forms
from django.contrib.contenttypes.models import ContentType
from django.contrib.gis.geos import Point
from django.utils.translation import ugettext_lazy as _

from moderation.forms import BaseModeratedObjectForm

from photos.models import Photo
from .models import Activity, GrowingPlace


class GrowingPlaceForm(BaseModeratedObjectForm):

    #
    # Fields in the GrowingPlace model that we're tweaking for the form
    #
    activities = forms.ModelMultipleChoiceField(
        label=_('How can people get involved?'),
        queryset=Activity.objects.all(),
        required=False,
        widget=forms.SelectMultiple(attrs={'data-placeholder': 'Pick activities'}),
    )
    name = forms.CharField(
        label="What's your project name?",
        max_length=300,
    )
    mission = forms.CharField(
        label=_('Describe your project in one sentence'),
        widget=forms.Textarea(),
    )
    address_line1 = forms.CharField(
        max_length=150,
        widget=forms.HiddenInput(),
    )
    city = forms.CharField(
        max_length=50,
        widget=forms.HiddenInput(),
    )
    state_province = forms.CharField(
        max_length=50,
        widget=forms.HiddenInput(),
    )
    country = forms.CharField(
        initial='United States',
        max_length=50,
        widget=forms.HiddenInput(),
    )
    postal_code = forms.CharField(
        max_length=10,
        widget=forms.HiddenInput(),
    )

    #
    # Fields not present in the GrowingPlace model
    #
    location = forms.CharField(
        label="What's your project's address?",
        max_length=300,
    )
    photo = forms.ImageField(
        label=_(u'Upload a photo'),
        required=False,
    )
    latitude = forms.FloatField(widget=forms.HiddenInput())
    longitude = forms.FloatField(widget=forms.HiddenInput())


    def save(self, commit=True, **kwargs):
        instance = super(GrowingPlaceForm, self).save(commit=False, **kwargs)

        instance.centroid = Point(self.cleaned_data['longitude'],
                                  self.cleaned_data['latitude'])

        # Intentionally ignoring commit keyword to save Photo
        instance.save()

        if self.cleaned_data['photo']:
            photo = Photo(
                content_type=ContentType.objects.get_for_model(instance),
                object_id=instance.pk,
                original_image=self.cleaned_data['photo']
            )
            photo.save()

        return instance

    class Meta:
        fields = ('name', 'mission', 'url', 'activities', 'address_line1',
                  'city', 'state_province', 'postal_code', 'country',)
        model = GrowingPlace
