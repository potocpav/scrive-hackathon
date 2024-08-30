import { gql } from '@apollo/client';

export const DOCUMENT = gql`
  query DocumentGet {
    document { name, id }
  }
`;
