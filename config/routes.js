module.exports = app => {
    //Tag
    app.get('/tag', app.api.Tag.get);
    app.get('/tag/:id', app.api.Tag.getById);
    app.post('/tag', app.api.Tag.save);
    app.delete('/tag/:key',app.api.Tag.destroy);

    //Themes
    app.get('/theme',app.api.Theme.get);
    app.get('/theme/:id',app.api.Theme.getById);
    app.post('/theme',app.api.Theme.save);
    app.put('/theme/:key',app.api.Theme.save);
    app.delete('/theme/:key',app.api.Theme.destroy);

    //ImageThemes
    app.get('/image', app.api.Image.get);
    app.get('/image/:id',app.api.Image.getById);
    app.post('/image', app.config.multer.upload.single("file"), app.api.Image.save);
    app.put('/image/:key',app.api.Image.save);
    app.delete('/image/:key/:id',app.api.Image.destroy);

    //Configuration Game
    app.get('/configGame',app.api.ConfigurationGame.get);
    app.get('/configGame/:id',app.api.ConfigurationGame.getById);
    app.post('/configGame',app.api.ConfigurationGame.save);
    app.put('/configGame/:key',app.api.ConfigurationGame.save);
    app.delete('/configGame/:key',app.api.ConfigurationGame.destroy);
}