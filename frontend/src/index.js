import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import API from "@aws-amplify/api";
import { Logger, Amplify } from "@aws-amplify/core";
import Auth from "@aws-amplify/auth";
import { BrowserRouter as Router } from "react-router-dom";
Logger.LOG_LEVEL = "DEBUG";



Auth.configure({
  Auth: {
    region: "eu-west-1",
    userPoolId: "eu-west-1_z8QXJ5zUq",
    userPoolWebClientId: "um8rd3o0ltsvt1rofpo3cva9t",
    identityPoolId: 'eu-west-1:2d1f2c19-463a-4ac0-a972-5aa1206ea280',
    mandatorySignIn: true,


  },
});
API.configure({
  API: {
    endpoints: [
      {
        endpoint: "https://gjo8rutz64.execute-api.eu-west-1.amazonaws.com/dev",
        name: "ApiGatewayRestApi",
        region: "eu-west-1",
        // custom_header: async () => {
        //   return {
        //     Authorization: `Bearer ${(await Auth.currentSession())
        //       .getIdToken()
        //       .getJwtToken()}`,
        //   };
        // },
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
