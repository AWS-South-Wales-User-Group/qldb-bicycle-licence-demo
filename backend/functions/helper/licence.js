/*
 * Helper utility that provides the implementation for interacting with QLDB
 */

//const Log = require('@dazn/lambda-powertools-logger');
const qldb = require('amazon-qldb-driver-nodejs');
const LicenceIntegrityError = require('../lib/LicenceIntegrityError');
const LicenceNotFoundError = require('../lib/LicenceNotFoundError');
const date = require('date-and-time');


/**
 * Check if an email address already exists
 * @param logger The logger instance
 * @param txn The {@linkcode TransactionExecutor} for lambda execute.
 * @param email The email address of the licence holder.
 * @returns The number of records that exist for the email address
 */
async function checkEmailUnique(logger, txn, email) {
  logger.debug('In checkEmailUnique function');
  const query = 'SELECT email FROM Contact AS b WHERE b.email = ?';
  let recordsReturned;
  await txn.execute(query, email).then((result) => {
    recordsReturned = result.getResultList().length;
    if (recordsReturned === 0) {
      logger.debug(`No records found for ${email}`);
    } else {
      logger.debug(`Record already exists for ${email}`);
    }
  });
  return recordsReturned;
}

/**
 * Helper function to retrieve a table ID
 * @param txn The {@linkcode TransactionExecutor} for lambda execute.
 * @param name The name of the table
 * @returns The Result from executing the statement
 */
 async function getTableId(txn, name) {
  console.log('In getTableId function');
  const query = 'SELECT tableId FROM information_schema.user_tables WHERE name = ?';
  return txn.execute(query, name);
}


/**
 * Creates a new contact and licence record in the QLDB ledger.
 * @param logger The logger object passed in
 * @param firstName The first name of the licence holder.
 * @param lastName The last name of the licence holder.
 * @param email The email address of the contact.
 * @param street The street address of the licence holder.
 * @param county The county of the licence holder
 * @param postcode The postcode of the licence holder.
 * @param mobile The mobile of the contact.
 * @param userId The userId of the licence holder.
 * @returns The JSON record of the new licence reecord.
 */
const createContactAndLicence = async (logger, firstName, lastName, email, street, county, postcode, mobile, userId) => {
  logger.debug(`In createContactAndLicence function with: first name ${firstName} last name ${lastName} email ${email} street ${street} county ${county} mobile ${mobile} postcode ${postcode}`);

  let licence;
  // Get a QLDB Driver instance
  const qldbDriver = new qldb.QldbDriver(process.env.LEDGER_NAME);
  await qldbDriver.executeLambda(async (txn) => {
    // Check if the record already exists assuming email unique for contact
    const recordsReturned = await checkEmailUnique(logger, txn, email);
    const currentDate = date.format(new Date(), 'YYYY/MM/DD HH:mm:ss'); 

    if (recordsReturned === 0) {
      logger.debug('No records found so about to insert new Licence and Contact record');
      const status = 'ACTIVE';
      const eventInfo = { eventName: 'LicenceCreated', eventDate: currentDate };
      const licenceDoc = {
        firstName, lastName, street, county, postcode, status, userId, events: eventInfo,
      };

      // Create the record. This returns the unique document ID in an array as the result set
      const result = await txn.execute('INSERT INTO Licence ?', licenceDoc);
      const docIdArray = result.getResultList();
      const licenceDocId = docIdArray[0].get('documentId').stringValue();
      logger.debug(`Licence created with document Id ${licenceDocId}`);

      // Now the licence record is created we need to create the contact record
      const contactEventInfo = { eventName: 'ContactCreated', eventDate: currentDate };
      const contactDoc = {
        licenceId: licenceDocId, email, mobile, userId, events: contactEventInfo
      };

      const contactResult = await txn.execute('INSERT INTO Contact ?', contactDoc);
      const contactDocIdArray = contactResult.getResultList();
      const contactDocId = contactDocIdArray[0].get('documentId').stringValue();
      logger.debug(`Contact created with document Id ${contactDocId}`);

      const statement = `UPDATE Licence AS l BY pid SET l.licenceId = ?, l.contactId = ? WHERE pid = '${licenceDocId}'`;
      await txn.execute(statement, licenceDocId, contactDocId);
      logger.debug('Licence and Contact records created');

      licence = {
        licenceId: licenceDocId,
        contactId: contactDocId,
        firstName,
        lastName,
        status,
        email,
        mobile,
        street,
        county,
        postcode
      };
    } else {
      throw new LicenceIntegrityError(400, 'Licence Integrity Error', `Licence record with email ${email} already exists. No new record created`);
    }
  });
  return licence;
};


