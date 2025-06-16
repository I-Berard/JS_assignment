let mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/exam');

let db = mongoose.connection;

db.on('error', (err) => {console.log(`There has been an error ${err}`)});
db.on('connected', () => {console.log("Successfully connected to database")});
db.on('disconnected', () => {console.log("Disconnected from database")});

let userSchema = mongoose.Schema({
    Name: {type: string, required: true},
    Email: {type: string, required: true, unique: true},
    Password: {type: string, required: true},
},
{
    timestamps: true
})

let User = new mongoose.model('user', userSchema);

modules.export = User;