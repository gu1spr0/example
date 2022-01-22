var LibPos = require('./library');
const net = require('net')
var express = require('express');
var app = express();
const port = 5432;
var ack = "06"
var paso = 1;
var tam = 0;
var isAck1 = false;

function hexStringToByte(str){
    if(!str){
        return new Uint8Array();
    }
    var a = [];
    for(var i=0, len=str.length; i<len; i+=2){
        a.push(parseInt(str.substr(i,2),16));
    }
    return new Uint8Array(a);
}
function isAck(str){
    if(str == ack){
        return true;
    } else{
        return false;
    }
}

var options = {
    allowHalfOpen: true,
    pauseOnConnect: false
};
var server = net.createServer(options);
server.on('connection', function(socket){
    var rport = socket.remotePort;
    var raddr = socket.remoteAddress;
    LibPos.log('INFO','Servidor TCP-IP conectado a: '+raddr+':'+rport);
    var destroyed = socket.destroyed;
    socket.setEncoding(null);
    tam = 0;
    app.locals.sock = socket;
    socket.on('data', function(chunk){
        var rport = socket.remotePort;
        var resp = Buffer.from(chunk);
        var strReply = resp.toString('hex');
        LibPos.log('INFO',`POS: ${resp.toString('hex')} (${resp.length})`);
        tam += resp.length;
        flujoInicializar(strReply, socket);
    });
});
server.listen(port, function () { //'listening' listener
    LibPos.log('INFO','Servidor escuchando');
});

function flujoInicializar(strReply, socket) {
    var resp = '';
    switch (paso) {

        case 1:
            if (isAck1 && tam == 29) {                                  // Respuesta Host
                //socket.write(ackHex); console.log(`Enviado al POS: ${ack}`);
                resp = LibPos.SendAck(socket); //console.log(`CAJA: ACK: ${resp}`);
                respHost += strReply;
                respHostJson = LibPos.RespuestaHostInicializacion(respHost);
                tam = 0;
                paso = -1;
                isAck1 = false;
                isAck2 = false;
                respHost = "";
                //inicializarPos = false;
                app.locals.sock.flujo = 'none';
                //tam = 0; console.log(`Tamaño: ${tam}`);

                break;
            } else if (isAck(strReply)) {
                isAck1 = true;
                tam = 0;
                break;
            } else {
                respHost = strReply;
                break;
            }

        default:
            break;
        //socket.write(ackHex); console.log(`Enviado al POS: ${ack}`);


    }
}