/**
 * Helper function to get the latest revision of document by document Id
 * @param txn The {@linkcode TransactionExecutor} for lambda execute.
 * @param id The document id of the document to retrieve
 * @returns The Result from executing the statement
 */
async function getLicenceRecordById(txn, id, userId) {
  console.log('In getLicenceRecordById function');
  const query = 'SELECT * FROM Licence AS b WHERE b.licenceId = ? AND b.userId = ?'
  return txn.execute(query, id, userId);
}

/**
 * Helper function to get the latest revision of document by document Id
 * @param txn The {@linkcode TransactionExecutor} for lambda execute.
 * @param id The document id of the document to retrieve
 * @returns The Result from executing the statement
 */
async function getLicenceRecordHistoryById(txn, id) {
  console.log('In getLicenceRecordHistoryById function');
  const query = 'SELECT * FROM history(Licence) WHERE metadata.id = ?';
  return txn.execute(query, id);
}


/**
 * Update the Licence document with an PointsAdded or PointsRemoved event
 * @param email The email address of the document to update
 * @param event The event to add
 * @returns A JSON document to return to the client
 */
 const updateLicenceStatus = async (licenceId, status, userId, eventInfo) => {
  console.log(`In updateLicenceStatus function with licenceId ${licenceId}, status ${status} and eventInfo ${eventInfo}`);

  let licence;
  // Get a QLDB Driver instance
  const qldbDriver = new qldb.QldbDriver(process.env.LEDGER_NAME);
  await qldbDriver.executeLambda(async (txn) => {

    const query = 'UPDATE Licence SET status = ?, events = ? WHERE licenceId = ? AND userId = ?'
    const result = await txn.execute(query, status, eventInfo, licenceId, userId);  
    const resultList = result.getResultList();

    if (resultList.length === 0) {
      throw new LicenceIntegrityError(400, 'Licence Integrity Error', `Licence record with licenceId ${licenceId} does not exist`);
    } else {
      licence = {
        licenceId,
        status: status,
      };
    }
  });
  return licence;
};

/**
 * Update the Licence document with new contact details
 * @param licenceId The licenceId of the document to update
 * @param street The updated street
 * @param county The updated county
 * @param postcode The updated postcode
 * @param eventInfo The event to add
 * @returns A JSON document to return to the client
 */
const updateLicenceAddress = async (licenceId, street, county, postcode, userId, eventInfo) => {
  console.log(`In updateLicenceAddress function with licenceId ${licenceId} street ${street} county ${county} and postcode ${postcode}`);

  let licence;
  // Get a QLDB Driver instance
  const qldbDriver = new qldb.QldbDriver(process.env.LEDGER_NAME);
  await qldbDriver.executeLambda(async (txn) => {
    // Get the current record

    const result = await getLicenceRecordById(txn, licenceId, userId);
    const resultList = result.getResultList();

    if (resultList.length === 0) {
      throw new LicenceIntegrityError(400, 'Licence Integrity Error', `Licence record with id ${licenceId} does not exist`);
    } else {

      const statement = 'UPDATE Licence SET street = ?, county = ?, postcode = ?, events = ? WHERE licenceId = ?';
      await txn.execute(statement, street, county, postcode, eventInfo, licenceId);

      licence = {
        licenceId,
        response: 'Address details updated',
      };
    }
  });
  return licence;
};


