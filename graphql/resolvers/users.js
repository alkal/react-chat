const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const {SECRET_KEY} = require ('../../config');
const User = require('../../models/User');

module.exports={
    Mutation:{
        register: async(_, args, context, info)=>{
            //TODO: Validate user data
            // TODO: Make sure user doesnt already exist
            //TODO: hash  password and create an auth token
            const {registerInput} = args;
            const {username, email, password, confirmPassword} = registerInput;
            const bcryptPass = await bcrypt.hash(password,12);
            const newUser = new User({
                email,
                username,
                password,
                createdAt: new Date().toISOString()
            });
            const res =  await newUser.save();
            const token = jwt.sign({
                id: res.id,
                email: res.email,
                username: res.username
            }, SECRET_KEY,{expiresIn:'1h'});

            console.log({
                ...res._doc,
                id: res._id,
                token
            });

            return {
                ...res._doc,
                id: res._id,
                token
            }
        }
    }
}