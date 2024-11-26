const OpenAI = require("openai");
const env = require("./env");

const openai = new OpenAI({
    apiKey: env.openAiSecretKey,  // Replace with your actual OpenAI API key
});

module.exports = { openai }