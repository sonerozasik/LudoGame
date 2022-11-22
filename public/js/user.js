const express=require('express');
const router = express.Router();

//mongodb user model
const User= require('./../models/user');

router.post('/signup',(req,res)=>{
let {username,password} = req.body;
username = username.trim();
password= password.trim();

if(username=="" || password == "" ){
    res.json({
        status: "FAILED",
        message: "Empty input fields!"
    });
}else if(password.lenght<8){
    res.json({
        status: "FAILED",
        message: "Password must be at least 8 characters"
    });
}else{

    User.find({username}).then(result=>{
        if(result.lenght){
            //user already exist
            res.json({
                status: "FAILED",
                message: "Username already exist!"
            })
        }else{
            // create user
            const newUser = new User({
                username,
                password,
            });
            newUser.save().then(result=>{
                res.json({
                    status: "SUCCESS",
                    message: "Signup successful!",
                    data: result
                })
            })
            .catch(err=>{
                res.json({
                    status: "FAILED",
                    message: "An error occured while saving user!"
                })
            })
        }

    }).catch(err=>{
        console.log(err);
        res.json({
            status: "FAILED",
            message: "An error occured while checking for existing user!"
        })
    })
}
})

router.post('/',(req,res)=>{
    let{username,password}=req.body;
    username=username.trim();
    password=password.trim();

    if(username==""||password==""){
        res.json({
            status: "FAILED",
            message: "Please enter your username and password!"
        })
    }
    else{
        User.find({username}).then(data=>{
            if(data){
                const db_password=data[0].password;
                if(password==db_password){
                    res.json({
                        status: "SUCCESS",
                        message: "Signin successful",
                        data: data
                    })
                }
            }
        })
    }
})

module.exports = router;