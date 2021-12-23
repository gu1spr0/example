var LibPos = require('./library-pos');
const net = require('net');
var express = require('express');
var app = express();
var porth = 3000;	// Servidor WEB
// The port on which the server is listening.
const port = 5432;	// Servidor TCP
var paso = 1;
var tam = 0;

var ack = "06";

var montoBOB = 0.00;
var reciboTRA = "";
var respHost = "";
var respHostJson = "";


var isAck1 = false;
var isAck2 = false;
var isAck3 = false;
var isAck4 = false;
var isAck5 = false;


function hexStringToByte(str) {
  if (!str) {
    return new Uint8Array();
  }
  var a = [];
  for (var i = 0, len = str.length; i < len; i+=2) {
    a.push(parseInt(str.substr(i,2),16));
  }
  return new Uint8Array(a);
}



function isAck(str) {
    if (str == ack) {
        return true;
    } else {
        return false;
    }
}


// Parámetros de inicio del servidor. allowHalfOpen debe ser siempre true
var options = {
  allowHalfOpen: true,
  pauseOnConnect: false
};

var server = net.createServer(options);     // Creación del servidor TCP

server.on('connection', function (socket) {
    var rport = socket.remotePort;
    var raddr = socket.remoteAddress;
    LibPos.log('INFO','Servidor TCP-IP conectado a: ' + raddr + ':' + rport);
    var destroyed = socket.destroyed;
    socket.setEncoding(null);
    tam = 0;
    app.locals.sock = socket;


    // The server can also receive data from the client by reading from its socket.
    socket.on('data', function (chunk) {
        var rport = socket.remotePort;
        var resp = Buffer.from(chunk);
        var strReply = resp.toString('hex');
        LibPos.log('INFO',`POS: ${resp.toString('hex')} (${resp.length})`);
        tam += resp.length;
        //LibPos.log('INFO',`Tam:  ${tam}`);
        var flujo = app.locals.sock.flujo;


        if (flujo == 'pagoChip') {
            flujoChip(strReply, socket);
        } else if (flujo == 'pagoChipMulti') {
            flujoChipMulti(strReply, socket);
        } else if (flujo == 'pagoCtl') {
            flujoCtl(strReply, socket);
        } else if (flujo == 'pagoCtlMulti') {
            flujoCtlMulti(strReply, socket);
        } else if (flujo == 'anulacionTrans') {
            flujoAnulacion(strReply, socket);
        } else if (flujo == 'anulacionTransMulti') {
            flujoAnulacionMulti(strReply, socket);
        } else if (flujo == 'cierrePos') {
            flujoCierre(strReply, socket);
        } else if (flujo == 'cierrePosMulti') {
            flujoCierreMulti(strReply, socket);
        } else if (flujo == 'inicializarPos') {
            flujoInicializar(strReply, socket);
        }
    });

    // When the client requests to end the TCP connection with the server, the server
    // ends the connection.
    socket.on('close', function (data) {
        var islistening = server.listening;
        var destroyed = socket.destroyed;
        LibPos.log('WARN','Socket Close');
        
    });

    // Don't forget to catch error, for your own sake.
    socket.on('error', function (err) {
        var islistening = server.listening;
        var destroyed = socket.destroyed;
        LibPos.log('ERROR','Socket Error');
        //LibPos.log('ERROR','-- Servidor TCP escuchando: ' + islistening);
        //LibPos.log('ERROR','-- Socket destroyed: ' + destroyed);
        LibPos.log('ERROR',`-- Error: ${err.toString()}`);
        LibPos.log('ERROR',err.stack);
        
    });

    socket.on('end', function (data) {
        var islistening = server.listening;
        var destroyed = socket.destroyed;
        LibPos.log('WARN','Socket End');
        
    });
});

server.listen(port, function () { //'listening' listener
    LibPos.log('INFO','Servidor escuchando');
});

// emits when any error occurs -> calls closed event immediately after this.
server.on('error', function (error) {
    LibPos.log('ERROR','Server Error');
    LibPos.log('ERROR','-- Error: ' + error.toString());
});


