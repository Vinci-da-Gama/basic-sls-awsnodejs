import { v4 as uuidv4 } from 'uuid';
import validator from '@middy/validator';
import createError from 'http-errors';

import dymDbCli from '../../clients/dymdbCli';
import commonMiddleware from '../../lib/commonMiddleware';
import createAuctionSchema from '../../schemas/createAuction';

async function createAuction(event, context) {
  const { title } = event.body;
  const { email: seller } = event.requestContext.authorizer;
  const now = new Date();
  const endDate = new Date();
  endDate.setHours(now.getHours() + 1);

  const auction = {
    id: uuidv4(),
    title,
    status: 'OPEN',
    createdAt: now.toISOString(),
    endingAt: endDate.toISOString(),
    highestBid: {
      amount: 0
    },
    seller
  };

  try {
    await dymDbCli.put({
      TableName: process.env.AUCTIONS_TABLE_NAME ? process.env.AUCTIONS_TABLE_NAME : 'AuctionsTable',
      Item: auction
    }).promise();
  } catch (error) {
    console.error('24 -- error: ', error.stack, error.message);
    throw new createError.InternalServerError(error);
  }

  return {
    statusCode: 201, // 201 means the data is made by the developer
    body: JSON.stringify(auction)
  };
}

export const createAuctionHandler = commonMiddleware(createAuction)
  .use(validator({ inputSchema: createAuctionSchema }));
