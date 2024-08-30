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
import base64

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
    endpoint:str

def list_documents():
    resultJson = scriveRequest('/api/v2/documents/list')
    print(resultJson)
    return [Document(id=doc["id"],name=doc["title"],filename=doc['file']['name'] if doc['file'] else "", fileid=doc['file']['id']  if doc['file'] else "", ctime=doc['ctime'],mtime=doc['mtime'],tags=doc['tags'],status=doc['status'], jsonstring=json.dumps(doc)) for doc in resultJson['documents']]

def streamTheFile(docPath:str):
    try:
        isExist = cb.get(env.get_couchbase_conf(),
                        cb.DocRef(bucket=env.get_couchbase_bucket(),
                                    collection='docs',
                                    key=docPath))
    except:
        pass

    if isExist:
        return isExist['base64string']
    else:
        return None

def get_documentFile(document_id:str, file_name:str):
    result = scriveRequestFile('/api/v2/documents/' + document_id + '/files/main/' + file_name)

    base64string = base64.b64encode(result.content)
    #docFolder = "" # "tempfiles/"
    docPath = document_id + "_" + file_name
    # if not os.path.exists(docFolder + docPath):
    #     with open(docFolder + docPath,"wb") as f:
    #         f.write(result.content)

    isExist = False
    try:
        isExist = cb.get(env.get_couchbase_conf(),
                        cb.DocRef(bucket=env.get_couchbase_bucket(),
                                    collection='docs',
                                    key=docPath))
    except:
        pass    
    if not isExist:
        cb.insert(env.get_couchbase_conf(),
                cb.DocSpec(bucket=env.get_couchbase_bucket(),
                             collection='docs',
                            key=docPath,
                            data={'base64string': str(base64string)}))

    return DocumentFile(id=document_id, endpoint=docPath,name=file_name)

@strawberry.type
class Query:
    @strawberry.field
    def documents(self) -> list[Document]:
        return list_documents()

    @strawberry.field
    def documentFile(self, id:str, filename:str) -> DocumentFile:
        return get_documentFile(id, filename)
    
def get_auth_header():
    auth_header \
        = 'oauth_signature_method="PLAINTEXT", ' \
        + f'oauth_consumer_key="{os.environ["apitoken"]}", ' \
        + f'oauth_token="{os.environ["accesstoken"]}", ' \
        + f'oauth_signature="{os.environ["apisecret"]}&{os.environ["accesssecret"]}"'
    return auth_header

def scriveRequestFile(query):
    base_url = 'https://api-testbed.scrive.com'
    auth_header = get_auth_header()
    result = requests.get(base_url+query,headers={"Authorization":auth_header})
    return result

def scriveRequest(query):
    base_url = 'https://api-testbed.scrive.com'
    auth_header = get_auth_header()
    result = requests.get(base_url+query,headers={"Authorization":auth_header})
    return json.loads(result.text)