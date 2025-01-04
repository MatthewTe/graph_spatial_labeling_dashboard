from typing import TypedDict

class Minio_Secrets(TypedDict):
    endpoint: str
    access_key: str
    secret_key: str

class Neo4J_Secrets(TypedDict):
    api_url: str
    endpoint: str
    username: str
    password: str