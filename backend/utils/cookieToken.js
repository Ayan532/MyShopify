
const cookieToken=async(user,statusCode,res)=>{
    const token= await user.getJwtToken();
    console.log(token);
   
    console.log(process.env.COOKIE_TIME_EXPIRE * 24 * 60 * 60 * 1000);
    const option={
        expires:new Date(
            Date.now()+process.env.COOKIE_TIME_EXPIRE * 24 * 60 * 60 * 1000
        ),
        httpOnly:true,
        
        
    }
    user.password=undefined
    res.status(statusCode).cookie('token1',token,option).json({
        success:true,
        token,
        user 
    })
}
module.exports=cookieToken;