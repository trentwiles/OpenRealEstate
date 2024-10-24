const { GoogleGenerativeAI } = require("@google/generative-ai");
const dotenv = require("dotenv");
dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_TOKEN);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

FORMAT_TO_FOLLOW = ""

async function transactionHistorySummary(sum) {
  const prompt = `Given this JSON formatted transaction summary: \n \n ${sum} \n \n Provide a brief summary of the transactions. ${format}`;

  const result = await model.generateContent(prompt);

  return result.response.text();
}

module.exports = { transactionHistorySummary };