/**
 * Update the Contact document with new contact details e.g. mobile number
 * @param licenceId The licenceId of the document to update
 * @param street The updated street
 * @param county The updated county
 * @param postcode The updated postcode
 * @param eventInfo The event to add
 * @returns A JSON document to return to the client
 */
 const updateContact = async (logger, licenceId, mobile, userId, eventInfo) => {
  logger.debug(`In updateContact function with licenceId ${licenceId} mobile ${mobile} userId ${userId} and eventInfo ${eventInfo}`);

  let licence;
  let tableId;
  let blockAddress;
  let docId;
  let version;

  // Get a QLDB Driver instance
  const qldbDriver = new qldb.QldbDriver(process.env.LEDGER_NAME);
  await qldbDriver.executeLambda(async (txn) => {

    const getCommittedQuery = 'SELECT * FROM _ql_committed_Contact AS c WHERE c.data.licenceId = ? AND c.data.userId = ?'
    const committedQueryResult = await txn.execute(getCommittedQuery, licenceId, userId);
    const committedQueryResultList = committedQueryResult.getResultList();

    if (committedQueryResultList.length === 0) {
      throw new LicenceIntegrityError(400, 'Licence Integrity Error', `Contact record with id ${licenceId} does not exist`);
    } else {

      logger.debug(`COMMITTED QUERY RESULT: ${committedQueryResultList[0]}`);

      // now to redact the old version
      blockAddress = committedQueryResultList[0].blockAddress;
      docId = committedQueryResultList[0].metadata.id;
      version = committedQueryResultList[0].metadata.version;

      // Get the tableId
      const tableResult = await getTableId(txn, 'Contact');
      const tableIdArray = tableResult.getResultList();
      tableId = tableIdArray[0].get('tableId').stringValue();
      
      const removeMobileQuery = 'UPDATE Contact REMOVE mobile WHERE licenceId = ? and userId = ?';
      await txn.execute(removeMobileQuery, licenceId, userId);
    }
  });

  await qldbDriver.executeLambda(async (txn) => {

    // Now redact the previous version and update with new details
    const redactQuery = `EXEC redact_revision ?, '${tableId}', '${docId}'`;
    const redactResult = await txn.execute(redactQuery, blockAddress);
    const redactResultList = redactResult.getResultList();
    
    await txn.execute('UPDATE Contact SET mobile = ?, events = ? WHERE licenceId = ? AND userId = ?', mobile, eventInfo, licenceId, userId);

    licence = {
      licenceId,
      response: 'Contact details updated',
    };
    logger.debug('Completed redactAndUpdateContact');
  })

  await waitUntilRevisionRedacted(logger, `Contact`, docId, version);
  return licence;
};

/**
 * Update the Licence document with an PointsAdded or PointsRemoved event
 * @param email The email address of the document to update
 * @param event The event to add
 * @returns A JSON document to return to the client
 */
 const addEndorsement = async (logger, licenceId, points, issueDtm, expiryDtm, eventInfo, userId) => {
  logger.debug(`In addEndorsement function with licenceId ${licenceId}, points ${points} and eventInfo ${eventInfo}`);

  let licence;
  // Get a QLDB Driver instance
  const qldbDriver = new qldb.QldbDriver(process.env.LEDGER_NAME);
  await qldbDriver.executeLambda(async (txn) => {
    // Get the current record

    const result = await getLicenceRecordById(txn, licenceId, userId);
    const resultList = result.getResultList();

    if (resultList.length === 0) {
      throw new LicenceIntegrityError(400, 'Licence Integrity Error', `Licence record with licenceId ${licenceId} does not exist`);
    } else {

      logger.debug('We have checked and licence record exists');

      // logic is to add endorsement then add mapping
      const endorsementDoc = {
        licenceId, points, issueDtm, expiryDtm, userId, events: eventInfo,
      };

      // Create the record. This returns the unique document ID in an array as the result set
      const result = await txn.execute('INSERT INTO Endorsement ?', endorsementDoc);
      const docIdArray = result.getResultList();
      const endorsementDocId = docIdArray[0].get('documentId').stringValue();

      // Now the endorsement record is created we need to create the mapping record
      const mappingDoc = {
        licenceId, endorsementId: endorsementDocId, userId
      };
      await txn.execute('INSERT INTO Mapping ?', mappingDoc);

      // And finally add the endorsementId to the endorsement record
      const statement = `UPDATE Endorsement as e BY pid SET e.endorsementId = ? WHERE pid = '${endorsementDocId}'`;
      await txn.execute(statement, endorsementDocId);
      logger.debug('Endorsement and Mapping records created');

      licence = {
        licenceId,
        status: `${points} points added to licence ${licenceId}`,
      };
    }
  });
  return licence;
};




