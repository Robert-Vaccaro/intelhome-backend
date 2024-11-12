const { encrypt, decrypt } = require("./encrypt");
const { creditCards } = require('../schemas/cards');
const { users } = require('../schemas/user');
const { v4: uuidv4 } = require('uuid');

exports.saveCreditCard = async ({ userId, cardName, number, cvc2, expMonth, expYear, defaultCard, verified = false}) => {
    try {
        // Prepare card data for encryption
        const cardData = {
            number: number,
            cvc2: cvc2,
            expMonth: expMonth.toString(),
            expYear: expYear.toString(),
        };
        const cardDataHex = Buffer.from(JSON.stringify(cardData)).toString('hex');
        const encryptedCardData = encrypt(cardDataHex);
        const id = uuidv4();

        // Create a new credit card entry
        const newCreditCard = new creditCards({
            userId,
            cardId: id,
            cardName: cardName !== "" ? cardName : "No Card Name",
            cardData: encryptedCardData,
            verified,
            default: defaultCard,
        });

        // If the new card is marked as default, set all other cards' default to false
        if (defaultCard) {
            await creditCards.updateMany({ userId, default: true }, { $set: { default: false } });
        }

        // Save the new credit card
        const savedCard = await newCreditCard.save();
        console.log("Credit card saved successfully");

        // Update the user's paymentMethods array with the new card ID
        await users.findOneAndUpdate(
            { userId },
            { $addToSet: { paymentMethods: savedCard.cardId } },
            { new: true }
        );

        console.log("Updated user with new payment method");

        return { message: "Success" };
    } catch (error) {
        console.error("Error saving credit card or updating user:", error);
        throw error;
    }
};


exports.getCardDetails = async (cardId) => {
    try {
        // Retrieve the credit card document based on cardId
        const creditCard = await creditCards.findOne({ cardId });
        if (!creditCard) {
            throw new Error("Credit card not found");
        }

        // Decrypt the cardData
        const encryptedCardData = creditCard.cardData;
        const cardDataHex = decrypt(encryptedCardData);

        // Convert the hex back to a JSON string and parse it
        const cardDataJSON = Buffer.from(cardDataHex, 'hex').toString();
        const cardData = JSON.parse(cardDataJSON);
        return cardData;
    } catch (error) {
        console.error("Error retrieving or decrypting credit card data:", error);
        throw error;
    }
};