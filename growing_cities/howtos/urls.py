from django.conf.urls.defaults import patterns, url
from .views import ListHowToView


urlpatterns = patterns('',

    url('^howto/list/', ListHowToView.as_view(), name='howto_list'),

)
