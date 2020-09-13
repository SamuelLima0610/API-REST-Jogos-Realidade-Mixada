module.exports = app => {
    //function to create a new information
    function writeTagData(id,tag,manager) {
        // Generate a reference to a new location and add some data using push()
        let tagsRef = manager.push();
        tagsRef.set({
            id,
            tag
        });
    }

    //function to create a new information
    function writeThemeData(id, name, qntd, manager) {
        // Generate a reference to a new location and add some data using push()
        let themesRef = manager.push();
        themesRef.set({
            id,
            name,
            qntd
        });
    }

    //function to create a new information
    function writeImageThemeData(id, theme, group, path, url, manager) {
        // Generate a reference to a new location and add some data using push()
        let imageThemesRef = manager.push();
        imageThemesRef.set({
            id,
            theme,
            group,
            path,
            url
        });
    }

    //function to create a new information
    function writeConfigurationGameData(id, name, configurationTag, qntd,manager) {
        // Generate a reference to a new location and add some data using push()
        let configurationRef = manager.push();
        configurationRef.set({
            id,
            name,
            qntd,
            configurationTag
        });
    }


    //function to look the cel of a specific
    async function find (manager, value, attribute){
        let find = [];
        await manager.orderByValue().once("value", tags => {
            tags.forEach( data => {
                if(data.val()[attribute] == value){
                    let json = {...data.val()}
                    //console.log(json) 
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

    return {writeTagData, writeThemeData, writeImageThemeData, writeConfigurationGameData, find, data}
}