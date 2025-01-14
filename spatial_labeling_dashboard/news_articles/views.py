from django.shortcuts import render, HttpResponse
from django.urls import reverse
from django.conf import settings

import json
import uuid
from neo4j import GraphDatabase, RoutingControl, Result
from neo4j.exceptions import DriverError, Neo4jError



def spatial_labeling_main(request):
    return render(request, "news_articles/news_articles_main.html", {
        "stream_spatial_parquet_url": reverse('stream_minio_parquet_spatial_data'),
        'render_news_article_labeling_component_url':reverse(
            'htmx-render_news_article_labeling_component',
            kwargs = {
                'field_name': None,  
                'lat': None,                
                'lng': None,
                'node_id': None,
                'column_name': None,
                'file_prefix': None
            }
        ),
        "layers_config": settings.NEWS_ARTICLES_LAYERS 
        })

def load_news_article_label_component(
    request, 
    field_name: str, 
    lat: float, 
    lng: float, 
    node_id: str, 
    column_name: str, 
    file_prefix: str
):
    default_json_spatial_label = [
        {
            "type":"edge",
            "query_type": "MERGE",
            "connection": {
                "from": node_id,
                "to": str(uuid.uuid5(uuid.NAMESPACE_URL, file_prefix.replace("-", "/")))
            },
            "labels": ["SPATIAL_LABEL"],
            "properties": {
                "unique_field_name": column_name,
                "value": field_name,
                "geometry": {"latitude": lat, "longitude": lng}
            }
        }
    ]

    return render(request, "news_articles/label_output_component.html", {
        'json_request': json.dumps(default_json_spatial_label, indent=1)
    })

