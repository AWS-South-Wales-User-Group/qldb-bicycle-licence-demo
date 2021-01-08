import React from "react";
import ReactDOM from "react-dom";
import AuthStateApp from "./AuthStateApp";
import reportWebVitals from "./reportWebVitals";
import API from "@aws-amplify/api";
import Auth from "@aws-amplify/auth";

Auth.configure({
  Auth: {
    region: "eu-west-1",
    userPoolId: "eu-west-1_TL1zlExKE",
    userPoolWebClientId: "6s7aqship3e29bg4slrs7bp0ud"
  },
});

API.configure({
  API: {
    endpoints: [
      {
        endpoint:
          "https://a8ffyaj6f6.execute-api.eu-west-1.amazonaws.com/prod",
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
    <AuthStateApp />
  </React.StrictMode>,
  document.getElementById("root")
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
