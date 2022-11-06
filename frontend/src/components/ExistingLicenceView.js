import React, { useState } from "react";
import { Tabs, TabItem, Card, Flex, SearchField, Button } from '@aws-amplify/ui-react';
import LicenceHistoryView from './LicenceHistoryView';
import LicenceView from './LicenceView';
import ContactView from "./ContactView";
import EndorsementView from "./EndorsementView";
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link
} from "react-router-dom";
export default function ExistingLicenceView() {
  const [index, setIndex] = useState(0);
  const [licenceId, setLicenceId] = useState('');

  return (
    <Card>
      <Flex direction="row" justifyContent="space-between">
        <SearchField width="25rem" label="Search" placeholder="Search using a Licence ID here..." onSubmit={(search) => setLicenceId(search)} />
        <Link to="/new">
          <Button>register new licence</Button>
        </Link>
      </Flex>
      <Tabs currentIndex={index} onChange={(i) => setIndex(i)}>
        <TabItem title="Licence"><LicenceView licenceId={licenceId} /></TabItem>
        <TabItem title="Licence History"><LicenceHistoryView licenceId={licenceId} /></TabItem>
        <TabItem title="Contact"><ContactView licenceId={licenceId} /></TabItem>
        <TabItem title="Endorsements"><EndorsementView licenceId={licenceId} /></TabItem>
      </Tabs>
    </Card>
  );
} 
