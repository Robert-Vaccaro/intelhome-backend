const { encrypt, decrypt } = require("./encrypt");
const { creditCards } = require('../schemas/cards');
const { users } = require('../schemas/user');
const { v4: uuidv4 } = require('uuid');

exports.saveCreditCard = async ({ userId, cardName, number, cvc2, expMonth, expYear, verified = false, defaultCard = false }) => {
    try {
        const cardData = {
            number: number,
            cvc2: cvc2,
            expMonth: expMonth.toString(),
            expYear: expYear.toString(),
        };
        const cardDataHex = Buffer.from(JSON.stringify(cardData)).toString('hex');
        const encryptedCardData = encrypt(cardDataHex);
        const id = uuidv4();

        const newCreditCard = new creditCards({
            userId,
            cardId: id,
            cardName: cardName !== "" ? cardName :"No Card Name",
            cardData: encryptedCardData,
            verified,
            default: defaultCard,
        });
        const savedCard = await newCreditCard.save();
        console.log("Credit card saved successfully");
        const updatedUser = await users.findOneAndUpdate(
            { userId },
            { $addToSet: { paymentMethods: savedCard.cardId } },
            { new: true }
        );
        console.log("Updated user with new payment method");
        await getCreditCardDetails(savedCard.cardId)
        return { "message": "Success" };
    } catch (error) {
        console.error("Error saving credit card or updating user:", error);
        throw error;
    }
};

const getCreditCardDetails = async (cardId) => {
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

        // Log the decrypted card data
        console.log("Decrypted Credit Card Data:", cardData);

        return cardData;
    } catch (error) {
        console.error("Error retrieving or decrypting credit card data:", error);
        throw error;
    }
};