var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var online = [];
var banned = [
    "steve",
    "bob"
];

app.get('/', function(req, res){
    res.sendFile(__dirname + '/chat.html');
});

io.on('connection', function(socket){
    var name = "UNSET";
    var room = -1;
    var valid_user = false;

    socket.on('disconnect', function(){
	console.log('remove user: ' + name +' from online now');
    });

    socket.on('name', function(uname){
	var index;
	var is_banned=false;
	for (index=0; index<banned.length; index++){
	    if(uname == banned[index]){
		is_banned=true;
	    }
	}
	if(is_banned){
	    socket.emit('name_response', "Failure");
	} else {
	    socket.emit('name_response', "Success");
	    valid_user = true;
	    name = uname;
	    console.log('user ' + name + " has connected.");
	    online[online.length] = name;
	}
    });

    socket.on('message', function(message){
	if(valid_user){
	    console.log('User ' + name + ' has sent: ' + message);
	}
    });

});


http.listen(3000, function(){
    console.log('listening on *:3000');
});