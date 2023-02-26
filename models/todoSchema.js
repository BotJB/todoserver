const mongoose=require('mongoose')

const todoSchema=new mongoose.Schema({
 email:String,
 title:String,
 progress:Number,
 data:String
})

const model=mongoose.model('todos',todoSchema)

module.exports=model