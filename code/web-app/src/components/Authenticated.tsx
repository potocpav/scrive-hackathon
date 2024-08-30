import React, {useState} from 'react';
import { ApolloProvider } from '@apollo/client';
import create_api_client from '../utils/apolloClient';
import Documents from './Documents';
import Document from './Document';

interface AuthenticatedProps {
  userInfo: Record<string, any>;
  logout: () => void;
  csrf: string;
}

function on_graphql_error(messages: string[]) {
    messages.forEach(message => alert(message));
}

interface ListPage {
    name: "list";
}

interface DocumentPage {
    name: "document";
    documentId: string;
}

type Page = DocumentPage | ListPage;

const Authenticated: React.FC<AuthenticatedProps> = ({ userInfo, logout, csrf }) => {
    const initialPage : Page = {"name": "list"};
    // const initialPage : Page = {"name": "document", "documentId": "123"};
    const [page_, setPage] = useState(initialPage);
    const page : Page = (page_ as Page);

    var body: any;
    switch (page.name) {
        case 'list':
            body = <Documents setPage={setPage} />;
            // body = <h2>unknown page</h2>;
            break;
        case 'document':
            body = <Document documentId={page.documentId} setPage={setPage} />;
            break;
        default:
            body = <h2>unknown page</h2>;
            break;
    }

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
            {body}

        </ApolloProvider>
    )
}

export default Authenticated;
