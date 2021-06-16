const express = require('express');
const app = express();
const PORT = process.env.PORT || 5000

console.log("Starting the Server");

app.get('', (req, res) => {
    res.send("Hello!!");
})

app.listen(PORT, () => console.log(`Listening on ${ PORT }`));