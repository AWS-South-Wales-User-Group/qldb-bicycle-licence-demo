import React, { useEffect, useState } from "react";
import API from "@aws-amplify/api";
import { Alert, View, Card, Flex, Text, TextField, Button, useTheme, Heading } from '@aws-amplify/ui-react';
import {
  useFormik,
} from 'formik';

import { faker } from '@faker-js/faker';

export default () => {

  const { tokens } = useTheme();
  const [licenceId, setLicenceId] = useState('');
  const [error, setError] = useState('');

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
          setLicenceId(response.licenceId);
        })
        .catch((error) => {
          console.log(error.response);

          setError({ detail: error.response.data.detail, title: error.response.data.title });

        }).finally(() => {

        });
    },
  });

  return (
    <View padding={tokens.space.large}>

      <Flex as="form" direction="column" onSubmit={formik.handleSubmit}>
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
        </Alert>
        <Heading level={4}>Register Licence</Heading>
        <Button onClick={() => {
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

        <Button color="primary" variant="contained" type="submit">
          Submit
        </Button>
      </Flex>

    </View>




  );
};


// {
//       "firstName" : "Cian",
//       "lastName" : "Lewis",
//       "email": "cian-lewis@qldb.com",
//       "street": "test street 1",
//       "county": "Swansea",
//       "mobile" : "01345456",
//       "postcode": "AB12ABC"
//   }