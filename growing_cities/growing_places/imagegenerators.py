from imagekit import ImageSpec, register
from imagekit.processors import SmartResize


class PopupThumbnail(ImageSpec):
    processors = [SmartResize(width=380, height=100, upscale=False)]
    format = 'PNG'
    options = {'quality': 90}

register.generator('growing_places:popupthumbnail', PopupThumbnail)
