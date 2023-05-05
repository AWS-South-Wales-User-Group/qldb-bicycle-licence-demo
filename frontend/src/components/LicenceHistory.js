import React, { useEffect, useState } from "react";
import API from "@aws-amplify/api";
import Accordion from 'react-bootstrap/Accordion';
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Stack from 'react-bootstrap/Stack';


export default function LicenceHistory(props) {
  const { licenceId, trigger } = props;
  const [items, setItems] = useState([]);

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

          <Stack>
                    {item.data && <p>firstName: <strong>{item.data.firstName}</strong></p>}
                    {item.data && <p>lastName: <strong>{item.data.lastName}</strong></p>}
                    {item.data && <p>street: <strong>{item.data.street}</strong></p>}
                    {item.data && <p>county: <strong>{item.data.county}</strong></p>}
                    {item.data && <p>postcode: <strong>{item.data.postcode}</strong></p>}
                    {item.data && <p>status: <strong>{item.data.status}</strong></p>}
                    {item.data ? <Button variant="secondary" onClick={(event) => redact(event, item.metadata.version)}>Redact</Button> : 'redacted'}

                  </Stack>
 
          </Accordion.Body>

        </Accordion.Item>))}

      </Accordion>


    </Card.Body></Card></Row></Container>

  );
}
