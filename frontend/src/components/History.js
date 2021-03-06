import React, { useEffect, useState } from "react";
import API from "@aws-amplify/api";
import { Table, Card, Form, InputGroup, Button, Accordion } from "react-bootstrap";
import Licence from "./Licence";

export default function History(props) {
  const [response, setResponse] = useState([]);
  const [error, setError] = useState();

  const [licenceId, setLicenceId] = useState("");

  const routeProps = {
    match: props.match,
    history: props.history,
    location: props.location,
  };

  useEffect(() => {
    if (routeProps.location.state) {
      setLicenceId(routeProps.location.state.licenceId);
      getHistory(routeProps.location.state.licenceId);
    }
  }, [routeProps.location]);

  function getHistory(licenceid) {
    console.log('In getHistory with licenceid: ' + licenceid);
    const apiName = "ApiGatewayRestApi";
    const path = `/licences/history/${licenceid}`;
    API.get(apiName, path)
      .then((response) => {
        console.log(response);
        const sortedResponse = response.sort(function (a, b) {
          return (
            new Date(b.metadata.txTime) -
            new Date(a.metadata.txTime)
          );
        });

        setResponse(sortedResponse);
        setError(null);
      })
      .catch((error) => {
        console.log('In the error handler: ' + error);
        setError(error.response);
        setResponse([]);
      });
  }

  function handleSubmit(evt) {
    evt.preventDefault();
    getHistory(licenceId);
  }

  return (
    <>
      <Card className='mt-4 align-items-center d-flex justify-content-center'>
        <Card.Body className='mt-0'>
          <div className="p-3 mb-2 bg-warning text-black">
            <h4 className='card-title text-center'>History Service</h4>
              This screen allows a user to view all changes (document revisions) that have taken place against 
              a given Bicycle Licence entity. This uses the history function in QLDB, which is a PartiQL extension.
              The top fields show the current state as held in the user view. This will be empty if the licence 
              has been deleted. The `LicenceDeleted` event will appear in the sequential list of events.
          </div>
        </Card.Body>
      </Card>
      <Form className='mt-3' onSubmit={handleSubmit}>
        <InputGroup className='mb-2'>
          <InputGroup.Prepend>
            <InputGroup.Text>Licence ID</InputGroup.Text>
          </InputGroup.Prepend>
          <Form.Control
            type='text'
            value={licenceId}
            onChange={(e) => setLicenceId(e.target.value)}
            placeholder='Enter Licence ID'
          />
          <InputGroup.Append>
            <Button variant='outline-secondary' type='submit'>
              Search History
            </Button>
          </InputGroup.Append>
        </InputGroup>
      </Form>
      {error ? (
        <Card className='text-center mt-4'>
          <Card.Body className='mt-0'>
            <h4>{error.data.detail}</h4>{" "}
          </Card.Body>
        </Card>
      ) : (
        <>
          <Card border='light'>
            <Card.Body className='mt-0'>
              <Licence licenceId={licenceId} />
            </Card.Body>
          </Card>
          <h5 className='mt-2'>Events</h5>
          <Table striped bordered hover size='sm' className='mt-3'>
            <thead>
              <tr>
                <th>Version</th>
                <th>Event Name</th>
                <th>Event Date</th>
                <th>Revision Details</th>
              </tr>
            </thead>
            <tbody>
              {response.map((value, index) => {
                return (
                  <tr key={index}>
                    <td>{value.metadata.version}</td>
                    <td>{value.data === undefined ? 'LicenceDeleted' : value.data.events.eventName}</td>
                    <td>{new Intl.DateTimeFormat("en-GB", {
                          year: "numeric",
                          month: "short",
                          day: "2-digit",
                          hour: 'numeric', minute: 'numeric', second: 'numeric'
                      }).format(new Date(value.metadata.txTime))}</td>
                    <td>
                      <Accordion>
                        <Card>
                          <Card.Header>
                            <Accordion.Toggle as={Button} variant="link" eventKey="0">
                              Revision Details
                            </Accordion.Toggle>
                          </Card.Header>
                          <Card.Body>
                          <Accordion.Collapse eventKey="0">
                            {value.data === undefined ? <> Licence Deleted </> : <>
                              Penalty Points: {value.data.penaltyPoints} <br/>
                              Street: {value.data.street} <br/> 
                              County: {value.data.county} <br/>
                              Postcode: {value.data.postcode}
                              </>}
                          </Accordion.Collapse>
                          </Card.Body>
                        </Card>
                      </Accordion>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        </>
      )}
    </>
  );
}