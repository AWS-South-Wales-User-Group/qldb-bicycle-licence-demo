import React, { useEffect, useState } from "react";
import API from "@aws-amplify/api";
import { View, Flex, Text, useTheme } from '@aws-amplify/ui-react';
import Accordion from 'react-bootstrap/Accordion';
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';


export default function LicenceHistory(props) {
  const { licenceId, trigger } = props;
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
      .then(() => {
        getLicenceHistory(licenceId);
      })
  }

  const getLicenceHistory = (licenceId) => {
    const apiName = "ApiGatewayRestApi";
    const path = `/licences/${licenceId}/history`;
    if (licenceId !== '') {
      API.get(apiName, path)
        .then((response) => {
          console.log(response);
          setItems(response);
        })
        .catch((error) => {
          console.log(error);
        });
    }
  }

  useEffect(() => {
    getLicenceHistory(licenceId);
  }, [licenceId, trigger]);

  return (
    <Container>
    <Row className="p-4">
      <Card >
        <Card.Body>
          <Card.Title>Licence history</Card.Title>
          <Card.Subtitle className="mb-2 text-muted">does this have its own history?</Card.Subtitle>

      <Accordion defaultActiveKey="0" alwaysOpen>
        {items.map((item, index) => (<Accordion.Item  key={item.metadata.version} eventKey={index}>

          {item.data ?
            <Accordion.Header>{item.metadata.version} - {item.data.events.eventName} - {item.data.events.eventDate}</Accordion.Header> :
            <Accordion.Header>{item.metadata.version} - Redacted</Accordion.Header>
          }
          {/* <Accordion.Header>{item.metadata.version} - {item.data.events.eventName} - {item.data.events.eventDate}</Accordion.Header> */}

          <Accordion.Body>
            <Flex direction="column" alignItems="flex-start">
              {item.data && <> {field("street", "Street", item.data.street)} {field("county", "County", item.data.county)} {field("postcode", "Postcode", item.data.postcode)}</>}
              {item.data ? <Button variant="secondary" onClick={(event) => redact(event, item.metadata.version)}>Redact</Button> : 'redacted'}
              {/* {JSON.stringify(item)} */}
            </Flex>
          </Accordion.Body>

        </Accordion.Item>))}

      </Accordion>


    </Card.Body></Card></Row></Container>

  );
}
