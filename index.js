/*
index.js
Written by Sam Weiss

This file is a node.js based webserver designed to serve a chat server.
It uses express and socket.io to create a clean an minimal message and web
server.

*/


var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

//The online data structure will contain information about who is online
//and what chat room they are in, this will aid in both searching and 
//sending messages
var online = [];

//The banned data structure simply contains a list of handles who have
//been banned
//TODO: read this from a file somewhere
var banned = [
    "steve",
    "bob"
];

//stores the number of rooms
var num_rooms = 20;

//This handles requests for the main page, and serves chat.html to users
//who request it.
app.get('/', function(req, res){
    res.sendFile(__dirname + '/chat.html');
});

//this handles requests for the search page, and serves search.html to users
//who request it.
//TODO: actually make this
app.get('/search/', function(req, res){
    res.sendFile(__dirname + '/search.html');
});

//This line of code triggers when we get a new socket connection, it will
//wait and listen for events (all of the socket.on statements) and then
//will execute some function
//TODO: implement search
io.on('connection', function(socket){
    var name = "UNSET";
    var room = -1;
    var valid_user = false;

    //when a user disconnects we want to remove them from the online array
    socket.on('disconnect', function(){
	var index;
	// if their name is unset it means they didn't choose a name, and 
	// therefore are not in the online array
	if (name != "UNSET"){
	    for (index=0; index<online.length; index++){
		if(online[index].name == name && online[index].room == room){
		    online.splice(index, 1);
		}
	    }
	}
    });

    //When the user connects to chat they are asked to choose a name, this
    //handles that information
    socket.on('name', function(uname){
	var index;
	var is_banned=false;
	//check and see if the user is banned
	for (index=0; index<banned.length; index++){
	    if(uname == banned[index]){
		is_banned=true;
	    }
	}
	if(is_banned){
	    //if they are, return failure and don't put them online
	    socket.emit('name_response', "Failure");
	} else {
	    //if they are not, return success, put them online, store their name
	    //and mark their messages as valid
	    socket.emit('name_response', "Success");
	    valid_user = true;
	    name = uname;
	    console.log('user ' + name + " has connected.");
	    
	    online[online.length] = {
		name:name,
		room:room,
		socket:socket,
	    };
	}
    });

    socket.on('message', function(message){
	//TODO: do something here
	var index;
	if(!valid_user){
	    return;
	}
	if(room == -1){
	    socket.emit('error', "Error: no room set");
	    return;
	}
	var msg = {
	    name: name,
	    message: message,
	};
	//cycle through the index and emit to everyone in your room
	for (index=0; index<online.length; index++){
	    if(online[index].room == room){
		online[index].socket.emit('message', msg);
	    }
	}
    });
    
    //allows the user to choose a chat room to enter
    socket.on("choose_room", function(room_number){
	if(valid_user and room_number <= num_rooms){
	    for (index=0; index<online.length; index++){
		if(online[index].name == name && online[index].room == room){
		    online[index].room = room_number;
		}
	    }
	    room = room_number;
	}
    });

    socket.on("request_online", function(){
	//strip all of the sockets out of online and send it
	var temp = [];
	var index;
	for(index=0; index<online.length; index++){
	    temp[temp.length] = {
		name:online[index].name,
		room:online[index].room
	    };
	}
	socket.emit('online_users', temp);
    });

});


http.listen(3000, function(){
    console.log('listening on *:3000');
});