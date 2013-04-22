from django.conf import settings
from django.core.urlresolvers import reverse
from django.views.generic import FormView, TemplateView

from fiber.views import FiberPageMixin

from .api import subscribe
from .forms import SignupForm


class SignupFormView(FormView):
    form_class = SignupForm
    template_name = 'newsletter/form.html'

    def form_valid(self, form):
        if not settings.DEBUG:
            subscribe(form.cleaned_data['email'])
        return super(SignupFormView, self).form_valid(form)

    def get_success_url(self):
        return reverse('newsletter:completed')


class SignupCompleted(FiberPageMixin, TemplateView):
    template_name = 'newsletter/signup_completed.html'

    def get_fiber_page_url(self):
        return reverse('newsletter:completed')
