import React, { useState } from "react";
import { Tabs, TabItem, Card, Flex, SearchField, Button } from '@aws-amplify/ui-react';
import LicenceHistory from '../LicenceHistory';
import LicenceView from '../LicenceView';
import ContactView from "../ContactView";
import EndorsementView from "../EndorsementView";

export default function MainView() {
  const [index, setIndex] = useState(0);
  // const [licenceId, setLicenceId] = useState('3Lb56lr4QzaFKYaoJgOa97');
  const [licenceId, setLicenceId] = useState('');

  return (
    <Card>
      <Flex direction="row" justifyContent="space-between">
        <SearchField width="25rem" label="Search" placeholder="Search using a Licence ID here..." onSubmit={(search) => setLicenceId(search)} />
        {/* <Link to="/new">
          <Button>register new licence</Button>
        </Link> */}
      </Flex>
      <Tabs currentIndex={index} onChange={(i) => setIndex(i)}>
        <TabItem title="Licence"><LicenceView licenceId={licenceId} /></TabItem>
        <TabItem title="Licence History"><LicenceHistory licenceId={licenceId} /></TabItem>
        <TabItem title="Contact"><ContactView licenceId={licenceId} /></TabItem>
        <TabItem title="Endorsements"><EndorsementView licenceId={licenceId} /></TabItem>
      </Tabs>
    </Card>
  );
} 