var serverweb = app.listen(porth, () => console.log(`Servidor web NodeJs escuchando en el puerto ${porth}!`));

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.get('/chip/:monto', function (req, res) {
    //res.send(req.params)
    var sock2 = req.app.locals.sock;
    var rport = sock2.remotePort;
    var monto = req.params.monto;
    var montob = parseFloat(monto);
    respHostJson = "";
    req.app.locals.sock.flujo = "pagoChip";
    
    LibPos.log('INFO','Pago con tarjeta Chip:' + montob);
    //res.send('Pago con tarjeta Chip:' + montob);
    //console.log('-- Socket: ' + rport);
    if (isNaN(montob)) {
        res.send('El monto debe ser un numero entero mayor a cero');
    } else {
        montob = montob.toFixed(2);
        montoBOB = LibPos.ValidarMonto(montob);
        //res.send('Monto:' + montoBOB);
        paso = 1; tam = 0;
        //sock2.write(solConnHex); console.log(`CAJA: Enviado solConn al POS: ${solConn}`);
        LibPos.SendConnectionChip(sock2);
        var intr = setInterval(function () {
            var lenr = respHostJson.length;
            if (lenr > 1) {
                LibPos.log('INFO','Resp:' + respHostJson);
                res.send(respHostJson.toString());
                clearInterval(intr);
                respHost = "";
                
            }
        }, 3000);
    }
});

app.get('/chipmulti/:monto/:idcom', function (req, res) {
    //res.send(req.params)
    var sock2 = req.app.locals.sock;
    var rport = sock2.remotePort;
    var monto = req.params.monto;
    var montob = parseFloat(monto);
    var idcom = req.params.idcom;
    var idcomb = parseInt(idcom);
    respHostJson = "";
    req.app.locals.sock.flujo = "pagoChipMulti";
    
    LibPos.log('INFO','Pago con tarjeta Chip Multicomercio:' + montob + ' - IdCom:' + idcomb);
    //res.send('Pago con tarjeta Chip:' + montob);
    //console.log('-- Socket: ' + rport);
    if (isNaN(montob)) {
        res.send('El monto debe ser un numero entero mayor a cero');
    } else {
        montob = montob.toFixed(2);
        montoBOB = LibPos.ValidarMonto(montob);
        //res.send('Monto:' + montoBOB);
        paso = 1; tam = 0;
        //sock2.write(solConnHex); console.log(`CAJA: Enviado solConn al POS: ${solConn}`);
        LibPos.SendConnectionChipMulticom(sock2, idcomb);
        var intr = setInterval(function () {
            var lenr = respHostJson.length;
            if (lenr > 1) {
                LibPos.log('INFO','Resp:' + respHostJson);
                res.send(respHostJson.toString());
                clearInterval(intr);
                respHost = "";
                
            }
        }, 3000);
    }
});

app.get('/ctl/:monto', function (req, res) {
    //res.send(req.params)
    var sock2 = req.app.locals.sock;
    var rport = sock2.remotePort;
    var monto = req.params.monto;
    var montob = parseFloat(monto);
    respHostJson = "";
    req.app.locals.sock.flujo = "pagoCtl";

    LibPos.log('INFO','Pago con tarjeta CTL:' + req.params.monto);
    //res.send('Pago con tarjeta CTL:' + req.params.monto);
    //console.log('-- Socket: ' + rport);
    if (isNaN(montob)) {
        res.send('El monto debe ser un numero entero mayor a cero');
    } else {
        montob = montob.toFixed(2);
        montoBOB = LibPos.ValidarMonto(montob);
        //res.send('Monto:' + montoBOB);
        paso = 1; tam = 0;
        //sock2.write(solConnHex); console.log(`CAJA: Enviado solConn al POS: ${solConn}`);
        LibPos.SendConnectionCtl(sock2);
        var intr = setInterval(function () {
            var lenr = respHostJson.length;
            if (lenr > 1) {
                LibPos.log('INFO','Resp:' + respHostJson);
                res.send(respHostJson);
                clearInterval(intr);
                respHost = "";
                
            }
        }, 3000);
    }

});

