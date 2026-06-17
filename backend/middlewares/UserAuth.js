import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'

dotenv.config()

const verifyAuth=async(req, res, next)=>{
   try {
        const decoded= await jwt.verify(req.headers.authorization.split(" ")[1], process.env.JWT_KEY)
        req.user=decoded
        next()
   } catch (error) {
        console.log(error)
        return await res.status(401).json({
            message: 'Auth Failed, Please login in order to have access...!'
        })
   }
}

export default verifyAuth