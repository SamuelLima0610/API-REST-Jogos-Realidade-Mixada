var randomstring = require("randomstring");

module.exports = app => {

    const {write,find, data} = app.api.methods;
    const {existsOrError} = app.api.validation;

    //references of themes in the firebase
    var manager = app.db.ref('users');

    //GET
    const get = async (req,res) => {
        //possible action to do if the data(links to the specific route)
        let HATEOAS = [
            {
                href:"https://rest-api-trimemoria.herokuapp.com/users",
                method: "POST",
                rel: "post_users"
            }
        ]
        //get all the data
        let users = await data(manager)
        //take only the name and if it is adm
        users = users.map(user => {
            let basicInformation = {name: user.name, adm: user.adm}
            return basicInformation;
        })
        //return a json
        res.json({data: users,_links: HATEOAS});
    }

    //GET
    const getById = async (req,res) => {
        let id = req.params.id;
        if(!isNaN(id)){
            try{
                let answer = await find(manager,id,'id');
                //possible action to do if the data(links to the specific route)
                existsOrError("Não foi encontrado o usuário",answer);
                let HATEOAS = [
                    {
                        href:"https://rest-api-trimemoria.herokuapp.com/users/" + answer[0].key,
                        method: "DELETE",
                        rel: "delete_users"
                    },
                    {
                        href:"https://rest-api-trimemoria.herokuapp.com/users/"  + answer[0].key,
                        method: "PUT",
                        rel: "put_users"
                    }
                ]
                //return a json
                res.json({data: answer[0], _links: HATEOAS});
            }catch(message){
                //alert the error about the user doesn't exist
                res.statusCode = 404;
                res.json({error: message});
            }
        }
    }

    //DELETE
    const destroy = (req,res) => {
        //possible action to do if the data(links to the specific route)
        let HATEOAS = [
            {
                href:"https://rest-api-trimemoria.herokuapp.com/users",
                method: "GET",
                rel: "get_users"
            }
        ]
        let key = req.params.key;
        //remove the user
        app.db.ref("users/" + key).remove()
                                       .then(() =>  res.json({data: "Excluido com sucesso", _links: HATEOAS}))
                                       .catch(error => res.status(404).send({error}));
    }

    //POST and PUT
    const save = async (req,res) => {
        let {name} = req.body;
        try{
            existsOrError("O campo nome deve ser preenchido",name);
            //possible action to do if the data(links to the specific route)
            let HATEOAS = [
                {
                    href:"https://rest-api-trimemoria.herokuapp.com/users/",
                    method: "GET",
                    rel: "get_users"
                }
            ]
            let exists = await find(manager,name,'name');
            if(req.params.key){
                //Actions to PUT verb
                let answer = await find(manager,id,'id');
                if(name != answer[0].name && exists.length > 0){
                    res.status(404).send({error: "Já existe um cadastro com esse nome",_links:HATEOAS});
                }else{
                    app.db.ref("users/" + req.params.key).set({
                        id, 
                        name
                    });
                    res.statusCode = 200;
                    res.send({data: "Updated",_links: HATEOAS});
                }
            }else{
                //Actions to POST verb
                if(exists.length > 0){
                    res.status(404).send({error: "Já existe um cadastro com esse nome",_links:HATEOAS});
                }else{
                    let randomNumber = Math.floor(Math.random() * 65536);
                    let key = randomstring.generate({
                        length: 12,
                        charset: 'alphabetic'
                    });
                    let id = randomNumber;
                    let info = {id, adm: 0,key, ...req.body}
                    write(info,manager);
                    res.statusCode = 200;
                    res.send({data: "Inserted",_links: HATEOAS , user: {id, key} });
                }
            }
        }catch(message){
            res.statusCode = 404;
            res.json({error: message});
        }
    }

    return {get,getById,destroy,save};

}