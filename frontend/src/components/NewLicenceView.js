import React, { useState } from "react";
import API from "@aws-amplify/api";
import { Alert, TextField } from '@aws-amplify/ui-react';
import {
  useFormik,
} from 'formik';
import { useNavigate } from "react-router-dom";

import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Card from 'react-bootstrap/Card';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';


import { faker } from '@faker-js/faker';

export default function NewLicenceView() {

  const [licenceId, setLicenceId] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const formik = useFormik({
    initialValues: {
      firstName: '',
      lastName: '',
      email: '',
      street: '',
      county: '',
      mobile: '',
      postcode: ''
    },
    // validationSchema: validationSchema, //https://formik.org/docs/examples/with-material-ui
    onSubmit: (values) => {
      setLicenceId('');
      const apiName = 'ApiGatewayRestApi';
      const path = '/licences';
      API.post(apiName, path, { body: values })
        .then((response) => {
          console.log(response);
          navigate(`/licence/${response.licenceId}`);
        })
        .catch((error) => {
          console.log(error.response);

          setError({ detail: error.response.data.detail, title: error.response.data.title });

        }).finally(() => {

        });


    },
  });

  return (
    <Container>
      <Row>
        <Col>
          <h1 class="display-6">Register</h1>
        </Col>
      </Row>
      <Row><Col>
        <Alert
          variation='success'
          isDismissible={true}
          hasIcon={true}
          heading={`Licence ID: ${licenceId} registered`}
          hidden={licenceId !== '' ? false : true}
        >
          Please make sure you make a note of your Licence ID
        </Alert>
        <Alert
          variation='error'
          isDismissible={true}
          hasIcon={true}
          heading={error.title}
          hidden={error !== '' ? false : true}
        >
          {error.detail}
        </Alert></Col>
      </Row>
      <Form onSubmit={formik.handleSubmit}>

        <Row className="pt-4">
          <Card>
            <Card.Body>
              <Container>
                <Row className="p-2">

                  <Col>
                    <p class="h5">Contact</p>
                  </Col>
                </Row>
                <Row className="p-2">
                  <Col>
                    {/* First Name */}
                    <TextField
                      id="firstName"
                      name="firstName"
                      label="First Name"
                      value={formik.values.firstName}
                      onChange={formik.handleChange}
                    // error={formik.touched.firstName && Boolean(formik.errors.firstName)}
                    // helperText={formik.touched.firstName && formik.errors.firstName}
                    />
                  </Col>
                  <Col>
                    {/* Last Name */}
                    <TextField
                      id="lastName"
                      name="lastName"
                      label="Last Name"
                      value={formik.values.lastName}
                      onChange={formik.handleChange}
                    // error={formik.touched.lastName && Boolean(formik.errors.lastName)}
                    // helperText={formik.touched.lastName && formik.errors.lastName}
                    />
                  </Col>
                </Row>
                <Row className="p-2">
                  <Col>
                    {/* email */}
                    <TextField
                      id="email"
                      name="email"
                      label="email"
                      value={formik.values.email}
                      onChange={formik.handleChange}
                    // error={formik.touched.email && Boolean(formik.errors.email)}
                    // helperText={formik.touched.email && formik.errors.email}
                    />

                  </Col>
                </Row>
                <Row className="p-2 pt-5">
                  <Col>
                    <p class="h5">Address</p>
                  </Col>
                </Row>

                <Row className="p-2">
                  <Col>

                    {/* street */}
                    <TextField
                      id="street"
                      name="street"
                      label="street"
                      value={formik.values.street}
                      onChange={formik.handleChange}
                    // error={formik.touched.street && Boolean(formik.errors.street)}
                    // helperText={formik.touched.street && formik.errors.street}
                    />
                  </Col>
                  <Col>
                    {/* county */}
                    <TextField
                      id="county"
                      name="county"
                      label="county"
                      value={formik.values.county}
                      onChange={formik.handleChange}
                    // error={formik.touched.county && Boolean(formik.errors.county)}
                    // helperText={formik.touched.county && formik.errors.county}
                    />
                  </Col>
                </Row>

                <Row className="p-2">
                  <Col>

                    {/* mobile */}
                    <TextField
                      id="mobile"
                      name="mobile"
                      label="mobile"
                      value={formik.values.mobile}
                      onChange={formik.handleChange}
                    // error={formik.touched.mobile && Boolean(formik.errors.mobile)}
                    // helperText={formik.touched.mobile && formik.errors.mobile}
                    />
                  </Col>
                  <Col>
                    {/* postcode */}
                    <TextField
                      id="postcode"
                      name="postcode"
                      label="postcode"
                      value={formik.values.postcode}
                      onChange={formik.handleChange}
                    // error={formik.touched.postcode && Boolean(formik.errors.postcode)}
                    // helperText={formik.touched.postcode && formik.errors.postcode}
                    />


                  </Col>
                </Row>



                <Row className="p-2">
                  <Col className="text-end">
                    <Button className="m-2 btn-light" onClick={() => {
                      formik.setValues(
                        {
                          firstName: faker.name.firstName(),
                          lastName: faker.name.lastName(),
                          email: faker.internet.email(),
                          street: faker.address.streetAddress(),
                          county: faker.address.county(),
                          mobile: faker.phone.number(),
                          postcode: faker.address.zipCode()
                        }
                      )
                    }}>Generate test data</Button>
                    <Button className="m-2 btn-secondary" type="submit">
                      Submit
                    </Button>

                  </Col>
                </Row>

              </Container>
            </Card.Body>
          </Card>
        </Row>
      </Form>

    </Container>


  );
};