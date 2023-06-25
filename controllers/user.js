const User = require('../models/user');
const path = require('path');
const  bcrypt =  require('bcrypt');
const jwt = require('jsonwebtoken');

exports.getHomePage = (req, res, next) => {
  res.sendFile(path.join(__dirname, '../views/signup.html'));
};

exports.getloginPage = (req,res,next)=>{
    res.sendFile(path.join(__dirname,'../views/login.html'));
}

exports.postAddUser = async(req,res,next)=>{
    const name = req.body.name;
    const email=req.body.email;
    const password = req.body.password;

    try{
        const saltRounds=10;
        bcrypt.hash(password,saltRounds,async(err,hash)=>{
            const result = await User.create({name:name,email:email,password:hash,totalamount:0});
            res.status(201).json({newSignUp:result});
        })
    }
    catch(err){
        console.log(err);
    }
}

function generateAccessToken(id,ispremuimuser){
   return jwt.sign({userId:id,ispremuimuser:ispremuimuser},'secretKey');
}


exports.postCheckUser = async(req,res,next)=>{
    const email=req.body.email;
    const password = req.body.password;

    try{
        const user = await User.findAll({where:{email:email}});
        if(user.length>0){
            bcrypt.compare(password,user[0].password,async(err,result)=>{
                if(err){
                    res.status(400).json({message:"Something is wrong"});
                }

                if(result==true){
                    res.status(200).json({message:"successfully login",token:generateAccessToken(user[0].id,user[0].ispremuimuser)});
                }
                else{
                    return res.status(400).json({message:"password is wrong"});
                }
            })
        }
        else{
            return res.status(400).json({message:"user does not exist"})
        }
    }
    catch(err){
        console.log(err);
    }
}

