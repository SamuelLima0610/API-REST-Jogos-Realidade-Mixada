const firebase = require('firebase');

// Set the configuration for your app
// TODO: Replace with your project's config object
var config = {
    apiKey: "AIzaSyDyuMec3UDlvasq1VQZw1Fbwa-cBd5OpGs",
    authDomain: "trimemoria.firebaseapp.com",
    databaseURL: "https://trimemoria.firebaseio.com",
    projectId: "trimemoria",
    storageBucket: "trimemoria.appspot.com",
    messagingSenderId: "537870280556",
    appId: "1:537870280556:web:737430edbf6f80a0f9f549"
};

firebase.initializeApp(config);

// Get a reference to the database service
var database = firebase.database();

module.exports = database;