/**
 * Helper function to delete the document
 * @param txn The {@linkcode TransactionExecutor} for lambda execute.
 * @param id The document id of the document to delete
 * @returns The Result from executing the statement
 */
async function deleteLicenceRecordById(txn, id) {
  console.log('In deleteLicenceRecordById function');
  const query = 'DELETE FROM Licence AS b WHERE b.licenceId = ?';
  return txn.execute(query, id);
}

/**
 * Helper function to retrieve the current state of a licence record
 * @param id The document id of the document to retrieve
 * @returns The JSON document to return to the client
 */
const getLicence = async (licenceId, userId) => {
  console.log(`In getLicence function with licenceId ${licenceId} and userId ${userId}`);

  let licence;
  // Get a QLDB Driver instance
  const qldbDriver = new qldb.QldbDriver(process.env.LEDGER_NAME);
  await qldbDriver.executeLambda(async (txn) => {
    // Get the current record
    const result = await getLicenceRecordById(txn, licenceId, userId);
    const resultList = result.getResultList();

    if (resultList.length === 0) {
      throw new LicenceNotFoundError(400, 'Licence Not Found Error', `Licence record with licenceId ${licenceId} does not exist`);
    } else {
      licence = JSON.stringify(resultList[0]);
    }
  });
  return licence;
};


/**
 * Helper function to retrieve the current state of a licence record
 * @param id The document id of the document to retrieve
 * @returns The JSON document to return to the client
 */
const getLicenceSummary = async (userId) => {
  console.log(`In getLicenceSummary function with userId ${userId}`);

  let licence;
  // Get a QLDB Driver instance
  const qldbDriver = new qldb.QldbDriver(process.env.LEDGER_NAME);
  await qldbDriver.executeLambda(async (txn) => {
    // Get the current record
    const result = await txn.execute('SELECT licenceId, firstName, lastName, postcode FROM Licence WHERE userId = ?', userId);
    const resultList = result.getResultList();

    if (resultList.length === 0) {
      throw new LicenceNotFoundError(400, 'Licence Not Found Error', `No licence records found registered to userId ${userId}`);
    } else {
      licence = JSON.stringify(resultList);
    }
  });
  return licence;
};


/**
 * Helper function to retrieve the current state of a licence record
 * @param id The document id of the document to retrieve
 * @returns The JSON document to return to the client
 */
 const getContact = async (licenceId, userId) => {
  console.log(`In getContact function with licenceId ${licenceId} and userId ${userId}`);

  let licence;
  // Get a QLDB Driver instance
  const qldbDriver = new qldb.QldbDriver(process.env.LEDGER_NAME);
  await qldbDriver.executeLambda(async (txn) => {

    // Get the contact record
    const result = await txn.execute('SELECT * FROM Contact WHERE licenceId = ? AND userId = ?', licenceId, userId);
    const resultList = result.getResultList();

    if (resultList.length === 0) {
      throw new LicenceNotFoundError(400, 'Licence Not Found Error', `Licence record with licenceId ${licenceId} does not exist`);
    } else {
      licence = JSON.stringify(resultList[0]);
    }
  });
  return licence;
};



