import React from "react";
import Row from "react-bootstrap/esm/Row";
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";

import LicenceView from './LicenceView';
import LicenceHistoryView from './LicenceHistoryView';
import NewLicenceView from './NewLicenceView';

import Root from "..//routes/root";
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
        element: <LicenceView />,
      },
      {
        path: "licence/:licenceId/history",
        element: <LicenceHistoryView />,
      },
    ],
  },
]);


export default function ExistingLicenceView() {
  return (
    <>
      <Row>
        <RouterProvider router={router} />
      </Row>
    </>
  );
} 
