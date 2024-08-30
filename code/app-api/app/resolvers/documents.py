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

def list_documents():
    result = scriveRequest('/api/v2/documents/list')
    return result

@strawberry.type
class Query:
    @strawberry.field
    def documents(self) -> list[Document]:
        return list_documents()

def scriveRequest(query):
    base_url = 'https://api-testbed.scrive.com'
    auth_header \
        = 'oauth_signature_method="PLAINTEXT", ' \
        + f'oauth_consumer_key="{os.environ["apitoken"]}", ' \
        + f'oauth_token="{os.environ["accesstoken"]}", ' \
        + f'oauth_signature="{os.environ["apisecret"]}&{os.environ["accesssecret"]}"'
    result = requests.get(base_url+query,headers={"Authorization":auth_header})
    print(result.status_code)

    resultJson = json.loads(result.text)
    return [Document(id=doc["id"],name=doc["title"]) for doc  in resultJson['documents']]
    