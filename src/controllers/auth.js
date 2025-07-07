import createError from 'http-errors';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../db/models/user.js';
import Session from '../db/models/session.js';
import dotenv from 'dotenv';
import nodemailer from 'nodemailer';
dotenv.config();

const { JWT_SECRET, SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD, SMTP_FROM, APP_DOMAIN } = process.env;

const generateTokens = (userId) => {
  const accessTokenValidUntil = new Date(Date.now() + 1000 * 60 * 15); // 15 хв
  const refreshTokenValidUntil = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7); // 7 днів

  const payload = { userId };

  const accessToken = jwt.sign(payload, JWT_SECRET, { expiresIn: '15m' });
  const refreshToken = jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });

  return {
    accessToken,
    refreshToken,
    accessTokenValidUntil,
    refreshTokenValidUntil,
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

    const payload = { userId: user._id };

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
  .status(200)
  .json({
    status: 200,
    message: 'Successfully logged in!',
    data: { accessToken }
  });

  } catch (err) {
    next(err);
  }
};


export const logout = async (req, res, next) => {
  try {
    const sessionId = req.cookies?.sessionId;
if (!sessionId) return next(createError(401, 'No session ID in cookies'));

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

  res.cookie("sessionId", newSession._id.toString(), {
    httpOnly: true,
    sameSite: "strict",
    maxAge: 1000 * 60 * 60 * 24 * 30,
  });

  res.status(200).json({
    status: 200,
    message: "Successfully refreshed a session!",
    data: { accessToken },
  });
};


export const sendResetEmail = async (req, res, next) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) throw createError(404, 'User not found!');

    const token = jwt.sign({ email }, JWT_SECRET, { expiresIn: '5m' });

    const resetLink = `${APP_DOMAIN}/reset-password?token=${token}`;

    const transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: SMTP_PORT,
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASSWORD,
      },
    });

    await transporter.sendMail({
      from: SMTP_FROM,
      to: email,
      subject: 'Password Reset',
      html: `<p>Click <a href="${resetLink}">here</a> to reset your password. This link is valid for 5 minutes.</p>`,
    });

    res.status(200).json({
      status: 200,
      message: "Reset password email has been successfully sent.",
      data: {},
    });
  } catch (err) {
    console.error(err);
    next(createError(500, 'Failed to send the email, please try again later.'));
  }
};

export const resetPassword = async (req, res, next) => {
  try {
    const { token, password } = req.body;

    const { email } = jwt.verify(token, JWT_SECRET);

    const user = await User.findOne({ email });
    if (!user) throw createError(404, 'User not found!');

    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;
    await user.save();

    await Session.deleteMany({ userId: user._id });

    res.status(200).json({
      status: 200,
      message: "Password has been successfully reset.",
      data: {},
    });
  } catch (err) {
    console.error(err);
    next(createError(401, 'Token is expired or invalid.'));
  }
};
