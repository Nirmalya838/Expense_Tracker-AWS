const express = require('express');

const router = express.Router();
const purchaseControllers = require('../controllers/purchase');
const authentication = require('../middleware/auth');

router.get('/purchase/premiummembership',authentication.authenticated,purchaseControllers.purchasepremium);

router.post('/purchase/updatestatus',authentication.authenticated,purchaseControllers.updateOrder)

router.post('/purchase/updatefailure',authentication.authenticated,purchaseControllers.updateFailure)


module.exports=router;