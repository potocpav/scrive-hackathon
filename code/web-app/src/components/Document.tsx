import React from 'react'
import { useQuery } from '@apollo/client'
import {
  DOCUMENTS,
} from '../graphql/documents'

interface Item {
  id: string
  name: string
}

interface Props {
  documentId: string,
  setPage: Function,
}

const Document: React.FC<Props> = ({documentId, setPage}) => {
  const { data, loading, error } = useQuery(DOCUMENTS)


  return (
    <div className="min-h-screen flex flex-col">
      <div className="navbar bg-base-300 text-neutral-content">
        <div className="flex-1">
          <h1 className="text-2xl">
              Document {documentId}
          </h1>

        </div>
      </div>
      <div className="hover:underline hover:cursor-pointer" onClick={() => setPage({"name": "list"})}>
        Back to document list
      </div>
    </div>
  )
}

export default Document
