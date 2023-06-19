const serviceAccount = require("../serviceAccountKey.json");
const { initializeApp, cert } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");

const app = initializeApp({
  credential: cert(serviceAccount),
});

const db = getFirestore();

const testdb = async () => {
  console.log("snapshot 1");
  var snapshot = await db.collection("locations").get();
  snapshot.forEach((doc) => {
    console.log(doc.id, "=>", doc.data());
  });

  const docRef = db.collection("locations").doc("NNB");

  await docRef.set({
    officialName: "New N-Block",
    aliases: ["NNB"],
  });

  console.log("snapshot 2");
  var snapshot = await db.collection("locations").get();
  snapshot.forEach((doc) => {
    console.log(doc.id, "=>", doc.data());
  });
};

// testdb().then((res) => console.log("done"));

module.exports = { db };
