const mongoose = require('mongoose');

// Import models in correct order (dependencies first)
const User = require('./User');
const Project = require('./Project');
const Material = require('./Material');
const Quotation = require('./Quotation');

module.exports = {
  User,
  Project,
  Material,
  Quotation
};