/*
 * Lambda function that implements the get licence functionality
 */
const { Logger, injectLambdaContext } = require('@aws-lambda-powertools/logger');
const { Tracer, captureLambdaHandler } = require('@aws-lambda-powertools/tracer');
const { Metrics, MetricUnits, logMetrics } = require('@aws-lambda-powertools/metrics');
const middy = require('@middy/core')
const cors = require('@middy/http-cors')
const { findAllLicences } = require('./lib/dynamodb-licence');

//  Params fetched from the env vars
const logger = new Logger();
const tracer = new Tracer();
const metrics = new Metrics();

tracer.captureAWS(require('aws-sdk'));

const handler = async (event) => {
  const userId = event.requestContext.authorizer.claims.sub;
  logger.debug(`In the dynamodb-findall handler with userId ${userId}`);

  try {

    response = await findAllLicences(userId);

    logger.debug(`RESPONSE: ${JSON.stringify(response)}`);

    return {
      statusCode: 200,
      body: JSON.stringify(response),
    };
  } catch (error) {
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