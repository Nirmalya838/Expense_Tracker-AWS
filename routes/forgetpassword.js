const express = require('express');

const router = express.Router();
const forgetPasswordControllers = require('../controllers/forgetpassword');

router.get('/password',forgetPasswordControllers.forgetPassword);
router.post('/password/forgetpassword',forgetPasswordControllers.postForgetPassword);

router.get('/password/resetpassword/:id',forgetPasswordControllers.getResetPassword);
router.get('/password/updatepassword/:id',forgetPasswordControllers.getUpdatePassword);

module.exports=router;