import dymdbCli from '../clients/dymdbCli';
import sqsCli from '../clients/sqsCli';

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

	await dymdbCli['update'](params).promise();

  const { title, seller, highestBid } = auction;
  const { amount, bidder } = highestBid;
  if (amount <= 0) {
    await sqsCli.sendMessage({
      QueueUrl: process.env.EMAIL_QUEUE_URL,
      MessageBody: JSON.stringify({
        subject: 'No bids on ur auction item :(',
        recipient: seller,
        body: `Oh no; ur item ${title} didn't get any bid. Better luke next time!`
      })
    }).promise();
    return;
  }

  const notifySeller = sqsCli.sendMessage({
    QueueUrl: process.env.EMAIL_QUEUE_URL,
    MessageBody: JSON.stringify({
      subject: 'Your Item has been sold!',
      recipient: seller,
      body: `Woohoo! Your item "${title}" has been sold for $${amount}.`
    })
  }).promise();
  const notifyBidder = sqsCli.sendMessage({
    QueueUrl: process.env.EMAIL_QUEUE_URL,
    MessageBody: JSON.stringify({
      subject: 'You won an auction!',
      recipient: bidder,
      body: `What a great deal! You got urself a ${title} for $${amount}.`
    })
  }).promise();

  return Promise.allSettled([notifySeller, notifyBidder]);
};
