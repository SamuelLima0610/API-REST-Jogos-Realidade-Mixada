const express = require('express');
const app = express();
const consign = require('consign');
const db = require('./database/config');

app.db = db;

consign()
    .then('./config/bodyAndCors.js')
    .then('./api/validation.js')
    .then('./api/methods.js')
    .then('./api')
    .then('./config/multer.js')
    .then('./config/routes.js')
    .into(app);


app.listen(process.env.PORT || 4000);
/*app.listen(4000,() => {
    console.log('Rodando porta 4000');
});*/
