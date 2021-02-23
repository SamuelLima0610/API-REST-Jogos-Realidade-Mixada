module.exports = (app,io) => {

    const {write,data} = app.api.methods;

    var manager = app.db.ref('data'); //references of tags in the firebase
    
    const get = async (req,res) => {
        let info = await data(manager)
        res.json(info);    
    }

    const destroy = (req,res) => {
        let key = req.params.key;
        app.db.ref("data/" + key).remove();
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
        let {detectedData,type} = req.body;
        io.emit(type,{detectedData});
        let randomNumber = Math.floor(Math.random() * 65536);
        let info = {id: randomNumber, data: detectedData};
        write(info,manager);
        res.statusCode = 200;
        res.send({res: "Inserted"});    
    }

    return {get, getById, save, destroy};
}
