const { openai } = require("../config/gpt");

exports.generateDeviceJson = async (deviceName) => {
    const completion = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
            {
                role: "system",
                content:
                    "You are an expert in electronics and household devices. Respond with a JSON string representing a single Device object in the following schema: {userId: String, name: String, type: String, location: String, capabilities: Array of String, specifications: String, detectedAt: Number, needsUpdate: Boolean}. Only provide the JSON string in your response. Do not include extra formatting like `json` or any explanations. and dont put \" for any of the strings just put quotes normally.",
            },
            {
                role: "user",
                content: `Please generate a JSON string for this Device name (this is the name field): ${deviceName}`,
            },
        ],
    });
    return completion.choices[0].message.content;
};