import React, {useState} from 'react';
import { ApolloProvider } from '@apollo/client';
import create_api_client from '../utils/apolloClient';
import Documents from './Documents';

interface AuthenticatedProps {
  userInfo: Record<string, any>;
  logout: () => void;
  csrf: string;
}

function on_graphql_error(messages: string[]) {
    messages.forEach(message => alert(message));
}

const Authenticated: React.FC<AuthenticatedProps> = ({ userInfo, logout, csrf }) => {
    const [page, setPage] = useState(false);

    return (
        <ApolloProvider client={create_api_client(csrf, on_graphql_error)}>
            {/* <div>
                Authenticated as: {JSON.stringify(userInfo)}
            </div> */}
            <div className="text-right">
                <button className="m-1 mr-3" onClick={logout}>
                    Logout
                </button>
            </div>
            <Documents />
            {/* {
                if (page['name'] == 'list') {
                    (<Documents setPage={setPage} />)
                } else if (page['name'] == 'document') {

                }
            } */}
        </ApolloProvider>
    )
}

export default Authenticated;
