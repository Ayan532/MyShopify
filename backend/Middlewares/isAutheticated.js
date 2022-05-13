const jwt=require('jsonwebtoken');
const User = require('../Models/User');
const ErrorHandler = require('../utils/errorHandler');
const catchErrorAsync = require('./catchErrorAsync');
exports.isAuthenticated=catchErrorAsync(async(req,res,next)=>{

    const token=req.cookies.token1;
    console.log("MyCookie",req.cookies.token1);
    if(!token){
        return next(new ErrorHandler('Please Login First',401))
    }

    const decode=jwt.verify(token,process.env.JWT_SECRET)

    req.user=await User.findById(decode.id)
    next();
})

exports.CustomRole=(...roles)=>{

    return (req,res,next)=>{
        if(!(roles.includes(req.user.role))){
            return next(new ErrorHandler("You are not Authorized to access this resources",403))
        }
        next();
    }

}