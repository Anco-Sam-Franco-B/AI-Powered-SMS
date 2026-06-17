import db from "../Configs/Database.js";
import bcrypt from "bcryptjs";
import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'

dotenv.config()

export const signup=async(req,res)=>{
    const {username, email, password}= req.body

    if(!username || !email || !password){
       return res.json({
        message: 'All input fields are required'
       })
    }

    try {
        const hashedPassword=await bcrypt.hash(password, 10)
        const existingUser=await db.query('SELECT id FROM users WHERE username=$1 OR email=$2', [username, email])
        if(existingUser.rows.length > 0){
            return res.status(409).json({ message: 'Username or email already exists' })
        }

        const sign= await db.query('INSERT INTO users(username, email, password) VALUES($1, $2, $3) RETURNING id', [username, email, hashedPassword])

        if(!sign){
            return res.status(500).json({
                message: 'Failed to sign up'
            })
        }

        return res.status(201).json({
            message: 'Signup successfully! Now you can login into your account'
        })
        
    } catch (error) {
        console.log(error)
        res.status(500).json({
            message: 'Internal Server Error',
            errors: error.message
        })
    }
}

export const login=async(req,res)=>{
    const {username, email, password}= req.body
    const loginName = username || email

    if(!loginName || !password){
       return res.json({
        message: 'Username/email and password are required'
       })
    }

    try {
        const users= await db.query('SELECT * FROM users WHERE username=$1 OR email=$1', [loginName])
        if(users.rows.length === 0){
            return res.status(401).json({
                message: 'Username Not Found'
            })
        }

        const result = await bcrypt.compare(password, users.rows[0].password)
        
        if(result){
          const token=jwt.sign({
                username: users.rows[0].username, 
                userId: users.rows[0].id,
                role: users.rows[0].role
            },
            process.env.JWT_KEY,
            {
                expiresIn: '7d'
            }
          )

          res.cookie('userCookie', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 7 * 24 * 60 * 60 * 1000,
            sameSite: 'strict',
            path: '/'
          })

            return res.status(200).json({
                message: 'User Auth Successfully',
                userToken: token,
                user: {
                    id: users.rows[0].id,
                    username: users.rows[0].username,
                    email: users.rows[0].email,
                    role: users.rows[0].role
                }
            })
        }

        res.status(401).json({
            message: 'Auth Failed: Incorrect password'
        })

    } catch (error) {
        console.log(error)
        res.status(500).json({
            message: 'Internal Server Error',
            errors: error.message
        })
    }
}

export const logout=async(req,res)=>{
    res.clearCookie('userCookie', { path: '/' })
    return res.status(200).json({ message: 'Logged out successfully' })
}

export const profile=async(req, res)=>{
    try {
        const userData=req.user
        const user=await db.query('SELECT id, username, email, role FROM users WHERE id=$1', [userData.userId])
        if(user.rows.length === 0){
            return res.status(404).json({ message: 'User not found' })
        }
        return res.status(200).json({
            message: 'User Profile',
            profile: user.rows[0]
        })
    } catch (error) {
         console.log(error)
        res.status(500).json({
            message: 'Internal Server Error',
            errors: error.message
        })
    }
}
