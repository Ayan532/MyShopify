const express=require('express');
const { getProduct, createProduct, getAllProduct, getSingleProduct, updateProduct, deleteProduct, createProductReview, deleteReview, getProductReviews, getAdminProducts } = require('../Controllers/productController');
const { isAuthenticated,CustomRole } = require('../Middlewares/isAutheticated');
const router=express.Router();


//router.route('/:id').get(getProduct)
router.route('/').get( getAllProduct)
router.route('/admin/products').get(isAuthenticated ,CustomRole('admin'),getAdminProducts);

router.route('/admin/product/new').post(isAuthenticated,CustomRole('admin'),createProduct)
router.route('/admin/product/:id')
      .put(isAuthenticated ,CustomRole('admin'),updateProduct)
      .delete(isAuthenticated ,CustomRole('admin'),deleteProduct)
router.route('/:id').get(getSingleProduct)


//Reviews Route
router.route('/review').put(isAuthenticated, createProductReview)
router.route('/review/:id').get(isAuthenticated,getProductReviews)
router.route('/reviews').delete(isAuthenticated, deleteReview)
      
module.exports=router;