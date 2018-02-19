'use strict';

const net = require('net');
const EE = require('events');
const Client = require('./model/client.js');
const PORT = process.env.PORT || 3000;
const server = net.createServer();
const ee = new EE();

const pool = [];

// allows to broadcast message to everyone
ee.on('@all', function(client, string) {
  pool.forEach( c => {
    c.socket.write( `${client.nickname}: ${string}`);
  });
});

// allows to change nickname
ee.on('@nickname' , function(client, string) {
  let nickname = string.split(' ').shift().trim();
  client.nickname = nickname;
  client.socket.write(`user nickname has been changed to ${nickname}\n`);
});

// allows you to direct message a user
ee.on('@dm', function(client, string) {
  var nickname = string.split(' ').shift().trim();
  var message = string.split(' ').splice(1).join(' ').trim();
  pool.forEach(c => {
    if(c.nickname === nickname) {
      c.socket.write(`${client.nickname}: ${message}`);
    }
  });
});

ee.on('@quit', function(client, string) {
  pool.forEach( c => {
    c.socket.write( `${client.nickname} has left the chat`);
  });

});

// gives you a list of current users
ee.on('@list', function(client) {
  var list = [];
  pool.forEach(function(each) {
    list.push(each.nickname);
  });
  client.socket.write(`Connected users: ${list.join(', ')}\n`);
});

// gives you possible commands when you type @help
ee.on('@help', function(client) {
  client.socket.write('what happens when you do @help\n');
});

ee.on('default', function(client, string) {
  client.socket.write('not a command - please use an @ symbol\n');
});

server.on('connection', function(socket) {
  var client = new Client(socket);
  pool.push(client);

  socket.on('data', function(data) {
    const command = data.toString().split(' ').shift().trim();

    if(command.startsWith('@')) {
      ee.emit(command, client, data.toString().split(' ').splice(1).join(' '));
      console.log('my command after the at:', data.toString().split(' ').splice(1).join(' '));
      return;
    }
    ee.emit('default', client, data.toString());
  });
  socket.on('error', function(error) {
    console.log(error);
  });
  socket.on('close', function(close) {

  });
});

server.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});