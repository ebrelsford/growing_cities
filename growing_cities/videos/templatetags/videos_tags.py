from django import template
from django.template.loader import render_to_string

register = template.Library()


def embed(video, args):
    width, height = args.split(',')
    return render_to_string('videos/embed_%s.html' % video.external_site, {
        'height': height,
        'width': width,
        'video': video,
    })

register.filter('embed', embed)
