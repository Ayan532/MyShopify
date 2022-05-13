const express=require('express');
const { loginUser,registerUser, logoutUser, forgetPassword, resetPassword, allUsers, getUserDetails, updateUser, deleteUser, updateProfile, updatePassword, getLogInUserDetails } = require('../Controllers/authController');
const { isAuthenticated, CustomRole } = require('../Middlewares/isAutheticated');
const router=express.Router();


router.route('/register').post(registerUser);
router.route('/login').post(loginUser);
router.route('/logout').get(logoutUser);
router.route('/password/forget').post(forgetPassword);
router.route('/password/reset/:token').put(resetPassword);


router.route('/me/update').put(isAuthenticated, updateProfile)
router.route('/me').get(isAuthenticated, getLogInUserDetails)
router.route('/password/update').put(isAuthenticated, updatePassword)

router.route('/admin/users').get(isAuthenticated, CustomRole('admin'), allUsers)
router.route('/admin/user/:id')
    .get(isAuthenticated, CustomRole('admin'), getUserDetails)
    .put(isAuthenticated, CustomRole('admin'), updateUser)
    .delete(isAuthenticated, CustomRole('admin'), deleteUser)


module.exports=router;