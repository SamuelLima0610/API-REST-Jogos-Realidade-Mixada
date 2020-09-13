const fs = require('fs');

module.exports = app => {

    const {writeImageThemeData,find, data} = app.api.methods;
    const {existsOrError} = app.api.validation;

    //references of themes in the firebase
    var manager = app.db.ref('imageTheme');

    const getImagesTheme = async (name) => {
        let answer = await find(manager,name,'theme');
        return answer;
    }

    const get = async (req,res) => {
        let HATEOAS = [
            {
                href:"https://rest-api-trimemoria.herokuapp.com/image",
                method: "POST",
                rel: "post_image"
            }
        ]
        let images = await data(manager)
        res.json({data: images, _links: HATEOAS});
    }

    const destroy = async (req,res) => {
        let HATEOAS = [
            {
                href:"https://rest-api-trimemoria.herokuapp.com/image",
                method: "GET",
                rel: "get_image"
            }
        ]
        let {key,id} = req.params;
        try{
            let answer = await find(manager,id,'id');
            existsOrError("Imagem não encontrada",answer[0]);
            /*fs.unlink(`./${answer[0].path}`, (err) => {
                if (err) {
                    console.log("failed to delete local image:"+err);
                } else {
                    app.db.ref("imageTheme/" + key).remove()
                                          .then(() => res.json({data: "Excluido com sucesso", _links: HATEOAS}))
                                          .catch(error => res.status(404).send({error,_links:HATEOAS}));                               
                }
            });*/
            app.db.ref("imageTheme/" + key).remove()
                                          .then(() => res.json({data: "Excluido com sucesso", _links: HATEOAS}))
                                          .catch(error => res.status(404).send({error,_links:HATEOAS}));
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
                let HATEOAS = [
                    {
                        href:"https://rest-api-trimemoria.herokuapp.com/image/" + answer[0].key,
                        method: "DELETE",
                        rel: "delete_config_game"
                    },
                    {
                        href:"https://rest-api-trimemoria.herokuapp.com/image/"  + answer[0].key,
                        method: "PUT",
                        rel: "put_config_game"
                    }
                ]
                res.json({data: answer[0], _links: HATEOAS});
            }catch(message){
                res.statusCode = 404;
                res.json({error: message});
            }
        }
    }

    const save = async (req,res) => {
        let {theme,group,id,path,url} = req.body;
        try{
            existsOrError("O campo tema deve ser preenchido",theme);
            existsOrError("O campo grupo deve ser preenchido",group);
            let HATEOAS = [
                {
                    href:"https://rest-api-trimemoria.herokuapp.com/image",
                    method: "GET",
                    rel: "get_image"
                }
            ]
            let exists = await find(manager,path,'path');
            if(req.params.key){
                existsOrError("O campo diretório deve ser preenchido",path);
                let answer = await find(manager,id,'id');
                if(path != answer[0].path && exists.length > 0){
                    res.status(404).send({error: "Já existe um imagema cadastrada com esse nome no tema",_links:HATEOAS});
                }else{
                    app.db.ref("imageTheme/" + req.params.key).set({
                        id, 
                        theme, 
                        group, 
                        path,
                        url
                    });
                    res.statusCode = 200;
                    res.send({data: "Updated", _links: HATEOAS});
                }
            }else{
                if(exists.length > 0){
                    res.status(404).send({error: "Já existe um imagema cadastrada com esse nome no tema",_links:HATEOAS});
                }else{
                    let randomNumber = Math.floor(Math.random() * 65536);
                    //let newPath = `/public/img/${theme}/${theme}(${number})${extension}`;
                    writeImageThemeData(randomNumber, theme, group, path, url,manager);
                    res.statusCode = 200;
                    res.send({data: "Inserted",_links: HATEOAS});
                }
            }
        }catch(message){
            res.statusCode = 404;
            res.json({error: message});
        }
    }

    return {get,getById,save,destroy,getImagesTheme}
}