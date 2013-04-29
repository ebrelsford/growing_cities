from datetime import datetime

from django.core.urlresolvers import reverse
from django.views.generic import FormView, TemplateView

from fiber.views import FiberPageMixin

from .forms import HostScreeningForm
from .models import Screening, Venue


class HostScreeningFormView(FormView):
    form_class = HostScreeningForm
    template_name = 'screenings/host_screening_form.html'

    def form_valid(self, form):
        # Create the venue
        venue, created = Venue.objects.get_or_create(
            name=form.cleaned_data['venue_name'],
            address_line1=form.cleaned_data['venue_address_line1'],
            city=form.cleaned_data['venue_city'],
            state_province=form.cleaned_data['venue_state_province'],
            postal_code=form.cleaned_data['venue_postal_code'],
        )

        # Create the screening
        # NB: Intentionally naive datetime--assuming the time given will be in
        # the appropriate timezone for the location given
        date = form.cleaned_data['date']
        time = form.cleaned_data['time']
        dt = datetime(
            year=date.year,
            month=date.month,
            day=date.day,
            hour=time.hour,
            minute=time.minute,
        )
        screening = Screening(
            time=dt,
            price=form.cleaned_data['price'],
            venue=venue,
        )
        screening.save()
        return super(HostScreeningFormView, self).form_valid(form)

    def get_success_url(self):
        return reverse('screenings:host_screening_completed')


class HostScreeningCompleted(FiberPageMixin, TemplateView):
    template_name = 'screenings/host_screening_completed.html'

    def get_fiber_page_url(self):
        return reverse('screenings:host_screening_completed')
