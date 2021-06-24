import AWS from 'aws-sdk';

const dymDbCli = new AWS.DynamoDB.DocumentClient();

export default dymDbCli;
