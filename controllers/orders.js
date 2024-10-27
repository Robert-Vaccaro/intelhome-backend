const { makeAPICall, processPayment } = require("../logic/omnivore");
const axios = require('axios');
const { users } = require('../schemas/user');
const { tickets } = require('../schemas/ticket');
const { createTicket } = require("../logic/user");

exports.test = async (req, res) => {
    try {
        return res.status(200).json({message: "Success"});
    } catch (err) {
        console.log(err)
        return res.status(500).json({ error: "Server Error" });
    }
};

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
        let locations = locationData.data._embedded.locations
        if (locations) {
            return res.status(200).json({ message: "Success", locations });
        }
        return res.status(200).json({ error: "No Locations", locations: null });
    } catch (error) {
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
        return res.status(500).json({ error: "Error getting location info" });

    }
}

exports.getLocationMenu = async (req, res) => {
    try {
        const { locationId } = req.body
        console.log("getLocationMenu ")
        let items = await makeAPICall(`/locations/${locationId}/menu/items`)
        // console.log("menu_categories: ",items.data._embedded.menu_items[0]._embedded.menu_categories)
        // console.log("option_sets: ",items.data._embedded.menu_items[0]._links.option_sets)
        // console.log("price_levels: ",items.data._embedded.menu_items[0]._embedded.price_levels)

        return res.status(200).json({ message: "Success", locationInfo });
    } catch (error) {
        return res.status(500).json({ error: "Error getting location info" });

    }
}

exports.getLocationMenu = async (req, res) => {
    try {
        const { locationId, ticketId, items} = req.body
        let addItemsResponse = await makeAPICall(`/locations/${locationId}/tickets/${ticketId}/items`, params=items)
        // console.log("addItemsResponse: ",addItemsResponse)

        return res.status(200).json({ message: "Success", locationInfo });
    } catch (error) {
        return res.status(500).json({ error: "Error getting location info" });

    }
}

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
                name: ticket.data.name, 
                guestCount: ticket.data.guest_count, 
                posId: ticket.data.pos_id, 
                discounts: ticket.data.totals.discounts, 
                totals: ticket.data.totals, 
                employeeId, 
                orderTypeId, 
                revenueCenterId,
                tableId,
                autoSend
            };
        
            let newTicket = await createTicket(userData);
            if (newTicket) {
                return res.status(201).json({ message: "Success" });
            }
        }
        

    } catch (err) {
        console.log(err)
        return res.status(500).json({ error: "Server Error" });
    }
};

exports.payTicket = async(req, res) => {
    try {
        const { userId, locationId, ticketId, amount, tip } = req.body
        console.log(tip)
        const user = await users.findOne({userId});

        if (!user) {
          return { user, error: "User does not exists" };
        }
        const ticket = await tickets.findOne({ticketId});

        if (!ticket) {
          return { ticket, error: "Ticket does not exists" };
        }
        const paymentPayload = {
            amount: amount, 
            card_info: {
                exp_month: 1,
                exp_year: 2025,
                cvc2: "123",
                number: "4111111111111111"
            },
            tip: tip,
            type: "card_not_present"
        };

        let payment = await processPayment(locationId, ticketId, paymentPayload)
        console.log("payment: ", payment?._embedded?.ticket);
        if (payment === "ticket_closed") {
            console.log("Ticket Already Closed")
            ticket.open = false
            ticket.openedAt = new Date().getTime()
            ticket.paid = true
            ticket.paidAt = new Date().getTime()
            await ticket.save()
            return res.status(409).json({ error: "Ticket already closed" });
        }
        let currTicket = payment?._embedded?.ticket 
        if (!currTicket) {
            console.log("Couldn't find current ticket")
            return res.status(409).json({ error: "Payment was not successful" });
        }
        if (currTicket.open === false) {
            console.log("Tip0: ", tip);
            console.log("Tip1: ", ticket.totals.tips);
            
            // Update the tips field and mark it as modified
            ticket.totals.tips = (ticket.totals.tips || 0) + tip;
            ticket.markModified('totals.tips');  // Mark the nested field as modified
            
            console.log("Tip2: ", ticket.totals.tips);
            
            // Update other fields
            ticket.open = false;
            ticket.openedAt = currTicket.openAt;
            ticket.paid = true;
            ticket.paidAt = new Date().getTime();
            
            // Save the ticket
            let results = await ticket.save();
            console.log("currTicket.open false: ", currTicket.open);
            
            return res.status(200).json({ message: "Payment successful" });
        } else {
            console.log("currTicket.open true: ", currTicket.open);
            return res.status(409).json({ message: "Payment was not successful" });
        }
    } catch (error) {
        console.log(error)
        const {ticketId} = req.body
        if (error === "ticket_closed"){
            const ticket = await tickets.findOne({ticketId});
            if (ticket) {
                ticket.open = false
                ticket.openedAt = new Date().getTime()
                ticket.paid = true
                ticket.paidAt = new Date().getTime()
                await ticket.save()
            }
        }
        return res.status(500).json({ error: "Server Error" });
    }
}

