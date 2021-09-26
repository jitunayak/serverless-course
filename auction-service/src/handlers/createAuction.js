import { v4 as uuid } from "uuid";
import AWS from "aws-sdk";
import commonMiddleware from "../lib/commonMiddleware";
import createError from "http-errors";
import createAuctionschema from "../lib/schemas/createAuctionSchema";
import validator from "@middy/validator";

const dynamoDb = new AWS.DynamoDB.DocumentClient();

async function createAuction(event, context) {
  if (event.httpMethod !== "POST") {
    throw new createError.MethodNotAllowed(
      "Request can only be made through POST method!"
    );
  }
  const { title } = event.body;
  const now = new Date();
  const endDate = new Date();
  endDate.setHours(now.getHours() + 1);

  const { email } = event.requestContext.authorizer;

  const auction = {
    id: uuid(),
    title,
    status: "OPEN",
    createdAt: now.toISOString(),
    endingAt: endDate.toISOString(),
    highestBid: {
      amount: 0,
    },
    bidder: email,
  };

  try {
    await dynamoDb
      .put({
        TableName: process.env.AUCTION_TABLE_NAME,
        Item: auction,
      })
      .promise();
  } catch (err) {
    console.log(err);
    throw new createError.InternalServerError(err);
  }

  return {
    statusCode: 201,
    body: JSON.stringify(auction),
  };
}

export const handler = commonMiddleware(createAuction).use(
  validator({ inputSchema: createAuctionschema })
);
