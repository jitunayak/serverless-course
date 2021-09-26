import AWS from "aws-sdk";
const ses = new AWS.SES({ region: "ap-south-1" });

async function sendEmail(event, context) {
  const record = event.Records[0];
  console.log("record processing", record);

  const email = JSON.parse(record.body);
  const { subject, body, recipient } = email;

  const params = {
    Source: "jitunayak715@gmail.com",
    Destination: {
      ToAddresses: [recipient],
    },
    Message: {
      Body: {
        Text: {
          Data: body,
        },
      },
      Subject: {
        Data: subject,
      },
    },
  };

  try {
    const result = await ses.sendEmail(params).promise();
    console.log(result);
  } catch (error) {
    console.error(error);
  }
}

export const handler = sendEmail;
