import React, {useState} from 'react'
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
  // const { data, loading, error } = useQuery(DOCUMENTS)
  const [queryText, setQueryText] = useState('');

  const [queryLoading, setQueryLoading] = useState(false);


  const handleQuery = async () => {
    if (!queryText.trim()) return

    console.log("queried");
    setQueryLoading(true);
    await new Promise(r => setTimeout(r, 2000));
    console.log("2 seconds");
    setQueryLoading(false);
    // await search({ variables: { items: [{ name: searchText }] } })
  }

  var spinner;
  if (queryLoading) {
    spinner =
      <button className="btn">
      <span className="loading loading-spinner"></span>
      Loading...
    </button>;
  } else {
    spinner = '';
  }

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
        <div>

        <div className="form-control w-full">
        <div className="join m-3">
          <input
            type="text"
            placeholder="Query document"
            className="join-item flex-grow input input-bordered input-md input-primary"
            value={queryText}
            onChange={(e) => setQueryText(e.target.value)}
          />
          <button
            className="join-item btn btn-md btn-primary px-3"
            onClick={handleQuery}
          >
            Query
          </button>
        </div>
      </div>

        {spinner}


        </div>
      </div>
    </div>
  )
}

export default Document
export type {DocumentT}
