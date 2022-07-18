/*
 * Lambda function that implements the create licence functionality
 */
const { Logger, injectLambdaContext } = require('@aws-lambda-powertools/logger');
const { Tracer, captureLambdaHandler } = require('@aws-lambda-powertools/tracer');
const { Metrics, MetricUnits, logMetrics } = require('@aws-lambda-powertools/metrics');
const middy = require('@middy/core');
const date = require('date-and-time');
const { createLicence } = require('./helper/licence');
const LicenceIntegrityError = require('./lib/LicenceIntegrityError');
const cors = require('@middy/http-cors')

//  Params fetched from the env vars
const logger = new Logger();
const tracer = new Tracer();
const metrics = new Metrics();

tracer.captureAWS(require('aws-sdk'));

const handler = async (event) => {
  const {
    firstName, lastName, email, street, county, postcode,
  } = JSON.parse(event.body);
  const userId = event.requestContext.authorizer.claims.sub;
  logger.debug(`In the create licence handler with: first name ${firstName} last name ${lastName} email ${email} street ${street} and county ${county} and postcode ${postcode} and userId ${userId}`);

  try {
    const eventInfo = { eventName: 'BicycleLicenceCreated', eventDate: date.format(new Date(), 'YYYY/MM/DD HH:mm:ss') };
    const response = await createLicence(
      logger, firstName, lastName, email, street, county, postcode, userId, eventInfo
    );
    metrics.addMetric('createLicenceSucceeded', MetricUnits.Count, 1);
    return {
      statusCode: 201,
      body: JSON.stringify(response),
    };
  } catch (error) {
    if (error instanceof LicenceIntegrityError) {
      return error.getHttpResponse();
    }
    metrics.addMetric('createLicenceFailed', MetricUnits.Count, 1);
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