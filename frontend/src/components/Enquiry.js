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
                <th>Deleted</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {response.map((value, index) => {
                return (
                  <tr key={index}>
                    <td className='align-middle'>{value.licenceId}</td>
                    <td className='align-middle'>{value.postcode}</td>
                    <td className='align-middle'>{value.penaltyPoints}</td>
                    <td className='align-middle'>{value.isDeleted ? "Yes" : ""}</td>
                    <td className='align-middle'>

                      <Link
                        to={{
                          pathname: "/history",
                          state: {
                            licenceId: value.licenceId,
                          },
                        }}
                      >
                        <Button
                          className="mr-1"
                          size='sm'
                          variant='outline-secondary'
                          type='submit'
                        >
                          history
                        </Button>
                      </Link>
                      {!value.isDeleted ? (
                      <Link
                        className="mr-3"
                        to={{
                          pathname: "/register",
                          state: {
                            licenceId: value.licenceId,
                          },
                        }}
                      >
                        <Button
                          size='sm'
                          variant='outline-secondary'
                          type='submit'
                        >
                          amend
                        </Button>
                      </Link>
                      ) : (
                        <></>
                      )}
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
