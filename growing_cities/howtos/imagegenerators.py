from imagekit import ImageSpec, register
from imagekit.processors import SmartResize


class ListThumbnail(ImageSpec):
    # Weird dimensions to match videos in the story list view
    processors = [SmartResize(width=236, height=145, upscale=False)]
    format = 'PNG'
    options = {'quality': 90}


register.generator('howtos:listthumbnail', ListThumbnail)
