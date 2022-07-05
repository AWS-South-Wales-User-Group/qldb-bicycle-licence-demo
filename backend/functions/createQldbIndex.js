/*
 * Lambda function used as a custom resource to create the indexes
 * in QLDB using CloudFormation
 */
const { Logger, injectLambdaContext } = require('@aws-lambda-powertools/logger');
const { Tracer, captureLambdaHandler } = require('@aws-lambda-powertools/tracer');
const { Metrics, MetricUnits, logMetrics } = require('@aws-lambda-powertools/metrics');
const middy = require('@middy/core');
const response = require('cfn-response-promise');
const { QldbDriver } = require('amazon-qldb-driver-nodejs');

const qldbDriver = new QldbDriver(process.env.LEDGER_NAME);

const logger = new Logger();
const tracer = new Tracer();
const metrics = new Metrics();

tracer.captureAWS(require('aws-sdk'));

async function createIndex(txn, tableName, indexAttribute) {
  const statement = `CREATE INDEX on ${tableName} (${indexAttribute})`;
  return txn.execute(statement).then((result) => {
    logger.debug(`Successfully created index ${indexAttribute} on table ${tableName}.`);
    return result;
  });
}

const handler = async (event, context) => {
  try {
    if (event.RequestType === 'Create') {
      logger.debug(`QLDB Index create request received:\n${JSON.stringify(event, null, 2)}`);
      try {
        await qldbDriver.executeLambda(async (txn) => {
          Promise.all([
            createIndex(txn, process.env.TABLE_NAME, process.env.INDEX_NAME_1),
            createIndex(txn, process.env.TABLE_NAME, process.env.INDEX_NAME_2),
            createIndex(txn, process.env.TABLE_NAME, process.env.INDEX_NAME_3),
          ]);
        });
      } catch (e) {
        logger.error(`Unable to connect: ${e}`);
        await response.send(event, context, response.FAILED);
      }
      const responseData = { requestType: event.RequestType };
      await response.send(event, context, response.SUCCESS, responseData);
    } else if (event.RequestType === 'Delete') {
      logger.debug('Request received to delete QLDB index');
      // Do nothing as table will be deleted as part of deleting QLDB Ledger
      const responseData = { requestType: event.RequestType };
      await response.send(event, context, response.SUCCESS, responseData);
    } else {
      logger.error('Did not recognise event type resource');
      await response.send(event, context, response.FAILED);
    }
  } catch (error) {
    logger.error(`catch all error: ${error}`);
    await response.send(event, context, response.FAILED, { Error: error });
  }
};

module.exports.handler = middy(handler)
.use(injectLambdaContext(logger))
.use(captureLambdaHandler(tracer))
.use(logMetrics(metrics, { captureColdStartMetric: true }));