app.get('/ctlmulti/:monto/:idcom', function (req, res) {
    //res.send(req.params)
    var sock2 = req.app.locals.sock;
    var rport = sock2.remotePort;
    var monto = req.params.monto;
    var montob = parseFloat(monto);
    var idcom = req.params.idcom;
    var idcomb = parseInt(idcom);
    respHostJson = "";
    req.app.locals.sock.flujo = "pagoCtlMulti";

    LibPos.log('INFO','Pago con tarjeta CTL Multicomercio:' + montob + ' - IdCom:' + idcomb);
    //res.send('Pago con tarjeta CTL:' + req.params.monto);
    //console.log('-- Socket: ' + rport);
    if (isNaN(montob)) {
        res.send('El monto debe ser un numero entero mayor a cero');
    } else {
        montob = montob.toFixed(2);
        montoBOB = LibPos.ValidarMonto(montob);
        //res.send('Monto:' + montoBOB);
        paso = 1; tam = 0;
        //sock2.write(solConnHex); console.log(`CAJA: Enviado solConn al POS: ${solConn}`);
        LibPos.SendConnectionCtlMulticom(sock2, idcomb);
        var intr = setInterval(function () {
            var lenr = respHostJson.length;
            if (lenr > 1) {
                LibPos.log('INFO','Resp:' + respHostJson);
                res.send(respHostJson);
                clearInterval(intr);
                respHost = "";
                
            }
        }, 3000);
    }

});

app.get('/anulacion/:recibo', function (req, res) {
    //res.send(req.params)
    var sock2 = req.app.locals.sock;
    var rport = sock2.remotePort;
    var recibo = req.params.recibo;
    var recibot = parseInt(recibo);
    respHostJson = "";
    req.app.locals.sock.flujo = "anulacionTrans";

    LibPos.log('INFO','Anulacion de transaccion:' + recibo);
    //res.send('Pago con tarjeta CTL:' + req.params.monto);
    //console.log('-- Socket: ' + rport);
    if (isNaN(recibo)) {
        res.send('El monto debe ser un numero entero mayor a cero');
    } else {
        reciboTRA = LibPos.ValidarRef(recibot);
        //res.send('Monto:' + montoBOB);
        paso = 1; tam = 0;
        //sock2.write(solConnHex); console.log(`CAJA: Enviado solConn al POS: ${solConn}`);
        LibPos.SendSolicitudAnulacion(sock2);
        var intr = setInterval(function () {
            var lenr = respHostJson.length;
            if (lenr > 1) {
                LibPos.log('INFO','Resp:' + respHostJson);
                res.send(respHostJson);
                clearInterval(intr);
                respHost = "";

            }
        }, 3000);
    }

});

app.get('/anulacionmulti/:recibo/:idcom', function (req, res) {
    //res.send(req.params)
    var sock2 = req.app.locals.sock;
    var rport = sock2.remotePort;
    var recibo = req.params.recibo;
    var recibot = parseInt(recibo);
    var idcom = req.params.idcom;
    var idcomb = parseInt(idcom);
    respHostJson = "";
    req.app.locals.sock.flujo = "anulacionTransMulti";

    LibPos.log('INFO','Anulacion de transaccion Multicomercio:' + recibo + ' - IdCom:' + idcomb);
    //res.send('Pago con tarjeta CTL:' + req.params.monto);
    //console.log('-- Socket: ' + rport);
    if (isNaN(recibo)) {
        res.send('El monto debe ser un numero entero mayor a cero');
    } else {
        reciboTRA = LibPos.ValidarRef(recibot);
        //res.send('Monto:' + montoBOB);
        paso = 1; tam = 0;
        //sock2.write(solConnHex); console.log(`CAJA: Enviado solConn al POS: ${solConn}`);
        LibPos.SendSolicitudAnulacionMulticom(sock2, idcomb);
        var intr = setInterval(function () {
            var lenr = respHostJson.length;
            if (lenr > 1) {
                LibPos.log('INFO','Resp:' + respHostJson);
                res.send(respHostJson);
                clearInterval(intr);
                respHost = "";

            }
        }, 3000);
    }

});

app.get('/cierre/:confirmar', function (req, res) {
    //res.send(req.params)
    var sock2 = req.app.locals.sock;
    var rport = sock2.remotePort;
    var conf = req.params.confirmar;
    var conft = parseInt(conf);
    respHostJson = "";
    req.app.locals.sock.flujo = "cierrePos";

    LibPos.log('INFO','Cierre de lote');
    //res.send('Pago con tarjeta CTL:' + req.params.monto);
    //console.log('-- Socket: ' + rport);
    if (conft != 1) {
        res.send('Cierre no autorizado');
    } else {
        //res.send('Monto:' + montoBOB);
        paso = 1; tam = 0;
        //sock2.write(solConnHex); console.log(`CAJA: Enviado solConn al POS: ${solConn}`);
        LibPos.SendSolicitudCierre(sock2);
        var intr = setInterval(function () {
            var lenr = respHostJson.length;
            if (lenr > 1) {
                LibPos.log('INFO','Resp:' + respHostJson);
                res.send(respHostJson);
                clearInterval(intr);
                respHost = "";

            }
        }, 3000);
    }

});

