import React, { useState, useEffect } from "react";
import Register from "./components/Register.js";
import History from "./components/History.js";
import Search from "./components/Search.js";
import Enquiry from "./components/Enquiry.js";
import "bootstrap/dist/css/bootstrap.min.css";
import Navbar from "react-bootstrap/Navbar";
import NavDropdown from "react-bootstrap/NavDropdown";
import Nav from "react-bootstrap/Nav";
import Avatar from "react-avatar";
import { withAuthenticator, AmplifySignOut } from "@aws-amplify/ui-react";
import Auth from "@aws-amplify/auth";
import API from "@aws-amplify/api";

import Container from "react-bootstrap/Container";
import { Switch, Route, Redirect } from "react-router-dom";
import { LinkContainer } from "react-router-bootstrap";

function App() {
  const [user, setUser] = useState();
  const [email, setEmail] = useState();
  const [group, setGroup] = useState();
  function switchRole(evt) {
    console.log(evt);

    const apiName = "ApiGatewayRestApi";
    const path = `/switch-roles/${evt}`;
    API.get(apiName, path)
      .then((response) => {
        console.log(response);
       
      })
      .catch((error) => {
        console.log("In the error handler: " + error);
      });
      Auth.currentAuthenticatedUser({bypassCache:true}).then(
        (response) => {
          console.log(response);
          setGroup(
            response.signInUserSession.accessToken.payload["cognito:groups"]
          );
        }
      );
  }

  useEffect(() => {
    Auth.currentUserInfo().then((response) => {
      setUser(response.username);
      setEmail(response.attributes.email);
    });
    Auth.currentAuthenticatedUser().then((response) => {
      setGroup(
        response.signInUserSession.accessToken.payload["cognito:groups"]
      );
    });
  }, []);

  return (
    <>
      <Navbar bg='dark' variant='dark'>
        <Navbar.Brand>QLDB Bicycle</Navbar.Brand>
        <Nav className='mr-auto' activeKey='/'>
          <LinkContainer to='/register'>
            <Nav.Link>Register</Nav.Link>
          </LinkContainer>
          <LinkContainer to='/history'>
            <Nav.Link>History</Nav.Link>
          </LinkContainer>
          <LinkContainer to='/search'>
            <Nav.Link>Search</Nav.Link>
          </LinkContainer>
          <LinkContainer to='/enquiry'>
            <Nav.Link>Enquiry</Nav.Link>
          </LinkContainer>
        </Nav>

        <Nav>
          <NavDropdown
            alignRight
            onSelect={switchRole}
            title={
              <>
                {email && (
                  <Avatar
                    email={email}
                    name={user}
                    className='rounded-circle'
                    size={35}
                  />
                )}
              </>
            }
          >
            {/* <NavDropdown.ItemText>current role: {group}</NavDropdown.ItemText>
            <NavDropdown.Divider />

            <NavDropdown.Item eventKey='ad'>Admin</NavDropdown.Item>
            <NavDropdown.Item eventKey='au'>Audit</NavDropdown.Item>
            <NavDropdown.Item eventKey='ro'>Readonly</NavDropdown.Item> */}
            {/* <NavDropdown.Divider /> */}
            <div className='dropdown-item'>
              <AmplifySignOut />
            </div>
          </NavDropdown>
        </Nav>
      </Navbar>
      <Container>
        <Switch>
          <Route path='/register' component={Register} />
          <Route path='/history' component={History} />
          <Route path='/search' component={Search} />
          <Route path='/enquiry' component={Enquiry} />
          <Route path='/'>
            <Redirect to='/register' exact />
          </Route>
        </Switch>
      </Container>
    </>
  );
}
const MyTheme = {
  signOutButton: { backgroundColor: "red", borderColor: "red" },
};

export default withAuthenticator(App, false, [], null, MyTheme);
