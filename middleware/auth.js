const jwt = require('jsonwebtoken');
const config = require("config");

module.exports = function (req, res, next) {

    //GET token from the header
    const token = req.header('x-auth-token');

    //check if no token 
    if (!token) {
        return res.status(401).json({
            msg: 'No token: authorization denided'
        });
    }

    try {
        const decoded = jwt.verify(token, config.get("jwtSecret"));
        req.user = decoded.user;
        next();
    } catch {
        res.status(401).json({
            meg: "Token is not valid,Please Try again"
        });
    }


}