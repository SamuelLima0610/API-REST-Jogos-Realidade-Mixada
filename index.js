const express = require('express');
const app = express();
const cors = require('cors');
const bodyParser = require('body-parser');

app.use(cors());
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

let tags = [];

app.get('/tag', (req,res) => {
    res.json(tags);
});

app.get('/tag/:id', (req,res) => {
    let id = req.params.id;
    if(!isNaN(id)){
        let find = tags.filter(tag => tag.id == id);
        if(find != undefined){
            res.statusCode = 200;
            res.json(find);
        }else{
            res.statusCode = 404;
            res.json({error: "Not found"});
        }
    }
});

app.post('/tag', (req,res) => {
    let tag = req.body.tag;
    let randomNumber = Math.floor(Math.random() * 65536);
    let insert = {
        id: randomNumber,
        tag
    }
    tags.push(insert);
    res.statusCode = 200;
    res.send({res: "Inserted"});
});

app.listen(process.env.PORT || 4000);
