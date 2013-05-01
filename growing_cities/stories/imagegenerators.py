from imagekit import ImageSpec, register
from imagekit.processors import ResizeToFit

class DetailThumbnail(ImageSpec):
    processors = [ResizeToFit(width=600, height=600, upscale=False)]
    format = 'PNG'
    options = {'quality': 90}

register.generator('stories:detailthumbnail', DetailThumbnail)
