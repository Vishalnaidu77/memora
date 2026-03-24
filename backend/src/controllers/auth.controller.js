import { userModel } from "../models/user.model.js"
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

export async function registerController(req, res){
    const { name, email, password } = req.body

    const isUserExist = await userModel.findOne({ email })

    if(isUserExist){
        return res.status(400).json({
            message: "Email already exist, try login"
        })
    }

    const hash = await bcrypt.hash(password, 10)

    const user = await userModel.create({
        name,
        email,
        password: hash
    })

    const token = jwt.sign({
        id: user._id
    }, process.env.JWT_SECRET)

    res.cookie("token", token, {
        httpOnly: true,
        secure: false,
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000
    })

    res.status(201).json({
        message: "User register successfully",
        user: {
            name: user.name,
            email: user.email
        }
    })
}

export async function loginController(req, res){
    const { email, password } = req.body

    const userExist = await userModel.findOne({ email })

    if(!userExist){
        return res.status(404).json({
            message: "Invalid credentials"
        })
    }

    const validPassword = await bcrypt.compare(password, userExist.password)

    if(!validPassword){
        return res.status(401).json({
            message: "Invalid credentials"
        })
    }

    const token = jwt.sign({
        id: userExist._id
    }, process.env.JWT_SECRET)

    res.cookie("token", token, {
        httpOnly: true,
        secure: false,
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000
    })

    res.status(200).json({
        message: "User logged in successfully.",
        user: {
            name: userExist.name,
            email: userExist.email,
            id: userExist._id

        }
    })
}