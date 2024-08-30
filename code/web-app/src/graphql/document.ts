import { gql } from '@apollo/client';

export const DOCUMENT = gql`
  query DocumentGet($id: String!, $filename: String!) {
    documentFile(id: $id, filename: $filename) { name, id, endpoint, data }
  }
`;

export const QUERY = gql`
  query DocumentQuery($id: String!, $query: String!) {
    documentQuery(id: $id, query: $query) {
        response
    }
  }
`;
