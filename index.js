var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);


app.get('/', function(req, res){
    res.sendFile(__dirname + '/chat.html');
});

io.on('connection', function(socket){
    console.log('a user connected');

    var name = "UNSET";
    var room = -1;

    socket.on('disconnect', function(){
	console.log('remove user from online now');
    });

    socket.on('name', function(uname){
	name = uname;
	console.log('user name set to ' + name);
    });

});


http.listen(3000, function(){
    console.log('listening on *:3000');
});