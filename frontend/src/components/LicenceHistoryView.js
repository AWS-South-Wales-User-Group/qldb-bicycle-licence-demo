import React, { useEffect, useState } from "react";
import API from "@aws-amplify/api";
import { Alert, Collection, Divider, View, Card, Flex, Heading, Text, Loader, useTheme } from '@aws-amplify/ui-react';

export default function LicenceHistoryView(props) {
  const { licenceId } = props;
  const { tokens } = useTheme();
  const [loading, setLoading] = useState(true);
  const [found, setFound] = useState(false);
  const [items, setItems] = useState({});

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
    const path = `/licences/${licenceId}/history`;
    if (licenceId !== '') {
      setLoading(true);
      API.get(apiName, path)
        .then((response) => {

          console.log(response);
          setItems(response);
          setFound(true);

        })
        .catch((error) => {
          console.log(error);

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
      <Collection hidden={!found}
        items={items}
        type="list"
        searchNoResultsFound={<></>}
        direction="column"
        gap="20px"
        wrap="nowrap"
      >
        {(item, index) => (
          <Card key={index} padding="1rem">
            <Heading level={4}>Revision: {item.metadata.version} - {item.data.events.eventName} - {item.data.events.eventDate}</Heading>
            <Flex direction="column" alignItems="flex-start">
              <Divider />
              {field("firstName", "First Name", item.data.firstName)}
              {field("lastName", "Last Name", item.data.lastName)}
              {field("street", "Street", item.data.street)}
              {field("county", "County", item.data.county)}
              {field("postcode", "Postcode", item.data.postcode)}
            </Flex>
          </Card>
        )}
      </Collection>


    </View>
  );
}
