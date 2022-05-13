const express=require('express');
const dotenv=require('dotenv');
const cookieParser=require('cookie-parser')
const cors = require('cors')
const fileUpload = require("express-fileupload");
const bodyParser=require('body-parser')
const  ErrorMiddleware  = require('./Middlewares/error');
const path = require('path')
const app=express();



//MiddleWares

app.use(express.json());
app.use(bodyParser.urlencoded({extended: true}));
// app.use(cors({
//     origin: 'http://localhost:3000',
//     credentials: true,
//     methods: ['GET','POST','PUT','DELETE']
// }));
app.use(cors())


app.use(cookieParser());

app.use(fileUpload());

if (process.env.NODE_ENV !== 'PRODUCTION') require('dotenv').config({ path: 'backend/config/config.env' })

//Routes
const products=require('./Routes/product')
const auth=require('./Routes/auth')
const order=require('./Routes/order')
const payment=require('./Routes/payment')

app.use('/api/v1/products',products)
app.use('/api/v1/auth',auth)
app.use('/api/v1/order',order)
app.use('/api/v1/payment',payment)


if (process.env.NODE_ENV === 'PRODUCTION') {
    app.use(express.static(path.join(__dirname, '../client/build')))

    app.get('*', (req, res) => {
        res.sendFile(path.resolve(__dirname, '../client/build/index.html'))
    })
}





//
app.use(ErrorMiddleware);

module.exports=app;