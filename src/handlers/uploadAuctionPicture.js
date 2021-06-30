import middy from '@middy/core';
import cors from '@middy/http-cors';
import httpErrorHandler from '@middy/http-error-handler';
import validator from '@middy/validator';
import createError from 'http-errors';

import { getAuctionById } from '../../lib/getAuctionById';
import uploadPictureToS3 from '../../lib/uploadPictureToS3';
import { setAuctionPictureUrl } from '../../lib/setAuctionPictureUrl';
import uploadAuctionPictureScheme from '../../schemas/uploadAuctionPicture';

const uploadAuctionPicture = async (event, context) => {
  const { id } = event.pathParameters;
  const { email } = event.requestContext.authorizer;
  const auction = await getAuctionById(id);

  // validate auction ownership
  if (auction.seller !== email) {
    throw new createError.Forbidden('You r not the seller for this auction...');
  }

  const base64 = event.body.replace(/^data:image\/\w+;base64,/, '');
  const buffer = Buffer.from(base64, 'base64');

  let updatedAuction;

  try {
    const picUrl = await uploadPictureToS3(`${auction.id}.jpg`, buffer);
    console.log('19 -- uploadToS3Rz.Location: ', picUrl);
    updatedAuction = await setAuctionPictureUrl(auction.id, picUrl);
  } catch (error) {
    console.error(error);
    throw new createError.InternalServerError(error);
  }

  return {
    statusCode: 200,
    body: JSON.stringify(updatedAuction)
  };
};

export const uploadAuctionPictureHandler = middy(uploadAuctionPicture)
  .use(httpErrorHandler())
  .use(cors())
  .use(validator({ inputSchema: uploadAuctionPictureScheme }));
