import express from "express"
import { login, profile, signup, logout } from "../../controllers/userAuth.controllers.js"
import verifyAuth from "../../middlewares/UserAuth.js"

const userAuthRoutes=express.Router()

userAuthRoutes.post('/signup', signup)
userAuthRoutes.post('/login', login)
userAuthRoutes.post('/logout', verifyAuth, logout)
userAuthRoutes.get('/profile', verifyAuth, profile)

export default userAuthRoutes