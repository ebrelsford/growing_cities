from django.views.generic import DetailView, ListView

from fiber.models import Page
from rsssync.models import RssEntry


class EntriesView(ListView):
    feed_name = 'Growing Cities Blog'
    model = RssEntry
    paginate_by = 5
    template_name = 'news/rssentry_list.html'

    def get_queryset(self):
        return self.model.objects.filter(feed__name=self.feed_name).order_by('-date')


class EntryView(DetailView):
    model = RssEntry
    template_name = 'news/rssentry_detail.html'

    def get_page(self):
        return Page.objects.get(title='News')

    def get_context_data(self, **kwargs):
        context = super(EntryView, self).get_context_data(**kwargs)
        context['fiber_page'] = self.get_page()
        return context
