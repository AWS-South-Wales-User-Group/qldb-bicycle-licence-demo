import React, { useEffect, useState } from "react";
import { useParams } from 'react-router-dom';

import API from "@aws-amplify/api";
import { Formik } from 'formik';

import Form from 'react-bootstrap/Form';
import Card from 'react-bootstrap/Card';
import Container from 'react-bootstrap/Container';
import Button from 'react-bootstrap/Button';

import Row from 'react-bootstrap/Row';

import ContactHistory from "./ContactHistory";

export default function Contact(props) {
  const { licenceId } = useParams();

  const [formValues, setFormValues] = useState({ email: '', mobile: '' });
  const [trigger, setTrigger] = useState(0);


  useEffect(() => {
    const apiName = "ApiGatewayRestApi";
    const path = `/licences/${licenceId}/contact`;
    if (licenceId !== '') {
      API.get(apiName, path)
        .then((response) => {
          const { email, mobile } = response;
          setFormValues({ email, mobile });
        });
    }
  }, [licenceId]);

  return (
    <>
      <Formik
        initialValues={formValues}
        enableReinitialize={true}
        onSubmit={async (values) => {
          const apiName = "ApiGatewayRestApi";
          const path = `/licences/contact`;
          values.licenceId = licenceId;
          console.log(values)
          await API.put(apiName, path, { body: values })
          setTrigger((trigger) => trigger + 1);

        }}
      >
        {({ isSubmitting, handleChange, values, touched, errors, handleSubmit }) => (

          <Container>
            <Row className="p-4">
              <Card >
                <Card.Body>
                  <Card.Title>Contact Details</Card.Title>
                  <Card.Subtitle className="mb-2 text-muted">does this have its own history?</Card.Subtitle>

                  {/* <Card.Text> */}
                  <Form onSubmit={handleSubmit} >

                    <Form.Group className="mb-3" controlId="validationEmail">
                      <Form.Label>email:</Form.Label>
                      <Form.Control readOnly type="email" name="email"
                        onChange={handleChange} value={values.email}
                        isValid={touched.email && !errors.email}
                      />
                      <Form.Control.Feedback type="invalid">{errors.email}</Form.Control.Feedback>
                    </Form.Group>

                    <Form.Group className="mb-3" controlId="validationMobile">
                      <Form.Label>mobile:</Form.Label>
                      <Form.Control type="text" name="mobile"
                        onChange={handleChange} value={values.mobile}
                        isValid={touched.mobile && !errors.mobile}
                      />
                      <Form.Control.Feedback type="invalid">{errors.mobile}</Form.Control.Feedback>
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
      <ContactHistory licenceId={licenceId} trigger={trigger} />



    </>
  );
}
