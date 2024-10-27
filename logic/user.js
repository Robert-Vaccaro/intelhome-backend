const { v4: uuidv4 } = require('uuid');
const { users } = require('../schemas/user');
const { tickets } = require('../schemas/ticket');

const Roles = Object.freeze({
  USER: "user",
  ADMIN: "admin",
  SUPER: "super",
  OWNER: "owner",
  EMPLOYEE: "employee"
});

async function createUser(userData) {
  try {
    // Check if a user with the same phone or email already exists
    const user = await users.findOne({
      $or: [{ phone: userData.phone }, { email: userData.email }]
    });

    if (user) {
      // If a user with the same phone or email exists, return an error message
      return { user, error: "User exists" };
    }

    // Create a new user instance
    const newUser = new users({
      userId: uuidv4(),
      phone: userData.phone,
      email: userData.email,
      role: [Roles.USER], // Set the default role to "user"
      firstName: userData.firstName,
      lastName: userData.lastName,
      profilePhoto: "",
      banned: false,
      isLoggingIn: false,
      phoneVerification: false,
      phoneCode: "",
      emailVerification: false,
      emailCode: "",
      paymentMethods: [],
      DTString: userData.DTString || "",
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
          name, 
          guestCount, 
          posId, 
          discounts,
          totals, 
          employeeId, 
          orderTypeId, 
          revenueCenterId, 
          tableId,
          autoSend
        } = userData

    const newTicket = new tickets({
      ticketId,
      userId,
      name,
      locationId,
      locationName,
      guestCount,
      open: true,
      openedAt: new Date().getTime(),
      posId,
      discounts,
      totals,
      employeeId,
      orderTypeId,
      revenueCenterId,
      tableId,
      autoSend
    });

    let ticket = await newTicket.save();

    return { ticket };
  } catch (error) {
    console.error("Error creating user:", error);
    return { error: "Error creating user." };
  }
}

module.exports = { createUser, Roles, createTicket };  // Export the Roles enum too
