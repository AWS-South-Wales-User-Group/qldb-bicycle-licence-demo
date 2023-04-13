import React, { useEffect, useState } from "react";
import { useParams } from 'react-router-dom';

import API from "@aws-amplify/api";
import { Alert, View, Card, Flex, Text, Loader, Button, useTheme } from '@aws-amplify/ui-react';

export default function LicenceView(props) {
  const { licenceId } = useParams();

  const { tokens } = useTheme();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [street, setStreet] = useState('');
  const [county, setCounty] = useState('');
  const [postcode, setPostcode] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const [found, setFound] = useState(false);

  const field = (key, label, value) => {
    return (
      <View>
        <Flex direction="row" alignItems="flex-start" gap={tokens.space.xs}>
          <Text variation="tertiary" >{label}:</Text>
          <Text variation="primary">
            {value}
          </Text>
        </Flex>
      </View>
    );
  }

  useEffect(() => {
    const apiName = "ApiGatewayRestApi";
    const path = `/licences/${licenceId}`;
    if (licenceId !== '') {
      setLoading(true);
      API.get(apiName, path)
        .then((response) => {
          setFirstName(response.firstName);
          setLastName(response.lastName);
          setStreet(response.street);
          setCounty(response.county);
          setPostcode(response.postcode);
          setStatus(response.status);
          setFound(true);

        })
        .catch((error) => {
          setFound(false);
        }).finally(() => {
          setLoading(false);
        });
    }
  }, [licenceId]);

  return (
    <View padding={tokens.space.large}>

      <Loader variation="linear" size="small" hidden={!loading} />

      <Alert
        variation="info"
        isDismissible={false}
        hasIcon={true}
        heading="Unknown or missing Licence ID"
        hidden={loading || found}
      >
        Search for a Licence using it's Licence ID in the search box above
      </Alert>
      <Card backgroundColor={tokens.colors.background.secondary} hidden={!found} >
        <Flex direction="column" alignItems="flex-start">
          {field("firstName", "First Name", firstName)}
          {field("lastName", "Last Name", lastName)}
          {field("street", "Street", street)}
          {field("county", "County", county)}
          {field("postcode", "Postcode", postcode)}
        </Flex>
        <Flex direction="column" alignItems="flex-end">
          <Button
            loadingText="update address"
            onClick={() => alert('update-address')}
            ariaLabel="update-address"
          >
            Update Address
          </Button>
        </Flex>
        <Flex direction="column" alignItems="flex-start">
          {field("status", "Status", status)}
        </Flex>
        <Flex direction="column" alignItems="flex-end">
          <Button
            loadingText="update status"
            onClick={() => alert('update-address')}
            ariaLabel="update-status"
          >
            Update Status
          </Button>
        </Flex>
      </Card>
    </View>
  );
}
