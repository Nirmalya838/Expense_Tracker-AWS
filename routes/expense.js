const express = require('express');
const router = express.Router();
const authentication = require('../middleware/auth');
const expenseController = require('../controllers/expense');


router.get('/expense/',expenseController.getHomePage);

router.post('/expense/add-expense',authentication.authenticated,expenseController.postAddExpense);

router.get('/expense/expenses/load-data', authentication.authenticated,expenseController.sendExpenses);

router.get('/expense/download',authentication.authenticated,expenseController.download);
router.get('/expense/show-downloadLink',authentication.authenticated,expenseController.downloadLinks)

router.delete('/expense/delete-expense/:id',expenseController.deleteExpense);


module.exports=router;
