import React, { useState } from 'react'
import { useQuery } from '@apollo/client'
import { DocumentT } from './Document'
import {
  DOCUMENTS,
} from '../graphql/documents'


interface Props {
  setPage: Function,
  // documents: null | [DocumentT],
  // setDocuments: Function
}

const Documents: React.FC<Props> = ({ setPage }) => {
  const [searchText, setSearchText] = useState('');
  const [documents, setDocuments] = useState(null);

  const { data, loading, error } = useQuery(DOCUMENTS, { skip: documents !== null });

  // if (data !== undefined) {
  //   setDocuments(data.documents);
  // }

  const handleSearch = async () => {
    if (!searchText.trim()) return
    // await search({ variables: { items: [{ name: searchText }] } })
  }

  if (loading)
    return (
      <div className="flex justify-center items-center min-h-screen bg-base-300">
        <button className="btn">
          <span className="loading loading-spinner"></span>
          Loading...
        </button>
      </div>
    )
  if (error) return <p>{'Error: ' + error}</p>

  return (
    <div className="min-h-screen flex flex-col">
      <div className="navbar bg-base-300">
        <div className="flex-1">
          <h1>
            <a href="/" className="p-2 normal-case text-2xl">
              Document List
            </a>
          </h1>
        </div>
      </div>

      <div className="form-control w-full">
        <div className="join m-3">
          <input
            type="text"
            placeholder="Search documents"
            className="join-item flex-grow input input-bordered input-md input-primary"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
          <button
            className="join-item btn btn-md btn-primary px-3"
            onClick={handleSearch}
          >
            Search
          </button>
        </div>
      </div>

      <div className="relative overflow-x-auto">
        <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
            <tr>
              <th scope="col" className="px-6 py-3">
                Status
              </th>
              <th scope="col" className="px-6 py-3">
                Document name
              </th>
              <th scope="col" className="px-6 py-3">
                Creation Time
              </th>
            </tr>
          </thead>
          <tbody className="hover:cursor-pointer">
            {
              data.documents.map((doc: DocumentT) => (
                <tr key={doc.id} className="bg-white border-b dark:bg-gray-900 dark:border-gray-700 dark:hover:bg-gray-800"
                  onClick={() => setPage({ "name": "document", "document": doc })} >
                  <td scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                    {doc.status}
                  </td>
                  <td className="px-6 py-4 hover:cursor-pointer hover:underline">
                    {doc.name}
                  </td>
                  <td className="px-6 py-4">
                    {doc.ctime}
                  </td>
                </tr>
              ))
            }
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default Documents
