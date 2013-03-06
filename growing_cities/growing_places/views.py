import json

from django.core.urlresolvers import reverse
from django.http import HttpResponse
from django.views.generic import ListView, TemplateView

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
        return context

    def get_fiber_page_url(self):
        return reverse('growing_places_map')

    def _get_cities(self):
        places = GrowingPlace.objects.filter(
            centroid__isnull=False,
            city__isnull=False,
            state_province__isnull=False,
        )
        places = places.distinct('city', 'state_province')
        places = places.order_by('state_province', 'city')
        return places.values('city', 'state_province')


class JSONResponseMixin(object):
    """A simple mixin that can be used to render a JSON response."""
    response_class = HttpResponse

    def render_to_response(self, context, **response_kwargs):
        """
        Returns a JSON response, transforming 'context' to make the payload.
        """
        response_kwargs['content_type'] = 'application/json'
        return self.response_class(
            self.convert_context_to_json(context),
            **response_kwargs
        )

    def convert_context_to_json(self, context):
        """
        Convert the context dictionary into a JSON object.

        Adapted from the Django docs:
            https://docs.djangoproject.com/en/dev/topics/class-based-views/mixins/#jsonresponsemixin-example

        Is very naive, but will suit our purposes.
        """
        return json.dumps(context)


class CityBBOXView(JSONResponseMixin, ListView):
    allowed_filters = ('city', 'state_province',)
    model = GrowingPlace

    def get_context_data(self, **kwargs):
        qs = self.get_queryset()
        return {
            'bbox': qs.extent(),
            'places': [self._to_dict(place) for place in qs],
        }

    def get_queryset(self):
        qs = super(CityBBOXView, self).get_queryset()
        qs = qs.filter(**self._get_filters())
        return qs

    def _get_filters(self):
        filters = self.request.GET.dict()
        filters = filter(lambda (k, v): k in self.allowed_filters,
                         filters.items())
        return dict(filters)

    def _to_dict(self, place):
        return {
            'id': place.pk,
            'name': place.name,
            'city': place.city,
            'state_province': place.state_province,
        }
