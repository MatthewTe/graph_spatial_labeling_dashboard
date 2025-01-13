from django.urls import path, include
from . import views

urlpatterns = [
    path("", views.render_static_file_upload_component, name='manage_static_files_page')
]

htmx_patterns = [
    path("upload_static_file_to_blob", views.upload_static_file, name='htmx-upload_static_file')
]

urlpatterns = urlpatterns + htmx_patterns