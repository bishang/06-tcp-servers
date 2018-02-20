'use strict';

const net = require('net');
const EE = require('events');
const Client = require('./model/client.js');
const PORT = process.env.PORT || 3000;
const server = net.createServer();
const ee = new EE();

const pool = [];

ee.on('@all', function(client, string) {
  pool.forEach(c => {
    c.socket.write( `${client.nickname}: ${string}`);
  });
});

ee.on('@nickname' , function(client, string) {
  let nickname = string.split(' ').shift().trim();
  let oldNickname = client.nickname;
  client.nickname = nickname;
  pool.forEach(c => {
    c.socket.write(`Nickname of ${oldNickname} has been changed to ${nickname}.\n`);
  });
  
});

ee.on('@dm', function(client, string) {
  var nickname = string.split(' ').shift().trim();
  var message = string.split(' ').splice(1).join(' ').trim();
  pool.forEach(c => {
    if(c.nickname === nickname) {
      c.socket.write(`${client.nickname}: ${message}`);
    }
  });
});

ee.on('@quit', function(client) {
  client.socket.end();
});

ee.on('@list', function(client) {
  var list = [];
  pool.forEach(c => {
    list.push(c.nickname);
  });
  client.socket.write(`Connected users: ${list.join(', ')}\n`);
});

var helpText = '\n @all <message> Sends a message to everyone connected.\n @nickname <new-nickname> Allows you to change your nickname.\n @dm <target-user> <message> Sends a direct message to a specific user.\n @list Will list all current users.\n @quit Will end your current session.\n';

ee.on('@help', function(client) {
  client.socket.write(`${helpText}\n`);
});

ee.on('default', function(client) {
  client.socket.write('not a command - please use an @ symbol\n');
});

server.on('connection', function(socket) {
  var client = new Client(socket);
  pool.push(client);

  pool.forEach(c => {
    c.socket.write(`${client.nickname} has joined the chat\n`);
  });

  socket.on('data', function(data) {
    const command = data.toString().split(' ').shift().trim();

    if(command.startsWith('@')) {
      ee.emit(command, client, data.toString().split(' ').splice(1).join(' '));
      console.log('@command:', command);
      console.log('after the command:', data.toString().split(' ').splice(1).join(' '));
      return;
    }
    ee.emit('default', client, data.toString());
  });

  socket.on('error', function(error) {
    console.log(error);
  });

  socket.on('close', function() {
    var index = pool.indexOf(client);
    pool.splice(index, 1);
    pool.forEach(c => {
      c.socket.write(`${client.nickname} has left the chat\n`);
    });
  });
});

server.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});