from growing_places.models import GrowingPlace


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
