import { gql } from '@apollo/client';

export const DOCUMENTS = gql`
  query ItemsGet {
    documents { name, id }
  }
`;
