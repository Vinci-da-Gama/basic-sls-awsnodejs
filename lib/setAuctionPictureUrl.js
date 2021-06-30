import dymdbCli from '../clients/dymdbCli';

export const setAuctionPictureUrl = async (id, picUrl) => {
  const params = {
    TableName: process.env.AUCTIONS_TABLE_NAME,
    Key: { id },
    UpdateExpression: 'set pictureUrl = :pictureUrl',
    ExpressionAttributeValues: {
      ':pictureUrl': picUrl
    },
    ReturnValues: 'ALL_NEW' // It is ReturnValues, not ReturnValue
  };
  const rz = await dymdbCli.update(params).promise();
  return rz.Attributes;
};
