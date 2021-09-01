import AWS from "aws-sdk";
import createError from "http-errors";
import commonMiddleware from "../lib/commonMiddleware";
import validator from "@middy/validator";
import getAuctionsSchema from "../lib/schemas/getAuctionsSchema";
const dynamoDb = new AWS.DynamoDB.DocumentClient();

async function getAuction(event, context) {
  const { status } = event.queryStringParameters;
  let auctions = "";

  try {
    const params = {
      TableName: process.env.AUCTION_TABLE_NAME,
      IndexName: "statusAndEndDate",
      KeyConditionExpression: "#status=:status",
      ExpressionAttributeValues: {
        ":status": status,
      },
      ExpressionAttributeNames: {
        "#status": "status",
      },
    };
    const result = await dynamoDb.query(params).promise();
    auctions = result.Items;
  } catch (err) {
    console.log(err);
    throw new createError.InternalServerError(err);
  }

  return {
    statusCode: 200,
    body: JSON.stringify(auctions),
  };
}

export const handler = commonMiddleware(getAuction).use(
  validator({
    inputSchema: getAuctionsSchema,
    ajvOptions: {
      useDefaults: true,
      strict: false,
    },
  })
);
