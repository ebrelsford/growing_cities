from django.views.generic import ListView

from rsssync.models import RssEntry


class EntriesView(ListView):
    feed_name = 'Growing Cities Blog'
    model = RssEntry
    paginate_by = 5
    template_name = 'news/rssentry_list.html'

    def get_queryset(self):
        return self.model.objects.filter(feed__name=self.feed_name).order_by('-date')
