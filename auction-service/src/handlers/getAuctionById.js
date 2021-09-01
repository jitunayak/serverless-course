import AWS from "aws-sdk";
import createError from "http-errors";
import commonMiddleware from "../lib/commonMiddleware";

const dynamoDb = new AWS.DynamoDB.DocumentClient();

export async function getSingleAuctionById(id) {
  let auction;
  try {
    const result = await dynamoDb
      .get({
        TableName: process.env.AUCTION_TABLE_NAME,
        Key: { id },
      })
      .promise();
    auction = result.Item;
  } catch (err) {
    console.log(err);
    throw new createError.InternalServerError(err);
  }
  return auction;
}

async function getAuctionById(event, context) {
  let auctions = "";
  const { id } = event.pathParameters;

  auctions = await getSingleAuctionById(id);

  if (!auctions) {
    throw new createError.NotFound(`Auction with ID "${id}" not found`);
  }
  return {
    statusCode: 200,
    body: JSON.stringify(auctions),
  };
}

export const handler = commonMiddleware(getAuctionById);
