const { GoogleGenerativeAI } = require("@google/generative-ai");
const dotenv = require("dotenv");
dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_TOKEN);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

FORMAT_TO_FOLLOW = "In addition, please write out bulletpoints, one for the seller, buyer, relevent dates, the loaner, and price. Show ONLY HTML, no markdown (```), and html must be embedable, meaning no body/head tags. Do the same for the 'previous transaction', if there's enough data."

async function transactionHistorySummary(sum) {
  const prompt = `Given this JSON formatted transaction summary: \n \n ${sum} \n \n Provide a brief HTML summary of the transactions. ${FORMAT_TO_FOLLOW}`;

  const result = await model.generateContent(prompt);

  return result.response.text();
}

module.exports = { transactionHistorySummary };
