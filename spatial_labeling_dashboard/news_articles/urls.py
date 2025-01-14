from django.urls import path

from . import views

urlpatterns = [
    path("", views.spatial_labeling_main, name='news_articles_dashboard')
]

htmx_patters = [
    path("render_news_label_component/<str:field_name>/<str:lat>/<str:lng>/<str:node_id>/<str:column_name>/<str:file_prefix>", views.load_news_article_label_component, name='htmx-render_news_article_labeling_component')
]

urlpatterns = urlpatterns + htmx_patters