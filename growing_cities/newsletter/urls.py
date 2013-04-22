from django.conf.urls.defaults import patterns, url

from .views import SignupFormView, SignupCompleted


urlpatterns = patterns('',
    url('^submit/$', SignupFormView.as_view(), name='form'),
    url('^success/$', SignupCompleted.as_view(), name='completed'),
)
