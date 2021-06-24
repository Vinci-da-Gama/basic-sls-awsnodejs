import createError from 'http-errors';
import validator from '@middy/validator';

import dymdbCli from '../../clients/dymdbCli';
import commonMiddleware from '../../lib/commonMiddleware';
import getAuctionsSchema from '../../schemas/getAuctions';

async function getAuctions(event, context) {
  const { status } = event.queryStringParameters;
  let auctions;
  const params = {
    TableName: process.env.AUCTIONS_TABLE_NAME,
    IndexName: 'statusAndEndDate',
    KeyConditionExpression: '#status = :status',
    ExpressionAttributeValues: {
      ':status': status
    },
    ExpressionAttributeNames: {
      '#status': 'status'
    }
  };

  try {
    // const rz = await dymdbCli.scan(params).promise();
    const rz = await dymdbCli.query(params).promise();

    auctions = rz.Items;
  } catch (error) {
		console.log('29 -- error: ', error.stack, error.message);
    throw new createError.InternalServerError(error);
  }

  return {
    statusCode: 200,
    body: JSON.stringify(auctions)
  };
}

export const getAuctionsHandler = commonMiddleware(getAuctions)
  .use(validator({ inputSchema: getAuctionsSchema, useDefaults: true }));
