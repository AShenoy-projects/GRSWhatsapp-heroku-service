const express = require('express');
const app = express();

console.log("Starting the Server");

app.get('', (req, res) => {
    res.send("Hello!!");
})

app.listen(3000);