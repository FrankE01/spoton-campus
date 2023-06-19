const { db } = require("../config/firebase");
const jwt = require("jsonwebtoken");
const createError = require("http-errors");

async function generateUserToken(person) {
  const payload = { sub: { person } };

  const refreshToken = jwt.sign(payload, process.env.USER_SECRET1, {
    expiresIn: "14d",
  });

  const accessToken = jwt.sign(payload, process.env.USER_SECRET2, {
    expiresIn: "1h",
  });

  let date = new Date();
  date.setDate(date.getDate() + 14);

  const token = db.collection("tokens").doc(person.uid);
  await token.set({ refreshToken, expiry: date });

  return { accessToken, refreshToken };
}

async function verifyUserToken(req, res, next) {
  const [type, token] = req.headers.authorization?.split(" ") ?? [];
  if (type !== "Bearer" || !token) return next(createError(401));

  try {
    const payload = jwt.verify(token, process.env.USER_SECRET2);
    const user = await db.collection("users").doc(payload.sub.person.uid).get();
    if (!user.exists) return next(createError(401));
    req.user = user.data();
    next();
  } catch (error) {
    return next(createError(401));
  }
}

async function generateAdminToken(person) {
  const payload = { sub: { person } };

  const refreshToken = jwt.sign(payload, process.env.ADMIN_SECRET1, {
    expiresIn: "14d",
  });

  const accessToken = jwt.sign(payload, process.env.ADMIN_SECRET2, {
    expiresIn: "1h",
  });

  let date = new Date();
  date.setDate(date.getDate() + 14);

  const token = db.collection("tokens").doc(person.uid);
  await token.set({ refreshToken, expiry: date });

  return { accessToken, refreshToken };
}

async function verifyAdminToken(req, res, next) {
  const [type, token] = req.headers.authorization?.split(" ") ?? [];
  if (type !== "Bearer" || !token) return next(createError(401));

  try {
    const payload = jwt.verify(token, process.env.ADMIN_SECRET2);
    const admin = await db
      .collection("admins")
      .doc(payload.sub.person.uid)
      .get();
    if (!admin.exists) return next(createError(401));
    req.admin = admin.data();
    next();
  } catch (error) {
    return next(createError(401));
  }
}

module.exports = {
  generateUserToken,
  verifyUserToken,
  generateAdminToken,
  verifyAdminToken,
};
