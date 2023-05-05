import React, { useEffect, useState } from "react";
import API from "@aws-amplify/api";
import Accordion from 'react-bootstrap/Accordion';
import Card from 'react-bootstrap/Card';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Stack from 'react-bootstrap/Stack';


export default function ContactHistory(props) {
  const { licenceId, trigger } = props;
  const [items, setItems] = useState([]);


  const getContactHistory = (licenceId) => {
    const apiName = "ApiGatewayRestApi";
    const path = `/licences/${licenceId}/contact/history`;
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
    getContactHistory(licenceId);

  }, [licenceId, trigger]);

  return (
    <Container>
      <Row className="p-4">
        <Card >
          <Card.Body>
            <Card.Title>Contact history</Card.Title>
            <Card.Subtitle className="mb-2 text-muted">https://dev.to/aws-heroes/redacting-data-in-amazon-qldb-1o06 - pattern 3</Card.Subtitle>

            <Accordion defaultActiveKey="0" alwaysOpen>
              {items.map((item, index) => (<Accordion.Item key={item.metadata.version} eventKey={index}>

                {item.data ?
                  <Accordion.Header>{item.metadata.version} - {item.data.events.eventName} - {item.data.events.eventDate}</Accordion.Header> :
                  <Accordion.Header>{item.metadata.version} - Redacted</Accordion.Header>
                }

                <Accordion.Body>
                  <Stack>
                    {item.data && <p>email: <strong>{item.data.email}</strong></p>}
                    {item.data && <p>mobile: <strong>{item.data.mobile}</strong></p>}
                  </Stack>
                </Accordion.Body>

              </Accordion.Item>))}

            </Accordion>


          </Card.Body></Card></Row></Container>

  );
}
