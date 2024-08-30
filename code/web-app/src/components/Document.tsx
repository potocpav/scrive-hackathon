import React from 'react'
import { useQuery } from '@apollo/client'
import {
  DOCUMENTS,
} from '../graphql/documents'

interface DocumentT {
  id: string
  name: string
  filename: string
  ctime: string
  mtime: string
  status: string
  jsonstring: string
  tags: [string]
}

interface Props {
  document: DocumentT,
  setPage: Function,
}

const Document: React.FC<Props> = ({document, setPage}) => {
  const { data, loading, error } = useQuery(DOCUMENTS)

  console.log(document);

  return (
    <div className="min-h-screen flex flex-col">
      <div className="navbar bg-base-300 text-neutral-content">
        <div className="flex-1">
          <h1 className="text-2xl">
              {document.name}
          </h1>
        </div>
      </div>
      <div className="hover:underline hover:cursor-pointer" onClick={() => setPage({"name": "list"})}>
        Back to document list
      </div>

      <div>
        ID: {document.id}
      </div>
      <div>
        Created at: {document.ctime}
      </div>
      <div>
        Modified at: {document.mtime}
      </div>
      <div>
        Status: {document.status}
      </div>
      <div>
        tags: {document.tags}
      </div>
      <div>
        JSON: {document.jsonstring}
      </div>
    </div>
  )
}

export default Document
export type {DocumentT}
