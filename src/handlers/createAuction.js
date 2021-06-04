async function createAuction(event, context) {
  const { title } = JSON.parse(event.body);
  const now = new Date().toISOString();

  const auction = {
    title,
    status: 'OPEN',
    createdAt: now
  };

  return {
    statusCode: 201,
    body: JSON.stringify(auction)
  };
}

export const createAuctionHandler = createAuction;
