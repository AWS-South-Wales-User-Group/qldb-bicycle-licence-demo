import React from "react";
import DriverHistoryView from "./components/LicenceHistoryView.js";
import DriverView from "./components/LicenceView.js";

import "bootstrap/dist/css/bootstrap.min.css";
import { Authenticator, Flex, Menu, useTheme, Image, MenuItem, View, Grid, Card, Tabs, TabItem, SearchField } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';

import { useState } from 'react';
import ContactView from "./components/ContactView.js";
import EndorsementView from "./components/EndorsementView.js";


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
  const [index, setIndex] = useState(0);
  // const [ licenceId, setLicenceId ] = useState('DdM1ilx24WY4cLhOU6nZUd');
  const [ licenceId, setLicenceId ] = useState('');

  return (
    <Authenticator components={components} signUpAttributes={[
      'email'
    ]}>

      {({ signOut, user }) => (

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
          <Card
            columnStart="1"
            columnEnd="-1"
          >
            <SearchField label="Search" placeholder="Search using a Licence ID here..." onSubmit={(search) => setLicenceId(search)} />
            <Tabs currentIndex={index} onChange={(i) => setIndex(i)}>
              <TabItem title="Licence"><DriverView licenceId={licenceId} /></TabItem>
              <TabItem title="Licence History"><DriverHistoryView licenceId={licenceId} /></TabItem>

              <TabItem title="Contact"><ContactView licenceId={licenceId} /></TabItem>
              <TabItem title="Endorsements"><EndorsementView licenceId={licenceId} /></TabItem>

            </Tabs>

          </Card>
        </Grid>




      )}
    </Authenticator>
  );
}


export default App;
