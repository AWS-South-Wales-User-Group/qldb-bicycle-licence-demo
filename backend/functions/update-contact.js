/*
 * Lambda function that implements the update contact functionality
 */

const { Logger, injectLambdaContext } = require('@aws-lambda-powertools/logger');
const { Tracer, captureLambdaHandler } = require('@aws-lambda-powertools/tracer');
const { Metrics, logMetrics, MetricUnits } = require('@aws-lambda-powertools/metrics');
const date = require('date-and-time');
const { updateContact } = require('./helper/licence');
const LicenceIntegrityError = require('./lib/LicenceIntegrityError');
const middy = require('@middy/core')
const cors = require('@middy/http-cors')

//  Params fetched from the env vars
const logger = new Logger();
const tracer = new Tracer();
const metrics = new Metrics();

tracer.captureAWS(require('aws-sdk'));

const handler = async (event) => {
  const {
    licenceId, mobile
  } = JSON.parse(event.body);
  const userId = event.requestContext.authorizer.claims.sub;
  const eventInfo = { eventName: 'ContactUpdated', eventDate: date.format(new Date(), 'YYYY/MM/DD HH:mm:ss') };
  logger.debug(`In the update contact handler with: licenceId ${licenceId} and mobile ${mobile}`);

  try {
    const response = await updateContact(logger, licenceId, mobile, userId, eventInfo);
    metrics.addMetric('updateContactSucceeded', MetricUnits.Count, 1);
    return {
      statusCode: 201,
      body: JSON.stringify(response),
    };
  } catch (error) {
    if (error instanceof LicenceIntegrityError) {
      return error.getHttpResponse();
    }
    metrics.addMetric('updateContactFailed', MetricUnits.Count, 1);
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