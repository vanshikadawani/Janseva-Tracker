const express = require("express")
const userModel = require("../models/user.model")
const jwt = require("jsonwebtoken")

const authRouter = express.Router()
const crypto = require("crypto")

// /api/auth/register
authRouter.post("/register", async (req, res) => {
    const { email, name, password } = req.body

    const isUserAlreadyExists = await userModel.findOne({email})

    if(isUserAlreadyExists){
        return res.status(400).json({
            message: "user with this email already existed"
        })
    }

    const hash = crypto.createHash("md5").update(password).digest("hex")

    const user = await userModel.create({
        email, password:hash, name
    })

    const token = jwt.sign(
        {
             id: user._id,
            email: user.email
        },
        process.env.JWT_SECRET
  )

  res.cookie("token", token)

    res.status(201).json({
        message: "user registerd",
        user,
        token

    })

})

//api/auth/protected

authRouter.post("/protected", (req, res) => {
    console.log("cookies",req.cookies);

    res.status(200).json({
        message: "this is a protected route",
        token: req.cookies.token
    })
})

// Post/api/auth/login


//controller for login route

authRouter.post("/login",async(req, res) => {
    const {email, password} = req.body

    const user = await userModel.findOne({email})

    if(!user) {
        return res.status(404).json({
            message: "user not found with this email address"
        })
    }
    
    const isPasswordMatched = user.password === crypto.createHash("md5").update(password).digest("hex")

    if(!isPasswordMatched){
        return res.status(401).json({
            message: "Invaild password"

        })
    }

    const token = jwt.sign({
        id: user._id,
    },process.env.JWT_SECRET)

    res.cookie("token", token)

    res.status(200).json({
        message: "login successfull",
        user,
        
    })

})
   

module.exports = authRouter