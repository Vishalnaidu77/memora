import jwt from 'jsonwebtoken'

export async function identifyUser(req, res, next){
    const cookieToken = req.cookies.token
    const authHeader = req.headers.authorization
    const bearerToken = authHeader?.startsWith("Bearer")
        ? authHeader.split(" ")[1]
        : null

    const token = cookieToken || bearerToken

    if(!token){
        return res.status(401).json({
            message: "Unauthorized access, Login first"
        })
    }

    let decoded = null;

    try {
        decoded = jwt.verify(token, process.env.JWT_SECRET)
    } catch (error) {
        return res.status(401).json({
            message: "Unauthorized token"
        })
    }

    req.user = decoded
    
    next()

}