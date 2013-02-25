from django.views.generic import CreateView, DetailView

from django.core.urlresolvers import reverse_lazy

from .models import Story


class CreateStoryView(CreateView):
    model = Story
    success_url = reverse_lazy('stories:story_create_success')


class DetailStoryView(DetailView):
    model = Story
