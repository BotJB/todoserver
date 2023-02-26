const PORT=process.env.PORT || 8000
const pool =require('./models/db')
const express=require('express')
const {v4:uuidv4}=require('uuid')
const jwt=require('jsonwebtoken')
const app=express();
require('./models/db')
const userSchema=require('./models/userSchema')
const postSchema=require('./models/todoSchema')
const bcrypt=require('bcrypt')
const cors=require('cors')
const { default: mongoose } = require('mongoose')
app.use(cors())
app.use(express.json())



app.get('/',async(res,req)=>{
  res.status(200).json({message:'This is the get request'})
})
//this method is to get all the todos for a specific user
app.get("/todos/:email",async (req,res)=>{
  
    const {email}=req.params
   

    const todos=await postSchema.find()

   

    res.status(200).json({todos})
   
})

//This method is to insert new posts into the table
app.post('/todos',async(req,res)=>{
  const {email,title,progress,date}=req.body
   const post=new postSchema({email,title,progress,date})
   await post.save();
 
   res.status(200).json({message:'It was inseted'})
})


//this method is to update a specific todo
app.put('/todos/:id',async(req,res)=>{
  const {id}=req.params
  const {email,title,progress,date}=req.body
  const postId=new mongoose.Types.ObjectId

     const todo= await postSchema.findByIdAndUpdate(id,{email:email,title:title,progress:progress})


     console.log(todo)
     res.status(200).json({message:'Edited successfully'})
})


//A route to delete the todo
app.delete('/todos/:id',async(req,res)=>{
   const {id}=req.params
   
   await postSchema.findByIdAndDelete(id)
   res.status(200).json({message:'deleted'})

})

//Login route
app.post('/login',async(req,res)=>{

  const {email,password}=req.body

  const user=await userSchema.findOne({email:email})
   if(!user){
    res.status(404).json('user not found')
   }
   const success=bcrypt.compare(password,user.password)
   if(success){
    const token=jwt.sign({email},'secret',{expiresIn:'1hr'})
    res.status(200).json({email,token})
   }




})

//Sign up route
app.post('/signup',async(req,res)=>{
  const {email,password}=req.body
  const salt=10
  const hash=bcrypt.hashSync(password,salt)
  
  const token=jwt.sign({email},'secret',{expiresIn:'1hr'})

  const user=new userSchema({email:email,password:hash})

  await user.save();
 
  res.status(200).json({email,token})


  
})


app.listen(PORT,()=>{
    console.log(`App is running on PORT ${PORT}`)
})
