import React from "react";
import { useParams } from 'react-router-dom';

import ContactView from "./ContactView";
import Licence from "./Licence";
import LicenceHistoryView from "./LicenceHistoryView";

export default function LicenceView(props) {
  const { licenceId } = useParams();
  return (
    <>
      <Licence licenceId={licenceId} />

      <LicenceHistoryView licenceId={licenceId}/>
      <ContactView licenceId={licenceId} />
    </>
  );
}
  