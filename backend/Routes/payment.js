const express = require('express')
const router = express.Router();

const {
    processPayment,
    sendStripApi
} = require('../Controllers/paymentController')

const { isAuthenticated } = require('../Middlewares/isAutheticated')

router.route('/process').post(isAuthenticated, processPayment);
router.route('/stripeapi').get(isAuthenticated, sendStripApi);

module.exports = router;