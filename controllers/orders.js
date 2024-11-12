const { makeAPICall, processPayment } = require("../logic/omnivore");
const axios = require('axios');
const { users } = require('../schemas/user');
const { tickets } = require('../schemas/ticket');
const { createTicket, getCurrentTime } = require("../logic/user");
const { saveCreditCard, getCardDetails } = require("../logic/creditCard");
var moment = require('moment-timezone');

exports.test = async (req, res) => {
    try {
        return res.status(200).json({message: "Success"});
    } catch (err) {
        console.log(err)
        return res.status(500).json({ error: "Server Error" });
    }
};

exports.getTicket = async (req, res) => {
    try {
        const { userId, ticketId, locationId } = req.query;
        let userTicket = await makeAPICall(`/locations/${locationId}/tickets/${ticketId}`, 'GET');
        userTicket = userTicket.data
        if (!userTicket) {
            return res.status(204).json({ message: "No Ticket Data" });
        }
        return res.status(200).json({ message: "Success", userTicket });
    } catch (error) {
        console.log(error)
        return res.status(500).json({ error: "Server Error" });
    }
}

exports.getTickets = async (req, res) => {
    try {
        const { userId } = req.query;
        const userTickets = await tickets.find({userId}).sort({ openedAt: -1 });;
        if (userTickets.length <= 0) {
            return res.status(204).json({ message: "No Tickets" });
        }
        return res.status(200).json({ message: "Success", userTickets });
    } catch (error) {
        console.log(error)
        return res.status(500).json({ error: "Server Error" });
    }
}



// exports.getTicketsPerLocation = async (req, res) => {
//     try {
//         const { userId } = req.query;
//         const userTickets = await tickets.find({userId});
//         if (userTickets.length <= 0) {
//             return res.status(204).json({ message: "No Tickets" });
//         }
//         return res.status(200).json({ message: "Success", userTickets });
//     } catch (error) {
//         console.log(error)
//         return res.status(500).json({ error: "Server Error" });
//     }
// }

exports.getLocations = async (req, res) => {
    try {
        const { latitude, longitude } = req.body; 
        let latLongParams;
        
        if (latitude && longitude) {
            latLongParams = {
                "latitude": latitude,
                "longitude": longitude
            };
        } else {
            latLongParams = {
                "latitude": 37.7749,
                "longitude": -122.4194
            };
        }

        let locationData = await makeAPICall(`/locations`, 'GET', latLongParams);
        // console.log("locations: ", locations.data._embedded.locations);
        let locations = locationData.data?._embedded?.locations
        if (locations) {
            return res.status(200).json({ message: "Success", locations });
        }
        return res.status(200).json({ error: "No Locations", locations: null });
    } catch (error) {
        console.log(error)
        return res.status(500).json({ error: "No Locations" });
    }
}



exports.getLocationInfo = async (req, res) => {
    try {
        const { locationId } = req.body

        let employees = await makeAPICall(`/locations/${locationId}/employees`)
        // console.log("employees: ",employees.data._embedded.employees)

        let order_types = await makeAPICall(`/locations/${locationId}/order_types`)
        // console.log("order_types: ",order_types.data._embedded.order_types)

        let revenue_center = await makeAPICall(`/locations/${locationId}/revenue_centers`)
        // console.log("revenue_center: ",revenue_center.data._embedded.revenue_centers)

        let tables = await makeAPICall(`/locations/${locationId}/tables`)
        // console.log("tables: ",tables.data._embedded.tables)
        let locationInfo = {
            employees:employees.data._embedded.employees, 
            order_types:order_types.data._embedded.order_types, 
            revenue_center:revenue_center.data._embedded.revenue_centers, 
            tables:tables.data._embedded.tables
        } 
        // console.log("locationInfo: ", locationInfo)
        return res.status(200).json({ message: "Success", locationInfo });
    } catch (error) {
        console.log(error)
        return res.status(500).json({ error: "Error getting location info" });

    }
}

