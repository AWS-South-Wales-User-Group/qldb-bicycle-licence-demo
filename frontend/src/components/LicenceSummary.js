import React, { useEffect, useState } from "react";
import API from "@aws-amplify/api";
import Card from "react-bootstrap/Card";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Button from "react-bootstrap/Button";
import Table from "react-bootstrap/Table";
import { Link } from 'react-router-dom';

export default function LicenceSummary(props) {
  const [items, setItems] = useState([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const apiName = "ApiGatewayRestApi";
    const path = `/licences/summary`;
    API.get(apiName, path).then((response) => {
      console.log(response.length);
      setItems(response);
    });
  }, [loaded]);

  return (
    <Container>
      <Row className="p-4">
        <Card>
          <Card.Body>
            <Card.Title>Licence Summary</Card.Title>
            <Card.Subtitle className="mb-2 text-muted">
              list of all your licences
            </Card.Subtitle>

            <Table hover>
              {/* <thead>
                <tr>
                  <th>Licence ID</th>
                  <th>First Name</th>
                  <th>Last Name</th>
                  <th>Postcode</th>
                </tr>
                </thead> */}
                <tbody>
                  {items.map((item, index) => (
                    <tr key={"licenceId-"+index}>
                      <td>{item.licenceId}</td>
                      <td>{item.firstName}</td>
                      <td>{item.lastName}</td>
                      <td>{item.postcode}</td>
                      <td><Link to={"/licence/"+item.licenceId}><Button variant="secondary">view</Button></Link></td>
                    </tr>
                  ))};
                </tbody>
            </Table>
            
          </Card.Body>
        </Card>
      </Row>
    </Container>
  );
}
