from imagekit import ImageSpec, register
from imagekit.processors import ResizeToFit, SmartResize


class DetailThumbnail(ImageSpec):
    processors = [ResizeToFit(width=600, height=600, upscale=False)]
    format = 'PNG'
    options = {'quality': 90}


class ListThumbnail(ImageSpec):
    # Weird dimensions to match videos in the story list view
    processors = [SmartResize(width=236, height=145, upscale=False)]
    format = 'PNG'
    options = {'quality': 90}


register.generator('stories:detailthumbnail', DetailThumbnail)
register.generator('stories:listthumbnail', ListThumbnail)
