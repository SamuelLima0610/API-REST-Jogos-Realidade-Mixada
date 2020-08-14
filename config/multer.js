const multer = require('multer');
const fs = require('fs');
const path = require('path');

module.exports = app => {
    const upload = multer({
        storage: multer.diskStorage({//method of image storage     
            destination:function(req,file,cb){
                let theme = req.body.theme;  //the image theme
                let destination = `public/img/${theme}` //location of image
                //exists validation
                if (!fs.existsSync(destination)){
                  //if don't exists, create a new directory
                  fs.mkdir(destination, (err) => {
                      if (err) {
                          return
                      }
                  });
                }
                cb(null,destination);
            },
            filename: function(req,file,cb){ //the creation of file name
                let {theme,number,extension} = req.body; 
                let title = `${theme}(${number})`
                cb(null, title + extension);
              }
        }),
        fileFilter: (req, file, cb) => { //the middleware only accepts three extension: png, jpeg and jpg
            if (path.extname(file.originalname) !== '.png' && path.extname(file.originalname) !== '.jpeg' && path.extname(file.originalname) !== '.jpg') {
                return cb(null, false);
            }
            return cb(null, true);
        }
    });

    return {upload}
}