exports.getLocationMenu = async (req, res) => {
    try {
        const { userId, locationId } = req.query
        let items = await makeAPICall(`/locations/${locationId}/menu/items`)
        // console.log("menu_categories: ",items.data._embedded.menu_items[0]._embedded.menu_categories)
        // console.log("option_sets: ",items.data._embedded.menu_items[0]._links.option_sets)
        // console.log("price_levels: ",items.data._embedded.menu_items[0]._embedded.price_levels)
        let menuItems = items.data._embedded.menu_items
        if (!menuItems) {
            return res.status(204).json({ message: "No Data", menuItems: [] });
        }
        return res.status(200).json({ message: "Success", menuItems });
    } catch (error) {
        console.log(error)
        return res.status(500).json({ error: "Error getting location info" });

    }
}

exports.addItemsToTicket = async (req, res) => {
    try {
        const { locationId, ticketId, items } = req.body;

        if (items && items.length > 0) {
            const newList = items.map(item => ({ menu_item: item }));

            let addItemsResponse = await makeAPICall(
                `/locations/${locationId}/tickets/${ticketId}/items`, 'POST',
                params = newList
            );

            return res.status(200).json({ message: "Success" });
        } else {
            return res.status(204).json({ message: "No items to add" });
        }
    } catch (error) {
        console.error("Error adding items to ticket:", error);
        return res.status(500).json({ error: "Server Error" });
    }
};


exports.openTicket = async (req, res) => {
    try {

        const { userId, locationId, locationName, ticketName, employeeId, orderTypeId, revenueCenterId, tableId, autoSend } = req.body
        const user = await users.findOne({userId});

        if (!user) {
          return { user, error: "User does not exists" };
        }

        let params = {
            "employee": employeeId,
            "order_type": orderTypeId,
            "revenue_center": revenueCenterId,
            "table": tableId,
            "guest_count": 1,
            "name": ticketName || "New Ticket",
            "auto_send": autoSend
        }
        let ticket = await makeAPICall(`/locations/${locationId}/tickets`, method = 'POST', params = params)
        // console.log("ticket made: ",ticket)
        if (ticket.data) {
            const userData = {
                userId: userId,
                ticketId: ticket.data.id, 
                locationId,
                locationName,
                ticketName: ticket.data.name
            };
        
            let newTicket = await createTicket(userData);
            if (newTicket) {
                return res.status(201).json({ message: "Success" });
            } else {
                return res.status(500).json({ error: "Ticket Creation Error"  });
            }
        }

    } catch (err) {
        console.log(err)
        return res.status(500).json({ error: "Server Error" });
    }
};

exports.payTicket = async(req, res) => {
    try {
        const { userId, cardId, locationId, ticketId, amount, tip } = req.body
        console.log(tip)
        const user = await users.findOne({userId});

        if (!user) {
          return { user, error: "User does not exists" };
        }
        const ticket = await tickets.findOne({ticketId});

        if (!ticket) {
          return { ticket, error: "Ticket does not exists" };
        }
        const cardDetails = await getCardDetails(cardId)
        const paymentPayload = {
            amount: amount, 
            card_info: {
                exp_month: parseInt(cardDetails.expMonth),
                exp_year: parseInt(cardDetails.expYear),
                cvc2: cardDetails.cvc2,
                number: cardDetails.number
            },
            tip: tip,
            type: "card_not_present"
        };

        let payment = await processPayment(locationId, ticketId, paymentPayload)
        // console.log("payment: ", payment?._embedded?.ticket);
        if (payment === "ticket_closed") {
            ticket.open = false
            ticket.openedAt = getCurrentTime()

            await ticket.save()
            console.log("Ticket Already Closed")
            return res.status(204).json({ error: "Ticket already closed" });
        }
        let currTicket = payment?._embedded?.ticket 
        if (!currTicket) {
            console.log("Couldn't find current ticket")
            return res.status(409).json({ error: "Payment was not successful" });
        }
        if (currTicket.open === false) {
            ticket.open = false;
            ticket.openedAt = currTicket.openAt;
            
            let results = await ticket.save();            
            return res.status(200).json({ message: "Payment successful" });
        } else {
            console.log("currTicket.open true: ", currTicket.open);
            return res.status(204).json({ message: "Payment was not successful" });
        }
    } catch (error) {
        console.log(error)
        const {ticketId} = req.body
        if (error === "ticket_closed"){
            const ticket = await tickets.findOne({ticketId});
            if (ticket) {
                ticket.open = false
                ticket.openedAt = getCurrentTime()
                await ticket.save()
            }
        }
        return res.status(500).json({ error: "Server Error" });
    }
}
