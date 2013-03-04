from django.conf import settings
from django.core.urlresolvers import reverse
from django.utils.timezone import now
from django.views.generic import TemplateView

from contact_form.forms import BasicContactForm
from fiber.views import FiberPageMixin

from products.models import Product
from screenings.models import Screening
from stories.forms import StoryForm
from stories.models import Story


class LearnPage(FiberPageMixin, TemplateView):
    template_name = 'pages/learn.html'

    def get_context_data(self):
        context = super(LearnPage, self).get_context_data()
        context['stories'] = Story.objects.filter(featured=True)[:6]
        context['story_form'] = StoryForm()
        return context

    def get_fiber_page_url(self):
        return reverse('pages_learn')


class ScreeningsPage(FiberPageMixin, TemplateView):
    template_name = 'pages/screenings.html'

    def get_context_data(self):
        context = super(ScreeningsPage, self).get_context_data()
        context['screenings'] = Screening.objects.filter(time__gte=now()).order_by('time')
        return context

    def get_fiber_page_url(self):
        return reverse('pages_screenings')


class ShopPage(FiberPageMixin, TemplateView):
    template_name = 'pages/shop.html'

    def get_context_data(self):
        context = super(ShopPage, self).get_context_data()
        context['products'] = Product.objects.all()
        return context

    def get_fiber_page_url(self):
        return reverse('pages_shop')


class ContactPage(FiberPageMixin, TemplateView):
    template_name = 'pages/contact.html'

    def get_context_data(self):
        context = super(ContactPage, self).get_context_data()
        context['form'] = BasicContactForm()
        return context

    def get_fiber_page_url(self):
        return reverse('pages_contact')


class NewsPage(FiberPageMixin, TemplateView):
    template_name = 'pages/news.html'

    def get_context_data(self):
        context = super(NewsPage, self).get_context_data()
        context['feed_url'] = settings.GROWING_CITIES_BLOG_RSS_URL
        return context

    def get_fiber_page_url(self):
        return reverse('pages_news')
