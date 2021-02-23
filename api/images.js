module.exports = app => {

    const {find,getReferenceFirebase} = app.api.methods;
    const {existsOrError} = app.api.validation;

    //action to the route responsible to show all the images' links
    const getImages = async (req,res) => {
        //category(name of the collection in firebase)
        //attribute is the name of attribute to do the search
        //attributeValue is value to look in the search
        let {category,attribute,attributeValue} = req.params
        //get the reference for the collection in firebase passed by route's params
        let manager = getReferenceFirebase(category);
        //possible action to do if the data(links to the specific route)
        let HATEOAS = [
            {
                href:`https://rest-api-trimemoria.herokuapp.com/config/${category}`,
                method: "GET",
                rel: `get_${category}`
            }
        ]
        try{
            //search the data of images storaged in firebase
            let images = await find(manager,attributeValue,attribute);
            //look if found something, if not found throw a error
            existsOrError("Não existe imagens armazenadas neste tema, com esse nome",images);
            //only take the url and the 
            res.json({data: images,_links: HATEOAS});
        }catch(message){
            res.statusCode = 404;
            res.json({error: message});
        }
    }
    return {getImages}
}