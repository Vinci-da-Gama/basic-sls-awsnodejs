import createError from 'http-errors';

import dymdbCli from '../clients/dymdbCli';

export const getAuctionById = async(id) => {
	let auction;
	try {
    const rz = await dymdbCli['get']({
      TableName: process.env.AUCTIONS_TABLE_NAME,
      Key: { id }
    }).promise();
    auction = rz.Item;
  } catch (error) {
    console.error('14 -- error: ', error.stack, error.message);
    throw new createError.InternalServerError(error);
  }

  if (!auction) {
      throw new createError.NotFound(`Auction with id "${id}" is not found!`);
  }
	return auction;
};
