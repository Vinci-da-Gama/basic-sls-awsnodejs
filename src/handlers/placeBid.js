import validator from '@middy/validator';
import createError from 'http-errors';

import dymdbCli from '../../clients/dymdbCli';
import commonMiddleware from '../../lib/commonMiddleware';
import { getAuctionById } from '../../lib/getAuctionById';
import placeBidSchema from '../../schemas/placeBid';

const placeBid = async (event, context) => {
  const { id } = event.pathParameters;
  const { amount } = event.body;
  const { email } = event.requestContext.authorizer;

	const targetAuction = await getAuctionById(id);

  // cannot bid ur self item
  if (email === targetAuction.seller) {
    throw new createError.Forbidden(`You cannot bid on your own auction item!`);
  }
  // avoid double bidding
  if (email === targetAuction.highestBid.bidder) {
    throw new createError.Forbidden(`You are already the highest bidder.`);
  }

  if (targetAuction.status !== 'OPEN') {
    throw new createError.Forbidden(`You cannot bid on a closed auctions!`);
  }
	if (amount <= targetAuction.highestBid.amount || amount <= 0) {
		throw new createError.Forbidden(`Your bid must be highter than ${targetAuction.highestBid.amount}!`);
	}

  const params = {
    TableName: process.env.AUCTIONS_TABLE_NAME,
    Key: { id },
    UpdateExpression: 'set highestBid.amount = :amount, highestBid.bidder = :bidder',
    ExpressionAttributeValues: {
			':amount': amount,
      ':bidder': email
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
