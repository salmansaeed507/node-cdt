var http = require('http');
const config = require('config');

http.createServer(function(req,res){

    res.writeHead(200,{'Content-Type':'text/html'});
    res.write('Hello World');
    res.end();

}).listen(config.get('app.port'), config.get('app.host'),function(){
    console.log("server running...");
});