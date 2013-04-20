import logging

from django.conf import settings

from suds.client import Client

logger = logging.getLogger(__name__)

try:
    client = Client(settings.NEWSLETTER_VERTICAL_RESPONSE_WSDL)
except Exception:
    client = None
    logger.exception('Exception caught while creating Vertical Response '
                     'client.')


def subscribe(email_address):
    """Subscribe an email address to the mailing list."""
    session_id = _login(
        username=settings.NEWSLETTER_VERTICAL_RESPONSE_USERNAME,
        password=settings.NEWSLETTER_VERTICAL_RESPONSE_PASSWORD,
    )
    try:
        _add_list_member(
            session_id,
            list_id=settings.NEWSLETTER_VERTICAL_RESPONSE_LIST_ID,
            email_address=email_address
        )
    except Exception:
        logger.exception('Exception caught while subscribing %s'
                         % email_address)


def _login(username=None, password=None):
    """Login to Vertical Response, returning the session ID."""
    return client.service.login({
        'username': username,
        'password': password,
    })


def _add_list_member(session_id, list_id=None, email_address=None):
    """Add the given email address to the given list in Vertical Response."""
    client.service.addListMember({
        'session_id': session_id,
        'list_member': {
            'list_id': list_id,
            'member_data': [
                { 'name': 'email_address', 'value': email_address, },
            ],
        }
    })
