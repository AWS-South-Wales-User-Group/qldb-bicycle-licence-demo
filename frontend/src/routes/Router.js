import React from "react";
import Row from "react-bootstrap/esm/Row";
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";

import Licence from '../components/Licence';
import Contact from '../components/Contact';
import NewLicenceView from '../components/NewLicenceView';

import Root from "./Root";
import ErrorPage from "../error-page";


const router = createBrowserRouter([
  {
    path: "/",
    element: <Root />,
    errorElement: <ErrorPage />,
    children: [
      {
        path: "licence/new",
        element: <NewLicenceView />,
      },
      {
        path: "licence/:licenceId",
        element: <Licence />,
      },
      {
        path: "licence/:licenceId/contact",
        element: <Contact />,
      },
    ],
  },
]);


export default function Router() {
  return (
    <>
      <Row>
        <RouterProvider router={router} />
      </Row>
    </>
  );
} 
