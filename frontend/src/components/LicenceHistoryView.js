import React, { useEffect, useState } from "react";
import API from "@aws-amplify/api";
import { Alert, Collection, Divider, View, Card, Flex, Heading, Text, Loader, useTheme } from '@aws-amplify/ui-react';
import Accordion from 'react-bootstrap/Accordion';
import Button from 'react-bootstrap/Button';

export default function LicenceHistoryView(props) {
  const { licenceId } = props;
  const { tokens } = useTheme();
  const [items, setItems] = useState([]);

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


  const redact = (event, version) => {
    event.preventDefault()
    const apiName = "ApiGatewayRestApi";
    const path = `/licences/revision/redact`;
    API.post(apiName, path, { body: { licenceId, version } })
      .then((response) => {

        console.log(response);

        setItems(response);

      })
  }



  useEffect(() => {
    const apiName = "ApiGatewayRestApi";
    const path = `/licences/${licenceId}/history`;
    if (licenceId !== '') {
      API.get(apiName, path)
        .then((response) => {
          setItems(response);
        })
        .catch((error) => {
          console.log(error);
        });
    }
  }, [licenceId]);

  return (
    <View padding={tokens.space.large}>
      <Accordion defaultActiveKey="0" alwaysOpen>
        {items.map((item, index) => (<Accordion.Item eventKey={index}>

          {item.data ?
            <Accordion.Header>{item.metadata.version} - {item.data.events.eventName} - {item.data.events.eventDate}</Accordion.Header> :
            <Accordion.Header>{item.metadata.version} - Redacted</Accordion.Header>
          }
          {/* <Accordion.Header>{item.metadata.version} - {item.data.events.eventName} - {item.data.events.eventDate}</Accordion.Header> */}

            <Accordion.Body>
              <Flex direction="column" alignItems="flex-start">
                <Divider />
                {item.data && <> field("street", "Street", item.data.street) {field("county", "County", item.data.county)} {field("postcode", "Postcode", item.data.postcode)}</>}

                {item.data ? <Button variant="secondary" onClick={(event) => redact(event,  item.metadata.version)}>Redact</Button> : 'redacted'}
                {JSON.stringify(item)}
              </Flex>
            </Accordion.Body>

        </Accordion.Item>))}

      </Accordion>


    </View>
  );
}
