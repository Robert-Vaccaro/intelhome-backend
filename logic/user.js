const bcrypt = require('bcrypt');
const { db } = require('../config/database');
let env = require('../config/env');
const { decrypt, encrypt } = require('./encrypt');
const { v4: uuidv4 } = require('uuid');
const { users } = require('../schemas/user');
const mongoose = require('mongoose');

async function loginUser(email, password) {
    try {

        return user;
    } catch (err) {
        throw new Error('Login process failed');
    }
}


async function createUser(userData) {
    try {
        // Step 1: Check if the email already exists
        const existingUser = await users.findOne({ email_address: userData.email_address });
        if (existingUser) {
            // Instead of throwing, return an error object with status and message
            return { 
                error: true, 
                status: 409,  // Conflict status code
                message: "Email already exists. Please use a different email." 
            };
        }

        // Step 2: Hash password if not using an OAuth type (e.g., Google, Facebook)
        let hashedPassword = "";
        if (userData.type === "") {
            hashedPassword = await bcrypt.hash(userData.password, 10);
        }

        // Step 3: Create new user object
        const newUser = new users({
            userId: userData.userId !== "" ? userData.userId : uuidv4(),
            email_address: userData.email_address,
            password: hashedPassword,
            type: userData.type,
            firstName: userData.firstName || "",
            lastName: userData.lastName || "",
            profilePhoto: userData.profilePhoto || "",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            banned: userData.banned || "false",
            verified: false,
            emailVerification: "",
            DTString: new Date().toISOString(),
        });

        // Step 4: Save the new user to the database
        const savedUser = await newUser.save();

        // Return the created user
        return savedUser;
    } catch (error) {
        return { 
            error: true, 
            status: 500,  // Internal Server Error
            message: "Error creating user. Please try again later." 
        };
    }
}

module.exports = { loginUser, createUser };
