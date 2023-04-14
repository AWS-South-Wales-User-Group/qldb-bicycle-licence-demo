/*
 * Lambda function that implements the create licence functionality
 */
const { Logger, injectLambdaContext } = require('@aws-lambda-powertools/logger');
const { Tracer, captureLambdaHandler } = require('@aws-lambda-powertools/tracer');
const { Metrics, MetricUnits, logMetrics } = require('@aws-lambda-powertools/metrics');
const date = require('date-and-time');
const middy = require('@middy/core');
const { addEndorsement } = require('./helper/licence');
const LicenceIntegrityError = require('./lib/LicenceIntegrityError');
const cors = require('@middy/http-cors')

//  Params fetched from the env vars
const logger = new Logger();
const tracer = new Tracer();
const metrics = new Metrics();

tracer.captureAWS(require('aws-sdk'));

const handler = async (event) => {
  const {
    licenceId, points, issueDtm, expiryDtm
  } = JSON.parse(event.body);
//  const userId = event.requestContext.authorizer.claims.sub;
  const userId = 1234;
  const eventInfo = { eventName: 'EndorsementAdded', eventDate: date.format(new Date(), 'YYYY/MM/DD HH:mm:ss') };

  logger.debug(`In the add endorsement handler with: licenceId ${licenceId} points ${points} issueDtm ${issueDtm} and expiryDtm ${expiryDtm}`);

  try {
    const response = await addEndorsement(
      logger, licenceId, points, issueDtm, expiryDtm, eventInfo, userId
    );
    metrics.addMetric('addEndorsementSucceeded', MetricUnits.Count, 1);
    return {
      statusCode: 201,
      body: JSON.stringify(response),
    };
  } catch (error) {
    if (error instanceof LicenceIntegrityError) {
      return error.getHttpResponse();
    }
    metrics.addMetric('addEndorsementFailed', MetricUnits.Count, 1);
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