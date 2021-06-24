import dymdbCli from '../clients/dymdbCli';

export const closeAuction = async(auction) => {
  const params = {
    TableName: process.env.AUCTIONS_TABLE_NAME,
    Key: { id: auction.id },
    UpdateExpression: 'set #status = :status',
    ExpressionAttributeValues: {
      ':status': 'CLOSED'
    },
    ExpressionAttributeNames: {
      '#status': 'status'
    }
  };

	const rz = await dymdbCli['update'](params).promise();

	return rz;
};
