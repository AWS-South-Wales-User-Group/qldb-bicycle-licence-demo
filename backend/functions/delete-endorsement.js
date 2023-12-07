/*
 * Lambda function that implements the delete licence functionality
 */
const { Logger, injectLambdaContext } = require('@aws-lambda-powertools/logger');
const { Tracer, captureLambdaHandler } = require('@aws-lambda-powertools/tracer');
const { Metrics, MetricUnits, logMetrics } = require('@aws-lambda-powertools/metrics');
const { deleteEndorsement } = require('./helper/licence');
const LicenceNotFoundError = require('./lib/LicenceNotFoundError');
const { QLDBSessionClient } = require('@aws-sdk/client-qldb-session');

import middy from '@middy/core'
import cors from '@middy/http-cors'

//  Params fetched from the env vars
const logger = new Logger();
const tracer = new Tracer();
tracer.captureAWSv3Client(new QLDBSessionClient({}));
const metrics = new Metrics();

const handler = async (event) => {
  const { endorsementId, licenceId } = JSON.parse(event.body);
  logger.debug(`In the delete endorsement handler for endorsementId ${endorsementId} and licenceId ${licenceId}`);

  try {
    const response = await deleteEndorsement(logger, endorsementId, licenceId);
    metrics.addMetric('deleteEndorsementSucceeded', MetricUnits.Count, 1);
    const message = JSON.parse(response);
    return {
      statusCode: 201,
      body: JSON.stringify(message),
    };
  } catch (error) {
    if (error instanceof LicenceNotFoundError) {
      return error.getHttpResponse();
    }
    metrics.addMetric('deleteEndorsementFailed', MetricUnits.Count, 1);
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