import React, { useState, useEffect } from "react";

import Nav from 'react-bootstrap/Nav';
import Row from "react-bootstrap/esm/Row";
import Button from "react-bootstrap/Button";

import { SearchField } from '@aws-amplify/ui-react';
import { Outlet, Link, NavLink, useNavigate, useParams } from "react-router-dom";
import Col from "react-bootstrap/Col";

export default function Root() {
  const navigate = useNavigate();
  const { licenceId } = useParams();
  const [search, setSearch] = useState('');

  useEffect(() => {
    setSearch(licenceId);
  }, [licenceId]);

  return (
    <>
      <Row className="py-4 justify-content-between">
        <Col>
          <SearchField hasSearchButton={false} hasSearchIcon={true} label="Search" placeholder="Search using a Licence ID here..."
            onClear={() => setSearch('')}
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            onSubmit={() => navigate(`/licence/${search}`)}
          />
        </Col>
        <Col className="text-end">
          <Link to="/licence/new">
            <Button variant="secondary">Create Licence</Button>
          </Link>
        </Col>
      </Row>
      {licenceId && licenceId.length > 0 &&
        <Row>
          <Nav variant="tabs" >
            <Nav.Item>
              <Nav.Link as={NavLink} to={'licence/' + licenceId} end>Licence</Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link as={NavLink} to={'licence/' + licenceId + '/contact'} end>Contact</Nav.Link>
            </Nav.Item>
          </Nav>
        </Row>
      }
      <Row>
        <Outlet />
      </Row>
    </>
  );
}