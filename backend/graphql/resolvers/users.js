const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const {UserInputError} = require('apollo-server');

const {validateRegisterInput, validateLoginInput} = require('../../utils/validators');
const {SECRET_KEY} = require ('../../config');
const User = require('../../models/User');

function  generateToken(user){
   return  jwt.sign({
        id: user.id,
        email: user.email,
        username: user.username
    }, SECRET_KEY,{expiresIn:'1h'});
}

module.exports={
    Mutation:{
        register: async(_, args, context, info)=>{
            //TODO: Validate user data
            // TODO: Make sure user doesnt already exist
            //TODO: hash  password and create an auth token
            const {registerInput} = args;
            const {username, email, password, confirmPassword} = registerInput;
            const {valid, errors} = validateRegisterInput (username, email, password, confirmPassword)
            if(!valid){
                throw new UserInputError('Errors',{errors});
            }
            const user = await User.findOne({username});
            if(user){
                throw new UserInputError('Username is taken', {
                    errors:{
                        username:'This username is taken'
                    }
                })
            }
            const bcryptPass = await bcrypt.hash(password,12);
            const newUser = new User({
                email,
                username,
                password,
                createdAt: new Date().toISOString()
            });
            const res =  await newUser.save();
            const token = generateToken(res)

            return {
                ...res._doc,
                id: res._id,
                token
            }
        },
        login: async(_,args,contect,info)=>{
            const {username, password} = args;
           const {valid, errors} = validateLoginInput (username, password);
           if(!valid){
               throw new UserInputError('Errors', {errors});
           }
           const user = await User.findOne({username});
           if(!user){
               errors.general = "User not found";
               throw new UserInputError('Wrong credentials',{errors})
           }
           const match = bcrypt.compare(password,user.password);
           if(!match){
            errors.general = "Wrong credentials";
            throw new UserInputError('Wrong credentials',{errors})
           }
           const token = generateToken(user);

           return {
                ...user._doc,
                id: user._id,
                token
            }
        }
    }
}