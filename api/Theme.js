module.exports = app => {
    const {writeThemeData,find} = app.api.methods;
    const {existsOrError} = app.api.validation;

    var themes = [];
    //references of themes in the firebase
    var manager = app.db.ref('themes');

    //take the theme data
    manager.on('value', (data) => {
        themes = data;
    });

    const get = (req,res) => {
        res.json(themes);
    }

    const getById = async (req,res) => {
        let id = req.params.id;
        if(!isNaN(id)){
            try{
                let answer = await find(manager,id,'id');
                existsOrError("Não foi encontrado o tema",answer);
                res.json(answer);
            }catch(message){
                res.statusCode = 404;
                res.json({error: message});
            }
        }
    }

    const destroy = (req,res) => {
        let key = req.params.key;
        app.db.ref("themes/" + key).remove().then(() =>  res.sendStatus(200))
                                            .catch(error => res.status(404).send({error}));
    }

    const save = (req,res) => {
        let {name,qntd,id} = req.body;
        try{
            existsOrError("O campo nome deve ser preenchido",name);
            existsOrError("O campo quantidade deve ser preenchido",qntd);
            if(req.params.key){
                app.db.ref("themes/" + req.params.key).set({
                    id, 
                    name, 
                    qntd
                });
                res.statusCode = 200;
                res.send({res: "Updated"});
            }else{
                let randomNumber = Math.floor(Math.random() * 65536);
                writeThemeData(randomNumber, name, qntd, manager);
                res.statusCode = 200;
                res.send({res: "Inserted"});
            }
        }catch(message){
            res.statusCode = 404;
            res.json({error: message});
        }
    }

    return {get, getById, destroy, save};
}