app.get('/cierremulti/:confirmar/:idcom', function (req, res) {
    //res.send(req.params)
    var sock2 = req.app.locals.sock;
    var rport = sock2.remotePort;
    var conf = req.params.confirmar;
    var conft = parseInt(conf);
    var idcom = req.params.idcom;
    var idcomb = parseInt(idcom);
    respHostJson = "";
    req.app.locals.sock.flujo = "cierrePosMulti";

    LibPos.log('INFO','Cierre de lote');
    //res.send('Pago con tarjeta CTL:' + req.params.monto);
    //console.log('-- Socket: ' + rport);
    if (conft != 1) {
        res.send('Cierre no autorizado');
    } else {
        //res.send('Monto:' + montoBOB);
        paso = 1; tam = 0;
        //sock2.write(solConnHex); console.log(`CAJA: Enviado solConn al POS: ${solConn}`);
        LibPos.SendSolicitudCierreMulticom(sock2, idcomb);
        var intr = setInterval(function () {
            var lenr = respHostJson.length;
            if (lenr > 1) {
                LibPos.log('INFO','Resp:' + respHostJson);
                res.send(respHostJson);
                clearInterval(intr);
                respHost = "";

            }
        }, 3000);
    }

});

app.get('/inicializar/:confirmar', function (req, res) {
    //res.send(req.params)
    var sock2 = req.app.locals.sock;
    var rport = sock2.remotePort;
    var conf = req.params.confirmar;
    var conft = parseInt(conf);
    respHostJson = "";
    req.app.locals.sock.flujo = "inicializarPos";

    LibPos.log('INFO','Inicializacion de Pos');
    //res.send('Pago con tarjeta CTL:' + req.params.monto);
    //console.log('-- Socket: ' + rport);
    if (conft != 1) {
        res.send('Inicializacion no autorizada');
    } else {
        //res.send('Monto:' + montoBOB);
        paso = 1; tam = 0;
        //sock2.write(solConnHex); console.log(`CAJA: Enviado solConn al POS: ${solConn}`);
        LibPos.SendSolicitudInicializar(sock2);
        var intr = setInterval(function () {
            var lenr = respHostJson.length;
            if (lenr > 1) {
                LibPos.log('INFO','Resp:' + respHostJson);
                res.send(respHostJson);
                clearInterval(intr);
                respHost = "";

            }
        }, 3000);
    }

});


