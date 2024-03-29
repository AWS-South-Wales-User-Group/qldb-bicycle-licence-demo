import React from "react";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import { Amplify, Auth } from 'aws-amplify';
import { createRoot } from 'react-dom/client';
import 'bootstrap/dist/css/bootstrap.min.css';


Amplify.configure({
  Auth: {
    region: "eu-west-2",
    userPoolId: "eu-west-2_QKNBfjNsj",
    userPoolWebClientId: "3hj9uu2mvf89j5o4r08hp9emu3"
  },
  API: {
    endpoints: [
      {
        endpoint:
          "https://ioz9dekgu2.execute-api.eu-west-2.amazonaws.com/prod",
        name: "ApiGatewayRestApi",
        region: "eu-west-2",
        custom_header: async () => {
          return { Authorization: `Bearer ${(await Auth.currentSession()).getIdToken().getJwtToken()}` }
        }
      },
    ],
  }
});

const container = document.getElementById('root');
const root = createRoot(container); // createRoot(container!) if you use TypeScript
root.render(
    <App />
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();



//   POST - https://hsht6yunic.execute-api.eu-west-2.amazonaws.com/test/licences
//   PUT - https://hsht6yunic.execute-api.eu-west-2.amazonaws.com/test/licences/address
//   PUT - https://hsht6yunic.execute-api.eu-west-2.amazonaws.com/test/licences/status
//   PUT - https://hsht6yunic.execute-api.eu-west-2.amazonaws.com/test/licences/contact
//   POST - https://hsht6yunic.execute-api.eu-west-2.amazonaws.com/test/licences/endorsement
//   GET - https://hsht6yunic.execute-api.eu-west-2.amazonaws.com/test/licences/{licenceid}
//   GET - https://hsht6yunic.execute-api.eu-west-2.amazonaws.com/test/licences/history/{licenceid}
//   GET - https://hsht6yunic.execute-api.eu-west-2.amazonaws.com/test/licences/contact/history/{licenceid}
//   GET - https://hsht6yunic.execute-api.eu-west-2.amazonaws.com/test/licences/endorsements/{licenceid}
//   GET - https://hsht6yunic.execute-api.eu-west-2.amazonaws.com/test/licences/endorsements/history/{licenceid}
//   DELETE - https://hsht6yunic.execute-api.eu-west-2.amazonaws.com/test/licences

