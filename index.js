const express = require('express');
const app = express();
const consign = require('consign');
const db = require('./database/config');
const http = require('http').createServer(app)
let io = require('socket.io')(http)

app.db = db;

consign()
    .then('./config/bodyAndCors.js')
    .then('./api/validation.js')
    .then('./api/methods.js')
    .then('./api')
    .then('./config/routes.js')
    .into(app,io);

io.on("connection", (socket) => {
    socket.on('disconnect', () => {
        console.log("Cliente: " + socket.id + "se desconectou")
    })
})

http.listen(process.env.PORT || 4000);
/*http.listen(4000,() => {
    console.log('Rodando porta 4000');
});*/
