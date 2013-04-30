from math import ceil

from django.core.urlresolvers import reverse
from django.utils.timezone import now
from django.views.generic import TemplateView

from fiber.views import FiberPageMixin

from books.models import Book
from howtos.models import HowTo
from partners.models import Partner
from products.models import Product
from screenings.models import Screening
from stories.forms import StoryForm
from stories.models import Story
from team.models import TeamMember


class FilmPage(FiberPageMixin, TemplateView):
    template_name = 'pages/film.html'

    def get_context_data(self):
        context = super(FilmPage, self).get_context_data()
        context['partners'] = Partner.objects.all()
        context['teammembers'] = TeamMember.objects.all()[:6]
        return context

    def get_fiber_page_url(self):
        return reverse('pages_film')


class LearnPage(FiberPageMixin, TemplateView):
    template_name = 'pages/learn.html'

    def get_context_data(self):
        stories = Story.objects.filter(featured=True)

        context = super(LearnPage, self).get_context_data()
        context['books'] = Book.objects.all()[:6]
        context['howtos'] = HowTo.objects.all()[:6]
        context['story_pages'] = int(ceil(stories.count() / 6.0))
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

    def get_fiber_page_url(self):
        return reverse('pages_contact')


class SignUpPage(FiberPageMixin, TemplateView):
    template_name = 'pages/signup.html'

    def get_fiber_page_url(self):
        return reverse('pages_signup')


class NewsPage(FiberPageMixin, TemplateView):
    template_name = 'pages/news.html'

    def get_fiber_page_url(self):
        return reverse('pages_news')