function flujoChip(strReply, socket) {
    var resp = '';
    switch (paso) {

        case 1:
            if (isAck1 && tam == 40) {                                  // Ultima Transaccion
                //socket.write(ackHex); console.log(`Enviado al POS: ${ack}`);
                resp = LibPos.SendAck(socket); //console.log(`CAJA: ACK: ${resp}`);
                resp = LibPos.SendTransRevNo(socket); //console.log(`CAJA: Enviado revNO al POS: ${resp}`);
                //tam = 0; console.log(`Tamaño: ${tam}`);
                paso = 2; //console.log(`Siguiente paso: ${paso}`);
                tam = 0;
                break;
            } else if (isAck(strReply)) {
                isAck1 = true;
                tam = 0;
                break;
            }

        case 2:
            if (isAck2 && tam == 36) {                                  // Solicitud nueva pantalla
                resp = LibPos.SendAck(socket); //console.log(`CAJA: ACK: ${resp}`);
                //tam = 0; console.log(`Tamaño: ${tam}`);
                paso = 3; //console.log(`Siguiente paso: ${paso}`);
                tam = 0;
                break;
            } else if (isAck(strReply)) {
                isAck2 = true;
                tam = 0;

                break;
            }

        case 3:
            if (tam == 29) {                                    // Solicitud de datos
                resp = LibPos.SendAck(socket); //console.log(`CAJA: ACK: ${resp}`);
                var tramaf = LibPos.SendDataToPos(montoBOB, socket); //console.log(`CAJA: Datos al POS: ${tramaf}`);  // Envio de datos
                //console.log('Trama:' + tramaf);
                //socket.write(envDatosHex); console.log(`CAJA: Datos al POS: ${envDatos}`);
                //tam = 0; console.log(`Tamaño: ${tam}`);
                paso = 4; //console.log(`Siguiente paso: ${paso}`);
                tam = 0;
                break;
            } else {

                break;
            }

        case 4:
            if (isAck4 && tam == 36) {                              // Solicitud pantalla PIN
                resp = LibPos.SendAck(socket); console.log(`CAJA: ACK: ${resp}`);
                //tam = 0; console.log(`Tamaño: ${tam}`);
                paso = 5; //console.log(`Siguiente paso: ${paso}`);
                tam = 0;
                break;
            } else if (isAck(strReply)) {
                isAck4 = true;
                tam = 0;


                break;
            }

        case 5:
            if (tam >= 223) {                                       // Respuesta del Host
                resp = LibPos.SendAck(socket); //console.log(`CAJA: ACK: ${resp}`);
                respHost = respHost + strReply;
                respHostJson = LibPos.RespuestaHostVenta(respHost);
                paso = -1;
                tam = 0;
                isAck1 = false;
                isAck2 = false;
                isAck3 = false;
                isAck4 = false;
                //pagoChip = false;
                app.locals.sock.flujo = 'none';
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

function flujoChipMulti(strReply, socket) {
    var resp = '';
    switch (paso) {

        case 1:
            if (isAck1 && tam == 81) {                                  // Ultima Transaccion
                //socket.write(ackHex); console.log(`Enviado al POS: ${ack}`);
                resp = LibPos.SendAck(socket); //console.log(`CAJA: ACK: ${resp}`);
                resp = LibPos.SendTransRevNo(socket); //console.log(`CAJA: Enviado revNO al POS: ${resp}`);
                //tam = 0; console.log(`Tamaño: ${tam}`);
                paso = 2; //console.log(`Siguiente paso: ${paso}`);
                tam = 0;
                break;
            } else if (isAck(strReply)) {
                isAck1 = true;
                tam = 0;
                break;
            }

        case 2:
            if (isAck2 && tam == 36) {                                  // Solicitud nueva pantalla
                resp = LibPos.SendAck(socket); //console.log(`CAJA: ACK: ${resp}`);
                //tam = 0; console.log(`Tamaño: ${tam}`);
                paso = 3; //console.log(`Siguiente paso: ${paso}`);
                tam = 0;
                break;
            } else if (isAck(strReply)) {
                isAck2 = true;
                tam = 0;

                break;
            }

        case 3:
            if (tam == 29) {                                    // Solicitud de datos
                resp = LibPos.SendAck(socket); //console.log(`CAJA: ACK: ${resp}`);
                var tramaf = LibPos.SendDataToPos(montoBOB, socket); //console.log(`CAJA: Datos al POS: ${tramaf}`);  // Envio de datos
                //console.log('Trama:' + tramaf);
                //socket.write(envDatosHex); console.log(`CAJA: Datos al POS: ${envDatos}`);
                //tam = 0; console.log(`Tamaño: ${tam}`);
                paso = 4; //console.log(`Siguiente paso: ${paso}`);
                tam = 0;
                break;
            } else {

                break;
            }

        case 4:
            if (isAck4 && tam == 36) {                              // Solicitud pantalla PIN
                resp = LibPos.SendAck(socket); console.log(`CAJA: ACK: ${resp}`);
                //tam = 0; console.log(`Tamaño: ${tam}`);
                paso = 5; //console.log(`Siguiente paso: ${paso}`);
                tam = 0;
                break;
            } else if (isAck(strReply)) {
                isAck4 = true;
                tam = 0;


                break;
            }

        case 5:
            if (tam >= 223) {                                       // Respuesta del Host
                resp = LibPos.SendAck(socket); //console.log(`CAJA: ACK: ${resp}`);
                respHost = respHost + strReply;
                respHostJson = LibPos.RespuestaHostVenta(respHost);
                paso = -1;
                tam = 0;
                isAck1 = false;
                isAck2 = false;
                isAck3 = false;
                isAck4 = false;
                //pagoChipMuti = false;
                app.locals.sock.flujo = 'none';
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

function flujoCtl(strReply, socket) {
    var resp = '';
    switch (paso) {
       
        case 1:
            if (isAck1 && tam == 40) {                                  // Ultima Transaccion
                //socket.write(ackHex); console.log(`Enviado al POS: ${ack}`);
                resp = LibPos.SendAck(socket); //console.log(`CAJA: ACK: ${resp}`);
                resp = LibPos.SendTransRevNo(socket); //console.log(`CAJA: Enviado revNO al POS: ${resp}`);
                //tam = 0; console.log(`Tamaño: ${tam}`);
                paso = 2; //console.log(`Siguiente paso: ${paso}`);
                tam = 0;
                break;
            } else if (isAck(strReply)) {
                isAck1 = true;
                tam = 0;
                break;
            }

        case 2:
            if (isAck2 && tam == 29) {                                  // Solicitud de datos
                resp = LibPos.SendAck(socket); //console.log(`CAJA: ACK: ${resp}`);
                //socket.write(envDatosHex); 
                var tramaf = LibPos.SendDataToPos(montoBOB, socket); //console.log(`CAJA: Datos al POS: ${tramaf}`);  // Envio de datos
                //tam = 0; console.log(`Tamaño: ${tam}`);
                paso = 3; //console.log(`Siguiente paso: ${paso}`);
                tam = 0;
                break;
            } else if (isAck(strReply)) {
                isAck2 = true;
                tam = 0;

                break;
            }

        case 3:
            if (isAck3 && tam == 36) {                                    // Solicitud pantalla acerque tarjeta
                resp = LibPos.SendAck(socket); //console.log(`CAJA: ACK: ${resp}`);
                resp = LibPos.SendTipoTarjetaCtl(socket); //console.log(`CAJA: Lectura CTL: ${resp}`);  // Envio de tipo tarjeta CTL
                //tam = 0; console.log(`Tamaño: ${tam}`);
                paso = 4; //console.log(`Siguiente paso: ${paso}`);
                tam = 0;
                break;
            } else if (isAck(strReply)) {
                isAck3 = true;
                tam = 0;
                break;
            }

        case 4:
            if (isAck4 && tam == 36) {                              // Solicitud pantalla PIN
                resp = LibPos.SendAck(socket); //console.log(`CAJA: ACK: ${resp}`);
                //tam = 0; console.log(`Tamaño: ${tam}`);
                paso = 5; //console.log(`Siguiente paso: ${paso}`);
                tam = 0;
                break;
            } else if (isAck(strReply)) {
                isAck4 = true;
                tam = 0;

                break;
            }

        case 5:
            if (tam >= 222) {                                       // Respuesta del Host
                resp = LibPos.SendAck(socket); //console.log(`CAJA: ACK: ${resp}`);
                respHost = respHost + strReply; //console.log('RespHost:' + respHost);
                respHostJson = LibPos.RespuestaHostVenta(respHost);
                paso = -1;
                tam = 0;
                isAck1 = false;
                isAck2 = false;
                isAck3 = false;
                isAck4 = false;
                //pagoCtl = false;
                respHost = "";
                app.locals.sock.flujo = 'none';
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

function flujoCtlMulti(strReply, socket) {
    var resp = '';
    console.log(`Paso CtlMulti: ${paso}`);
    switch (paso) {
       
        case 1:
            if (isAck1 && tam == 81) {                                  // Ultima Transaccion
                //socket.write(ackHex); console.log(`Enviado al POS: ${ack}`);
                resp = LibPos.SendAck(socket); //console.log(`CAJA: ACK: ${resp}`);
                resp = LibPos.SendTransRevNo(socket); //console.log(`CAJA: Enviado revNO al POS: ${resp}`);
                //tam = 0; console.log(`Tamaño: ${tam}`);
                paso = 2; //console.log(`Siguiente paso: ${paso}`);
                tam = 0;
                break;
            } else if (isAck(strReply)) {
                isAck1 = true;
                tam = 0;
                break;
            }

        case 2:
            if (isAck2 && tam == 29) {                                  // Solicitud de datos
                resp = LibPos.SendAck(socket); //console.log(`CAJA: ACK: ${resp}`);
                //socket.write(envDatosHex); 
                var tramaf = LibPos.SendDataToPos(montoBOB, socket); //console.log(`CAJA: Datos al POS: ${tramaf}`);  // Envio de datos
                //tam = 0; console.log(`Tamaño: ${tam}`);
                paso = 3; //console.log(`Siguiente paso: ${paso}`);
                tam = 0;
                break;
            } else if (isAck(strReply)) {
                isAck2 = true;
                tam = 0;

                break;
            }

        case 3:
            if (isAck3 && tam == 36) {                                    // Solicitud pantalla acerque tarjeta
                resp = LibPos.SendAck(socket); //console.log(`CAJA: ACK: ${resp}`);
                resp = LibPos.SendTipoTarjetaCtl(socket); //console.log(`CAJA: Lectura CTL: ${resp}`);  // Envio de tipo tarjeta CTL
                //tam = 0; console.log(`Tamaño: ${tam}`);
                paso = 4; //console.log(`Siguiente paso: ${paso}`);
                tam = 0;
                break;
            } else if (isAck(strReply)) {
                isAck3 = true;
                tam = 0;
                break;
            }

        case 4:
            if (isAck4 && tam == 36) {                              // Solicitud pantalla PIN
                resp = LibPos.SendAck(socket); //console.log(`CAJA: ACK: ${resp}`);
                //tam = 0; console.log(`Tamaño: ${tam}`);
                paso = 5; //console.log(`Siguiente paso: ${paso}`);
                tam = 0;
                break;
            } else if (isAck(strReply)) {
                isAck4 = true;
                tam = 0;

                break;
            }

        case 5:
            if (tam >= 222) {                                       // Respuesta del Host
                resp = LibPos.SendAck(socket); //console.log(`CAJA: ACK: ${resp}`);
                respHost = respHost + strReply; //console.log('RespHost:' + respHost);
                respHostJson = LibPos.RespuestaHostVenta(respHost);
                paso = -1;
                tam = 0;
                isAck1 = false;
                isAck2 = false;
                isAck3 = false;
                isAck4 = false;
                //pagoCtlMulti = false;
                respHost = "";
                app.locals.sock.flujo = 'none';
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

function flujoAnulacion(strReply, socket) {
    var resp = '';
    switch (paso) {

        case 1:
            if (isAck1 && tam == 29) {                                  // Solicitud de referencia
                //socket.write(ackHex); console.log(`Enviado al POS: ${ack}`);
                resp = LibPos.SendAck(socket); //console.log(`CAJA: ACK: ${resp}`);
                resp = LibPos.SendRefAnulToPos(reciboTRA, socket); //console.log(`CAJA: Referencia anulacion: ${resp}`); // Envio de referencia
                //tam = 0; console.log(`Tamaño: ${tam}`);
                paso = 2; //console.log(`Siguiente paso: ${paso}`);
                tam = 0;
                break;
            } else if (isAck(strReply)) {
                isAck1 = true;
                tam = 0;
                break;
            }

        case 2:
            if (isAck2 && tam == 29) {                                  // Resultado busqueda referencia
                resp = LibPos.SendAck(socket); //console.log(`CAJA: ACK: ${resp}`);
                //socket.write(envDatosHex); 
                resp = LibPos.SendConfirmarAnulacion(socket); //console.log(`CAJA: Confirmar anulacion: ${resp}`);  // Confirmar anulacion
                //tam = 0; console.log(`Tamaño: ${tam}`);
                paso = 3; //console.log(`Siguiente paso: ${paso}`);
                tam = 0;
                break;
            } else if (isAck(strReply)) {
                isAck2 = true;
                tam = 0;

                break;
            }

        case 3:
            if (tam >= 210) {                                       // Respuesta del Host
                resp = LibPos.SendAck(socket); //onsole.log(`CAJA: ACK: ${resp}`);
                respHost = respHost + strReply;
                respHostJson = LibPos.RespuestaHostAnulacion(respHost);
                paso = -1;
                tam = 0;
                isAck1 = false;
                isAck2 = false;
                isAck3 = false;
                isAck4 = false;
                //anulacionTrans = false;
                respHost = "";
                app.locals.sock.flujo = 'none';
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

function flujoAnulacionMulti(strReply, socket) {
    var resp = '';
    console.log(`CAJA: Paso: ${paso}`);
    switch (paso) {

        case 1:
            if (isAck1 && tam >= 70) {                                  // Solicitud de referencia
                //socket.write(ackHex); 
                console.log(`CAJA: Tam: ${tam}`);
                resp = LibPos.SendAck(socket); //console.log(`CAJA: ACK: ${resp}`);
                resp = LibPos.SendRefAnulToPos(reciboTRA, socket); //console.log(`CAJA: Referencia anulacion: ${resp}`); // Envio de referencia
                //tam = 0; console.log(`Tamaño: ${tam}`);
                paso = 2; //console.log(`Siguiente paso: ${paso}`);
                tam = 0;
                break;
            } else if (isAck(strReply)) {
                isAck1 = true;
                tam = 0;
                break;
            }

        case 2:
            if (isAck2 && tam == 29) {                                  // Resultado busqueda referencia
                resp = LibPos.SendAck(socket); //console.log(`CAJA: ACK: ${resp}`);
                //socket.write(envDatosHex); 
                resp = LibPos.SendConfirmarAnulacion(socket); //console.log(`CAJA: Confirmar anulacion: ${resp}`);  // Confirmar anulacion
                //tam = 0; console.log(`Tamaño: ${tam}`);
                paso = 3; //console.log(`Siguiente paso: ${paso}`);
                tam = 0;
                break;
            } else if (isAck(strReply)) {
                isAck2 = true;
                tam = 0;

                break;
            }

        case 3:
            if (tam >= 210) {                                       // Respuesta del Host
                resp = LibPos.SendAck(socket); //onsole.log(`CAJA: ACK: ${resp}`);
                respHost = respHost + strReply;
                respHostJson = LibPos.RespuestaHostAnulacion(respHost);
                paso = -1;
                tam = 0;
                isAck1 = false;
                isAck2 = false;
                isAck3 = false;
                isAck4 = false;
                //anulacionTransMulti = false;
                respHost = "";
                app.locals.sock.flujo = 'none';
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

function flujoCierre(strReply, socket) {
    var resp = '';
    switch (paso) {

        case 1:
            if (isAck1 && tam == 38) {                                  // Cantidad de transacciones
                //socket.write(ackHex); console.log(`Enviado al POS: ${ack}`);
                resp = LibPos.SendAck(socket); //console.log(`CAJA: ACK: ${resp}`);
                respHost += strReply;
                var codr = respHost.substr(50, 4); //console.log('Cod.Respuesta:' + codr);
                if (codr == "5858") {
                    paso = -1;
                    isAck1 = false;
                    isAck2 = false;
                    respHostJson = LibPos.RespuestaHostCierreSinTransac(respHost);
                } else {
                    paso = 2; //console.log(`Siguiente paso: ${paso}`);
                    tam = 0;
                }
                respHost = "";
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

        case 2:
            if (tam > 140) {                                    // Mas transacciones
                resp = LibPos.SendAck(socket); //console.log(`CAJA: ACK: ${resp}`);
                tam = 0;
                break;
            } else if (tam == 40) {                                            // Fin Cierre
                respHost += strReply;
                resp = LibPos.SendAck(socket); //console.log(`CAJA: ACK: ${resp}`);
                respHostJson = LibPos.RespuestaHostCierreConTransac(respHost);
                tam = 0;
                paso = -1;
                isAck1 = false;
                isAck2 = false;
                //cierrePos = false;
                respHost = "";
                app.locals.sock.flujo = 'none';
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

function flujoCierreMulti(strReply, socket) {
    var resp = '';
    switch (paso) {

        case 1:
            if (isAck1 && tam == 79) {                                  // Cantidad de transacciones
                //socket.write(ackHex); console.log(`Enviado al POS: ${ack}`);
                resp = LibPos.SendAck(socket); //console.log(`CAJA: ACK: ${resp}`);
                respHost += strReply;
                var codr = respHost.substr(50, 4); //console.log('Cod.Respuesta:' + codr);
                if (codr == "5858") {
                    paso = -1;
                    isAck1 = false;
                    isAck2 = false;
                    respHostJson = LibPos.RespuestaHostCierreSinTransac(respHost);
                } else {
                    paso = 2; //console.log(`Siguiente paso: ${paso}`);
                    tam = 0;
                }
                respHost = "";
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

        case 2:
            if (tam > 140) {                                    // Mas transacciones
                resp = LibPos.SendAck(socket); //console.log(`CAJA: ACK: ${resp}`);
                tam = 0;
                break;
            } else if (tam == 40) {                                            // Fin Cierre
                respHost += strReply;
                resp = LibPos.SendAck(socket); //console.log(`CAJA: ACK: ${resp}`);
                respHostJson = LibPos.RespuestaHostCierreConTransac(respHost);
                tam = 0;
                paso = -1;
                isAck1 = false;
                isAck2 = false;
                //cierrePosMulti = false;
                respHost = "";
                app.locals.sock.flujo = 'none';
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
