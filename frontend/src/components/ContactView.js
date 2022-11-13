import React, { useEffect, useState } from "react";
import API from "@aws-amplify/api";
import { Alert, Expander, ExpanderItem, Heading, Divider, Loader, TextField, View, Flex, Button, useTheme } from '@aws-amplify/ui-react';
import {
  useFormik
} from 'formik';
import Code from "./prism/Code";


export default function ContactView(props) {
  const { tokens } = useTheme();
  const { licenceId } = props;
  const [loading, setLoading] = useState(false);
  const [found, setFound] = useState(false);
  const [history, setHistory] = useState([]);
  const [formValues, setFormValues] = useState({ email: '', mobile: '' });
  const [value, setValue] = useState();


  useEffect(() => {
    const apiName = "ApiGatewayRestApi";
    const path = `/licences/${licenceId}/contact`;
    if (licenceId !== '') {
      setLoading(true);
      API.get(apiName, path)
        .then((response) => {
          const { email, mobile } = response;
          setFormValues({ email, mobile });

          API.get(apiName, `/licences/${licenceId}/contact/history`)
            .then((response) => {
              console.log(response)
              setHistory(response);
            })
            .catch((error) => {
              alert(JSON.stringify(error, null, 2));
            })

          setFound(true);
        })
        .catch((error) => {
          setFound(false);
        }).finally(() => {
          setLoading(false);
        });


    }
  }, [licenceId]);

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: formValues,
    // validationSchema: validationSchema,
    onSubmit: (values) => {
      alert(JSON.stringify(values, null, 2));
      const apiName = "ApiGatewayRestApi";
      const path = `/licences/contact`;
      values.licenceId = licenceId;
      alert(JSON.stringify(values, null, 2));

      API.put(apiName, path, { body: values })
        .then((response) => {
          console.log(response)
          alert(JSON.stringify(response, null, 2));

        })
        .catch((error) => {
          alert(JSON.stringify(error, null, 2));

          setFound(false);
        }).finally(() => {
          setLoading(false);
        });


    },
  });

  const CustomTitle = ({ courseNumber, courseName }) => {
    const { tokens } = useTheme();
    return (
      <Flex gap={tokens.space.small}>
        <View width="10rem" color={tokens.colors.teal[80]}>
          {courseNumber}
        </View>
        <View>{courseName}</View>
      </Flex>
    );
  };

  return (
    <View padding={tokens.space.large}>
      <Loader variation="linear" size="small" hidden={!loading} />
      <Alert
        variation="info"
        isDismissible={false}
        hasIcon={true}
        heading="Unknown or missing Licence ID"
        hidden={loading || found}
      >
        Search for a Licence using it's Licence ID in the search box above
      </Alert>

      <View padding={tokens.space.large}>

        <Flex as="form" onSubmit={formik.handleSubmit} direction="column" >


          <TextField id="email" name="email" label="email" value={formik.values.email} onChange={formik.handleChange} readOnly disabled />

          <TextField id="mobile" name="mobile" label="mobile" value={formik.values.mobile} onChange={formik.handleChange} />

          <Flex direction="column" alignItems="flex-end">

            <Button
              loadingText="update contact"
              type="submit"
              ariaLabel="update-contact"
            >
              Update Contact
            </Button>
          </Flex>

        </Flex>


      </View>
      <Divider
    orientation="horizontal" />
      <View padding={tokens.space.large}>
        <Flex
          direction="column"
          justifyContent="flex-start"
          alignItems="stretch"
          alignContent="flex-start"
          wrap="nowrap"
          gap="1rem"
        >
          <Heading level={3}>History</Heading>


          <Expander type="single" isCollapsible={true} value={value} onValueChange={setValue}>

            {/* {history.map((item, i) => <ExpanderItem title="Is it accessible?" value={i}>
            Yes! It adheres to the WAI-ARAI design pattern.
          </ExpanderItem>)} */}
            {history.map((item, i) =>
              <ExpanderItem
                key={item.metadata.txid}
                title={
                  <CustomTitle
                    courseNumber={`version ${item.metadata.version}`}
                    courseName={`${item.data ? item.data.events.eventName : "redacted? or deleted?"}`}
                  />
                }
                value={`${i}`}
              >
                <Code code={`${JSON.stringify(item, null, 2)}`} language="json"  />
              </ExpanderItem>)}

          </Expander>




        </Flex>

      </View>
    </View>
  );
}
