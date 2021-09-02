const AWS = require('aws-sdk');
const docClient = new AWS.DynamoDB.DocumentClient();

async function listComments() {
  const params = {
    TableName: process.env.COMMENTS_TABLE,
  }
  try {
    const data = await docClient.scan(params).promise();
    // intentionally fetch only last page
    return data.Items
  } catch (err) {
    console.log('DynamoDB error: ', err)
    return null
  }
}

export default listComments;