try:
    from johnny.cache import enable
    enable()
except Exception:
    # johnny-cache might not be installed (eg, locally). And that's okay.
    pass
