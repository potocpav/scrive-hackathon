import { gql } from '@apollo/client';

export const DOCUMENTS = gql`
  query ItemsGet {
    items { name, id }
  }
`;