/**
 * Helper function to retrieve the current state of a licence record
 * @param id The document id of the document to retrieve
 * @returns The JSON document to return to the client
 */
 const getEndorsement = async (logger, licenceId) => {
  logger.debug(`In getEndorsement function with licenceId ${licenceId}`);

  let licence;
  // Get a QLDB Driver instance
  const qldbDriver = new qldb.QldbDriver(process.env.LEDGER_NAME);
  await qldbDriver.executeLambda(async (txn) => {
    // Get the current record
    const result = await txn.execute('SELECT * FROM Endorsement WHERE licenceId = ?', licenceId);  
    const resultList = result.getResultList();

    if (resultList.length === 0) {
      throw new LicenceNotFoundError(404, 'Endorsements Not Found Error', `No endorsements were found for record with licenceId ${licenceId}`);
    } else {
      licence = JSON.stringify(resultList);
    }
  });
  return licence;
};


/**
 * Helper function to retrieve the current state of a licence record
 * @param id The document id of the document to retrieve
 * @returns The JSON document to return to the client
 */
 const getEndorsementHistory = async (logger, licenceId) => {
  logger.debug(`In getEndorsementHistory function with licenceId ${licenceId}`);

  let responseRecord = [];
  // Get a QLDB Driver instance
  const qldbDriver = new qldb.QldbDriver(process.env.LEDGER_NAME);
  await qldbDriver.executeLambda(async (txn) => {
    // Get the current record
    const result = await txn.execute('SELECT endorsementId FROM Mapping WHERE licenceId = ?', licenceId);  
    const resultList = result.getResultList();

    if (resultList.length === 0) {
      throw new LicenceNotFoundError(400, 'Endorsements Not Found Error', `Endorsements for record with licenceId ${licenceId} does not exist`);
    } else {
      for (const endorsement of resultList) {
        let endorsementId = endorsement.get('endorsementId').stringValue();
        logger.debug(`In function with endorsementId ${endorsementId}`); 
        let endorsementResult = await txn.execute('SELECT * FROM history(Endorsement) WHERE metadata.id = ?', endorsementId);
        let endorsementArray = endorsementResult.getResultList();
        responseRecord.push(endorsementArray);
      };
    }
  });
  return JSON.stringify(responseRecord);
};


/**
 * Helper function to retrieve the current and historic states of a licence record
 * @param id The document id of the document to retrieve
 * @returns The JSON document to return to the client
 */
const getLicenceHistory = async (licenceId) => {
  console.log(`In getLicence function with licenceId ${licenceId}`);

  let licence;
  // Get a QLDB Driver instance
  const qldbDriver = new qldb.QldbDriver(process.env.LEDGER_NAME);
  await qldbDriver.executeLambda(async (txn) => {
    // Get the current record
    const result = await getLicenceRecordHistoryById(txn, licenceId);
    const licenceHistoryArray = result.getResultList();
    if (licenceHistoryArray.length === 0) {
      throw new LicenceNotFoundError(400, 'Licence Not Found Error', `Licence record with licenceId ${licenceId} does not exist`);
    } else {
      licence = JSON.stringify(licenceHistoryArray);
    }
  });
  return licence;
};


