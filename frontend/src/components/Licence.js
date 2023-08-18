import React, { useEffect, useState } from "react";
import API from "@aws-amplify/api";
import { Formik } from 'formik';
import Form from 'react-bootstrap/Form';
import Card from 'react-bootstrap/Card';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Badge from 'react-bootstrap/Badge';
import Button from 'react-bootstrap/Button';
import { useParams } from 'react-router-dom';
import LicenceHistory from "./LicenceHistory";


export default function Licence(props) {
  const { licenceId } = useParams();
  const [formValues, setFormValues] = useState({ firstName: '', lastName: '', street: '', county: '', postcode: '', status: '' });
  const [trigger, setTrigger] = useState(0);

  // const { values, setValues } = useFormikContext();


  useEffect(() => {
    const apiName = "ApiGatewayRestApi";
    const path = `/licences/${licenceId}`;
    if (licenceId !== '') {
      API.get(apiName, path)
        .then((response) => {
          const { firstName, lastName, street, county, postcode, status } = response;
          setFormValues({ firstName, lastName, street, county, postcode, status });
        });
    }
  }, [licenceId]);

  const deleteLicence = (event) => {
    event.preventDefault();
    const apiName = "ApiGatewayRestApi";
    const path = `/licences`;
    API.del(apiName, path, { body: { licenceId } }).then(() => {
      setTrigger((trigger) => trigger + 1);
    });
  }

  return (
    <>
      <Formik
        initialValues={formValues}
        enableReinitialize={true}
        onSubmit={async (values) => {

          const apiName = "ApiGatewayRestApi";
          const path = `/licences/address`;
          values.licenceId = licenceId;
          await API.put(apiName, path, { body: values })
          setTrigger((trigger) => trigger + 1);

        }}
      >
        {({ isSubmitting, handleChange, values, touched, errors, handleSubmit }) => (

          <Container>
            <Row className="p-4">
              <Card >
                <Card.Body>
                  <Card.Title>Licence Details <Badge bg="info" className="m-3 position-absolute end-0">{values.status}</Badge></Card.Title>
                  <Card.Subtitle className="mb-2 text-muted">does this have its own history?</Card.Subtitle>

                  <Form onSubmit={handleSubmit} >
                    <Row className="mb-3">
                      <Col md={6}>
                        <Form.Group className="mb-3" controlId="validationFirstName">
                          <Form.Label>firstName:</Form.Label>
                          <Form.Control readOnly disabled type="firstName" name="firstName"
                            onChange={handleChange} value={values.firstName}
                            isValid={touched.firstName && !errors.firstName}
                          />
                          <Form.Control.Feedback type="invalid">{errors.firstName}</Form.Control.Feedback>
                        </Form.Group>
                      </Col>
                      <Col md={6}>

                        <Form.Group className="mb-3" controlId="validationLastName">
                          <Form.Label>lastName:</Form.Label>
                          <Form.Control readOnly disabled type="text" name="lastName"
                            onChange={handleChange} value={values.lastName}
                            isValid={touched.lastName && !errors.lastName}
                          />
                          <Form.Control.Feedback type="invalid">{errors.lastName}</Form.Control.Feedback>
                        </Form.Group>
                      </Col>

                    </Row>
                    <Row>
                      <Form.Group className="mb-3" controlId="validationStreet">
                        <Form.Label>street:</Form.Label>
                        <Form.Control type="street" name="street"
                          onChange={handleChange} value={values.street}
                          isValid={touched.street && !errors.street}
                        />
                        <Form.Control.Feedback type="invalid">{errors.street}</Form.Control.Feedback>
                      </Form.Group>

                    </Row>
                    <Row>
                      <Form.Group className="mb-3" controlId="validationCounty">
                        <Form.Label>county:</Form.Label>
                        <Form.Control type="county" name="county"
                          onChange={handleChange} value={values.county}
                          isValid={touched.county && !errors.county}
                        />
                        <Form.Control.Feedback type="invalid">{errors.county}</Form.Control.Feedback>
                      </Form.Group>
                    </Row>
                    <Row>
                      <Form.Group className="mb-3" controlId="validationPostcode">
                        <Form.Label>postcode:</Form.Label>
                        <Form.Control type="postcode" name="postcode"
                          onChange={handleChange} value={values.postcode}
                          isValid={touched.postcode && !errors.postcode}
                        />
                        <Form.Control.Feedback type="invalid">{errors.postcode}</Form.Control.Feedback>
                      </Form.Group>
                    </Row>
                    <Button variant="primary" type="submit" value="update">
                      update
                    </Button>&nbsp; 
                    <Button variant="primary" onClick={(event) => deleteLicence(event)} value="delete"> 
                      delete
                    </Button>
                  </Form>
                </Card.Body>
              </Card>

            </Row>
          </Container>


        )}


      </Formik>

      <LicenceHistory licenceId={licenceId} trigger={trigger} />


    </>
  );
}
