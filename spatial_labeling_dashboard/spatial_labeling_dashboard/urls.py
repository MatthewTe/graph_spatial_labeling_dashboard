from django.contrib import admin
from django.conf import settings
from django.urls import path, include
from django.conf.urls.static import static

from . import views

urlpatterns = [
    path('admin/', admin.site.urls),
    path("news_articles/", include("news_articles.urls")),
    path("manage_static_files/", include("upload_static_files.urls")),
    path("stream_minio_parquet_data/", views.stream_minio_parquet_spatial_data, name="stream_minio_parquet_spatial_data")
] + static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)

htmx_patterns = [
    path("render_unique_node_table/", views.generate_nodes_table, name="htmx-generate_nodes_table"),
    path("render_single_node_attrs_table/", views.generate_node_attrs_tbl, name="htmx-generate_node_attrs_table"),
    path("render_minio_search_component/", views.generate_minio_search_component, name="htmx-generate_minio_search_component"),
    path("render_minio_objects/", views.search_minio_objects, name="htmx-render_minio_objects_from_search")
]

urlpatterns = urlpatterns + htmx_patterns
