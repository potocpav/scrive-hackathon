import { gql } from '@apollo/client';

export const DOCUMENTS = gql`
  query DocumentsGet {
    documents { name, id }
  }
`;
