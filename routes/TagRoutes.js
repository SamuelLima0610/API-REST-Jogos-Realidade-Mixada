const express = require('express');
const firebase = require('firebase');
const database = require('../database/config');
const router = express.Router();

var tagsDetected = [];

var manager = firebase.database().ref('tags');
manager.on('value', (data) => {
    tagsDetected = data;
});

function writeTagData(id, tagId) {
    // Generate a reference to a new location and add some data using push()
    let tagsRef = manager.push();
    tagsRef.set({
        id,
        tagId
    });
}

router.get('/tag', (req,res) => {
    res.json(tagsDetected);
});

router.get('/tag/:id', (req,res) => {
    let id = req.params.id;
    if(!isNaN(id)){
        let find = undefined;
        manager.orderByValue().on("value", tags => {
            tags.forEach( data => {
                if(data.val().id == id){
                    find = data;
                    res.statusCode = 200;
                    res.json(find);
                }
            });
            if(find == undefined){
                res.statusCode = 404;
                res.json({error: "Not found"});
            }
        });
    }
});

router.post('/tag', (req,res) => {
    let tag = req.body.tag;
    let randomNumber = Math.floor(Math.random() * 65536);
    writeTagData(randomNumber, tag);
    res.statusCode = 200;
    res.send({res: "Inserted"});
});

module.exports = router;