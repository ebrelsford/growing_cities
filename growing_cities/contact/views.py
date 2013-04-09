from django.core.urlresolvers import reverse
from django.views.generic import TemplateView

from contact_form.views import ContactFormView as _ContactFormView
from fiber.views import FiberPageMixin

from .forms import GrowingCitiesContactForm


class ContactFormView(_ContactFormView):
    form_class = GrowingCitiesContactForm
    template_name = 'contact_form/form.html'


class ContactCompleted(FiberPageMixin, TemplateView):
    template_name = 'contact_form/contact_completed.html'

    def get_fiber_page_url(self):
        return reverse('contact_form:completed')
