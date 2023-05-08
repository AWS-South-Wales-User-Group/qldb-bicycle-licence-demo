import React, { useEffect, useState } from "react";
import API from "@aws-amplify/api";
import Accordion from 'react-bootstrap/Accordion';
import Card from 'react-bootstrap/Card';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Stack from 'react-bootstrap/Stack';


export default function EndorsementHistory(props) {
  const { licenceId, trigger } = props;
  const [items, setItems] = useState([]);


  const getEndorsementHistory = (licenceId) => {
    const apiName = "ApiGatewayRestApi";
    const path = `/licences/${licenceId}/endorsements/history`;
    if (licenceId !== '') {
      API.get(apiName, path)
        .then((response) => {
          console.log(response);
          setItems(response);   // TODO: array within an array - investigate in serverless.
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
            <Card.Subtitle className="mb-2 text-muted">Full endorsement history showing redacted endorsements after 5 years</Card.Subtitle>


            <Stack>
              {items.map((item, index) => (<div key={"d-" + index}>

                <p key={"p-" + index}> History for Endorsement: needs to be a key here </p>



                <Accordion key={"a-"+index} defaultActiveKey="0" alwaysOpen>
                  {item.map((item2, index) => (<Accordion.Item key={item2.metadata.version} eventKey={index}>
                    {item2.data ?
                      <Accordion.Header>{item2.metadata.version} - {item2.data.events.eventName} - {item2.data.events.eventDate}</Accordion.Header> :
                      <Accordion.Header>{item2.metadata.version} - Redacted</Accordion.Header>
                    }
                    <Accordion.Body>
                      <Stack>
                        {item2.data && <p>points: <strong>{item2.data.points}</strong></p>}
                        {item2.data && <p>issueDtm: <strong>{item2.data.issueDtm}</strong></p>}
                        {item2.data && <p>expiryDtm: <strong>{item2.data.expiryDtm}</strong></p>}

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
