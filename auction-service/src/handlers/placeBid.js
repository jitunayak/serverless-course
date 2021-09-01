import AWS from "aws-sdk";
import createError from "http-errors";
import commonMiddleware from "../lib/commonMiddleware";
import { getSingleAuctionById } from "./getAuctionById";

const dynamoDb = new AWS.DynamoDB.DocumentClient();

async function placeBid(event, context) {
  const { id } = event.pathParameters;
  const { amount } = event.body;

  const originalamount = await getSingleAuctionById(id);
  if (originalamount.status == "CLOSED") {
    throw new createError.Forbidden("Auction is closed :(");
  }
  if (originalamount.highestBid.amount >= amount) {
    throw new createError.Forbidden(
      `Your bid must be higher than ${originalamount.highestBid.amount}!`
    );
  }

  const params = {
    TableName: process.env.AUCTION_TABLE_NAME,
    Key: { id },
    UpdateExpression: "set highestBid.amount=:amount",
    ExpressionAttributeValues: {
      ":amount": amount,
    },
    ReturnValues: "ALL_NEW",
  };

  let updatedAuction;

  try {
    const result = await dynamoDb.update(params).promise();
    updatedAuction = result.Attributes;
  } catch (err) {
    console.log(err);
    throw new createError.InternalServerError(err);
  }

  return {
    statusCode: 200,
    body: JSON.stringify(updatedAuction),
  };
}

export const handler = commonMiddleware(placeBid);
