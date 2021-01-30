import React from "react";
import { AmplifyAuthenticator } from "@aws-amplify/ui-react";
import { AuthState, onAuthUIStateChange } from "@aws-amplify/ui-components";
import App from "./App";
import Jumbotron from "react-bootstrap/Jumbotron";
import Button from "react-bootstrap/Button";
import Container from "react-bootstrap/Container";

const AuthStateApp = () => {
  const [authState, setAuthState] = React.useState("welcome");
  const [user, setUser] = React.useState();

  React.useEffect(() => {
    onAuthUIStateChange((nextAuthState, authData) => {
      setAuthState(nextAuthState);
      setUser(authData);
    });
  }, []);

  if (authState === AuthState.SignedIn && user) {
    return <App />;
  } else if (authState === "welcome") {
    return (
      <Container>
        <Jumbotron>
          <h1>QLDB Bicycle Licence Demo</h1>
          <p>
            Welcome to the QLDB Bicycle Licence demo. This is a working prototype to demonstrate some of the
            features of the Amazon QLDB service. To start off, you need to create an account using a valid
            email address you have access too. Next you can create your own synthetic bicycle licence data, add and
            remove penalty points and change contact details. You can also delete the record. At any point
            you can view the history of a specific record, showing all revisions that have been made in 
            chronological order.<br/><br/>

            As you interact with the underlying QLDB ledger, all changes are streamed out to both DynamoDB 
            and Elasticsearch. You can use the 'Enquiry' menu to automatically retrieve all bicycle licence records
            that have been registered by the authenticated user. You can use the 'Search' menu to retrieve licence records
            that match a wildcard search on last name.<br/><br/>
            
            The source code for this demo can be found <a href="https://github.com/AWS-South-Wales-User-Group/qldb-bicycle-licence-demo">
              here
            </a>
          </p>
          <p>
            <Button onClick={() => setAuthState("signin")} variant='primary'>
              Login
            </Button>
          </p>
        </Jumbotron>
      </Container>
    );
  } else {
    return <AmplifyAuthenticator />;
  }
};

export default AuthStateApp;
