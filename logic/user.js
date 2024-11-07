const { v4: uuidv4 } = require('uuid');
const { users } = require('../schemas/user');
const { tickets } = require('../schemas/ticket');
const moment = require('moment-timezone');

const Roles = Object.freeze({
  USER: "user",
  ADMIN: "admin",
  SUPER: "super",
  OWNER: "owner",
  EMPLOYEE: "employee"
});

async function createUser(phone) {
  try {
    // Check if a user with the same phone or email already exists
    const user = await users.findOne({
      $or: [{ phone: phone }]
    });

    if (user) {
      // If a user with the same phone or email exists, return an error message
      return { user, error: "User exists" };
    }

    // Create a new user instance
    const newUser = new users({
      userId: uuidv4(),
      phone: phone,
      email: "",
      role: [Roles.USER], // Set the default role to "user"
      firstName: "",
      lastName: "",
      profilePhoto: "",
      banned: false,
      isLoggingIn: false,
      phoneVerification: false,
      phoneCode: "",
      emailVerification: false,
      emailCode: "",
      paymentMethods: [],
      DTString: "",
    });

    // Save the new user to the database
    await newUser.save();

    // Return the created user
    return { user: newUser };
  } catch (error) {
    console.error("Error creating user:", error);
    return { error: "Error creating user." };
  }
}

async function createTicket(userData) {
  try {
    const {
          userId, 
          ticketId,
          locationId,
          locationName,
        } = userData

    const newTicket = new tickets({
      ticketId,
      userId,
      locationId,
      locationName,
    });

    let ticket = await newTicket.save();

    return { ticket };
  } catch (error) {
    console.error("Error creating user:", error);
    return { error: "Error creating user." };
  }
}

function getCurrentTime() {
  return moment(moment().tz(moment.tz.guess())).unix();
}

module.exports = { createUser, Roles, createTicket, getCurrentTime };  // Export the Roles enum too
