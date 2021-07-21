module.exports = app => {

    //generics (All the configuration will be managed by this routes)
    app.get('/config/:category', app.api.auth.secondAuth, app.api.generic.get);
    app.get('/config/:category/:id', app.api.auth.secondAuth, app.api.generic.getById);
    app.post('/config/:category', app.api.auth.secondAuth, app.api.generic.save);
    app.put('/config/:category/:key',app.api.auth.secondAuth,app.api.generic.save);
    app.delete('/config/:category/:key',app.api.auth.secondAuth,app.api.generic.destroy);

    //categories(Manager the categories of the configuration)
    app.get('/category', app.api.auth.firstAuth,app.api.category.get);
    app.get('/category/:id', app.api.auth.firstAuth, app.api.category.getById);
    app.post('/category', app.api.auth.firstAuth, app.api.category.save);
    app.delete('/category/:key',app.api.auth.firstAuth,app.api.category.destroy);

    //Data(Manager the data will be pass by socket.io)
    app.get('/data', app.api.detectedData.get);
    app.get('/data/:id', app.api.detectedData.getById);
    app.post('/data', app.api.detectedData.save);
    app.delete('/data/:key',app.api.detectedData.destroy);

    //images(Routes to manager the information about images)
    app.get('/config/image/:category/:attribute/:attributeValue',app.api.images.getImages);

    //users (Manager the authentication)
    app.get('/users', app.api.auth.admAuth, app.api.users.get);
    app.get('/users/:id', app.api.auth.admAuth, app.api.users.getById);
    app.post('/users', app.api.users.save);
    app.delete('/users/:key',app.api.auth.admAuth, app.api.users.destroy);
}