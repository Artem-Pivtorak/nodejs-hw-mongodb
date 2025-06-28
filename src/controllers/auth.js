import createError from 'http-errors';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../db/models/user.js';
import Session from '../db/models/session.js';


const JWT_SECRET = process.env.JWT_SECRET || 'default_secret';

const generateToken = (payload, expiresIn) => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn });
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

export const login = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) throw createError(401, 'Invalid credentials');

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) throw createError(401, 'Invalid credentials');

  const accessToken = generateToken({ userId: user._id }, '15m');
  const refreshToken = generateToken({ userId: user._id }, '30d');

  await Session.deleteMany({ userId: user._id });
  await Session.create({
    userId: user._id,
    accessToken,
    refreshToken,
    accessTokenValidUntil: new Date(Date.now() + 15 * 60 * 1000),
    refreshTokenValidUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
  });

  res.cookie('refreshToken', refreshToken, { httpOnly: true, sameSite: 'strict' });

  res.status(200).json({
    status: 200,
    message: 'Successfully logged in an user!',
    data: { accessToken }
  });
};

export const logout = async (req, res) => {
  const sessionId = req.cookies?.sid;

  if (!sessionId) {
    throw createError(401, "No session ID provided in cookies");
  }

  await Session.findByIdAndDelete(sessionId);
  res.clearCookie("sid");
  res.status(204).send();
};

export const refresh = async (req, res) => {
  const oldSessionId = req.cookies?.sid;

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
