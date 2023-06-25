const express = require('express');
const router = express.Router();
const authentication = require('../middleware/auth');
const expenseController = require('../controllers/expense');


router.get('/',expenseController.getHomePage);

router.post('/add-expense',authentication.authenticated,expenseController.postAddExpense);

router.get('/expenses/load-data', authentication.authenticated,expenseController.sendExpenses);

router.get('/download',authentication.authenticated,expenseController.download);
router.get('/show-downloadLink',authentication.authenticated,expenseController.downloadLinks)

router.delete('/delete-expense/:id',expenseController.deleteExpense);


module.exports=router;
