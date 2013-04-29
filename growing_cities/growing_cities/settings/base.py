import os
from os.path import abspath, dirname

from django.core.exceptions import ImproperlyConfigured


def get_env_variable(var_name):
    """Get the environment variable or return exception"""
    try:
        return os.environ[var_name]
    except KeyError:
        error_msg = "Set the %s env variable" % var_name
        raise ImproperlyConfigured(error_msg)

ADMINS = (
    # ('Your Name', 'your_email@example.com'),
)

MANAGERS = ADMINS
DJANGO_MODERATION_MODERATORS = ()

DATABASES = {
    'default': {
        'ENGINE': 'django.contrib.gis.db.backends.postgis',
        'NAME': get_env_variable('GROWING_CITIES_DB_NAME'),
        'USER': get_env_variable('GROWING_CITIES_DB_USER'),
        'PASSWORD': get_env_variable('GROWING_CITIES_DB_PASSWORD'),
        'HOST': get_env_variable('GROWING_CITIES_DB_HOST'),
        'PORT': get_env_variable('GROWING_CITIES_DB_PORT'),
    }
}

LANGUAGE_CODE = 'en-us'

SITE_ID = 1

USE_I18N = True

USE_L10N = True

USE_TZ = True
TIME_ZONE = 'America/New_York'

PROJECT_ROOT = os.path.join(abspath(dirname(__file__)), '..', '..')

DATA_ROOT = os.path.join(PROJECT_ROOT, 'data')

MEDIA_ROOT = os.path.join(PROJECT_ROOT, 'media')
MEDIA_URL = '/media/'

CKEDITOR_UPLOAD_PATH = os.path.join(MEDIA_ROOT, 'ckeditor')

STATIC_ROOT = os.path.join(PROJECT_ROOT, 'collected_static')
STATIC_URL = '/static/'

STATICFILES_DIRS = (
    os.path.join(PROJECT_ROOT, 'static'),
)

STATICFILES_FINDERS = (
    'django.contrib.staticfiles.finders.FileSystemFinder',
    'django.contrib.staticfiles.finders.AppDirectoriesFinder',
    'compressor.finders.CompressorFinder',
)

SECRET_KEY = get_env_variable('GROWING_CITIES_SECRET_KEY')

TEMPLATE_LOADERS = (
    'django.template.loaders.filesystem.Loader',
    'django.template.loaders.app_directories.Loader',
)

MIDDLEWARE_CLASSES = (
    'django.middleware.common.CommonMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',

    'fiber.middleware.ObfuscateEmailAddressMiddleware',
    'fiber.middleware.AdminPageMiddleware',
)

TEMPLATE_CONTEXT_PROCESSORS = (
    'django.contrib.auth.context_processors.auth',
    'django.core.context_processors.media',
    'django.core.context_processors.request',
    'django.core.context_processors.static',

    'growing_cities.context_processors.activities',
    'growing_cities.context_processors.buy_button',
    'growing_cities.context_processors.cities',
    'growing_cities.context_processors.trailer',
)

ROOT_URLCONF = 'growing_cities.urls'

WSGI_APPLICATION = 'growing_cities.wsgi.application'

TEMPLATE_DIRS = (
    os.path.join(PROJECT_ROOT, 'templates'),
)

INSTALLED_APPS = (

    #
    # django contrib
    #
    'django.contrib.admin',
    'django.contrib.admindocs',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.gis',
    'django.contrib.messages',
    'django.contrib.sessions',
    'django.contrib.sites',
    'django.contrib.staticfiles',

    #
    # third-party
    #
    'ckeditor',
    'compressor',
    'contact_form',
    'feedparser',
    'fiber',
    'imagekit',
    'inplace',
    'moderation',
    'mptt',
    'south',
    'twittersync',

    #
    # first-party
    #
    'books',
    'buttons',
    'contact',
    'growing_places',
    'howtos',
    'news',
    'newsletter',
    'pages',
    'partners',
    'photos',
    'products',
    'rsssync',
    'screenings',
    'stories',
    'team',
    'videos',
)

PLACES_CLOUDMADE_KEY = '781b27aa166a49e1a398cd9b38a81cdf'
PLACES_CLOUDMADE_STYLE = '87617'

PLACES_MAPQUEST_KEY = 'Fmjtd%7Cluub2107l9%2C72%3Do5-96t5uu'

FIBER_TEMPLATE_CHOICES = (
    ('base.html', 'Default template'),
    ('content_page.html', 'Content template'),
    ('growing_places/map.html', 'Map template'),
)
FIBER_LOGIN_STRING = '@admin'

CKEDITOR_CONFIGS = {
    'default': {
        'toolbar': 'Basic',
    }
}

NEWSLETTER_VERTICAL_RESPONSE_WSDL = 'https://api.verticalresponse.com/wsdl/1.0/VRAPI.wsdl'
NEWSLETTER_VERTICAL_RESPONSE_USERNAME = get_env_variable('NEWSLETTER_VERTICAL_RESPONSE_USERNAME')
NEWSLETTER_VERTICAL_RESPONSE_PASSWORD = get_env_variable('NEWSLETTER_VERTICAL_RESPONSE_PASSWORD')
NEWSLETTER_VERTICAL_RESPONSE_LIST_ID = get_env_variable('NEWSLETTER_VERTICAL_RESPONSE_LIST_ID')
