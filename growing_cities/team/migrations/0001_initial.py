# -*- coding: utf-8 -*-
import datetime
from south.db import db
from south.v2 import SchemaMigration
from django.db import models


class Migration(SchemaMigration):

    def forwards(self, orm):
        # Adding model 'TeamMember'
        db.create_table(u'team_teammember', (
            (u'id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('name', self.gf('django.db.models.fields.CharField')(max_length=200)),
            ('title', self.gf('django.db.models.fields.CharField')(max_length=200)),
            ('bio', self.gf('django.db.models.fields.TextField')()),
            ('original_image', self.gf('django.db.models.fields.files.ImageField')(max_length=100)),
        ))
        db.send_create_signal(u'team', ['TeamMember'])


    def backwards(self, orm):
        # Deleting model 'TeamMember'
        db.delete_table(u'team_teammember')


    models = {
        u'team.teammember': {
            'Meta': {'object_name': 'TeamMember'},
            'bio': ('django.db.models.fields.TextField', [], {}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'name': ('django.db.models.fields.CharField', [], {'max_length': '200'}),
            'original_image': ('django.db.models.fields.files.ImageField', [], {'max_length': '100'}),
            'title': ('django.db.models.fields.CharField', [], {'max_length': '200'})
        }
    }

    complete_apps = ['team']