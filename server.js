const PORT=process.env.PORT || 8000
const pool =require('./db')
const express=require('express')
const {v4:uuidv4}=require('uuid')
const jwt=require('jsonwebtoken')
const app=express();
const bcrypt=require('bcrypt')

app.use(express.json())
app.get("/todos/:email",async (req,res)=>{
    console.log('this route was hit')
    const {email}=req.params
    console.log(email)
    try{
      const data=await pool.query("SELECT * FROM  todo where email=$1",[email])
      res.json(data.rows)
    }
    catch(err) {
        console.log(err)
    }
})
app.post('/todos',async(req,res)=>{
  const {email,title,progress,date}=req.body
  const id=uuidv4()
  console.log(id)
  try{

    const response=await pool.query("INSERT INTO todo(id,email,title,progress,date) VALUES($1,$2,$3,$4,$5)",[id,email,title,progress,date]);
    res.send(response)
  }
  catch(err){
    console.error(err)
  }
})

app.put('/todos/:id',async(req,res)=>{
  const {id}=req.params
  const {email,title,progress,date}=req.body
  const query=pool.query('UPDATE todo SET email=$1,title=$2,progress=$3,date=$4 WHERE id=$5',[email,title,progress,date,id])
  res.send(query)
  console.log(id)
})

//A route to delete the todo
app.delete('/todos/:id',async(req,res)=>{
   const {id}=req.params
   console.log(id)
   const response=pool.query('DELETE FROM todo where id=$1',[id])
   res.send(response)

})

//Login route
app.post('/login',async(req,res)=>{

  const {email,password}=req.body
  const user=await pool.query('SELECT * from users WHERE email=$1',[email])
  console.log(user.rows)

  if(!user.rows.length){
    return res.json('User not Found')
  }
  const success=await bcrypt.compare(password,user.rows[0].password)
  if(success){
    const token=jwt.sign({email},'secret',{expiresIn:'1hr'})
    res.json({email,token})
  }



})

//Sign up route
app.post('/signup',async(req,res)=>{
  const {email,password}=req.body
  const salt=10
  const hash=bcrypt.hashSync(password,salt)
 const resp=pool.query('INSERT INTO users(email,password) VALUES($1,$2)',[email,hash])
 const token=jwt.sign({email},'secret',{expiresIn:'1hr'})

 res.json({email,token})
  
})


app.listen(PORT,()=>{
    console.log(`App is running on PORT ${PORT}`)
})
