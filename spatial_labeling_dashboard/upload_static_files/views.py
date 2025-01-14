from django.shortcuts import render, HttpResponse
from neo4j import GraphDatabase
from django.conf import settings

import io
import uuid 
import requests
import traceback
from minio import Minio

def render_static_file_upload_component(request):
    return render(request, "upload_static_files/uploading_spatial_file.html", {})


def upload_static_file(request):

    if request.method == "POST":

        if request.POST.get("minio_bucket_dropdown", False) and request.POST.get("uploaded_file_prefix", False):
            
            node_id = str(uuid.uuid5(uuid.NAMESPACE_URL, request.POST.get("uploaded_file_prefix")))
            neo4j_auth = (settings.NEO4J_CONFIG['username'], settings.NEO4J_CONFIG['password'])

            client =  Minio(
                settings.MINIO_CONFIG['endpoint'], 
                access_key=settings.MINIO_CONFIG['access_key'], 
                secret_key=settings.MINIO_CONFIG['secret_key'],
                secure=False
            )
            bucket = request.POST.get("minio_bucket_dropdown")
            prefix = request.POST.get("uploaded_file_prefix")

            try:
                file_response = client.stat_object(bucket, prefix)
                print(f"File: {file_response.object_name} exists")
                file_exists = True
            except Exception as e:
                file_exists = False
                print(f"File {bucket, prefix} does not exist")

            with GraphDatabase.driver(settings.NEO4J_CONFIG['endpoint'], auth=neo4j_auth) as driver:
                query = "MATCH (n {id: $id}) RETURN n"
                all_node_params = driver.execute_query(query, id=node_id)
                print(all_node_params)
                node_params_dict = dict(all_node_params.records)

                if len(node_params_dict) == 0:
                  
                    try:
                        if file_exists:
                            file_stream = io.BytesIO(request.FILES['file'].read())
                            file_stream.seek(0)

                            result = client.put_object(
                                bucket,
                                prefix,
                                file_stream,
                                file_stream.getbuffer().nbytes,
                                metadata={"graph_static_file_id": node_id}
                            )

                            print("created {0} object; etag: {1}, version-id: {2}".format(
                                result.object_name, result.etag, result.version_id)
                            )

                        file_creation_request = [
                            {
                                "type": "node",
                                "query_type": "MERGE",
                                "labels": ["Static_File", "Blob", "Spatial_File"],
                                "properties": {
                                    "id": node_id,
                                    "full_file_prefix": prefix,
                                    "bucket_name": bucket
                                }
                            }
                        ]

                        node_creation_response = requests.post(f"{settings.NEO4J_CONFIG['api_url']}/v1/api/run_query", json=file_creation_request)
                        node_creation_response.raise_for_status()
                        print(node_creation_response.json())

                        query = "MATCH (n {id: $id}) RETURN n"
                        all_node_params = driver.execute_query(query, id=node_id)
                    
                        return render(request, "single_node_table.html", {"node_properties": dict(all_node_params.records[0]["n"])})

                    except Exception as e:
                        traceback.print_exception(e)
                        return HttpResponse(f"Error in creating node and minio file: {e.with_traceback(None)}")

                else:
                    return HttpResponse(f"Node Id {node_id} already exists")

        return HttpResponse("Hello World")