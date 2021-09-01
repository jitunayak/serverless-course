import { getEndedAuctions } from "../lib/getEndedAuctions";
import { closeAuction } from "../lib/closeAuction";
import createError from "http-errors";

async function processAuction(event, context) {
  console.log("process auction!");
  try {
    const auctionsToClose = await getEndedAuctions();
    const closePromise = auctionsToClose.map((auction) =>
      closeAuction(auction)
    );
    await Promise.all(closePromise);
    return { closed: closePromise.length };
  } catch (error) {
    console.error(error.message);
    throw new createError.InternalServerError(error.message);
  }
}

export const handler = processAuction;
