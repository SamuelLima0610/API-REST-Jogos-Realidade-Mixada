module.exports = app => {
    function existsOrError(message,value){
        if(value == undefined) throw message;
        else if(Array.isArray(value) && value.length == 0) throw message;
        else if(typeof value === "string" && !value.trim()) throw message;
    }

    function notExistsOrError(message,value){
        try{
            existsOrError(message,value);
        }catch(error){
            return;
        }
        throw message;
    }

    return {existsOrError, notExistsOrError};
}