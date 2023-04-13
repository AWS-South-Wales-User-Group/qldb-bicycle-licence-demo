import React from "react";
import { Authenticator, useTheme, Image, View} from '@aws-amplify/ui-react';
import Container from 'react-bootstrap/Container';
import Navbar from 'react-bootstrap/Navbar';
import NavDropdown from 'react-bootstrap/NavDropdown';

import '@aws-amplify/ui-react/styles.css';


// import NewLicenceView from "./components/NewLicenceView.js";
import ExistingLicenceView from "./components/ExistingLicenceViewBootstrap.js";



const components = {
  Header() {
    const { tokens } = useTheme();
    return (
      <View textAlign="center" padding={tokens.space.large}>
        <Image
          alt="Amplify logo"
          src="https://qldbguide.com/assets/QLDB-Guide.svg"
        />
      </View>
    );
  },
}


function App() {

  return (

    <Authenticator components={components} signUpAttributes={[
      'email'
    ]}>

      {({ signOut, user }) => (
        <Container>
          <Navbar>
            <Container>
              <Navbar.Brand href="#home">QLDB Bicycle Licence</Navbar.Brand>
              <Navbar.Toggle />
              <Navbar.Collapse className="justify-content-end">
                <Navbar.Text className="pe-1">
                  Signed in as:
                </Navbar.Text>
                <NavDropdown title={user.username} id="nav-dropdown">
                  <NavDropdown.Item onClick={signOut} eventKey="signout">Sign out</NavDropdown.Item>
                </NavDropdown>
              </Navbar.Collapse>
            </Container>
          </Navbar>
          <Container>
              <ExistingLicenceView />
          </Container>

        </Container>

      )}

    </Authenticator>

  );
}


export default App;
