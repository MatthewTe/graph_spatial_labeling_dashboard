from django.shortcuts import render
from django.urls import reverse

def spatial_labeling_main(request):
    return render(request, "news_articles/news_articles_main.html", {"stream_spatial_parquet_url": reverse('stream_minio_parquet_spatial_data')})

