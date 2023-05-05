import React, { useEffect, useState } from "react";
import API from "@aws-amplify/api";
import { Alert, Loader, TableBody, View, Card, TableHead, Table, TableRow, TableCell, Button, useTheme } from '@aws-amplify/ui-react';

export default function EndorsementView(props) {
  const { tokens } = useTheme();
  const { licenceId } = props;
  const [endorsements, setEndorsements] = useState([]);
  const [loading, setLoading] = useState(false);
  const [found, setFound] = useState(false);

  useEffect(() => {
    const apiName = "ApiGatewayRestApi";
    const path = `/licences/${licenceId}/endorsements`;
    if (licenceId !== '') {
      setLoading(true);
      API.get(apiName, path)
        .then((response) => {
          setEndorsements(response);
          setFound(true);

        })
        .catch((error) => {
          setFound(false);

        }).finally(() => {
          setLoading(false);
        });
    }
  }, [licenceId]);

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
      <Card hidden={!found} >
        <Table
          caption=""
          highlightOnHover={false}>
          <TableHead>
            <TableRow>
              <TableCell as="th">issueDtm</TableCell>
              <TableCell as="th">expiryDtm</TableCell>
              <TableCell as="th">points</TableCell>
              <TableCell as="th"></TableCell>

            </TableRow>
          </TableHead>
          <TableBody>
            {endorsements.map((value, index) => {
              return (
                <TableRow key={index}>
                  <TableCell>{value.issueDtm}</TableCell>
                  <TableCell>{value.expiryDtm}</TableCell>
                  <TableCell>{value.points}</TableCell>
                  <TableCell>
                    <Button loadingText="delete-endorsement" onClick={() => alert('delete-endorsement')} ariaLabel="delete-endorsement" >
                      Delete
                    </Button></TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </Card>
    </View>
  );
}
