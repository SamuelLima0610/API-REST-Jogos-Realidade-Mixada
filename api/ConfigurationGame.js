module.exports = app => {
    const {writeConfigurationGameData,find} = app.api.methods;
    const {existsOrError} = app.api.validation;

    var configurationsGame = [];
    //references of themes in the firebase
    var manager = app.db.ref('configuration');
    
    //take the config data
    manager.on('value', (data) => {
        configurationsGame = data;
    });

    const get = (req,res) => {
        res.json(configurationsGame);
    }

    const destroy = (req,res) => {
        let key = req.params.key;
        app.db.ref("configuration/" + key).remove()
                                          .then(() => res.sendStatus(200))
                                          .catch(error => res.status(404).send({error})); 
    }

    const getById = async (req,res) => {
        let id = req.params.id;
        if(!isNaN(id)){
            try{
                let answer = await find(manager,id,'id');
                existsOrError("Não existe configuração com esse id",answer);
            }catch(message){
                res.statusCode = 404;
                res.json({error: message});
            }
            res.json(answer);
        }
    }
    
    const save = (req,res) => {
        let {name,configurationTag,id} = req.body;
        try{
            existsOrError("O campo nome deve ser preenchido",name);
            existsOrError("O campo das tags deve ser preenchido",configurationTag);
            if(req.params.key){
                app.db.ref("configuration/" + req.params.key).set({
                    id, 
                    name, 
                    configurationTag
                });
                res.statusCode = 200;
                res.send({res: "Updated"});
            }else{
                let randomNumber = Math.floor(Math.random() * 65536);
                writeConfigurationGameData(randomNumber,name,configurationTag,manager);
                res.statusCode = 200;
                res.send({res: "Inserted"});
            }
        }catch(message){
            res.status(404).send({error: message});
        }
    }

    return {save,get,getById,destroy}
}