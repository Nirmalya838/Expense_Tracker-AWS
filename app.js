const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();
const morgan = require('morgan');
app.use(express.json());
app.use(express.static(path.join(__dirname,"public")))


const sequelize = require('./util/database');
const userRouter = require('./routes/user');
const expenseRouter = require('./routes/expense');
const purchaseRouter = require('./routes/purchase');
const premiumRouter = require('./routes/premium');
const forgetPasswordRouter = require('./routes/forgetpassword');
const User = require('./models/user');
const Expense = require('./models/expense');
const Order = require('./models/order');
const ForgetPassword = require('./models/forgetpassword');
const FilesDownloaded=require('./models/filesdownloaded'); 

const accessLogStream = fs.createWriteStream(path.join(__dirname, 'access.log'), {flags: 'a'});

app.use(morgan('combined', {stream:accessLogStream}));

app.use('/user',userRouter);
app.use('/expense',expenseRouter);
app.use('/purchase',purchaseRouter);
app.use('/premium',premiumRouter);
app.use('/password',forgetPasswordRouter);

User.hasMany(Expense);
Expense.belongsTo(User);

User.hasMany(Order);
Order.belongsTo(User);

User.hasMany(ForgetPassword);
ForgetPassword.belongsTo(User);

User.hasMany(FilesDownloaded);
FilesDownloaded.belongsTo(User);

sequelize.sync()
.then(result=>{
    app.listen(process.env.PORT||3000, ()=> console.log('connected to Database'));
})
.catch(err=>{
    console.log(err);
})

