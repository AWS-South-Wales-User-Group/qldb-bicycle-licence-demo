/*
 * Lambda function that implements the delete licence functionality
 */
const { Logger, injectLambdaContext } = require('@aws-lambda-powertools/logger');
const { Tracer, captureLambdaHandler } = require('@aws-lambda-powertools/tracer');
const { Metrics, MetricUnits, logMetrics } = require('@aws-lambda-powertools/metrics');
const { redactLicenceRevision } = require('./helper/licence');
const LicenceNotFoundError = require('./lib/LicenceNotFoundError');
const middy = require('@middy/core')
const cors = require('@middy/http-cors')

//  Params fetched from the env vars
const logger = new Logger();
const tracer = new Tracer();
const metrics = new Metrics();

tracer.captureAWS(require('aws-sdk'));

const handler = async (event) => {
  const { licenceId, version } = JSON.parse(event.body);
  const userId = event.requestContext.authorizer.claims.sub;
  logger.debug(`In the delete licence handler for licenceid ${licenceId} and version ${version}`);

  try {
    const response = await redactLicenceRevision(logger, licenceId, userId, version);
    metrics.addMetric('redactLicenceRevisionSucceeded', MetricUnits.Count, 1);
    const message = JSON.parse(response);
    return {
      statusCode: 201,
      body: JSON.stringify(message),
    };
  } catch (error) {
    if (error instanceof LicenceNotFoundError) {
      return error.getHttpResponse();
    }
    metrics.addMetric('redactLicenceRevisionFailed', MetricUnits.Count, 1);
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