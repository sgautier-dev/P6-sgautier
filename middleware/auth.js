const jwt = require('jsonwebtoken');

/**
 * Authentification middleware, retrieving and verifying the token with jsonwebtoken,
 * attaching auth object with userId to the request
 * @param req, res, next the HTTP request, response objects and next() 
 * @return next() passing control to the next middelware
 */
module.exports = (req, res, next) => {
   try {
       const token = req.headers.authorization.split(' ')[1];//to retrieve without "Bearer" 
       const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
       const userId = decodedToken.userId;
       req.auth = {
           userId: userId
       };
	next();
   } catch(error) {
       res.status(401).json({ error });
   }
};