const express = require('express');

const router = express.Router();
const userControllers = require('../controllers/user');

router.get('/user/',userControllers.getHomePage);

router.get('/user/login',userControllers.getloginPage);

router.post('/user/sign-up',userControllers.postAddUser);


router.post('/user/login/login-user',userControllers.postCheckUser)


module.exports=router;