import contextlib

from fabric.api import *


env.hosts = ['gc',]
env.use_ssh_config = True

server_project_dir = '~/webapps/gc_django_gu'
server_src_dir = '/'.join([server_project_dir, 'growing_cities'])
server_virtualenv = 'gc_django'


@contextlib.contextmanager
def workon(ve):
    with prefix('workon %s' % ve):
        yield


@task
def pull():
    with cd(server_src_dir):
        run('git pull')


@task
def build_static():
    with workon(server_virtualenv):
        run('django-admin.py collectstatic --noinput')


@task
def install_requirements():
    with workon(server_virtualenv):
        with cd(server_src_dir):
            run('pip install -r requirements/base.txt')
            run('pip install -r requirements/production.txt')


@task
def syncdb():
    with workon(server_virtualenv):
        run('django-admin.py syncdb')


@task
def migrate():
    with workon(server_virtualenv):
        run('django-admin.py migrate')


@task
def restart_django():
    sudo('supervisorctl ~/supervisor/supervisord.conf restart fc_django')


@task
def deploy():
    pull()
    install_requirements()
    syncdb()
    migrate()
    build_static()
    restart_django()
