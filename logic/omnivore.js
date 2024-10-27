const env = require('../config/env');
const axios = require('axios');

exports.makeAPICall = async (path, method = 'GET', params = {}, headers = {}) => {
    try {
        let config = {
            url: env.omnivoreAPIUrl + path,
            method: method,
            headers: {
                'Api-Key': env.omnivoreAPIKey,
                ...headers
            },
        };
        if (method === 'GET') {
            config.params = params;
          } else {
            config.data = params;
          }
        const response = await axios(config);
        // Return a dictionary with message and data
        return {
            message: 'Success',
            data: response.data
        };
    } catch (error) {
        let errorMessage = 'An error occurred';

        if (error.response) {
            // The request was made and the server responded with a status code
            errorMessage = `Error: ${error.response.data.message || error.message}`;
        } else if (error.request) {
            // The request was made but no response was received
            errorMessage = 'No response received from server';
        } else {
            // Some other error occurred in setting up the request
            errorMessage = `Axios Error: ${error.message}`;
        }

        // Return the error message in a dictionary
        return {
            message: errorMessage,
            data: null
        };
    }
}

exports.processPayment = async (locationId, ticketId, paymentPayload) => {
        const url = `https://api.omnivore.io/1.0/locations/${locationId}/tickets/${ticketId}/payments/`;

    try {
        const response = await axios.post(url, paymentPayload, {
            headers: {
                'Content-Type': 'application/json',
                'Api-Key': process.env.OMNIVORE_API_KEY  // Ensure your API key is set in the environment variables
            }
        });
        console.log(response.data)
        // Return the value of 'open' inside the '_embedded.ticket' from the response
        return response.data;
    } catch (error) {
        let paymentError = error?.response?.data?.errors[0]?.error || "Error processing payment"
        if (paymentError === "ticket_closed") {
            return paymentError;  // Return null if there's an error
        } else {
            throw paymentError
        }
    }
}