/**
 * Helper function to retrieve the current and historic states of a licence record
 * @param id The document id of the document to retrieve
 * @returns The JSON document to return to the client
 */
 const getContactHistory = async (logger, licenceId) => {
  logger.debug(`In getContactHistory function with licenceId ${licenceId}`);

  let licence;
  // Get a QLDB Driver instance
  const qldbDriver = new qldb.QldbDriver(process.env.LEDGER_NAME);
  await qldbDriver.executeLambda(async (txn) => {

    // get the contact ID from the licenceId
    const result = await txn.execute('SELECT contactId FROM Licence WHERE licenceId = ?', licenceId);
    const resultList = result.getResultList();
    logger.debug(`resultList is ${JSON.stringify(resultList)}`); 

    if (resultList.length === 0) {
      throw new LicenceNotFoundError(400, 'Licence Not Found Error', `Licence record with licenceId ${licenceId} does not exist`);
    } else {
      const contactId = resultList[0].get('contactId').stringValue();
      logger.debug(`In getContactHistory function with contactId ${contactId}`);
      const contactResult = await txn.execute('SELECT * FROM history(Contact) WHERE metadata.id = ?', contactId);
      const contactHistoryArray = contactResult.getResultList();
      licence = JSON.stringify(contactHistoryArray);
    }
  });
  return licence;
};

/**
 * Function to delete a licence record
 * @param id The document id of the document to delete
 * @returns The JSON response to return to the client
 */
const deleteLicence = async (id, userId) => {
  console.log(`In deleteLicence function with LicenceId ${id} and userId ${userId}`);

  let licence;
  // Get a QLDB Driver instance
  const qldbDriver = new qldb.QldbDriver(process.env.LEDGER_NAME);
  await qldbDriver.executeLambda(async (txn) => {
    // Get the current record
    const result = await getLicenceRecordById(txn, id, userId);
    const resultList = result.getResultList();

    if (resultList.length === 0) {
      throw new LicenceNotFoundError(400, 'Licence Not Found Error', `Licence record with LicenceId ${id} does not exist`);
    } else {
      await deleteLicenceRecordById(txn, id);
      licence = '{"response": "Licence record deleted"}';
    }
  });
  return licence;
};

/**
 * Function to delete a licence record
 * @param id The document id of the document to delete
 * @returns The JSON response to return to the client
 */
 const redactLicence = async (logger, licenceId, userId) => {
  logger.debug(`In redactLicence function with licenceId ${licenceId} and userId ${userId}`);

  let licence;
  let tableId;
  let sortedResponse;

  // Get a QLDB Driver instance
  const qldbDriver = new qldb.QldbDriver(process.env.LEDGER_NAME);
  await qldbDriver.executeLambda(async (txn) => {

    // logically delete the current record
    const deleteQuery = 'DELETE FROM Licence AS b WHERE b.licenceId = ?';
    const deleteResult = await txn.execute(deleteQuery, licenceId);
    const deleteResultList = deleteResult.getResultList();

    if (deleteResultList.length === 0) {
      throw new LicenceNotFoundError(400, 'Licence Not Found Error', `Licence record with LicenceId ${licenceId} does not exist`);
    } else {
      // Get the current record
      const historyQuery = 'SELECT * FROM history(Licence) WHERE metadata.id = ?';
      const historyResult = await txn.execute(historyQuery, licenceId);
      sortedResponse = historyResult.getResultList().sort(function (a, b) {
        return (
          new Date(b.metadata.txTime) -
          new Date(a.metadata.txTime)
        );
      });
      const tableResult = await getTableId(txn, 'Licence');
      const tableIdArray = tableResult.getResultList();
      tableId = tableIdArray[0].get('tableId').stringValue();
    }
  });
  
  for (const element of sortedResponse) {
    let blockAddress = element.blockAddress;
    logger.debug("DataHash: " + element.dataHash);

    await qldbDriver.executeLambda(async (txn) => {
      try {
        if (element.dataHash === null || element.dataHash === undefined) {
          let redactQuery = `EXEC redact_revision ?, '${tableId}', '${licenceId}'`;
          await txn.execute(redactQuery, blockAddress);
        } else {
          logger.debug("Revision already been redacted so skipping")
        }  
      } catch (error) {
        logger.debug("ERROR!!!!!: " + error);
      }  
    });
  }  
  licence = '{"response": "All inactive revisions of document now redacted"}';
  return licence;
};


