const accountSid = process.env.ACCOUNTSID;
const authToken = process.env.AUTHTOKEN;
const client = require("twilio")(accountSid, authToken);

const sendMessage = async ({
  productName,
  customerName,
  phoneNum,
  paymentMode,
  address,
  quantity,
  totalPrice,
}) => {
  try {
    const messageBody = `Product: ${productName}\nCustomer: ${customerName}\nPhone: ${phoneNum}\nPayment-Mode: ${paymentMode}\nAddress: ${address}\nQuantity: ${quantity}\nTotal-Price: ${totalPrice}\n`;

    const message = await client.messages.create({
      body: messageBody,
      from: process.env.TWILIO_NUM,
      to: process.env.ADMIN_NUM,
    });
    console.log("Message sent successfully. SID:", message.sid);
  } catch (error) {
    console.error("Error sending message:", error);
  }
};

module.exports = sendMessage;

