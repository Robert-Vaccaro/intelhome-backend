const router = require('express').Router();
const  { getLocationInfo, getLocations, openTicket, payTicket, getTickets, getLocationMenu, getTicket, addItemsToTicket } = require('../controllers/orders.js');
const authMiddleware = require('../middleware/auth.middleware.js');

router.post('/locations',  getLocations);
router.post('/location-info',  getLocationInfo);
router.get('/location-menu',  getLocationMenu);
router.get('/tickets',  getTickets);
router.get('/ticket',  getTicket);
router.post('/add-items',  addItemsToTicket);
router.post('/open-ticket',  openTicket);
router.post('/pay-ticket',  payTicket);
// console.log("getLocation:" , getLocations())
// console.log("getLocationInfo:" , getLocationInfo())

module.exports = router;