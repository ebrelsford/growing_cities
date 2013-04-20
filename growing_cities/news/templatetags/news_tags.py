import re

from django import template

register = template.Library()

open_a_tag = re.compile('<a')


def make_links_target_blank(text):
    """Add target="_blank" to all links in the input text."""
    return re.sub(open_a_tag, '<a target="_blank" ', text)

register.filter('make_links_target_blank', make_links_target_blank)
