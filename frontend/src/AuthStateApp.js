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
          <h1>Hello, QLDB!</h1>
          <p>
            Welcome to QLDB demo. This is a demo site to show some of the
            features of the Amazon QLDB service. Create an account and create
            some synthetic bicycle licence data, which you can query against
            using QLDB, DynamoDB and elasticsearch
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
