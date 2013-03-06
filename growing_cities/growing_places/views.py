from django.core.urlresolvers import reverse
from django.views.generic import TemplateView

from fiber.views import FiberPageMixin

from .models import GrowingPlace


class GrowingPlacesMapView(FiberPageMixin, TemplateView):
    template_name = 'growing_places/map.html'

    def get_context_data(self, **kwargs):
        context = super(GrowingPlacesMapView, self).get_context_data(**kwargs)
        context.update({
            'cities': self._get_cities(),
            'places_url': reverse('inplace:growing_places_growingplace_geojson'),
        })
        print context
        return context

    def get_fiber_page_url(self):
        return reverse('growing_places_map')

    def _get_cities(self):
        places = GrowingPlace.objects.filter(
            centroid__isnull=False,
            city__isnull=False,
            state_province__isnull=False,
        )\
        .distinct('city', 'state_province')\
        .order_by('state_province', 'city')
        cities_states = places.values_list('city', 'state_province')
        return [', '.join((city, state)) for (city, state) in cities_states]
