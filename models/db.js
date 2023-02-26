const mongoose=require('mongoose')
const dotenv=require('dotenv')

dotenv.config()
mongoose.connect(process.env.MONGO_URI)

mongoose.connection.on('connected',()=>{
    console.log('Connected to database')
})




