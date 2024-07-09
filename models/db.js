const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const dbConnection = mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => console.log('Connected to database'))
  .catch((err) => console.error('Could not connect to database', err));

module.exports = dbConnection;



