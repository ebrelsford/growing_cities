from django.conf import settings
from django.conf.urls import patterns, include, url
from django.conf.urls.static import static

from django.contrib import admin
admin.autodiscover()

from django.contrib.staticfiles.urls import staticfiles_urlpatterns

from growing_places.views import GrowingPlacesMapView
from pages.views import ContactPage, LearnPage, ScreeningsPage, ShopPage, NewsPage

urlpatterns = static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT, show_indexes=True)

urlpatterns += staticfiles_urlpatterns()

urlpatterns += patterns('',

    # pages with special views
    url(r'^$', GrowingPlacesMapView.as_view(), name='growing_places_map'),
    url(r'^contact/$', ContactPage.as_view(), name='pages_contact'),
    url(r'^learn/', LearnPage.as_view(), name='pages_learn'),
    url(r'^screenings/', ScreeningsPage.as_view(), name='pages_screenings'),
    url(r'^shop/', ShopPage.as_view(), name='pages_shop'),
    url(r'^news/', NewsPage.as_view(), name='pages_news'),

    # first-party views
    url(r'^contact/', include('contact.urls', 'contact_form')),
    url(r'^growing_places/', include('growing_places.urls')),
    url(r'^inplace/', include('inplace.urls', 'inplace')),
    url(r'^stories/', include('stories.urls', 'stories')),

    # third-party views
    (r'^ckeditor/', include('ckeditor.urls')),

    #
    # fiber
    #
    (r'^api/v2/', include('fiber.rest_api.urls')),
    (r'^admin/fiber/', include('fiber.admin_urls')),
    (r'^jsi18n/$', 'django.views.i18n.javascript_catalog', {'packages': ('fiber',),}),

    # admin views
    url(r'^admin/doc/', include('django.contrib.admindocs.urls')),
    url(r'^admin/', include(admin.site.urls)),

    (r'', 'fiber.views.page'),
)

from moderation.helpers import auto_discover
auto_discover()
