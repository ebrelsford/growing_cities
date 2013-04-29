# -*- coding: utf-8 -*-
import datetime
from south.db import db
from south.v2 import SchemaMigration
from django.db import models


class Migration(SchemaMigration):

    def forwards(self, orm):
        # Adding model 'HowTo'
        db.create_table(u'howtos_howto', (
            (u'id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('name', self.gf('django.db.models.fields.CharField')(max_length=200)),
            ('image', self.gf('django.db.models.fields.files.ImageField')(max_length=100, null=True, blank=True)),
            ('text', self.gf('django.db.models.fields.TextField')(null=True, blank=True)),
            ('link', self.gf('django.db.models.fields.URLField')(max_length=200)),
            ('order', self.gf('django.db.models.fields.PositiveIntegerField')(default=0)),
        ))
        db.send_create_signal(u'howtos', ['HowTo'])


    def backwards(self, orm):
        # Deleting model 'HowTo'
        db.delete_table(u'howtos_howto')


    models = {
        u'howtos.howto': {
            'Meta': {'ordering': "('order',)", 'object_name': 'HowTo'},
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'image': ('django.db.models.fields.files.ImageField', [], {'max_length': '100', 'null': 'True', 'blank': 'True'}),
            'link': ('django.db.models.fields.URLField', [], {'max_length': '200'}),
            'name': ('django.db.models.fields.CharField', [], {'max_length': '200'}),
            'order': ('django.db.models.fields.PositiveIntegerField', [], {'default': '0'}),
            'text': ('django.db.models.fields.TextField', [], {'null': 'True', 'blank': 'True'})
        }
    }

    complete_apps = ['howtos']