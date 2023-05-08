import React, { useEffect, useState } from "react";
import { useParams } from 'react-router-dom';

import API from "@aws-amplify/api";
import { Formik } from 'formik';

import Form from 'react-bootstrap/Form';
import Card from 'react-bootstrap/Card';
import Container from 'react-bootstrap/Container';
import Button from 'react-bootstrap/Button';

import Row from 'react-bootstrap/Row';


export default function Endorsement(props) {
  const { licenceId } = useParams();

  const [formValues, setFormValues] = useState({ points: '', issueDtm: '', expiryDtm: '' });
  const [noEndorsements, setNoEndorsement] = useState({ title: '', detail: '', status: '' });
  const [trigger, setTrigger] = useState(0);


  useEffect(() => {
    const apiName = "ApiGatewayRestApi";
    const path = `/licences/${licenceId}/endorsements`;
    if (licenceId !== '') {
      API.get(apiName, path)
        .then((response) => {
          console.log(response);
          // const { email, mobile } = response;

        }).catch((e) => {
          if (e.response.status === 404) {
            // const { firstName, lastName, street, county, postcode, status } = response;
            // setValues({ error, lastName, street, county, postcode, status });
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
          console.log(values)
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


                  {/* <Card.Text> */}
                  <Form onSubmit={handleSubmit} >

                    <Form.Group className="mb-3" controlId="validationPoints">
                      <Form.Label>points:</Form.Label>
                      <Form.Control type="points" name="points"
                        onChange={handleChange} value={values.points}
                        isValid={touched.points && !errors.points}
                      />
                      <Form.Control.Feedback type="invalid">{errors.points}</Form.Control.Feedback>
                    </Form.Group>

                    <Form.Group className="mb-3" controlId="validationIssueDtm">
                      <Form.Label>issueDtm: 2013/10/10 10:10:10</Form.Label>
                      <Form.Control type="text" name="issueDtm"
                        onChange={handleChange} value={values.issueDtm}
                        isValid={touched.issueDtm && !errors.issueDtm}
                      />
                      <Form.Control.Feedback type="invalid">{errors.issueDtm}</Form.Control.Feedback>
                    </Form.Group>

                    <Form.Group className="mb-3" controlId="validationExpiryDtm">
                      <Form.Label>expiryDtm:</Form.Label>
                      <Form.Control type="text" name="expiryDtm"
                        onChange={handleChange} value={values.expiryDtm}
                        isValid={touched.expiryDtm && !errors.expiryDtm}
                      />
                      <Form.Control.Feedback type="invalid">{errors.expiryDtm}</Form.Control.Feedback>
                    </Form.Group>


                    <Button variant="primary" type="submit">
                      update
                    </Button>
                  </Form>

                  {/* </Card.Text> */}
                </Card.Body>
              </Card>

            </Row>
          </Container>


        )}


      </Formik>



    </>
  );
}
