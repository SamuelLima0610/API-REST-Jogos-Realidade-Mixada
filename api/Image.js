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
            fs.unlink(`./${answer[0].path}`, (err) => {
                if (err) {
                    console.log("failed to delete local image:"+err);
                } else {
                    app.db.ref("imageTheme/" + key).remove()
                                          .then(() => res.json({data: "Excluido com sucesso", _links: HATEOAS}))
                                          .catch(error => res.status(404).send({error,_links:HATEOAS}));                               
                }
            });
        }catch(message){
            console.log('catch')
            res.status(404).send({error: message});
        }
    }

    const getById = async (req,res) => {
        let id = req.params.id;
        if(!isNaN(id)){
            try{
                let answer = await find(manager,id,'id');
                existsOrError("Imagem não encontrada",answer);
                //res.status(200).send(answer[0].path)
                res.status(200).sendFile(process.cwd() + answer[0].path);
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
            let HATEOAS = [
                {
                    href:"https://rest-api-trimemoria.herokuapp.com/image",
                    method: "GET",
                    rel: "get_image"
                }
            ]
            if(req.params.key){
                existsOrError("O campo diretório deve ser preenchido",path);
                app.db.ref("imageTheme/" + req.params.key).set({
                    id, 
                    theme, 
                    group, 
                    path
                });
                res.statusCode = 200;
                res.send({data: "Updated", _links: HATEOAS});
            }else{
                if(req.file){
                    let randomNumber = Math.floor(Math.random() * 65536);
                    let newPath = `/public/img/${theme}/${theme}(${number})${extension}`;
                    writeImageThemeData(randomNumber, theme, group, newPath, manager);
                    res.statusCode = 200;
                    res.send({data: "Inserted",_links: HATEOAS});
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

    return {get,getById,save,destroy,getImagesTheme}
}