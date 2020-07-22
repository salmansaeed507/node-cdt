var express = require('express');
var app = express();

app.set('view engine','pug');
app.set('views','./views');
app.use(express.static('public'));

app.get('/', function(req, res){
   res.render("index");
});

var server = app.listen(3000);

const io = require('socket.io')(server);

io.on('connection', function(socket) {

    socket.on('draw',function(data){
        io.sockets.emit('draw',data);
    });

    socket.on('drawShape', function(data){
        io.sockets.emit('drawShape',data);
    });
    
    socket.on('disconnect', function () {
       console.log('A user disconnected');
    });
});

 
