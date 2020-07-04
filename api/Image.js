module.exports = app => {

    const {writeImageThemeData,find} = app.api.methods;
    const {existsOrError} = app.api.validation;

    var images = [];

    //references of themes in the firebase
    var manager = app.db.ref('imageTheme');

    //take the theme data
    manager.on('value', (data) => {
        images = data;
    });

    const get = (req,res) => {
        res.json(images);
    }

    const destroy = async (req,res) => {
        let {key,id} = req.params;
        try{
            let answer = await find(manager,id,'id');
            existsOrError("Imagem não encontrada",answer);
            fs.unlink(answer.path , err => {
                if (err) res.status(400).send({err});
                app.db.ref("imageTheme/" + key).remove().then(() =>  res.sendStatus(200))
                                                        .catch(error => res.status(404).send({error}))
            });
            res.status(200).send("Teste");
        }catch(message){
            res.status(404).send({error: message});
        }
    }

    const getById = async (req,res) => {
        let id = req.params.id;
        if(!isNaN(id)){
            try{
                let answer = await find(manager,id,'id');
                existsOrError("Imagem não encontrada",answer);
                res.status(200).send(answer);
                //res.status(200).sendFile(__dirname + answer.path);
            }catch(message){
                res.statusCode = 404;
                res.json({error: message});
            }
        }
    }

    const save = (req,res) => {
        let {theme,group,id,path,number,extension} = req.body;
        try{
            existsOrError("O campo tema deve ser preenchido",theme);
            existsOrError("O campo grupo deve ser preenchido",group);
            if(req.params.key){
                existsOrError("O campo diretório deve ser preenchido",path);
                app.db.ref("imageTheme/" + req.params.key).set({
                    id, 
                    theme, 
                    group, 
                    path
                });
                res.statusCode = 200;
                res.send({res: "Updated"});
            }else{
                if(req.file){
                    let randomNumber = Math.floor(Math.random() * 65536);
                    let newPath = `/public/img/${theme}/${theme}(${number})${extension}`;
                    writeImageThemeData(randomNumber, theme, group, newPath, manager);
                    res.statusCode = 200;
                    res.send({res: "Inserted"});
                }else{
                    res.statusCode = 404;
                    res.json({error: "Não aceita esse formato de arquivo"});
                }
            }
        }catch(message){
            res.statusCode = 404;
            res.json({error: message});
        }
    }

    return {get,getById,save,destroy}
}