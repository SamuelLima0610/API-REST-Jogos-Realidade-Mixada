module.exports = app => {


    const {write,find, data} = app.api.methods;
    const {existsOrError} = app.api.validation;

    //references of themes in the firebase
    var manager = app.db.ref('categories');

    const get = async (req,res) => {
        let HATEOAS = [
            {
                href:"https://rest-api-trimemoria.herokuapp.com/categories",
                method: "POST",
                rel: "post_categories"
            }
        ]
        let categories = await data(manager)
        res.json({data: categories,_links: HATEOAS});
    }

    const getByIdOrName = async (req,res) => {
        let search = req.params.search;
        if(!isNaN(search)){
            try{
                let answer = await find(manager,search,'id');
                existsOrError("Não foi encontrado a categoria",answer);
                let HATEOAS = [
                    {
                        href:"https://rest-api-trimemoria.herokuapp.com/categories/" + answer[0].key,
                        method: "DELETE",
                        rel: "delete_categories"
                    },
                    {
                        href:"https://rest-api-trimemoria.herokuapp.com/categories/"  + answer[0].key,
                        method: "PUT",
                        rel: "put_categories"
                    }
                ]
                res.json({data: answer[0], _links: HATEOAS});
            }catch(message){
                res.statusCode = 404;
                res.json({error: message});
            }
        }else{
            let answer = await find(manager,search,'user');
            existsOrError("Não foi encontrado nenhuma categoria cadastrada pelo usuário",answer);
            let HATEOAS = [
                    {
                        href:"https://rest-api-trimemoria.herokuapp.com/categories/",
                        method: "POST",
                        rel: "post_categories"
                    }
            ]
            res.json({data: answer, _links: HATEOAS});    
        }
    }



    const destroy = (req,res) => {
        let HATEOAS = [
            {
                href:"https://rest-api-trimemoria.herokuapp.com/categories",
                method: "GET",
                rel: "get_categories"
            }
        ]
        let key = req.params.key;
        app.db.ref("categories/" + key).remove()
                                       .then(() =>  res.json({data: "Excluido com sucesso", _links: HATEOAS}))
                                       .catch(error => res.status(404).send({error}));
    }

    const save = async (req,res) => {
        let {name,attributes,user} = req.body;
        try{
            existsOrError("O campo nome deve ser preenchido",name);
            existsOrError("O campo atributos deve ser preenchido",attributes);
            let HATEOAS = [
                {
                    href:"https://rest-api-trimemoria.herokuapp.com/categories",
                    method: "GET",
                    rel: "get_categories"
                }
            ]
            let exists = await find(manager,name,'name');
            if(req.params.key){
                let answer = await find(manager,id,'id');
                if(name != answer[0].name && exists.length > 0){
                    res.status(404).send({error: "Já existe um cadastro com esse nome",_links:HATEOAS});
                }else{
                    app.db.ref("categories/" + req.params.key).set({
                        id, 
                        name, 
                        attributes
                    });
                    res.statusCode = 200;
                    res.send({data: "Updated",_links: HATEOAS});
                }
            }else{
                if(exists.length > 0){
                    res.status(404).send({error: "Já existe um cadastro com esse nome",_links:HATEOAS});
                }else{
                    let randomNumber = Math.floor(Math.random() * 65536);
                    let info = {id: randomNumber, ...req.body}
                    write(info,manager);
                    res.statusCode = 200;
                    res.send({data: "Inserted",_links: HATEOAS});
                }
            }
        }catch(message){
            res.statusCode = 404;
            res.json({error: message});
        }
    }

    return {get,getByIdOrName,destroy,save};

}