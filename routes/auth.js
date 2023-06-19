const express = require("express");
const router = express.Router();
const createError = require("http-errors");
const { v4: uuid } = require("uuid");
const path = require("path");
const bcrypt = require("bcrypt");
const { db } = require("../config/firebase.js");
const admin = require("firebase-admin");
const {
  generateUserToken,
  //   generateAdminToken,
} = require("../middlewares/guard.js");

router.post("/login", async (req, res, next) => {
  if (!req.body || !req.body.accessToken) {
    return next(createError(400, "Please provide the accessToken"));
  }

  try {
    const decodedToken = await admin.auth().verifyIdToken(req.body.accessToken);

    const user = await db.collection("users").doc(decodedToken.uid).get();
    if (!user.exists) {
      try {
        const decodedToken = await admin
          .auth()
          .verifyIdToken(req.body.accessToken);

        await db.collection("users").doc(decodedToken.uid).set({
          appID: uuid(),
          uid: decodedToken.uid,
          name: decodedToken.name,
          email: decodedToken.email,
          picture: decodedToken.picture,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
      } catch (error) {
        return next(createError(500, error.message));
      }
    }

    const tokens = await generateUserToken({ uid: decodedToken.uid });

    res.send(tokens);
  } catch (error) {
    return next(createError(500, error.message));
  }
});

router.post("/admin/login", async (req, res, next) => {
  if (!req.body || !req.body.email || !req.body.password) {
    return next(createError(400, "Please provide the email and password"));
  }

  const admins = await db
    .collection("admins")
    .where("email", "==", req.body.email)
    .get();
  if (admins.empty) {
    return next(createError(401));
  } else {
    const admin = admins.docs[0].data();

    const result = bcrypt.compareSync(req.body.password, admin.password);

    if (!result) {
      return next(createError(401));
    } else {
      const tokens = await generateUserToken({ uid: admin.uid });
      res.send(tokens);
    }
  }
});

// router.post("/admin/register", async (req, res, next) => {
//   if (!req.body || !req.body.email || !req.body.password) {
//     return next(createError(400, "Please provide the email and password"));
//   }

//   if (!/^[\w.-]+@[a-zA-Z_-]+?\.[a-zA-Z]{2,3}$/.test(req.body.email)) {
//     return next(createError(400, "Email is invalid"));
//   }

//   const admins = await db
//     .collection("admins")
//     .where("email", "==", req.body.email)
//     .get();
//   if (!admins.empty) {
//     return next(createError(409, "Admin already exists"));
//   } else {
//     const salt = bcrypt.genSaltSync(10);
//     const hash = bcrypt.hashSync(req.body.password, salt);

//     const adminDoc = await db.collection("admins").add({
//       uid: uuid(),
//       email: req.body.email,
//       password: hash,
//       createdAt: admin.firestore.FieldValue.serverTimestamp(),
//       updatedAt: admin.firestore.FieldValue.serverTimestamp(),
//     });

//     const tokens = await generateAdminToken({ uid: adminDoc.id });
//     res.send(tokens);
//   }
// });

router.get("/test", (req, res, next) => {
  res.sendFile(path.join(__dirname, "../public/test.html"));
});

module.exports = router;
