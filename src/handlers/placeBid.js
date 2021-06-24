import validator from '@middy/validator';
import createError from 'http-errors';

import dymdbCli from '../../clients/dymdbCli';
import commonMiddleware from '../../lib/commonMiddleware';
import { getAuctionById } from '../../lib/getAuctionById';
import placeBidSchema from '../../schemas/placeBid';

const placeBid = async (event, context) => {
  const { id } = event.pathParameters;
  const { amount } = event.body;

	const targetAuction = await getAuctionById(id);
  if (targetAuction.status !== 'OPEN') {
    throw new createError.Forbidden(`You cannot bid on a closed auctions!`);
  }
	if (amount <= targetAuction.highestBid.amount || amount <= 0) {
		throw new createError.Forbidden(`Your bid must be highter than ${targetAuction.highestBid.amount}!`);
	}

  const params = {
    TableName: process.env.AUCTIONS_TABLE_NAME,
    Key: { id },
    UpdateExpression: 'set highestBid.amount = :amount',
    ExpressionAttributeValues: {
			':amount': amount
    },
		ReturnValues: 'ALL_NEW'
  };

	let updatedAuction;

  try {
    const rz = await dymdbCli['update'](params).promise();
    updatedAuction = rz.Attributes;
  } catch (error) {
		console.error('26 -- error: ', error.stack, error.message);
    throw new createError.InternalServerError(error);
  }

  return {
    statusCode: 200,
    body: JSON.stringify(updatedAuction)
  };
};

export const placeBidHandler = commonMiddleware(placeBid)
  .use(validator({ inputSchema: placeBidSchema }));
