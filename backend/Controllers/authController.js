
const catchErrorAsync = require("../Middlewares/catchErrorAsync");
const User = require("../Models/User");
const ApiFeature = require("../utils/apiFeature");
const cookieToken = require("../utils/cookieToken");
const ErrorHandler = require("../utils/errorHandler");
const sendEmail = require("../utils/sendEmail");
const crypto=require('crypto')
const cloudinary=require('cloudinary');

exports.registerUser= catchErrorAsync(async(req,res,next)=>{
    const {name,email,password}=req.body;

    const result = await cloudinary.v2.uploader.upload(req.body.avatar, {
        folder: 'avatars',
        width: 150,
        crop: "scale"
    })

    if(!(name||email||password)){
          return next(new ErrorHandler("Please give the required feild",400))

    }

    const user=await User.create({
        name,
        email,
        password,
        avatar: {
            public_id: result.public_id,
            url: result.secure_url
        }
    })

    cookieToken(user,200,res);
})
exports.loginUser= catchErrorAsync(async(req,res,next)=>{
    const {email,password}=req.body;

    if(!email || !password){
        return next(new ErrorHandler('Please enter email & password', 400))

  }
  const user=await User.findOne({email:email}).select('+password')
  if(!user){
    return next(new ErrorHandler('Please Register First', 400))

  }
  const isPasswordMatched = await user.comparePassword(password);

  if (!isPasswordMatched) {
      return next(new ErrorHandler('Invalid Email or Password', 401));
  }
   
  cookieToken(user,200,res);


})

exports.logoutUser= catchErrorAsync(async(req,res,next)=>{
    res.clearCookie("token1")

      res.status(200).json({
        success: true,
        message: "Logut Successfully",
      });
    
})

exports.forgetPassword= catchErrorAsync(async(req,res,next)=>{

    const user=await User.findOne({email:req.body.email})
    if(!user){
        return next(new ErrorHandler('Please enter a valid email', 404))

    }

    const resetToken=user.getResetPasswordToken();

    await user.save({validateBeforeSave:false});

    const resetUrl=`${req.protocol}://${req.get('host')}/password/reset/${resetToken}`

    const message=`Your password reset token is as follow:\n\n${resetUrl}\n\nIf you have not requested this email, then ignore it.`

    try {
        await sendEmail({
            email: user.email,
            subject: "Shopify: Password reset email",
            message: message,
          });
      
          res.status(200).json({
            success: true,
            message: `Email Sent Successfully to ${req.body.email}`,
          });


        
    }catch(err){
        user.resetPasswordToken=undefined
        user.resetPasswordExpire=undefined

        await user.save({validateBeforeSave:false})

        return next(new ErrorHandler(err.message, 500))


        
    }
  
})

exports.resetPassword= catchErrorAsync(async(req,res,next)=>{

    const resetToken=crypto.createHash('sha256').update(req.params.token).digest('hex')

    const user = await User.findOne({
        resetPasswordToken: resetToken,
        resetPasswordExpire: { $gt: Date.now() }
      });

      if(!user){
        return next(new ErrorHandler('Reset Password Token is invalid or expired', 400))

      }
      console.log(req.body.password);
      console.log(req.body.confirmPassword);

      if (req.body.password !== req.body.confirmPassword) {
        return next(new ErrorHandler(`Password mismatched`,500));
      }

      user.password = req.body.password;

      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;

      await user.save({ validateBeforeSave: false });

        cookieToken(user,200,res);



})
exports.getLogInUserDetails = catchErrorAsync(async (req, res, next) => {
    const user = await User.findById(req.user.id);
  
    if (!user) {
      return next(new ErrorHandler(`Invalid User`), 500);
    }
  
    cookieToken(user,200,res);
  });

exports.updatePassword = catchErrorAsync(async (req, res, next) => {
    const user = await User.findById(req.user.id).select('+password');

    // Check previous user password
    const isMatched = await user.comparePassword(req.body.oldPassword)
    if (!isMatched) {
        return next(new ErrorHandler('Old password is incorrect',400));
    }

    user.password = req.body.password;
    await user.save();

    cookieToken(user, 200, res)

})



exports.allUsers = catchErrorAsync(async (req, res, next) => {
    const users = await User.find();

    res.status(200).json({
        success: true,
        users
    })
})


// Get user details   =>   /api/v1/admin/user/:id
exports.getUserDetails = catchErrorAsync(async (req, res, next) => {
    const user = await User.findById(req.params.id);

    if (!user) {
        return next(new ErrorHandler(`User does not found with id: ${req.params.id}`))
    }

    res.status(200).json({
        success: true,
        user
    })
})

exports.updateProfile = catchErrorAsync(async (req, res, next) => {
    const newUserData = {
        name: req.body.name,
        email: req.body.email
    }
    if (req.body.avatar !== '') {
        const user = await User.findById(req.user.id)

        const image_id = user.avatar.public_id;
        const res = await cloudinary.v2.uploader.destroy(image_id);

        const result = await cloudinary.v2.uploader.upload(req.body.avatar, {
            folder: 'avatars',
            width: 150,
            crop: "scale"
        })

        newUserData.avatar = {
            public_id: result.public_id,
            url: result.secure_url
        }
    }


    const user = await User.findByIdAndUpdate(req.user.id, newUserData, {
        new: true,
        runValidators: true,
        useFindAndModify: false
    })
    cookieToken(user, 200, res)

   
})
exports.updateUser = catchErrorAsync(async (req, res, next) => {
    const newUserData = {
        name: req.body.name,
        email: req.body.email,
        role: req.body.role
    }

    const user = await User.findByIdAndUpdate(req.params.id, newUserData, {
        new: true,
        runValidators: true,
        useFindAndModify: false
    })

    res.status(200).json({
        success: true
    })
})

// Delete user   =>   /api/v1/admin/user/:id
exports.deleteUser = catchErrorAsync(async (req, res, next) => {
    const user = await User.findById(req.params.id);

    if (!user) {
        return next(new ErrorHandler(`User does not found with id: ${req.params.id}`))
    }

    await user.remove();

    res.status(200).json({
        success: true,
    })
})