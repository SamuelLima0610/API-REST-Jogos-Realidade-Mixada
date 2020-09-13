module.exports = app => {

    const {writeThemeData,find, data} = app.api.methods;
    const {existsOrError} = app.api.validation;
    const {getImagesTheme} = app.api.Image;

    //references of themes in the firebase
    var manager = app.db.ref('themes');


    const get = async (req,res) => {
        let HATEOAS = [
            {
                href:"https://rest-api-trimemoria.herokuapp.com/theme",
                method: "POST",
                rel: "post_theme"
            }
        ]
        let themes = await data(manager)
        res.json({data: themes,_links: HATEOAS});
    }

    const getImages = async (req,res) => {
        let theme = req.params.theme
        let HATEOAS = [
            {
                href:"https://rest-api-trimemoria.herokuapp.com/theme",
                method: "GET",
                rel: "get_theme"
            }
        ]
        try{
            let answer = await getImagesTheme(theme);
            existsOrError("Não existe imagens armazenadas neste tema, com esse nome",answer);
            let images = answer.map(data => {
                let cel = {
                    href: 'https://rest-api-trimemoria.herokuapp.com/image/'+ data.id,
                    group: data.group
                };
                return cel;
            });
            res.json({data: images,_links: HATEOAS});
        }catch(message){
            res.statusCode = 404;
            res.json({error: message});
        }
    }

    const getById = async (req,res) => {
        let id = req.params.id;
        if(!isNaN(id)){
            try{
                let answer = await find(manager,id,'id');
                existsOrError("Não foi encontrado o tema",answer);
                let HATEOAS = [
                    {
                        href:"https://rest-api-trimemoria.herokuapp.com/theme/" + answer[0].key,
                        method: "DELETE",
                        rel: "delete_theme"
                    },
                    {
                        href:"https://rest-api-trimemoria.herokuapp.com/theme/"  + answer[0].key,
                        method: "PUT",
                        rel: "put_theme"
                    }
                ]
                res.json({data: answer[0], _links: HATEOAS});
            }catch(message){
                res.statusCode = 404;
                res.json({error: message});
            }
        }
    }

    const destroy = (req,res) => {
        let HATEOAS = [
            {
                href:"https://rest-api-trimemoria.herokuapp.com/theme",
                method: "GET",
                rel: "get_theme"
            }
        ]
        let key = req.params.key;
        app.db.ref("themes/" + key).remove().then(() =>  res.json({data: "Excluido com sucesso", _links: HATEOAS}))
                                            .catch(error => res.status(404).send({error}));
    }

    const save = async (req,res) => {
        let {name,qntd,id} = req.body;
        try{
            existsOrError("O campo nome deve ser preenchido",name);
            existsOrError("O campo quantidade deve ser preenchido",qntd);
            let HATEOAS = [
                {
                    href:"https://rest-api-trimemoria.herokuapp.com/theme",
                    method: "GET",
                    rel: "get_theme"
                }
            ]
            let exists = await find(manager,name,'name');
            if(req.params.key){
                let answer = await find(manager,id,'id');
                if(name != answer[0].name && exists.length > 0){
                    res.status(404).send({error: "Já existe um cadastro com esse nome",_links:HATEOAS});
                }else{
                    app.db.ref("themes/" + req.params.key).set({
                        id, 
                        name, 
                        qntd
                    });
                    res.statusCode = 200;
                    res.send({data: "Updated",_links: HATEOAS});
                }
            }else{
                if(exists.length > 0){
                    res.status(404).send({error: "Já existe um cadastro com esse nome",_links:HATEOAS});
                }else{
                    let randomNumber = Math.floor(Math.random() * 65536);
                    writeThemeData(randomNumber, name, qntd, manager);
                    res.statusCode = 200;
                    res.send({data: "Inserted",_links: HATEOAS});
                }
            }
        }catch(message){
            res.statusCode = 404;
            res.json({error: message});
        }
    }

    return {get, getById, destroy, save, getImages};
}