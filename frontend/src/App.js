import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { Authenticator, Flex, Menu, useTheme, Image, MenuItem, View, Grid, Card } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import {
  BrowserRouter as Router,
  Switch,
  Route
} from "react-router-dom";
import NewLicenceView from "./components/NewLicenceView.js";
import ExistingLicenceView from "./components/ExistingLicenceView.js";


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
        <Router>

          <Grid
          // columnGap="0.5rem"
          // rowGap="0.5rem"
          // templateColumns="1fr 1fr 1fr"
          // templateRows="1fr 3fr 1fr"
          >
            <Card
              columnStart="1"
              columnEnd="-1"
            >
              <Flex
                direction="row-reverse"
                // justifyContent="flex-end"
                wrap="wrap"
                gap="2rem"
              >

                <Menu
                  menuAlign="start"
                >
                  <MenuItem onClick={signOut}>
                    Sign out
                  </MenuItem>
                </Menu>


              </Flex>
            </Card>
          


{/* content */}

           
          </Grid>



          <Switch>
            <Route path="/new">
              <NewLicenceView />
            </Route>
            <Route exact path="/">
              <ExistingLicenceView />
            </Route>
          </Switch>
        </Router>

      )}

    </Authenticator>
  );
}


export default App;
