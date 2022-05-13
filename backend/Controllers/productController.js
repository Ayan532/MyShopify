const catchErrorAsync = require("../Middlewares/catchErrorAsync");
const Product = require("../Models/Product");
const ApiFeature = require("../utils/apiFeature");
const cloudinary=require('cloudinary');
const mongoose=require('mongoose');
exports.createProduct= catchErrorAsync(async(req,res,next)=>{

    let images = []
    if (typeof req.body.images === 'string') {
        images.push(req.body.images)
    } else {
        images = req.body.images
    }

    let imagesLinks = [];

    for (let i = 0; i < images.length; i++) {
        const result = await cloudinary.v2.uploader.upload(images[i], {
            folder: 'products'
        });

        imagesLinks.push({
            public_id: result.public_id,
            url: result.secure_url
        })
    }

    req.body.images = imagesLinks
    req.body.user = req.user.id;
    const product=await Product.create(req.body);

    res.status(201).json({
        success:true,
        product
    })
})

exports.getAllProduct=catchErrorAsync(async(req,res,next)=>{
    let resPerPage=8;

    const productsCount=await Product.countDocuments(); 
    

    const apifeature=new ApiFeature(Product.find(),req.query).search().filter()
  

    let products=await apifeature.query
    let filteredProductsCount = products.length;

    apifeature.pagination(resPerPage)
    products = await apifeature.query.clone();




    res.status(200).json({
        success:true,
        productsCount,
        resPerPage,
        filteredProductsCount,
        products
    })

})

exports.getSingleProduct=catchErrorAsync(async(req,res,next)=>{

    const product=await Product.findById(req.params.id);

    if(!product){
        res.status(404).json({
            success:false,
            message:"Product not avaliable"
        })

    }


    res.status(200).json({
        success:true,
       product
    })

})

exports.updateProduct= catchErrorAsync(async(req,res,next)=>{
    
    let product=await Product.findById(req.params.id);
    
        if(!product){
            return next(new ErrorHandler("Product Not Found", 404))

    }
    let images = []
    if (typeof req.body.images === 'string') {
        images.push(req.body.images)
    } else {
        images = req.body.images
    }
    if (images !== undefined) {

        // Deleting images associated with the product
        for (let i = 0; i < product.images.length; i++) {
            const result = await cloudinary.v2.uploader.destroy(product.images[i].public_id)
        }


        let imagesLinks = [];

        for (let i = 0; i < images.length; i++) {
            const result = await cloudinary.v2.uploader.upload(images[i], {
                folder: 'products'
            });

            imagesLinks.push({
                public_id: result.public_id,
                url: result.secure_url
            })
        }
        req.body.images = imagesLinks
    }


    product = await Product.findByIdAndUpdate(req.params.id,req.body,{
        new:true,
        runValidators:true,
        useFindAndModify:false
    })


    res.status(200).json({
        success:true,
       product
    })

})
exports.deleteProduct= catchErrorAsync(async(req,res,next)=>{
    
    let product=await Product.findById(req.params.id);

    if(!product){

        return next(new ErrorHandler("Product Not Found", 404))
       

    }
    await product.remove();


    res.status(200).json({
        success:true
    })

})

// Get all products (Admin)  =>   /api/v1/admin/products
exports.getAdminProducts = catchErrorAsync(async (req, res, next) => {

    const products = await Product.find();

    res.status(200).json({
        success: true,
        products
    })

})

//Reviews
exports.createProductReview = catchErrorAsync(async (req, res, next) => {

    const { rating, comment, productId } = req.body;

    const review = {
        user: req.user._id,
        name: req.user.name,
        rating: Number(rating),
        comment
    }

    const product = await Product.findById(productId);

    const isReviewed = product.reviews.find(
        r => r.user.toString() === req.user._id.toString()
    )

    if (isReviewed) {
        product.reviews.forEach(review => {
            if (review.user.toString() === req.user._id.toString()) {
                review.comment = comment;
                review.rating = rating;
            }
        })

    } else {
        product.reviews.push(review);
        product.numOfReviews = product.reviews.length
    }

    product.ratings = product.reviews.reduce((acc, item) => item.rating + acc, 0) / product.reviews.length

    await product.save({ validateBeforeSave: false });

    res.status(200).json({
        success: true
    })

})

exports.getProductReviews = catchErrorAsync(async (req, res, next) => {

    const product = await Product.findById(req.params.id);

    res.status(200).json({
        success: true,
        reviews: product.reviews
    })
})

exports.deleteReview = catchErrorAsync(async (req, res, next) => {

    const product = await Product.findById(req.query.productId);

    console.log(product);

    const reviews = product.reviews.filter(review => review._id.toString() !== req.query.id.toString());

    const numOfReviews = reviews.length;

    const ratings = product.reviews.reduce((acc, item) => item.rating + acc, 0) / reviews.length

    await Product.findByIdAndUpdate(req.query.productId, {
        reviews,
        ratings,
        numOfReviews
    }, {
        new: true,
        runValidators: true,
        useFindAndModify: false
    })

    res.status(200).json({
        success: true
    })
})
