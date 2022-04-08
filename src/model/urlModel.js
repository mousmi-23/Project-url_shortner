const mongoose = require('mongoose');

const urlSchema = new mongoose.Schema({

    urlCode : {
        type : String,
        required : true,
        unique : true,
        lowercase : true,
        trim : true 
        
    }, 
    
    longUrl : {
        type : String,
        required : true,
        trim : true,
        match : [/(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-/]))?/]
    },

    shortUrl : {
        type : String,
        required : true,
        unique : true,
        trim : true
    }

}, { timestamps : true })


module.exports = mongoose.model('createUrl', urlSchema)