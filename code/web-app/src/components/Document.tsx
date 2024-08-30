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

  return (
    <div className="min-h-screen flex flex-col">
      <div className="navbar bg-base-300">
        <div className="flex-1">
          <h1 className="px-5 text-2xl">
              {document.name}
          </h1>
        </div>
      </div>

      <div className="mx-3">
        <div className="hover:underline hover:cursor-pointer my-5" onClick={() => setPage({"name": "list"})}>
        ← Back to document list
        </div>

        <table>
          <tbody>
            <tr>
              <td>
                ID:
              </td><td>
                {document.id}
              </td>
            </tr>
            <tr>
              <td>
                Created at:
              </td><td>
                {document.ctime}
              </td>
            </tr>
            <tr>
              <td>
                Modified at:
              </td><td>
                {document.mtime}
              </td>
            </tr>
            <tr>
              <td>
                Status:
              </td><td>
                {document.status}
              </td>
            </tr>
            <tr>
              <td>
                tags:
              </td><td>
                {document.tags ? (<i>empty</i>) : document.tags}
              </td>
            </tr>
            {/* <tr>
              <td>
                JSON
              </td><td>
                {document.jsonstring}
              </td>
            </tr> */}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default Document
export type {DocumentT}
