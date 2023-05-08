import React, { useEffect, useState } from "react";
import API from "@aws-amplify/api";
import Accordion from 'react-bootstrap/Accordion';
import Card from 'react-bootstrap/Card';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Stack from 'react-bootstrap/Stack';
import Button from 'react-bootstrap/Button';


export default function EndorsementHistory(props) {
  const { licenceId, trigger } = props;
  const [items, setItems] = useState([]);

  const redact = (event, endorsementId) => {
    event.preventDefault()
    const apiName = "ApiGatewayRestApi";
    const path = `/licences/endorsement`;
    API.del(apiName, path, { body: { licenceId, endorsementId } })
      .then(() => {
        getEndorsementHistory(licenceId);
      })
  }
  const getEndorsementHistory = (licenceId) => {
    const apiName = "ApiGatewayRestApi";
    const path = `/licences/${licenceId}/endorsements/history`;
    if (licenceId !== '') {
      API.get(apiName, path)
        .then((response) => {
          setItems(response);
        })
        .catch((error) => {
          console.log(error);
        });
    }
  }

  useEffect(() => {
    getEndorsementHistory(licenceId);

  }, [licenceId, trigger]);

  return (
    <Container>
      <Row className="p-4">
        <Card >
          <Card.Body>
            <Card.Title>Endorsement history</Card.Title>
            <Card.Subtitle className="mb-2 text-muted">Full endorsement history showing deleted endorsements after 5 years</Card.Subtitle>


            <Stack>
              {items.map((item, index) => (<div key={"d-" + index}>

                <p className="pt-3" key={"p-" + index}> History for Endorsement: needs to be a key here </p>

                <Accordion key={"a-" + index} defaultActiveKey="0" alwaysOpen>
                  {item.map((item2, index) => (<Accordion.Item key={item2.metadata.version} eventKey={index}>
                    {item2.data ?
                      <Accordion.Header>{item2.metadata.version} - {item2.data.events.eventName} - {item2.data.events.eventDate}</Accordion.Header> :
                      <Accordion.Header>{item2.metadata.version} - Deleted</Accordion.Header>
                    }
                    <Accordion.Body>
                      <Stack>
                      {item2.data && <p>endorsementId: <strong>{ item2.data.endorsementId}</strong></p>}
                        {item2.data && <p>points: <strong>{item2.data.points}</strong></p>}
                        {item2.data && <p>issueDtm: <strong>{item2.data.issueDtm}</strong></p>}
                        {item2.data && <p>expiryDtm: <strong>{item2.data.expiryDtm}</strong></p>}
                        {item2.data ? <Button variant="secondary" onClick={(event) => redact(event, item2.data.endorsementId)}>delete</Button> : 'deleted'}

                      </Stack>
                    </Accordion.Body>
                  </Accordion.Item>))}
                </Accordion>





              </div>))}

            </Stack>
            {/* 


            <Accordion className="m-5" defaultActiveKey="0" alwaysOpen>
              {items.map((item, index) => (<Accordion.Item key={index} eventKey={index}>

                {JSON.stringify(item)}
                bob
                <Accordion.Header>{item[0].metadata.id}</Accordion.Header>


                <Accordion.Body>
                  <Stack>
                    {item.data && <p>email: <strong>{item.data.email}</strong></p>}
                    {item.data && <p>mobile: <strong>{item.data.mobile}</strong></p>}
                  </Stack>
                </Accordion.Body> }

              </Accordion.Item>))}

            </Accordion> */}


          </Card.Body></Card></Row></Container>

  );
}
