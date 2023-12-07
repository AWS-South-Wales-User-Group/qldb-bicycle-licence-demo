/*
 * Lambda function used as a custom resource to create the table
 * in QLDB using CloudFormation
 */

const { Logger, injectLambdaContext } = require('@aws-lambda-powertools/logger');
const { Tracer, captureLambdaHandler } = require('@aws-lambda-powertools/tracer');
const { Metrics, MetricUnits, logMetrics } = require('@aws-lambda-powertools/metrics');
import middy from '@middy/core'
//const middy = require('@middy/core');
const response = require('cfn-response-promise');
const { QldbDriver } = require('amazon-qldb-driver-nodejs');
const { QLDBSessionClient } = require('@aws-sdk/client-qldb-session');

const qldbDriver = new QldbDriver(process.env.LEDGER_NAME);

const logger = new Logger();
const tracer = new Tracer();
tracer.captureAWSv3Client(new QLDBSessionClient({}));
const metrics = new Metrics();

async function createTable(txn, tableName) {
  const statement = `CREATE TABLE ${tableName}`;
  return txn.execute(statement).then((result) => {
    logger.debug(`Successfully created table ${tableName}.`);
    return result;
  });
}

const handler = async (event, context) => {
  logger.debug(`QLDB Table request received:\n${JSON.stringify(event, null, 2)}`);

  try {
    if (event.RequestType === 'Create') {
      logger.debug('Attempting to create QLDB table');
      try {
        await qldbDriver.executeLambda(async (txn) => {
          Promise.all([
            createTable(txn, process.env.LICENCE_TABLE),
            createTable(txn, process.env.CONTACT_TABLE),
            createTable(txn, process.env.ENDORSEMENT_TABLE),
            createTable(txn, process.env.MAPPING_TABLE)
          ]);
        });
      } catch (e) {
        logger.error(`Unable to connect: ${e}`);
        await response.send(event, context, response.FAILED);
      }
      const responseData = { requestType: event.RequestType };
      await response.send(event, context, response.SUCCESS, responseData);
    } else if (event.RequestType === 'Delete') {
      logger.debug('Request received to delete QLDB table');
      // Do nothing as table will be deleted as part of deleting QLDB Ledger
      const responseData = { requestType: event.RequestType };
      await response.send(event, context, response.SUCCESS, responseData);
    } else {
      logger.error('Did not recognise event type resource');
      await response.send(event, context, response.FAILED);
    }
  } catch (error) {
    logger.error(`Failed to create table in custom resource: ${JSON.stringify(error)}`);
    await response.send(event, context, response.FAILED);
  }
};

module.exports.handler = middy(handler)
  .use(injectLambdaContext(logger))
  .use(captureLambdaHandler(tracer))
  .use(logMetrics(metrics, { captureColdStartMetric: true }));
