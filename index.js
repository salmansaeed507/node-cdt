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

    socket.broadcast.emit('needcanvas');

    var canvas = null;
    socket.on('clientcanvas', function(data){
        if (!canvas) {
            canvas = data;
            socket.broadcast.emit('updatecanvas',canvas);
        }
    });

    socket.on('draw',function(data){
        socket.broadcast.emit('draw',data);
    });

    socket.on('drawShape', function(data){
        socket.broadcast.emit('drawShape',data);
    });

    socket.on('clear', function(){
        socket.broadcast.emit('clear');
    });
    
    socket.on('disconnect', function () {
       console.log('A user disconnected');
    });
});

 
