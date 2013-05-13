from django.views.generic import ListView

from howtos.models import HowTo


class ListHowToView(ListView):
    model = HowTo
    paginate_by = 6

    def get_queryset(self):
        return HowTo.objects.all()
