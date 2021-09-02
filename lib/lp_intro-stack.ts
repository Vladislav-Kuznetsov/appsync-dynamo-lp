import * as cdk from '@aws-cdk/core';
import { AttributeType, BillingMode, Table } from '@aws-cdk/aws-dynamodb';
import * as appsync from '@aws-cdk/aws-appsync';
import * as lambda from '@aws-cdk/aws-lambda';

export class LpIntroStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);
    const prefix = 'vkuz-lp';
    let table = new Table(this, `${prefix}comments`, {
      billingMode: BillingMode.PAY_PER_REQUEST,
      partitionKey: {name:'created', type: AttributeType.NUMBER},
      sortKey: {name:'userName', type: AttributeType.STRING},
    });

    // Creates the AppSync API
    const api = new appsync.GraphqlApi(this, 'Api', {
      name: 'cdk-comments-appsync-api',
      schema: appsync.Schema.fromAsset('lib/graphql/schema.graphql'),
      authorizationConfig: {
        defaultAuthorization: {
          authorizationType: appsync.AuthorizationType.API_KEY,
          apiKeyConfig: {
            expires: cdk.Expiration.after(cdk.Duration.days(365))
          }
        },
      },
      xrayEnabled: true,
    });

    // Prints out the AppSync GraphQL endpoint to the terminal
    new cdk.CfnOutput(this, "GraphQLAPIURL", {
      value: api.graphqlUrl
    });

    // Prints out the AppSync GraphQL API key to the terminal
    new cdk.CfnOutput(this, "GraphQLAPIKey", {
      value: api.apiKey || ''
    });

    // Prints out the stack region to the terminal
    new cdk.CfnOutput(this, "Stack Region", {
      value: this.region
    });


    // lib/appsync-cdk-app-stack.ts
    const commentsLambda = new lambda.Function(this, 'AppSyncCommentsHandler', {
      runtime: lambda.Runtime.NODEJS_12_X,
      handler: 'main.handler',
      code: lambda.Code.fromAsset('lib/lambda-fns'),
      memorySize: 1024
    });

    // enable the Lambda function to access the DynamoDB table (using IAM)
    table.grantFullAccess(commentsLambda)

    // Create an environment variable that we will use in the function code
    commentsLambda.addEnvironment('COMMENTS_TABLE', table.tableName);

    // Set the new Lambda function as a data source for the AppSync API
    const lambdaDs = api.addLambdaDataSource('lambdaDatasource', commentsLambda);

    lambdaDs.createResolver({
      typeName: "Query",
      fieldName: "listComments"
    });

    lambdaDs.createResolver({
      typeName: "Mutation",
      fieldName: "addComment"
    });

    lambdaDs.createResolver({
      typeName: "Mutation",
      fieldName: "deleteComment"
    });

  }

}
