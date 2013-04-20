from django.conf import settings
from django.core.urlresolvers import reverse
from django.views.generic import TemplateView

from contact_form.views import ContactFormView as _ContactFormView
from fiber.views import FiberPageMixin

from newsletter.api import subscribe
from .forms import GrowingCitiesContactForm


class ContactFormView(_ContactFormView):
    form_class = GrowingCitiesContactForm
    template_name = 'contact_form/form.html'

    def form_valid(self, form):
        if not settings.DEBUG:
            subscribe(form.cleaned_data['email'])
        return super(ContactFormView, self).form_valid(form)


class ContactCompleted(FiberPageMixin, TemplateView):
    template_name = 'contact_form/contact_completed.html'

    def get_fiber_page_url(self):
        return reverse('contact_form:completed')
