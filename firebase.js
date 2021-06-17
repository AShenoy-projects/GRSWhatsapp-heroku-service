const firebase = require('firebase-admin');
const _RESPONSEMSGS = require('./routes')._RESPONSEMSGS;

firebase.initializeApp({
    credential: firebase.credential.applicationDefault(),
    databaseURL: process.env.DBURL
});

const db = firebase.database();

function updateStatus(dataList, phoneNumber, statusToUpdt, res) {

    let updates = {};
    for(let file of dataList) {
        updates[file.id + '/status'] = statusToUpdt;
        updates[file.id + '/sentTo'] =  phoneNumber;
    }
    db.ref('GRSARROOM-FILES/').update(updates, err => {
        if(err) {
            console.log(err);
            res.status(_RESPONSEMSGS.__INTERNAL_SERVER_ERROR_STATUS);
            res.send(_RESPONSEMSGS.__DBERROR);
        }
        else
            res.send(_RESPONSEMSGS.__SUCCESS);
    });
}

function getFilesforPhNo(phone) {
    return db.ref('GRSARROOM-FILES').orderByChild('sentTo').equalTo(phone).get();
}


module.exports.updateStatus = updateStatus;
module.exports.getFilesforPhNo = getFilesforPhNo;