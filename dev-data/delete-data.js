const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Idea = require('./../models/ideaModel');
const Message = require('./../models/messageModel');
const User = require('./../models/userModel');

dotenv.config({ path: './.env' });

const DB = process.env.DATABASE.replace('<PASSWORD>', process.env.DATABASE_PASSWORD);

mongoose
    .connect(DB, {
        useUnifiedTopology: true,
        useNewUrlParser: true,
        useCreateIndex: true
    })
    .then(() => console.log('DB connection successful!'));

const deleteData = async () => {
    try {
        await Idea.deleteMany();
        await User.deleteMany();
        await Message.deleteMany();
        console.log('Data deleted');
    } catch (err) {
        console.log(err);
    }
    process.exit();
};

if (process.argv[2] === '--delete') deleteData();
