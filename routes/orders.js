const router = require('express').Router();
const  { getLocationInfo, getLocations, openTicket, payTicket, getTickets, getLocationMenu } = require('../controllers/orders.js');
const authMiddleware = require('../middleware/auth.middleware.js');

router.post('/locations',  getLocations);
router.post('/location-info',  getLocationInfo);
router.post('/location-menu',  getLocationMenu);
router.get('/tickets',  getTickets);
router.post('/open-ticket',  openTicket);
router.post('/pay-ticket',  payTicket);
// console.log("getLocation:" , getLocations())
// console.log("getLocationInfo:" , getLocationInfo())

module.exports = router;