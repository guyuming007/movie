/**
 * Created by newuser on 2017/11/16.
 */
const mongoose = require('mongoose')
const movieSchema = require('../schema/movie')

const movieModel = mongoose.model('Movie', movieSchema)

module.exports = movieModel;