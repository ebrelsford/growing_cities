from django.contrib.sites.models import Site

from buttons.models import Button
from growing_places.models import Activity, GrowingPlace
from videos.models import Video


def cities(request):
    """
    Adds cities to the request to populate the map drawer.
    """
    places = GrowingPlace.objects.filter(
        centroid__isnull=False,
        city__isnull=False,
        state_province__isnull=False,
    )
    places = places.distinct('city', 'state_province')
    places = places.order_by('state_province', 'city')
    return { 'cities': places.values('city', 'state_province'), }


def activities(request):
    """
    Adds activities to the request to populate the map drawer.
    """
    return { 'activities': Activity.objects.all(), }


def buy_button(request):
    """Adds buy button to the request."""
    try:
        button = Button.objects.get(name='bottom-right')
    except Exception:
        button = None
    return { 'buy_button': button, }


def trailer(request):
    """Adds trailer to the request."""
    try:
        trailer = Video.objects.get(name='Trailer')
    except Exception:
        trailer = None
    return { 'trailer': trailer, }


def current_site(request):
    return { 'current_site': Site.objects.get_current }
