const express = require("express");
const router = express.Router();
const dbInterface = require("./firebase");
const gupshupInterface = require("./gupshupAPI");
const _RESPONSEMSGS = require("./constants/statusmsgs");

const __TO_BE_SENT = "TO_BE_SENT";
const __SENT = "SENT";

//gupshup request constants
const __EXPECTED_APP = "GRSAVS";
const __EXPECTED_BODY_TYPE = "user-event";
const __EXPECTED_PAYLOAD_TYPE = "opted-in";
const __MESSAGE_TO_SEND =
  "Hello, here's your video link: Active for 24 hours. Note: This demo app only supports links, in the production version this app sends the video directly. ";
const __WELCOME_MSG =
  "Your request is being processed and you will receive your videos in a short while. Thank You!";

//API for the front end
router.post("/update", (req, res) => {
  const dataList = req.body;
  if (!("fileslist" in dataList) || !("phone" in dataList)) {
    res.status(_RESPONSEMSGS.__BAD_REQUEST_STATUS);
    res.send(_RESPONSEMSGS.__INVALID);
    return;
  }

  dbInterface.updateStatus(
    dataList.fileslist,
    dataList.phone,
    __TO_BE_SENT,
    res
  );
});

//End point for Gupshup
router.post("/send", (req, res) => {
  let setHeader = true;
  if (req.body.app == __EXPECTED_APP && req.body.type == __EXPECTED_BODY_TYPE) {
    payload = req.body.payload;
    if (payload.type == __EXPECTED_PAYLOAD_TYPE) {
      setHeader = false;
      const phoneNumber = payload.phone;
      dbInterface.getFilesforPhNo(phoneNumber).then((snapshot) => {
        if (snapshot.exists()) {
          const fileDataList = snapshot.val();
          for (let file in fileDataList) {
            if (fileDataList[file].status != __TO_BE_SENT)
              delete fileDataList[file];
            else {
              const filename = fileDataList[file].filename;
              dbInterface.getDownloadlink(filename).then((signedLink) => {
                gupshupInterface.sendVideoToUser(
                  phoneNumber,
                  __MESSAGE_TO_SEND + signedLink
                );
              });
            }
          }
          const filesToUpdate = Object.keys(fileDataList).map((fileId) => {
            return { id: fileId };
          });
          dbInterface.updateStatus(filesToUpdate, phoneNumber, __SENT, res);
        } else res.send(_RESPONSEMSGS.__NORECORDS);
      });
    }
  }
  if (setHeader) res.send(__WELCOME_MSG);
});

router.get("", (req, res) => {
  res.send("Ping Works!!");
});

module.exports.router = router;
module.exports._RESPONSEMSGS = _RESPONSEMSGS;
