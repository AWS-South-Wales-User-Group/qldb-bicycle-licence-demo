import React from "react";
import { Link } from "react-router-dom";
import Jumbotron from "react-bootstrap/Jumbotron";
import Button from "react-bootstrap/Button";
import Container from "react-bootstrap/Container";
import { LinkContainer } from "react-router-bootstrap";

const Welcome = () => {
  return (
    <Container>
      <Jumbotron>
        <h1>Hello, QLDB!</h1>
        <p>
          Welcome to QLDB demo. This is a demo site to show some of the features
          of the Amazon QLDB service. Create an account and create some
          synthetic bicycle licence data, which you can query against using
          QLDB, DynamoDB and elasticsearch
        </p>
        <p>
          <LinkContainer to='/login'>
            <Button variant='primary'>Login</Button>
          </LinkContainer>
        </p>
      </Jumbotron>
    </Container>
  );
};

export default Welcome;
