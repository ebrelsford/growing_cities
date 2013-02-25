from django.core.urlresolvers import reverse

from fiber.views import FiberPageMixin
from places.views import PlacesListView

from .models import GrowingPlace


class GrowingPlacesMapView(FiberPageMixin, PlacesListView):
    queryset = GrowingPlace.objects.filter(centroid__isnull=False)
    template_name = 'growing_places/map.html'

    def get_fiber_page_url(self):
        return reverse('growing_places_map')
