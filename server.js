var _ = require('lodash');
var express = require('express');
var app = express();

app.use(require('morgan')('dev'));
app.use(require('body-parser')());
app.use(require('method-override')('_method'));
app.use(express.static(__dirname + '/public'));

var env = process.env.NODE_ENV || 'development';
var knexConfig = require('./knexfile.js')[env];
var knex = require('knex')(knexConfig);
var bookshelf = require('bookshelf')(knex);

var Person = bookshelf.Model.extend({
  tableName: 'people'
});


var people = {};
var peopleSequence = (function() {
  var sequence = 1;
  return function() {
    var result = sequence;
    sequence += 1;
    return result;
  };
}());

app.get('/', function(req, res) {
  res.redirect('/home/');
});

app.get('/api/people', function(req, res) {
  Person.fetchAll().then(function(result) {
    res.json({ people: result.toJSON()});
  });

});

app.post('/api/people', function(req, res) {
  Person.forge({ name: req.param('name') }).save().then(function(person) {
    res.json({ person: person.toJSON() });
  });

});

app.get('/api/people/:id', function(req, res) {
  //TODO: can't get id greater than database contents.
  Person.where({ id:req.params.id }).fetch().then(function(person) {
    res.json({ person: person.toJSON() });
  }).done();
});
app.put('/api/people/:id', function(req, res) {
  Person.where({ id:req.params.id }).fetch()
  .then(function(person) {
    person.set({
      name: req.body.name,
      address: req.body.address
    });
    return person.save();
  })
  .then(function(person) {
    res.json({ person: person.toJSON() });
  });
});

app.delete('/api/people/:id', function(req, res) {
  Person.where({ id:req.params.id }).fetch()
  .then(function(person) {
    return person.destroy();
  })
  .then(function() {
    res.json({ status: 'ok' });
  });
});

var server = app.listen(process.env.PORT || 3000, function() {
  console.log('Listening on port %d', server.address().port);
});