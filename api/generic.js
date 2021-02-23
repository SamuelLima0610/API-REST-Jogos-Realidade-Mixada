//The methods will be used by the routes, that is responsible to manipulate the data

module.exports = app => {

    //methods auxiliars to manager the data in firebase
    const {data,find,write,getReferenceFirebase} = app.api.methods;
    //methods auxiliars to validate the data
    const {existsOrError} = app.api.validation;

    //references categories in the firebase
    var categories = app.db.ref("categories");


    //GET
    const get = async (req,res) => {
        //get the reference for the collection in firebase passed by route's params
        let {category} = req.params;
        let manager = getReferenceFirebase(category);
        //possible action to do if the data(links to the specific route)
        let HATEOAS = [
            {
                href:`https://rest-api-trimemoria.herokuapp.com/config/${category}`,
                method: "POST",
                rel: `post_${category}`
            }
        ]
        //get all the data
        let information = await data(manager)
        //return a json
        res.json({data: information, _links: HATEOAS});
    }

    //DELETE
    const destroy = (req,res) => {
        //get the category and key(id of the cell in firebase) passed by route's params
        let {category,key} = req.params;
        //possible action to do if the data(links to the specific route)
        let HATEOAS = [
            {
                href:`https://rest-api-trimemoria.herokuapp.com/config/${category}`,
                method: "GET",
                rel: `get_${category}`
            }
        ]
        //remove the data request by client
        app.db.ref(`${category}/` + key).remove()
                                        .then(() => res.json({data: "Excluido com sucesso", _links: HATEOAS}))
                                        .catch(error => res.status(404).send({error,_links:HATEOAS})); 
    }

    //POST or PUT
    const save = async (req,res) => {
        //get the category passed by route's params
        let categoryChosen = req.params.category; 
        //get the information of the category
        let category = await find(categories,categoryChosen,'name')
        //check if the category exist
        if(category.length > 0){
            //get the reference for the collection in firebase passed by route's params
            let manager = getReferenceFirebase(categoryChosen);
            //possible action to do if the data(links to the specific route)
            let HATEOAS = [
                {
                    href:`https://rest-api-trimemoria.herokuapp.com/config/${categoryChosen}`,
                    method: "GET",
                    rel: `get_${categoryChosen}`
                }
            ];
            //check if it is put request
            if(req.params.key){
                //get the data of the cell store in firebase
                let answer = await find(manager,req.body.id,'id');
                //call the method to manipulate the data
                let error = await checkTheBody(req.body,category[0],manager,true,answer[0]);
                //check if it was detected errors
                if(error != undefined){
                    //send a json alert about the error
                    res.statusCode = 404;
                    res.json({error});
                }else{
                    //if tha process was ok, save the update in firebase
                    app.db.ref(`${categoryChosen}/` + req.params.key).set(req.body);
                    //send a json alert about the conclusion
                    res.statusCode = 200;
                    res.send({data: "Updated",_links: HATEOAS});
                }   
            }//or post request
            else{
                //call the method to manipulate the data
                let error = await checkTheBody(req.body,category[0],manager,false,undefined);
                if(error != undefined){
                    //check if it was detected errors
                    res.statusCode = 404;
                    res.json({error});
                }else{
                    //if tha process was ok, save the update in firebase
                    //take a id
                    let randomNumber = Math.floor(Math.random() * 65536);
                    let info = {id: randomNumber, ...req.body}
                    //save the new information in firebase
                    write(info,manager);
                    //send a json alert about the conclusion
                    res.statusCode = 200;
                    res.send({data: "Inserted",_links: HATEOAS});
                }
            }
        }else{
            //alert the error about the category doesn't exist
            res.status(404).send({error: "Não existe nenhuma categoria com esse nome"});
        }
    }

    //GET
    const getById = async (req,res) => {
        //get the reference for the collection in firebase passed by route's params
        let {category,id} = req.params;
        let manager = getReferenceFirebase(category);
        if(!isNaN(id)){
            try{
                //check if exist a data with the id passed by client
                let answer = await find(manager,id,'id');
                existsOrError("Não foi encontrado o tema",answer);
                //possible action to do if the data(links to the specific route)
                let HATEOAS = [
                    {
                        href:`https://rest-api-trimemoria.herokuapp.com/config/${category}/` + answer[0].key,
                        method: "DELETE",
                        rel: `delete_${category}`
                    },
                    {
                        href:`https://rest-api-trimemoria.herokuapp.com/config/${category}/`  + answer[0].key,
                        method: "PUT",
                        rel: `put_${category}`
                    }
                ]
                //alert the conclusion the action
                res.json({data: answer[0], _links: HATEOAS});
            }catch(message){
                //alert about the erros was happened
                res.statusCode = 404;
                res.json({error: message});
            }
        }
    }


    /*Params:
        json: data passed by the body(BodyParser)
        category: the category of the data
        manager: the object to manipulate the category's collection in firebase
        isPut: check if it was a put request
        before: the data safe before(only put request)
    */
    async function checkTheBody(json,category,manager,isPut,before){
        //get keys of the json
        let keys = Object.keys(json);
        try {
            //check if the json has the right number request by category
            if(keys.length != category.attributes.length)
                throw `Esse campo precisa de ${category.attributes.length} só foi fornecido ${keys.length}`
            for(const index in keys){
                //get the param in category with the same name in json's attribute 
                let param = knowAttribute(category,keys[index])
                //check if the json's attribute contains information 
                existsOrError(`O campo ${keys[index]} deve ser preenchido`,json[keys[index]]);
                //check if the params was detected
                if(param == undefined && !isPut){ //enter only if it isn't put request and the param wasn't detected
                    throw `Atributo invalido (${keys[index]})`
                }else if(param == undefined && isPut && keys[index] == "id"){
                    //enter only if it's put request and the param wasn't detected, and the name the json's attribute is "id"
                    break
                }else{
                    //check if the params need to be unique
                    if(param.unique){
                        //look if exist another cell with the same value in the same attribute
                        let exists = await find(manager,json[keys[index]],keys[index]);
                        if(isPut && before != undefined){
                            //enter only if it's put request
                            if(before[keys[index]] != json[keys[index]]){
                                //check if the attrbitute unique continues with the same value or want change
                                //if want to change
                                //look if exist another cell with the same value in the same attribute
                                if(exists.length > 0) throw "Já existe um cadastro com esse valor"    
                            }
                        }else{
                            if(exists.length > 0) throw "Já existe um cadastro com esse valor"
                        }
                    }
                }
            }
            return undefined; 
        } catch (error) {
            return error;
        }
    }

    /*Params:
        category: the name of category
        nameAttribute: the name of attribute to look if contains in category
    */
    function knowAttribute(category, nameAttribute){
        let {attributes} = category;
        let found = attributes.find(element => element.name == nameAttribute)
        return found;
    }

    return {get,destroy,save,getById};

}