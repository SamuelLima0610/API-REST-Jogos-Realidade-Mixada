module.exports = app => {
    const {writeTagData} = app.api.methods;

    var tagsDetected = [];
    var manager = app.db.ref('tags'); //references of tags in the firebase
    
    //take the tag data
    manager.on('value', (data) => {
        tagsDetected = data;
    });

    const get = (req,res) => {
        res.json(tagsDetected);    
    }

    const destroy = (req,res) => {
        let key = req.params.key;
        app.db.ref("tags/" + key).remove();
        res.sendStatus(200); 
    }
    
    const getById = (req,res) => {
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
    }

    const save = (req,res) => {
        let tag = req.body.tag;
        let randomNumber = Math.floor(Math.random() * 65536);
        writeTagData(randomNumber, tag, manager);
        res.statusCode = 200;
        res.send({res: "Inserted"});    
    }

    return {get, getById, save, destroy};
}
