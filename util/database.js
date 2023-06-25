const Sequelize = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize('expense',`${process.env.dbUser}`,`${process.env.dbPass}`,{
    dialect:'mysql',
    host:'localhost'
})

module.exports = sequelize;