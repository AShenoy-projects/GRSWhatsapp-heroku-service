//imports
const express = require('express');
const app = express();
const router = require('./routes').router;
const PORT = process.env.PORT || 3000
const ISDEVENV = process.env.ENVDEV;

if(ISDEVENV) { //testing
    var cors = require('cors');
    app.use(cors());
}


//middlewares
app.use(express.json());
app.use('/', router);


app.listen(PORT, () => console.log(`Listening on ${ PORT }`));