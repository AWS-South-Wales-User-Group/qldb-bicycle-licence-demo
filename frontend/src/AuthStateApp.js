import React from "react";
import { AmplifyAuthenticator, AmplifySignOut } from "@aws-amplify/ui-react";
import { AuthState, onAuthUIStateChange } from "@aws-amplify/ui-components";
import App from "./App";
import Welcome from "./Welcome";
import { LinkContainer } from "react-router-bootstrap";

import { BrowserRouter as Router, Redirect, Route, Link } from "react-router-dom";

const AuthStateApp = () => {
  const [authState, setAuthState] = React.useState();
  const [user, setUser] = React.useState();

  React.useEffect(() => {
    onAuthUIStateChange((nextAuthState, authData) => {
      setAuthState(nextAuthState);
      setUser(authData);
    });
  }, []);
  if (authState === AuthState.SignedIn && user) {
    return <App />;
  }

  return (
    <>

    <Router>




      <Route exact path='/login' component={AmplifyAuthenticator} />
      <Route exact path='/' component={Welcome} />
      <Route path='/'>
            <Redirect to="/" exact /> 
          </Route>
      

    </Router></>
  );
};

export default AuthStateApp;
