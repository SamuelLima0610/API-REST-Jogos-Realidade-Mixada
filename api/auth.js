module.exports =  app => {

    //references of themes in the firebase
    var managerUser = app.db.ref('users');
    var managerCategory = app.db.ref('categories');

    const {find} = app.api.methods;

    const firstAuth = async (req,res,next) => {
        //take the token send by requisition header
        const authToken = req.headers['authorization'];
        if(authToken != undefined){
            let token = authToken.split(' ');
            //look for user that have the key
            let exists = await find(managerUser,token[1],'key');
            //if exist the requisition will be complete
            if(exists.length > 0) next();
            else{
                //not found and send a error
                res.statusCode = 201;
                res.send("Não autorizado");
            }
        }else{
            //the token wasn't sent
            res.statusCode = 201;
            res.send("Não autorizado");
        }
    }

    const secondAuth = async (req,res,next) => {
        //take the token send by requisition header
        const authToken = req.headers['authorization'];
        if(authToken != undefined){
            let token = authToken.split(' ');
            //look for user that have the key
            let exists = await find(managerUser,token[1],'key');
            if(exists.length > 0) {
                let category = req.params.category;
                let existsCategory = await find(managerCategory,category,'name');
                if(existsCategory.length > 0){
                    //look if the user can manager the respective category
                    if(exists[0].name == existsCategory[0].user) next();
                    else{
                        //not found and send a error
                        res.statusCode = 201;
                        res.send("Não autorizado");
                    }
                }else{
                    res.status(404).send({error: "Não existe nenhuma categoria com esse nome"});
                } 
            }
            else{
                //not found and send a error
                res.statusCode = 201;
                res.send("Não autorizado");
            }
        }else{
            //the token wasn't sent
            res.statusCode = 201;
            res.send("Não autorizado");
        }
    }

    const admAuth = async (req,res,next) => {
        //take the token send by requisition header
        const authToken = req.headers['authorization'];
        if(authToken != undefined){
            //look for user that have the key
            let token = authToken.split(' ');
            let exists = await find(managerUser,token[1],'key');
            if(exists.length > 0) {
                //look if the user is adm
                if(exists[0].adm == 1) next();
                else{
                    res.statusCode = 201;
                    res.send("Você não é administrador");
                }
            }
            else{
                //not found and send a error
                res.statusCode = 201;
                res.send("Não autorizado");
            }
        }else{
            //the token wasn't sent
            res.statusCode = 201;
            res.send("Não autorizado");
        }
    }

    return {firstAuth, secondAuth, admAuth}
};