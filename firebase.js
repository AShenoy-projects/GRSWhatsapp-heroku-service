const firebase = require("firebase-admin");
const _RESPONSEMSGS = require("./constants/statusmsgs");
const __LINK_EXPIRY_NO_OF_DAYS = 1;

firebase.initializeApp({
  credential: firebase.credential.cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
    client_email: process.env.FIREBASE_CLIENT_EMAIL,
  }),
  databaseURL: process.env.DBURL,
});

const db = firebase.database();
const storage = firebase.storage();

function updateStatus(dataList, phoneNumber, statusToUpdt, res) {
  let updates = {};
  for (let file of dataList) {
    updates[file.id + "/status"] = statusToUpdt;
    updates[file.id + "/sentTo"] = phoneNumber;
  }
  db.ref("GRSARROOM-FILES/").update(updates, (err) => {
    if (err) {
      console.log(err);
      res.status(_RESPONSEMSGS.__INTERNAL_SERVER_ERROR_STATUS);
      res.send(_RESPONSEMSGS.__DBERROR);
    } else res.send(_RESPONSEMSGS.__SUCCESS);
  });
}

function getDownloadlink(filename) {
  let expiry = new Date();
  expiry.setDate(expiry.getDate() + __LINK_EXPIRY_NO_OF_DAYS);

  const config = {
    action: "read",
    expires: expiry,
  };

  return storage
    .bucket("grs-whatsapp.appspot.com")
    .file(filename)
    .getSignedUrl(config);
}

function getFilesforPhNo(phone) {
  return db.ref("GRSARROOM-FILES").orderByChild("sentTo").equalTo(phone).get();
}

module.exports.updateStatus = updateStatus;
module.exports.getFilesforPhNo = getFilesforPhNo;
module.exports.getDownloadlink = getDownloadlink;
