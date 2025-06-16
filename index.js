let express = require('express');
let mongoose = require('mongoose');
let bcrypt = require('bcrypt');
let Joi = require('joi');
let jwt = require('jsonwebtoken');
let User = require('./models');

let app = express();

app.use(express.json());

let schema = Joi.object({
    name: Joi.string().min(5).max(50).trim(),
    email: Joi.string().min(5).email().required(),
    password: Joi.string().min(4)
});

let loginSchema = Joi.object({
    email: Joi.string().min(5).email().required(),
    password: Joi.string().min(4),
})

const auth = (req, res, next) => {
    let token = req.header('Authorisation')?.split(' ')[1];

    if(!token) res.json({message : "Access denied. No provided token"});

    try{
        const secret = process.env.JWT_SECRET;
        const decoded = jwt.verify(token, secret);
        req.user = decoded;
        next;
    } catch (err){
        console.log(err);
        res.send(400).json({message: "Invalid token"});
    }

}

app.post('/signup', async (req, res) => {
    const {name, email, password} = req.body;    

    const {error, value} = schema.validate({name: name, email: email, password: password});
    if (error) res.json({message: error.details[0].message});

    let findUser = await User.findOne({Name: name, Email: email});
    
    if(findUser){
        res.status(401).json({message: "User already exists"});
    }else{

        let hashedPassword = bcrypt.hash(password, 10);
        
        let user = new User({
            Name: name,
            Email: email,
            password: hashedPassword, 
        });

        await user.save()
    }
})

app.post('login', async (req, res) => {
    const {email, password} = req.body;

    const {error, value} = loginSchema.validate({email: email, password: password});
    if (error) res.json({message: error.details[0].message});

    let user = await User.findOne({Email: email});

    let isValid = bcrypt.compare(password, user.Password);

    if(!user){
        res.status(401).json({message: "User not found"});
    }
    if(!isValid){
        res.status(401).json({message: "Password doesn't match"});
    }

    let token = jwt.sign({id: user._id, email: user.email}, process.env.JWT_SECRET, {expiresIn: '1h'});
    
})