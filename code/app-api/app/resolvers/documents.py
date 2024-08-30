import asyncio
import time
from typing import AsyncGenerator, List
import strawberry
import uuid
import logging
from .. import couchbase as cb, env
from ..auth import IsAuthenticated
import requests
import os
import json

logger = logging.getLogger(__name__)

@strawberry.type
class Document:
    id: str
    name: str
    filename: str
    fileid: str
    ctime: str
    mtime: str
    status: str
    jsonstring: str
    tags : list[str]

@strawberry.type
class DocumentFile:
    id:str
    name:str
    jsonstring:str

def list_documents():
    resultJson = scriveRequest('/api/v2/documents/list')
    print(resultJson)
    return [Document(id=doc["id"],name=doc["title"],filename=doc['file']['name'] if doc['file'] else "", fileid=doc['file']['id']  if doc['file'] else "", ctime=doc['ctime'],mtime=doc['mtime'],tags=doc['tags'],status=doc['status'], jsonstring=json.dumps(doc)) for doc in resultJson['documents']]

def get_documentFile(document_id:str, file_name:str):
    resultJson = scriveRequest('/api/v2/documents/' + document_id + '/files/main/' + file_name)

    return DocumentFile(id=id, jsonstring=json.dumps(resultJson),name="s")

@strawberry.type
class Query:
    @strawberry.field
    def documents(self) -> list[Document]:
        return list_documents()

    @strawberry.field
    def documentFile(self, id:str, filename:str) -> DocumentFile:
        return get_documentFile(id, filename)

def scriveRequest(query):
    base_url = 'https://api-testbed.scrive.com'
    auth_header \
        = 'oauth_signature_method="PLAINTEXT", ' \
        + f'oauth_consumer_key="{os.environ["apitoken"]}", ' \
        + f'oauth_token="{os.environ["accesstoken"]}", ' \
        + f'oauth_signature="{os.environ["apisecret"]}&{os.environ["accesssecret"]}"'
    result = requests.get(base_url+query,headers={"Authorization":auth_header})
    return json.loads(result.text)