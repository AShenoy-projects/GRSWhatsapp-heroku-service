const express = require('express');
const router = express.Router();
const dbInterface = require('./firebase');

const __TO_BE_SENT = 'TO_BE_SENT';
const __SENT = 'SENT';

//gupshup request constants
const __EXPECTED_APP = "GRSAVS";
const __EXPECTED_BODY_TYPE = "user-event";
const __EXPECTED_PAYLOAD_TYPE = "opted-in";
const _RESPONSEMSGS = {
    __INVALID : {msg: 'INVALID FORMAT'},
    __NORECORDS : {msg: "ERROR: NO RECORDS FOUND"},
    __MISMATCH : {msg: 'PAYLOAD TYPE MISMATCH'},
    __DBERROR : {msg: 'DB ERROR'},
    __SUCCESS : {msg: 'SUCCESS'},
    __BAD_REQUEST_STATUS: 400,
    __INTERNAL_SERVER_ERROR_STATUS: 500

}

//API for the front end
router.post('/update', (req, res) => {

    const dataList = req.body;
    if(!('fileslist' in dataList) || !('phone' in dataList)) {
        res.status(_RESPONSEMSGS.__BAD_REQUEST_STATUS);
        res.send(_RESPONSEMSGS.__INVALID);
        return;
    }

    dbInterface.updateStatus(dataList.fileslist, dataList.phone, __TO_BE_SENT, res);
});

//End point for Gupshup
router.post('/send', (req, res) => {

    let setHeader = true;
    if(req.body.app == __EXPECTED_APP && req.body.type == __EXPECTED_BODY_TYPE)
    {
        payload = req.body.payload;
        if(payload.type == __EXPECTED_PAYLOAD_TYPE)
        {
            setHeader = false;
            const phoneNumber = payload.phone;
            dbInterface.getFilesforPhNo(phoneNumber).then(snapshot => {
                if(snapshot.exists())
                {
                    const fileDataList = snapshot.val();
                    for(let file in fileDataList) {
                        if(fileDataList[file].status != __TO_BE_SENT)
                            delete fileDataList[file];
                    }
                    const filesToUpdate = Object.keys(fileDataList).map(fileId => { return {id: fileId}; });
                    dbInterface.updateStatus(filesToUpdate, phoneNumber, __SENT, res);
                }
                else
                    res.send(_RESPONSEMSGS.__NORECORDS);
            });
        }
    }
    if(setHeader)
        res.send(_RESPONSEMSGS.__MISMATCH);
});

router.get('', (req, res) => {
    res.send("Ping Works!!");
});

module.exports.router = router;
module.exports._RESPONSEMSGS = _RESPONSEMSGS;