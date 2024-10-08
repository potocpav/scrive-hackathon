import React, {useState} from 'react'
import { useQuery, useLazyQuery } from '@apollo/client'
import {
  DOCUMENT,
  QUERY,
} from '../graphql/document'

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

interface DocumentFile {
  id: string,
  name: string,
}

const Document: React.FC<Props> = ({document, setPage}) => {
  // const { data, loading, error } = useQuery(DOCUMENTS)
  const [queryText, setQueryText] = useState('');

  const [queryLoading, setQueryLoading] = useState(false);

  const { data, loading, error } = useQuery(DOCUMENT, {variables:
      {id: document.id, filename: document.filename}});

  const [queryQuery, queryRes] = useLazyQuery(QUERY, {onCompleted: () => setQueryLoading(false)})


  const handleQuery = () => {
    if (!queryText.trim()) return
    setQueryLoading(true);
    console.log(data.documentFile.endpoint);
    queryQuery({variables: {docPath: data.documentFile.endpoint, query: queryText}});
    // await search({ variables: { items: [{ name: searchText }] } })
  }

  const spinner =
    <button className="btn">
      <span className="loading loading-spinner"></span>
      Loading...
    </button>;

  var queryResult;
  if (queryRes.loading) {
    queryResult = spinner
  } else {
    if (queryRes.data) {
      console.log("Result");
      console.log(queryRes.data.documentContent);
      queryResult =
        <div>
          {queryRes.data.documentContent.message}
        </div>;
    } else  {
      queryResult = <div>Not asked.</div>
    }
  }

  var docPdf;
  if (loading) {
    docPdf = spinner
  } else {
    // console.log(data.documentFile.data);
    const dataUrl = "data:application/pdf;base64," + data.documentFile.data
    // console.log(screen.width)
    docPdf =
      <div className="my-5">
        <iframe width="1000" height="1000" className="min-w-screen" src={dataUrl}></iframe>
      </div>
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
            onKeyDown={(e) => { if (e.key == "Enter") {handleQuery()} } }
          />
          <button
            className="join-item btn btn-md btn-primary px-3"
            onClick={handleQuery}
          >
            Query
          </button>
        </div>
      </div>

        {queryResult}

        {docPdf}


        </div>
      </div>
    </div>
  )
}

export default Document
export type {DocumentT}
