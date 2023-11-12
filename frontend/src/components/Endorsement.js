import React, { useEffect, useState } from "react";
import { useParams } from 'react-router-dom';

import API from "@aws-amplify/api";
import { Formik } from 'formik';

import Form from 'react-bootstrap/Form';
import Card from 'react-bootstrap/Card';
import Container from 'react-bootstrap/Container';
import Button from 'react-bootstrap/Button';

import Row from 'react-bootstrap/Row';
import Table from 'react-bootstrap/Table';
import EndorsementHistory from "./EndorsementHistory";
import Col from "react-bootstrap/esm/Col";


export default function Endorsement(props) {
  const { licenceId } = useParams();

  const [formValues] = useState({ points: '', issueDtm: '', expiryDtm: '' });
  const [noEndorsements, setNoEndorsement] = useState({ title: '', detail: '', status: '' });
  const [endorsements, setEndorsement] = useState([]);

  const [trigger, setTrigger] = useState(0);


  useEffect(() => {
    const apiName = "ApiGatewayRestApi";
    const path = `/licences/${licenceId}/endorsements`;
    if (licenceId !== '') {
      API.get(apiName, path)
        .then((response) => {
          console.log(response);
          setEndorsement(response);

        }).catch((e) => {
          if (e.response.status === 404) {
            console.log(e.response.data)
            setNoEndorsement(e.response.data);
          }
        });
    }

  }, [licenceId, trigger]);

  return (
    <>

      <Formik
        initialValues={formValues}
        enableReinitialize={true}
        onSubmit={async (values, { resetForm }) => {
          const apiName = "ApiGatewayRestApi";
          const path = `/licences/endorsement`;
          values.licenceId = licenceId;
          await API.post(apiName, path, { body: values })

          setTrigger((trigger) => trigger + 1);
          resetForm();

        }}
      >
        {({ isSubmitting, handleChange, values, touched, errors, handleSubmit }) => (

          <Container>
            <Row className="p-4">
              <Card >
                <Card.Body>
                  <Card.Title>Endorsement Details</Card.Title>

                    {noEndorsements.status && <Card.Text>title: <strong>{noEndorsements.title}</strong></Card.Text>}
                    {noEndorsements.status && <Card.Text>detail: <strong>{noEndorsements.detail}</strong></Card.Text>}

                  <Table>
                    <thead>
                      <tr>
                        <th>id</th>

                        <th>points</th>
                        <th>issue date</th>
                        <th>expiry date</th>
                      </tr>
                    </thead>
                    <tbody>

                      {endorsements.map((item) => (
                        <tr key={item.endorsementId}>
                          <td>{item.endorsementId}</td>
                          <td>{item.points}</td>
                          <td>{item.issueDtm}</td>
                          <td>{item.expiryDtm}</td>
                        </tr>
                      ))}

                    </tbody>
                  </Table>
                  {/* <Card.Text> */}
                  <Card.Subtitle className="mt-4 mb-2 text-muted">add endorsement</Card.Subtitle>
                  <Form onSubmit={handleSubmit} >
                    <Container>
                      <Row>
                        <Col md={4} >
                          <Form.Group className="mb-3" controlId="validationPoints">
                            <Form.Label>points:</Form.Label>
                            <Form.Control type="number" min="0" max="10" name="points"
                              onChange={handleChange} value={values.points}
                              isValid={touched.points && !errors.points}
                            />
                            <Form.Control.Feedback type="invalid">{errors.points}</Form.Control.Feedback>
                          </Form.Group>
                        </Col>
                        <Col md={8}>
                          <Form.Group className="mb-3" controlId="validationIssueDtm">
                            <Form.Label>issueDate: </Form.Label>
                            <Form.Control type="date" name="issueDtm"
                              onChange={handleChange} value={values.issueDtm}
                              isValid={touched.issueDtm && !errors.issueDtm}
                            />
                            <Form.Control.Feedback type="invalid">{errors.issueDtm}</Form.Control.Feedback>
                          </Form.Group>

                          <Form.Group className="mb-3" controlId="validationExpiryDtm">
                            <Form.Label>expiryDate: </Form.Label>
                            <Form.Control type="date" name="expiryDtm"
                              min={values.issueDtm}
                              onChange={handleChange} value={values.expiryDtm}
                              isValid={touched.expiryDtm && !errors.expiryDtm}
                            />
                            <Form.Control.Feedback type="invalid">{errors.expiryDtm}</Form.Control.Feedback>
                          </Form.Group>
                        </Col>
                      </Row>
                      <Row>
                        <Button variant="primary" type="submit">
                          update
                        </Button>
                      </Row>
                    </Container>
                  </Form>
                  {/* </Card.Text> */}
                </Card.Body>
              </Card>

            </Row>
          </Container>


        )}


      </Formik>

      <EndorsementHistory licenceId={licenceId} trigger={trigger} />



    </>
  );
}
