import React, { useEffect, useState } from "react";
import API from "@aws-amplify/api";
import { Alert, Loader, View, Card, Flex, Text, Button, useTheme } from '@aws-amplify/ui-react';

export default function ContactView(props) {
  const { tokens } = useTheme();
  const { licenceId } = props;
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
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
    const path = `/licences/${licenceId}/contact`;
    if (licenceId !== '') {
      setLoading(true);
      API.get(apiName, path)
        .then((response) => {
          const { email, mobile } = response;
          setEmail(email);
          setMobile(mobile);
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
          {field("email", "email", email)}
          {field("mobile", "mobile", mobile)}
        </Flex>
        <Flex direction="column" alignItems="flex-end">
          <Button
            loadingText="update contact"
            onClick={() => alert('update-contact')}
            ariaLabel="update-contact"
          >
            Update Contact
          </Button>
        </Flex>
      </Card>
    </View>
  );
}