/**
 * Function to delete a licence record
 * @param id The document id of the document to delete
 * @returns The JSON response to return to the client
 */
 const redactLicenceRevision = async (logger, licenceId, userId, version) => {
  logger.debug(`In redactLicenceRevision function with licenceId ${licenceId} and userId ${userId} and version ${version}`);

  let licence;
  let tableId;
  let sortedResponse;

  // Get a QLDB Driver instance
  const qldbDriver = new qldb.QldbDriver(process.env.LEDGER_NAME);
  await qldbDriver.executeLambda(async (txn) => {

    // retrieve revision from history function
    const historyQuery = 'SELECT * FROM history(Licence) WHERE metadata.id = ? AND metadata.version = ?';
    const historyResult = await txn.execute(historyQuery, licenceId, version);
    const historyResultList = historyResult.getResultList();

    if (historyResultList.length === 0) {
        throw new LicenceNotFoundError(400, 'Licence Not Found Error', `Licence record with LicenceId ${licenceId} and version ${version} does not exist`);
    } else {
      const tableResult = await getTableId(txn, 'Licence');
      const tableIdArray = tableResult.getResultList();
      tableId = tableIdArray[0].get('tableId').stringValue();

      const blockAddress = historyResultList[0].blockAddress;
      let redactQuery = `EXEC redact_revision ?, '${tableId}', '${licenceId}'`;
      await txn.execute(redactQuery, blockAddress);
      licence = '{"response": "Selected revision of document now redacted"}';
    }
  });
  await waitUntilRevisionRedacted(logger, `Licence`, licenceId, version);
  return licence;
};


const waitUntilRevisionRedacted = async (logger, tableName, licenceId, version) => {
  logger.debug(`In waitUntilRevisionRedacted function`);

  let isRedacted = false;
  const qldbDriver = new qldb.QldbDriver(process.env.LEDGER_NAME);

  while (!isRedacted) {
    await qldbDriver.executeLambda(async (txn) => {
      // retrieve revision from history function
      const revisionQuery = `SELECT * FROM history(${tableName}) WHERE metadata.id = ? AND metadata.version = ?`;
      const revisionResult = await txn.execute(revisionQuery, licenceId, version);
      const revisionResultList = revisionResult.getResultList();

      if (revisionResultList[0].get('dataHash') != null && revisionResultList[0].get('data') == null) {
        logger.debug(`Revision was successfully redacted!`);
        isRedacted = true;
      }
      if (!isRedacted) {
        logger.debug(`Revision is not yet redacted. Waiting for some time.`);
        await sleep(500);
      }
    });
  }
};


function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}



/**
 * Function to delete a licence record
 * @param id The document id of the document to delete
 * @returns The JSON response to return to the client
 */
 const deleteEndorsement = async (logger, endorsementId, licenceId) => {
  logger.debug(`In deleteEndorsement function with endorsementId ${endorsementId} and licenceId ${licenceId}`);

  let licence;
  // Get a QLDB Driver instance
  const qldbDriver = new qldb.QldbDriver(process.env.LEDGER_NAME);
  await qldbDriver.executeLambda(async (txn) => {
    // Get the current record
    const statement = 'DELETE FROM Endorsement WHERE endorsementId = ? AND licenceId = ?';
    const result = await txn.execute(statement, endorsementId, licenceId);
    const resultList = result.getResultList();

    if (resultList.length === 0) {
      throw new LicenceNotFoundError(400, 'Endorsement Not Found Error', `Endorsement record for LicenceId ${licenceId} does not exist`);
    } else {
      licence = '{"response": "Endorsement record deleted"}';
    }
  });
  return licence;
};


module.exports = {
  createContactAndLicence,
  updateLicenceStatus,
  updateContact,
  getLicence,
  getContact,
  getLicenceHistory,
  getLicenceSummary,
  updateLicenceAddress,
  deleteLicence,
  redactLicence,
  redactLicenceRevision,
  addEndorsement,
  getContactHistory,
  getEndorsement,
  getEndorsementHistory,
  deleteEndorsement
};
