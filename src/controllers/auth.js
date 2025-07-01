import createError from 'http-errors';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../db/models/user.js';
import Session from '../db/models/session.js';
import dotenv from 'dotenv';
dotenv.config();


const JWT_SECRET = process.env.JWT_SECRET || 'default_secret';

const generateTokens = (userId) => {
  const accessTokenValidUntil = new Date(Date.now() + 15 * 60 * 1000); // 15 хв
  const refreshTokenValidUntil = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 днів

  console.log('JWT_SECRET =', process.env.JWT_SECRET);

  const accessToken = jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: '15m' });
  const refreshToken = jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: '7d' });

  return {
    accessToken,
    refreshToken,
    accessTokenValidUntil,
    refreshTokenValidUntil
  };
};


export const register = async (req, res) => {
  const { name, email, password } = req.body;

  const existing = await User.findOne({ email });
  if (existing) throw createError(409, 'Email in use');

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await User.create({ name, email, password: hashedPassword });

  res.status(201).json({
    status: 201,
    message: 'Successfully registered a user!',
    data: {
      _id: user._id,
      name: user.name,
      email: user.email
    }
  });
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return next(createError(401, 'Email or password is wrong'));
    }

    const payload = { id: user._id };
    const accessToken = jwt.sign(payload, process.env.JWT_ACCESS_SECRET, { expiresIn: '15m' });
    const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' });

    const now = new Date();
    const session = await Session.create({
      userId: user._id,
      accessToken,
      refreshToken,
      accessTokenValidUntil: new Date(now.getTime() + 15 * 60 * 1000), // 15 хв
      refreshTokenValidUntil: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000), // 7 днів
    });

    res
      .cookie('refreshToken', refreshToken, { httpOnly: true, sameSite: 'strict' })
      .cookie('sessionId', session._id.toString(), { httpOnly: true, sameSite: 'strict' })
      .json({ accessToken });
  } catch (err) {
    next(err);
  }
};


export const logout = async (req, res, next) => {
  try {
    const sessionId = req.cookies.sessionId;
    if (!sessionId) return next(HttpError(401, 'Not authorized'));

    await Session.findByIdAndDelete(sessionId);

    res
      .clearCookie('refreshToken')
      .clearCookie('sessionId')
      .status(204)
      .send();
  } catch (error) {
    next(error);
  }
};

export const refresh = async (req, res) => {
  const oldSessionId = req.cookies?.sessionId;

  if (!oldSessionId) {
    throw createError(401, "No session ID found in cookies");
  }

  const oldSession = await Session.findById(oldSessionId);
  if (!oldSession) {
    throw createError(401, "Session not found");
  }

  if (oldSession.refreshTokenValidUntil < new Date()) {
    throw createError(401, "Refresh token expired");
  }

  const user = await User.findById(oldSession.userId);
  if (!user) {
    throw createError(404, "User not found");
  }

  await Session.findByIdAndDelete(oldSessionId);

  const { accessToken, refreshToken, accessTokenValidUntil, refreshTokenValidUntil } = generateTokens(user._id);
  const newSession = await Session.create({
    userId: user._id,
    accessToken,
    refreshToken,
    accessTokenValidUntil,
    refreshTokenValidUntil,
  });

  res.cookie("sid", newSession._id.toString(), {
    httpOnly: true,
    sameSite: "lax",
    maxAge: 1000 * 60 * 60 * 24 * 30,
  });

  res.status(200).json({
    status: 200,
    message: "Successfully refreshed a session!",
    data: { accessToken },
  });
};
