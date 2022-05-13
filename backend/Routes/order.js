const express=require('express');
const { newOrder, allOrders, updateOrder, deleteOrder, getSingleOrder, myOrders } = require('../Controllers/orderController');
const { isAuthenticated, CustomRole } = require('../Middlewares/isAutheticated');
const router=express.Router();

router.route( '/new').post(isAuthenticated,newOrder)

router.route('/me').get(isAuthenticated, myOrders);
router.route('/:id').get(isAuthenticated, getSingleOrder);

router.route('/admin/orders').get(isAuthenticated, CustomRole('admin'), allOrders);
router.route('/admin/orders/:id')
    .put(isAuthenticated, CustomRole('admin'), updateOrder)
    .delete(isAuthenticated, CustomRole('admin'), deleteOrder);




module.exports=router;