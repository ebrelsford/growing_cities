import re

from django import template
from django.template.loader import render_to_string

register = template.Library()

id_regexes = {
    'youtube': [
        # eg http://youtu.be/IIu16dy3ThI
        re.compile('^\S*youtu.be/(\S+)'),

        # eg http://www.youtube.com/watch?v=IIu16dy3ThI
        re.compile('^\S*youtube.com/\S+v=(\S+)'),
    ],
    'vimeo': [
        # eg http://vimeo.com/42288661
        re.compile('^\S*vimeo.com/(\S+)'),
    ],
}


def embed(video, args):
    width, height = args.split(',')
    return render_to_string('videos/embed_%s.html' % video.external_site, {
        'height': height,
        'width': width,
        'external_id': video.external_id,
        'video': video,
    })

register.filter('embed', embed)


def embed_by_url(video_url, args):
    width, height = args.split(',')
    site = _determine_site(video_url)
    external_id = _get_external_id(video_url, site)
    if not site or not external_id:
        # TODO just link to the video
        site = 'nosite'

    return render_to_string('videos/embed_%s.html' % site, {
        'height': height,
        'width': width,
        'external_id': external_id,
        'url': video_url,
    })


def _determine_site(url):
    """Try to determine the video site that the given url links to."""
    for site, regexes in id_regexes.items():
        if any(map(lambda r: r.match(url), regexes)):
            return site
    return None


def _get_external_id(url, site):
    """Try to get the external id of the video for the given url."""
    try:
        for regex in id_regexes[site]:
            match = regex.match(url)
            if match:
                return match.group(1)
    except KeyError:
        pass
    return None

register.filter('embed_by_url', embed_by_url)
