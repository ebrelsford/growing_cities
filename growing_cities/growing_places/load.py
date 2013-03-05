import csv
import re
import traceback

from django.conf import settings
from django.contrib.gis.geos import Point

from inplace.geocode.mapquest import geocode
from .models import GrowingPlace


FILE = settings.DATA_ROOT + '/growing_places.csv'

def load_growing_places():
    reader = csv.DictReader(open(FILE))

    for place in reader:
        # skip empty rows
        if not place['Organization']:
            continue

        address = place['Address'].strip()
        city = place['City'].strip()
        state = place['State'].strip()
        zipcode = place['ZIP'].strip()
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
                    'address_line1': place['Address'].strip(),
                    'centroid': centroid,
                    'country': 'USA',
                    'mission': place['Mission'].strip(),
                    'contact': place['Phone'].strip(),
                    'postal_code': zipcode,
                    'url': place['Website'].strip(),
                },
            )
            print 'added', saved_place.name
        except Exception:
            print 'Exception while adding "%s"' % place['Organization']
            traceback.print_exc()
            continue
