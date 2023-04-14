/*
 * Lambda function that implements the get licence functionality
 */
const { Logger, injectLambdaContext } = require('@aws-lambda-powertools/logger');
const { Tracer, captureLambdaHandler } = require('@aws-lambda-powertools/tracer');
const { Metrics, MetricUnits, logMetrics } = require('@aws-lambda-powertools/metrics');
const { getEndorsement } = require('./helper/licence');
const LicenceNotFoundError = require('./lib/LicenceNotFoundError');
const middy = require('@middy/core')
const cors = require('@middy/http-cors')

//  Params fetched from the env vars
const logger = new Logger();
const tracer = new Tracer();
const metrics = new Metrics();

tracer.captureAWS(require('aws-sdk'));

const handler = async (event) => {
  const { licenceid } = event.pathParameters;
  logger.debug(`In the get-licence handler with licenceid ${licenceid}`);

  try {
    const response = await getEndorsement(logger, licenceid);
    metrics.addMetric('getEndorsementSucceeded', MetricUnits.Count, 1);
    const licence = JSON.parse(response);
    return {
      statusCode: 200,
      body: JSON.stringify(licence),
    };
  } catch (error) {
    if (error instanceof LicenceNotFoundError) {
      return error.getHttpResponse();
    }
    metrics.addMetric('getEndorsementFailed', MetricUnits.Count, 1);
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