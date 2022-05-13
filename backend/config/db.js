const  mongoose  = require("mongoose");

const connectWithDb=()=>{
    mongoose.connect(process.env.MONG_URL,{
        useNewUrlParser:true,
        useUnifiedTopology:true
    })
    .then(con=>{console.log(`DB CONNECTED `)})
    .catch(error=>{
        console.log(`DB CONNECTIONS ISSUES`);
        console.log(error);
        process.exit(1);
    })

}
module.exports=connectWithDb;

