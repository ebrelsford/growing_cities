import datetime
import feedparser

from django import template

register = template.Library()


@register.inclusion_tag('news/posts.html')
def pull_feed(feed_url, posts_to_show=5):
    """
    Display the most recent posts in a given feed.

    Adapted from http://djangosnippets.org/snippets/311/
    """
    feed = feedparser.parse(feed_url)
    posts = []
    for i in range(posts_to_show):
        pub_date = feed['entries'][i].updated_parsed
        published = datetime.date(pub_date[0], pub_date[1], pub_date[2])
        posts.append({
            'title': feed['entries'][i].title,
            'summary': feed['entries'][i].summary,
            'link': feed['entries'][i].link,
            'date': published,
        })
    return {'posts': posts}
