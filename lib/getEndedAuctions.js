import dymdbCli from '../clients/dymdbCli';

export const getEndedAuctions = async() => {
  const now = new Date();
  const params = {
    TableName: process.env.AUCTIONS_TABLE_NAME,
    IndexName: 'statusAndEndDate',
    KeyConditionExpression: '#status = :status AND endingAt <= :now',
    ExpressionAttributeValues: {
      ':status': 'OPEN',
      ':now': now.toISOString()
    },
    ExpressionAttributeNames: {
      '#status': 'status'
    }
  };

	const rz = await dymdbCli['query'](params).promise();

	return rz.Items;
};
