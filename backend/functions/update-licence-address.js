/*
 * Lambda function that implements the update contact functionality
 */

const { Logger, injectLambdaContext } = require('@aws-lambda-powertools/logger');
const { Tracer, captureLambdaHandler } = require('@aws-lambda-powertools/tracer');
const { Metrics, logMetrics, MetricUnits } = require('@aws-lambda-powertools/metrics');
const date = require('date-and-time');
const { updateLicenceAddress } = require('./helper/licence');
const LicenceIntegrityError = require('./lib/LicenceIntegrityError');
const { QLDBSessionClient } = require('@aws-sdk/client-qldb-session');

import middy from '@middy/core'
import cors from '@middy/http-cors'

//  Params fetched from the env vars
const logger = new Logger();
const tracer = new Tracer();
tracer.captureAWSv3Client(new QLDBSessionClient({}));
const metrics = new Metrics();

const handler = async (event) => {
  const {
    licenceId, street, county, postcode
  } = JSON.parse(event.body);
  const userId = event.requestContext.authorizer.claims.sub;
  const eventInfo = { eventName: 'LicenceAddressUpdated', eventDate: date.format(new Date(), 'YYYY/MM/DD HH:mm:ss') };
  logger.debug(`In the update licence address handler with: licenceId ${licenceId} street ${street} county ${county} and postcode ${postcode}`);

  try {
    const response = await updateLicenceAddress(licenceId, street, county, postcode, userId, eventInfo);
    metrics.addMetric('pdateLicenceAddressSucceeded', MetricUnits.Count, 1);
    return {
      statusCode: 201,
      body: JSON.stringify(response),
    };
  } catch (error) {
    if (error instanceof LicenceIntegrityError) {
      return error.getHttpResponse();
    }
    metrics.addMetric('updateLicenceAddressFailed', MetricUnits.Count, 1);
    logger.error(`Error returned: ${error}`);
    const errorBody = {
      status: 500,
      title: error.name,
      detail: error.message,
    };
    return {
      statusCode: 500,
      body: JSON.stringify(errorBody),
    };
  }
};

module.exports.handler = middy(handler)
  .use(injectLambdaContext(logger))
  .use(captureLambdaHandler(tracer))
  .use(logMetrics(metrics, { captureColdStartMetric: true }))
  .use(cors());