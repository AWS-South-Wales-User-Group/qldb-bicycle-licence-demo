import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import API from "@aws-amplify/api";
import Auth from "@aws-amplify/auth";
import { BrowserRouter as Router } from "react-router-dom";


Auth.configure({
  Auth: {
    region: "region",
    userPoolId: "userPoolId",
    userPoolWebClientId: "userPoolWebClientId"
  },
});

API.configure({
  API: {
    endpoints: [
      {
        endpoint:
          "https://endpoint",
        name: "ApiGatewayRestApi",
        region: "eu-west-1",
        custom_header: async () => { 
          return { Authorization: `Bearer ${(await Auth.currentSession()).getIdToken().getJwtToken()}` }
        }
      },
    ],
  },
});


ReactDOM.render(
  <React.StrictMode>
    <Router>
      <App />
    </Router>
  </React.StrictMode>,
  document.getElementById("root")
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
