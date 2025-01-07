from django.shortcuts import render, HttpResponse
from django.urls import reverse
from django.conf import settings

import json
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
                'node_id': None
            }
        )
        })

def load_news_article_label_component(request, field_name: str, lat: float, lng: float, node_id: str):

    neo4j_auth = (settings.NEO4J_CONFIG['username'], settings.NEO4J_CONFIG['password'])
    with GraphDatabase.driver(settings.NEO4J_CONFIG['endpoint'], auth=neo4j_auth) as driver:
        query = "MATCH (n {id: $id}) RETURN n"
        all_node_params = driver.execute_query(query, id=node_id)
        node_params_dict = dict(all_node_params.records[0]["n"])


    node_params_dict['geometry'] = {"latitude": lat, "longitude": lng}
    default_json_spatial_label = [
        {
            "type": 'node',
            "query_type":"MATCH",
            "properties": node_params_dict
        },
        {
            "type":"edge",
            "connection": {
                "from": "example_spatial_file",
                "to": node_params_dict['id']
            },
            "labels": ["SPATIAL_LABEL"],
            "properties": {
                "unique_field_name": "name",
                "value": field_name
            }
        }
    ]

    return render(request, "news_articles/label_output_component.html", {
        'json_request': json.dumps(default_json_spatial_label, indent=2)
    })

