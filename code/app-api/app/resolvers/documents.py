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

from langchain_openai import ChatOpenAI
from langchain_chroma import Chroma
from langchain_community.document_loaders import WebBaseLoader
from langchain_core.output_parsers import StrOutputParser
from langchain_core.runnables import RunnablePassthrough
from langchain_openai import OpenAIEmbeddings
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.document_loaders import DirectoryLoader
from langchain_core.prompts import PromptTemplate
from langchain_community.document_loaders import PyPDFLoader

logger = logging.getLogger(__name__)


def format_docs(docs):
    return "\n\n".join(doc.page_content for doc in docs)

def aiquery(docPath:str, query:str)->str:
    loader = PyPDFLoader(docPath)
    pages = loader.load_and_split()

    llm = ChatOpenAI(model="gpt-4o-mini")

    text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
    splits = text_splitter.split_documents(pages)
    vectorstore = Chroma.from_documents(documents=splits, embedding=OpenAIEmbeddings())

    # Retrieve and generate using the relevant snippets of the blog.
    retriever = vectorstore.as_retriever(search_type="similarity", search_kwargs={"k": 6})

    retrieved_docs = retriever.invoke(query)

    print(retrieved_docs)
    template = """Use the following pieces of context to answer the question at the end.
    If you don't know the answer, just say that you don't know, don't try to make up an answer.
    Use three sentences maximum and keep the answer as concise as possible.

    {context}

    Question: {question}

    Helpful Answer:"""
    custom_rag_prompt = PromptTemplate.from_template(template)

    rag_chain = (
        {"context": retriever | format_docs, "question": RunnablePassthrough()}
        | custom_rag_prompt
        | llm
        | StrOutputParser()
    )

    result = rag_chain.invoke(query)
    return result

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
    data:str

@strawberry.type
class DocumentContent:
    message:str

def get_docuemntContent(docPath:str, query:str)->DocumentContent:
    isExist = False

    try:
        isExist = cb.get(env.get_couchbase_conf(),
                        cb.DocRef(bucket=env.get_couchbase_bucket(),
                                    collection='docs',
                                    key=docPath))
    except:
        pass

    if not isExist:
        return DocumentContent(message="document not found")

    with open(docPath,"wb") as f:
        f.write(base64.b64decode(isExist.value["base64string"]))

    result = aiquery(docPath, query)
    print(result)
    os.remove(docPath)
    return DocumentContent(message=result)

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
    docPath = document_id + "_" + file_name
    result = None
    try:
        result = cb.get(env.get_couchbase_conf(),
                        cb.DocRef(bucket=env.get_couchbase_bucket(),
                                    collection='docs',
                                    key=docPath))
    except:
        pass

    if not result:
        result = scriveRequestFile('/api/v2/documents/' + document_id + '/files/main/' + file_name)
        base64string = base64.b64encode(result.content).decode('utf-8')
        cb.insert(env.get_couchbase_conf(),
                cb.DocSpec(bucket=env.get_couchbase_bucket(),
                             collection='docs',
                            key=docPath,
                            data={'base64string': base64string}))
        # print("new", base64string)
    else:
        base64string = result.value['base64string']


    return DocumentFile(id=document_id, endpoint=docPath,name=file_name,data=base64string)

@strawberry.type
class Query:
    @strawberry.field
    def documents(self) -> list[Document]:
        return list_documents()

    @strawberry.field
    def documentFile(self, id:str, filename:str) -> DocumentFile:
        return get_documentFile(id, filename)

    @strawberry.field
    def documentContent(self, docPath:str, query:str) -> DocumentContent:
        return get_docuemntContent(docPath,query)

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
