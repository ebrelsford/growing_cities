from django.views.generic import CreateView, DetailView, ListView

from django.core.urlresolvers import reverse_lazy

from .forms import StoryForm
from .models import Story


class CreateStoryView(CreateView):
    form_class = StoryForm
    model = Story
    success_url = reverse_lazy('stories:story_create_success')


class DetailStoryView(DetailView):
    model = Story


class ListStoryView(ListView):
    model = Story
    paginate_by = 6

    def get_queryset(self):
        return Story.objects.filter(featured=True)
