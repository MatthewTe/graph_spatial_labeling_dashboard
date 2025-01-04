from django.urls import path

from . import views

urlpatterns = [
    path("", views.spatial_labeling_main, name='news_articles_dashboard')
]