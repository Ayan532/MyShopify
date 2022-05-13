class ApiFeature{
    constructor(query,queryStr){
        this.query=query;
        this.queryStr=queryStr;
    }

    search(){
        const keyword=this.queryStr.keyword?{
            name:{
                $regex:this.queryStr.keyword,
                $options:'i'
            }
        }:{}
       // console.log(keyword);
        this.query=this.query.find({...keyword})
        //console.log(this.query);
        return this;
    }
    filter(){
        const queryCopy={...this.queryStr}
        //console.log(queryCopy);

        const removeFeilds=['keyword','limit','page'];

        removeFeilds.forEach((el)=>{
            delete queryCopy[el]
        })
        let queryStr=JSON.stringify(queryCopy)
        queryStr= queryStr.replace(/\b(gte|lte|gt|lt)\b/g,match=>`$${match}`)
        //console.log(queryStr);
        this.query=this.query.find(JSON.parse(queryStr))
        return this;
    }
    pagination(resultPerPage){
        let currPage=Number(this.queryStr.page)||1
        let skip=resultPerPage *(currPage-1);

        this.query=this.query.limit(resultPerPage).skip(skip);
        return this;
    }

}

module.exports=ApiFeature;