import React, { useState, useEffect } from "react";
import { Card, Table, Button } from "react-bootstrap";
import { Link } from "react-router-dom";

import API from "@aws-amplify/api";

export default function Enquiry() {
  const [response, setResponse] = useState([]);
  const [error, setError] = useState();

  useEffect(() => {
    const fetchData = async () => {
      const apiName = "ApiGatewayRestApi";
      const path = `/dynamodb/licences`;
      API.get(apiName, path)
        .then((response) => {
          console.log(response);
          setResponse(response);
          setError(null);
        })
        .catch((error) => {
          setError(error.response);
          setResponse([]);
        });
    };

    fetchData();
  }, []);

  return (
    <>
      {error ? (
        <Card className='text-center mt-4'>
          <Card.Body className='mt-0'>
            <h4>{error.data.detail}</h4>
          </Card.Body>
        </Card>
      ) : (
        <>
          <Table striped bordered size='sm' className='mt-3'>
            <thead>
              <tr>
                <th>Licence ID</th>
                <th>Postcode</th>
                <th>Penalty Points</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {response.map((value, index) => {
                return (
                  <tr key={index}>
                    <td className='align-middle'>{value.sk}</td>
                    <td className='align-middle'>{value.postcode}</td>
                    <td className='align-middle'>{value.penaltyPoints}</td>
                    <td className='align-middle center'>
                      <Link
                        to={{
                          pathname: "/history",
                          state: {
                            licenceId: value.sk,
                          },
                        }}
                      >
                        <Button
                          block
                          size='sm'
                          variant='outline-secondary'
                          type='submit'
                        >
                          history
                        </Button>
                      </Link>
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
