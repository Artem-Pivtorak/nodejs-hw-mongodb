import jwt from 'jsonwebtoken';
import createError from 'http-errors';
import Session from '../db/models/session.js';
import User from '../db/models/user.js';



const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || '';
    const [bearer, token] = authHeader.split(' ');

    if (bearer !== 'Bearer' || !token) {
      throw createError(401, 'Not authorized');
    }
    const payload = jwt.verify(token, process.env.JWT_ACCESS_SECRET);


    const session = await Session.findOne({
  userId: payload.userId,
  accessToken: token
});


    if (!session) throw createError(401, 'Invalid session');

    if (session.accessTokenValidUntil < new Date()) {
      throw createError(401, 'Access token expired');
    }
    const user = await User.findById(payload.userId);


    if (!user) throw createError(401, 'User not found');
    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
};

export default authenticate;

