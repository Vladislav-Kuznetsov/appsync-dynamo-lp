const AWS = require('aws-sdk');
const docClient = new AWS.DynamoDB.DocumentClient();
import Comment from './Comment';

async function addComment(comment: Comment) {
  const params = {
    TableName: process.env.COMMENTS_TABLE,
    Item: comment
  }
  try {
    comment.created = new Date().getTime();
    let idPrefix = comment.userName;
    if (!comment.userName) {
      comment.userName = 'anonymous';
      idPrefix = (Math.random() + 1).toString(36).substring(7);
    }
    comment.id = `${idPrefix}-${comment.created}`;
    await docClient.put(params).promise();
    return comment;
  } catch (err) {
    console.log('DynamoDB error: ', err);
    return null;
  }
}

export default addComment;