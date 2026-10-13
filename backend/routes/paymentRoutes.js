const express = require('express');
const { paymentOrder} = require('../controllers/paymentController');

const router = express.Router();

router.post('/order', paymentOrder);

module.exports = router;
