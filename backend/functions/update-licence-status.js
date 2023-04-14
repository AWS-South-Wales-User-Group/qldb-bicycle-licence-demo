/*
 * Lambda function that implements the update licence functionality
 */
const { Logger, injectLambdaContext } = require('@aws-lambda-powertools/logger');
const { Tracer, captureLambdaHandler } = require('@aws-lambda-powertools/tracer');
const { Metrics, MetricUnits, logMetrics } = require('@aws-lambda-powertools/metrics');
const date = require('date-and-time');
const { updateLicenceStatus } = require('./helper/licence');
const middy = require('@middy/core')
const cors = require('@middy/http-cors')

const LicenceIntegrityError = require('./lib/LicenceIntegrityError');

const logger = new Logger();
const tracer = new Tracer();
const metrics = new Metrics();

tracer.captureAWS(require('aws-sdk'));

const handler = async (event) => {
  const { licenceId, status } = JSON.parse(event.body);
  const userId = 1234;
//  const userId = event.requestContext.authorizer.claims.sub;
  logger.debug(`In the update licence status handler with licenceId ${licenceId} and status ${status}`);
  const eventInfo = { eventName: 'LicenceStatusUpdated', eventDate: date.format(new Date(), 'YYYY/MM/DD HH:mm:ss') };

  try {
    const response = await updateLicenceStatus(licenceId, status, userId, eventInfo);
    metrics.addMetric('updateLicenceStatusSucceeded', MetricUnits.Count, 1);
    return {
      statusCode: 200,
      body: JSON.stringify(response),
    };
  } catch (error) {
    if (error instanceof LicenceIntegrityError) {
      return error.getHttpResponse();
    }
    metrics.addMetric('updateLicenceStatusFailed', MetricUnits.Count, 1);
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