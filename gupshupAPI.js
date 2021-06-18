const https = require("https");
const querystring = require("querystring");

function sendVideoToUser(phone, data) {
  const wData = querystring.stringify({
    channel: "whatsapp",
    source: "917834811114", //Public source
    destination: phone,
    "src.name": "GRSAVS",
    message: JSON.stringify({
      isHSM: "true",
      type: "text",
      text: data,
    }),
  });

  const options = {
    hostname: "api.gupshup.io",
    path: "/sm/api/v1/msg",
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      apikey: process.env.GUPSHUPAPIKEY, //private key
    },
  };

  const req = https.request(options, (res) => {
    res.on("data", (d) => {
      process.stdout.write("Custom message=>" + d);
    });
  });

  req.on("error", (error) => {
    console.error(error);
  });

  req.write(wData);
  req.end();
}

module.exports.sendVideoToUser = sendVideoToUser;
