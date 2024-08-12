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
const dbConnection=require('./models/db')
const { default: mongoose } = require('mongoose')
const sessions=require('express-session');
const mongoDbSession=require('connect-mongodb-session')(sessions)
app.use(cors())
app.use(express.json())
//set up the store
//set up the store for sessions
const store=mongoDbSession({
  uri:process.env.MONGO_URI,
  collection:'sessions'

})
//setup sessions
app.use(sessions({
  secret: 'your_secret_key',  // use this as an example, can change it later
  resave: false,              // Don't save session if unmodified
  saveUninitialized: false,   // Don't create a session until something is stored
  store: store,
  cookie: {
    maxAge: 1000 * 60 * 10, // 10 minutes
    httpOnly: true, // Prevent client-side access to cookie
    secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
    sameSite: 'strict' // Strict same-site policy to prevent CSRF
  }
}));




app.get('/',async(req,res)=>{
  res.status(200).json({message:'This is the get request'})
})


//this method is to get all the todos for a specific user
app.get("/todos/:email",async (req,res)=>{
  
    const {email}=req.params
   

    const todos=await postSchema.find({email:email})

   

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
//check if the user is already logged 
if(req.session.user && req.session.isAuthenticated){
  res.status(200).json({ message: "User is already logged in." });
}

console.log(req.body);

  const {email,password}=req.body

  const user=await userSchema.findOne({email:email})
   if(!user){
    res.status(404).json('user not found')
   }
   const success=await bcrypt.compare(password,user.password)
   if(success){
    req.session.user = {
      id: user._id,
      email: user.email,
      isAuthenticated:true
    };
    const token=jwt.sign({email},'secret',{expiresIn:'1hr'})
    res.status(200).json({user,token})
   }
   else{
    res.status(401).json({err:"UserName or password wrong"})
    console.log("it was in the else block")
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


const server = app.listen(PORT, () => {
  console.log(`App is running on PORT ${PORT}`);
});

module.exports={app,server};
