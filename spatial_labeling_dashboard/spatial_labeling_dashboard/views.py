from django.shortcuts import render, HttpResponse
from django.http import StreamingHttpResponse, JsonResponse
from django.conf import settings
from django.urls import reverse

from neo4j import GraphDatabase, RoutingControl, Result
from neo4j.exceptions import DriverError, Neo4jError

from minio import Minio
import geopandas as gpd
import pyarrow.parquet as pq
import pyarrow as pa

import s3fs
import json

"""
MATCH (n)
RETURN 
    n.id AS nodeId,
    labels(n) AS nodeLabels,
    EXISTS { MATCH (n)-[:SPATIAL_LABEL]-() } AS hasSpatialRelationship
"""


def generate_nodes_table(request):

    if request.method == "POST":
        if request.POST.get("inputText", None) is not None:
            neo4j_auth = (settings.NEO4J_CONFIG['username'], settings.NEO4J_CONFIG['password'])
            with GraphDatabase.driver(settings.NEO4J_CONFIG['endpoint'], auth=neo4j_auth) as driver:
                query = request.POST.get("inputText")
                try:
                    records_df = driver.execute_query(query, database_="neo4j", result_transformer_=Result.to_df)

                    return render(request, "node_id_table.html", {"node_records":records_df.to_records()})

                except (DriverError, Neo4jError) as exception:
                    print("%s raised an error: \n%s", query, exception)

        return HttpResponse("Hello World")

def generate_node_attrs_tbl(request):

    if request.method == "POST":

        if request.POST.get("nodeId", None) is not None:

            node_id = request.POST.get("nodeId")
            neo4j_auth = (settings.NEO4J_CONFIG['username'], settings.NEO4J_CONFIG['password'])
            with GraphDatabase.driver(settings.NEO4J_CONFIG['endpoint'], auth=neo4j_auth) as driver:
                query = "MATCH (n {id: $id}) RETURN n"
                all_node_params = driver.execute_query(query, id=node_id)
               
            return render(request, "single_node_table.html", {"node_properties": dict(all_node_params.records[0]["n"])})

def generate_minio_search_component(request):

    client =  Minio(
        settings.MINIO_CONFIG['endpoint'], 
        access_key=settings.MINIO_CONFIG['access_key'], 
        secret_key=settings.MINIO_CONFIG['secret_key'],
        secure=False
    )
        
    buckets = client.list_buckets()
    return render(request, "minio_search_component.html", {'minio_buckets': buckets})

def search_minio_objects(request):
    if request.method == "POST":
        if request.POST.get("minio_bucket_dropdown", False):

            client =  Minio(
                settings.MINIO_CONFIG['endpoint'], 
                access_key=settings.MINIO_CONFIG['access_key'], 
                secret_key=settings.MINIO_CONFIG['secret_key'],
                secure=False
            )

            buckets = request.POST.get("minio_bucket_dropdown")
            prefix = request.POST.get("minio_search_prefix", "")

            print(buckets, prefix)

            if prefix in ["", "/", '"']:
                objects = client.list_objects(bucket_name=buckets)
            else:
                objects = client.list_objects(bucket_name=buckets, prefix=prefix)
            
            file_objects = []
            for object in objects:
                file_objects.append({
                    "object_name": object.object_name,
                    "size": object.size,
                    "is_dir": object.is_dir,
                    "last_modified": object.last_modified,

                })

            return render(request, "minio_objects_table.html", {"minio_objects": file_objects})

    return HttpResponse("hello world")

def stream_minio_parquet_spatial_data(request):

    fs = s3fs.S3FileSystem(
        anon=False,
        use_ssl=False,
        client_kwargs={
            "endpoint_url": f"http://{settings.MINIO_CONFIG['endpoint']}",
            "aws_access_key_id": settings.MINIO_CONFIG['access_key'],
            "aws_secret_access_key":  settings.MINIO_CONFIG['secret_key']
        }
    )

    request_body_dict = json.loads(request.body.decode("utf-8"))
    full_parquet_path = f"{request_body_dict['bucket_name']}/{request_body_dict['parquet_path']}"   

    if request_body_dict['format_type'] == "geoarrow_stream":
        table = pq.read_table(full_parquet_path, filesystem=fs, columns=['geometry', 'name'])
        buffer = pa.BufferOutputStream()
        writer = pq.ParquetWriter(buffer, table.schema)

        writer.write_table(table)
        writer.close()
        
        raw_parquet_data = buffer.getvalue().to_pybytes()
        response = StreamingHttpResponse(
            iter([raw_parquet_data]),  # Iterable returning raw Parquet bytes
            content_type='application/octet-stream'  # Set content type for binary data
        )
        return response

    elif request_body_dict['format_type'] == "geojson":
        gdf: gpd.GeoDataFrame = gpd.read_parquet(full_parquet_path, filesystem=fs, columns=['geometry', 'name'])
        geojson = gdf.to_json()
        return JsonResponse(geojson, safe=False)
