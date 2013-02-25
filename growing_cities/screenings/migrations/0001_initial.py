# -*- coding: utf-8 -*-
import datetime
from south.db import db
from south.v2 import SchemaMigration
from django.db import models


class Migration(SchemaMigration):

    def forwards(self, orm):
        # Adding model 'Screening'
        db.create_table(u'screenings_screening', (
            (u'id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('time', self.gf('django.db.models.fields.DateTimeField')()),
            ('price', self.gf('django.db.models.fields.DecimalField')(null=True, max_digits=5, decimal_places=2, blank=True)),
            ('venue', self.gf('django.db.models.fields.related.ForeignKey')(to=orm['screenings.Venue'])),
        ))
        db.send_create_signal(u'screenings', ['Screening'])

        # Adding model 'Venue'
        db.create_table(u'screenings_venue', (
            (u'id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('centroid', self.gf('django.contrib.gis.db.models.fields.PointField')(null=True, blank=True)),
            ('polygon', self.gf('django.contrib.gis.db.models.fields.MultiPolygonField')(null=True, blank=True)),
            ('name', self.gf('django.db.models.fields.CharField')(max_length=256, null=True, blank=True)),
            ('address_line1', self.gf('django.db.models.fields.CharField')(max_length=150, null=True, blank=True)),
            ('address_line2', self.gf('django.db.models.fields.CharField')(max_length=150, null=True, blank=True)),
            ('postal_code', self.gf('django.db.models.fields.CharField')(max_length=10, null=True, blank=True)),
            ('city', self.gf('django.db.models.fields.CharField')(max_length=50, null=True, blank=True)),
            ('state_province', self.gf('django.db.models.fields.CharField')(max_length=40, null=True, blank=True)),
            ('country', self.gf('django.db.models.fields.CharField')(max_length=40, null=True, blank=True)),
        ))
        db.send_create_signal(u'screenings', ['Venue'])


    def backwards(self, orm):
        # Deleting model 'Screening'
        db.delete_table(u'screenings_screening')

        # Deleting model 'Venue'
        db.delete_table(u'screenings_venue')


    models = {
        u'screenings.screening': {
            'Meta': {'object_name': 'Screening'},
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'price': ('django.db.models.fields.DecimalField', [], {'null': 'True', 'max_digits': '5', 'decimal_places': '2', 'blank': 'True'}),
            'time': ('django.db.models.fields.DateTimeField', [], {}),
            'venue': ('django.db.models.fields.related.ForeignKey', [], {'to': u"orm['screenings.Venue']"})
        },
        u'screenings.venue': {
            'Meta': {'object_name': 'Venue'},
            'address_line1': ('django.db.models.fields.CharField', [], {'max_length': '150', 'null': 'True', 'blank': 'True'}),
            'address_line2': ('django.db.models.fields.CharField', [], {'max_length': '150', 'null': 'True', 'blank': 'True'}),
            'centroid': ('django.contrib.gis.db.models.fields.PointField', [], {'null': 'True', 'blank': 'True'}),
            'city': ('django.db.models.fields.CharField', [], {'max_length': '50', 'null': 'True', 'blank': 'True'}),
            'country': ('django.db.models.fields.CharField', [], {'max_length': '40', 'null': 'True', 'blank': 'True'}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'name': ('django.db.models.fields.CharField', [], {'max_length': '256', 'null': 'True', 'blank': 'True'}),
            'polygon': ('django.contrib.gis.db.models.fields.MultiPolygonField', [], {'null': 'True', 'blank': 'True'}),
            'postal_code': ('django.db.models.fields.CharField', [], {'max_length': '10', 'null': 'True', 'blank': 'True'}),
            'state_province': ('django.db.models.fields.CharField', [], {'max_length': '40', 'null': 'True', 'blank': 'True'})
        }
    }

    complete_apps = ['screenings']