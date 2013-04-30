import csv
import re
import traceback

from django.conf import settings
from django.contrib.gis.geos import Point

from moderation import moderation

from inplace.geocode.mapquest import geocode
from .models import Activity, GrowingPlace


activities = {
    'Dig in Dirt': 1,
    'Change the Law': 2,
    'Learn skills': 4,
    'Get your kids involved': 3,
    'Help your community thrive': 5,
    'Buy or trade good food': 6,
    'Cook healthy food': 7,
    'Create new growing spaces': 8,
}


def _get_activities(place):
    return [Activity.objects.get(pk=activities[a]) for a in activities
            if place[a] is not '']


def _strip_string(s):
    """Strip a string and get rid of any unicode"""
    return unicode(s, 'utf-8', 'ignore').strip().encode('ascii', 'ignore')


def load_growing_places(file_name='growing_places.csv'):
    reader = csv.DictReader(open(settings.DATA_ROOT + '/' + file_name))

    # Stop moderating GrowingPlace objects for now
    moderation.unregister(GrowingPlace)

    for place in reader:
        # skip empty rows
        if not place['Organization']:
            continue

        address = _strip_string(place['Address'])
        city = _strip_string(place['City'])
        state = _strip_string(place['State'])
        zipcode = _strip_string(place['ZIP'])
        # watch out for weird stuff in the zipcode field
        if not re.match('^[\d-]+$', zipcode):
            zipcode = None

        lng, lat = geocode(' '.join(filter(None, (address, city, state, zipcode))))
        try:
            centroid = Point(lng, lat)
        except TypeError:
            centroid = None

        try:
            saved_place, created = GrowingPlace.objects.get_or_create(
                name=place['Organization'].strip(),
                city=city,
                state_province=state,

                defaults={
                    'address_line1': address,
                    'centroid': centroid,
                    'country': 'USA',
                    'mission': place['Mission'].strip(),
                    'contact': place['Phone'].strip(),
                    'postal_code': zipcode,
                    'url': place['Website'].strip(),
                },
            )
            saved_place.activities = _get_activities(place)
            saved_place.save()
            print 'added', saved_place.name
        except Exception:
            print 'Exception while adding "%s"' % place['Organization']
            traceback.print_exc()
            continue

    # Start moderating GrowingPlace objects again
    moderation.register(GrowingPlace)
