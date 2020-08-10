module.exports = app => {
    const {writeConfigurationGameData,find,data} = app.api.methods;
    const {existsOrError} = app.api.validation;

    //references of themes in the firebase
    var manager = app.db.ref('configuration');
    
    const get = async (req,res) => {
        let HATEOAS = [
            {
                href:"https://rest-api-trimemoria.herokuapp.com/configGame",
                method: "POST",
                rel: "post_config_game"
            }
        ]
        let configurationsGame = await data(manager)
        res.json({data:configurationsGame, _links: HATEOAS});
    }

    const destroy = (req,res) => {
        let HATEOAS = [
            {
                href:"https://rest-api-trimemoria.herokuapp.com/configGame",
                method: "GET",
                rel: "get_config_game"
            }
        ]
        let key = req.params.key;
        app.db.ref("configuration/" + key).remove()
                                          .then(() => res.json({data: "Excluido com sucesso", _links: HATEOAS}))
                                          .catch(error => res.status(404).send({error,_links:HATEOAS})); 
    }

    const getById = async (req,res) => {
        let id = req.params.id;
        if(!isNaN(id)){
            let answer = await find(manager,id,'id');
            try{
                existsOrError("Não existe configuração com esse id",answer);
            }catch(message){
                res.statusCode = 404;
                res.json({error: message});
            }
            let HATEOAS = [
                {
                    href:"https://rest-api-trimemoria.herokuapp.com/configGame/" + answer[0].key,
                    method: "DELETE",
                    rel: "delete_config_game"
                },
                {
                    href:"https://rest-api-trimemoria.herokuapp.com/configGame/"  + answer[0].key,
                    method: "PUT",
                    rel: "put_config_game"
                }
            ]
            res.json({data: answer[0], _links: HATEOAS});
        }
    }
    
    const save = (req,res) => {
        let {name,configurationTag,id} = req.body;
        try{
            existsOrError("O campo nome deve ser preenchido",name);
            existsOrError("O campo das tags deve ser preenchido",configurationTag);
            let HATEOAS = [
                {
                    href:"https://rest-api-trimemoria.herokuapp.com/configGame",
                    method: "GET",
                    rel: "get_config_game"
                }
            ]
            res.statusCode = 200;
            if(req.params.key){
                app.db.ref("configuration/" + req.params.key).set({
                    id, 
                    name, 
                    configurationTag
                });
                res.send({data: "Updated",_links: HATEOAS});
            }else{
                let randomNumber = Math.floor(Math.random() * 65536);
                writeConfigurationGameData(randomNumber,name,configurationTag,manager);
                res.send({data: "Inserted",_links: HATEOAS});
            }
        }catch(message){
            res.status(404).send({error: message,_links:HATEOAS});
        }
    }

    return {save,get,getById,destroy}
}