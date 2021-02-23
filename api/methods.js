module.exports = app => {

    function getReferenceFirebase(category){
        //references in the firebase
        var manager = app.db.ref(category);
        return manager;
    }

    //function to insert a data in firebase
    //new
    function write(toInsert, manager){
        let ref = manager.push();
        ref.set(toInsert);
    }

    //function to look the cel of a specific
    async function find (manager, value, attribute){
        let find = [];
        await manager.orderByValue().once("value", tags => {
            tags.forEach( data => {
                if(data.val()[attribute] == value){
                    find.push({...data.val(),key: data.key});
                }
            });
        }); 
        return find;
    }

    async function data(manager){
        var list = [];
        await manager.once('value' , elements => {
            elements.forEach(data => {
                list.push({...data.val()})
            })
        })
        return list
    }

    return {find, data , write, getReferenceFirebase}
}