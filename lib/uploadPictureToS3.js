import s3Cli from '../clients/s3Cli';

export default async (Key, Body) => {
  const rz = await s3Cli.upload({
    Bucket: process.env.AUCTION_S3BUCKET_NAME,
    Key,
    Body,
    ContentEncoding: 'base64',
    ContentType: 'image/*'
  }).promise();

  return rz.Location;
};
