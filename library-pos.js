var MPK = "720";
var PNR = "028510";

exports.SendAck = function (sock) {
    var msg = '06';
    SendMessageToPOS(msg, sock);
    return msg;
};

exports.SendConnectionChip = function (sock) {
    var msg = '02001736303030303030303030313030303030300323';
    SendMessageToPOS(msg, sock);
    return msg;
};

exports.SendConnectionCtl = function (sock) {
    var msg = '02001736303030303030303030313030363030300325';
    SendMessageToPOS(msg, sock);
    return msg;
};

exports.SendTransRevNo = function (sock) {
    var msg = '02002436303030303030303030313030303030311C3438000258580303';
    SendMessageToPOS(msg, sock);
    return msg;
};

exports.SendTipoTarjetaCtl = function (sock) {
    msg = '02001736303030303030303030313030363030310324';
    SendMessageToPOS(msg, sock);
    return msg;
};

exports.SendSolicitudCierre = function (sock) {
    var msg = '02001736303030303030303030313030313030300322';
    SendMessageToPOS(msg, sock);
    return msg;
};

exports.SendSolicitudAnulacion = function (sock) {
    var msg = '02001736303030303030303030313030353030300326';
    SendMessageToPOS(msg, sock);
    return msg;
};

exports.SendConfirmarAnulacion = function (sock) {
    var msg = '02002436303030303030303030313030353030321C3438000230300305';
    SendMessageToPOS(msg, sock);
    return msg;
};

exports.SendSolicitudInicializar = function (sock) {
    var msg = '02001736303030303030303030313030323030300321';
    SendMessageToPOS(msg, sock);
    return msg;
};

exports.RespuestaHostVenta = function (respHost) {
    var codAutoriz = respHost.substr(50, 12);
    var montoCompra = respHost.substr(72, 24);
    var numRecibo = respHost.substr(106, 12);
    var rrn = respHost.substr(128, 24);
    var terminalId = respHost.substr(162, 16);
    var fechaTransac = respHost.substr(188, 8);
    var horaTransac = respHost.substr(206, 8);
    var codRespuesta = respHost.substr(224, 4);
    var tipoCuenta = respHost.substr(238, 4);
    var numCuotas = respHost.substr(252, 4);
    var ult4Digit = respHost.substr(266, 8);
    var msgError = respHost.substr(284, 138);
    var binTarjeta = respHost.substr(432, 12);

    var codAutorizA = hex2a(codAutoriz); exports.log('INFO','codAutoriz:' + codAutoriz + '->' + codAutorizA);
    var montoCompraA = hex2a(montoCompra); exports.log('INFO','montoCompra:' + montoCompra + '->' + montoCompraA);
    var numReciboA = hex2a(numRecibo); exports.log('INFO','numRecibo:' + numRecibo + '->' + numReciboA);
    var rrnA = hex2a(rrn); exports.log('INFO','rrn:' + rrn + '->' + rrnA);
    var terminalIdA = hex2a(terminalId); exports.log('INFO','terminalId:' + terminalId + '->' + terminalIdA);
    var fechaTransacA = hex2a(fechaTransac); exports.log('INFO','fechaTransac:' + fechaTransac + '->' + fechaTransacA);
    var horaTransacA = hex2a(horaTransac); exports.log('INFO','horaTransac:' + horaTransac + '->' + horaTransacA);
    var codRespuestaA = hex2a(codRespuesta); exports.log('INFO','codRespuesta:' + codRespuesta + '->' + codRespuestaA);
    var tipoCuentaA = hex2a(tipoCuenta); exports.log('INFO','tipoCuenta:' + tipoCuenta + '->' + tipoCuentaA);
    var numCuotasA = hex2a(numCuotas); exports.log('INFO','numCuotas:' + numCuotas + '->' + numCuotasA);
    var ult4DigitA = hex2a(ult4Digit); exports.log('INFO','ult4Digit:' + ult4Digit + '->' + ult4DigitA);
    var msgErrorA = hex2a(msgError); exports.log('INFO','msgError:' + msgError + '->' + msgErrorA);
    var binTarjetaA = hex2a(binTarjeta); exports.log('INFO','binTarjeta:' + binTarjeta + '->' + binTarjetaA);

    var jsono = {};
    jsono.codAutoriz = codAutorizA;
    jsono.montoCompra = montoCompraA;
    jsono.numRecibo = numReciboA;
    jsono.rtn = rrnA;
    jsono.terminalId = terminalIdA;
    jsono.fechaTransac = fechaTransacA;
    jsono.horaTransac = horaTransacA;
    jsono.codRespuesta = codRespuestaA;
    jsono.tipoCuenta = tipoCuentaA;
    jsono.numCuotas = numCuotasA;
    jsono.ult4Digit = ult4DigitA;
    jsono.msgError = msgErrorA;
    jsono.binTarjeta = binTarjetaA;
    return JSON.stringify(jsono);
}

exports.RespuestaHostAnulacion = function (respHost) {
    var codAutoriz = respHost.substr(52, 12);
    var montoCompra = respHost.substr(74, 24);
    var numRecibo = respHost.substr(108, 12);
    var rrn = respHost.substr(130, 24);
    var terminalId = respHost.substr(164, 16);
    var fechaTransac = respHost.substr(190, 8);
    var horaTransac = respHost.substr(208, 8);
    var codRespuesta = respHost.substr(226, 4);
    //var tipoCuenta = respHost.substr(238, 4);
    //var numCuotas = respHost.substr(252, 4);
    var ult4Digit = respHost.substr(240, 8);
    var msgError = respHost.substr(258, 138);
    var binTarjeta = respHost.substr(406, 12);

    var codAutorizA = hex2a(codAutoriz); exports.log('INFO','codAutoriz:' + codAutoriz + '->' + codAutorizA);
    var montoCompraA = hex2a(montoCompra); exports.log('INFO','montoCompra:' + montoCompra + '->' + montoCompraA);
    var numReciboA = hex2a(numRecibo); exports.log('INFO','numRecibo:' + numRecibo + '->' + numReciboA);
    var rrnA = hex2a(rrn); exports.log('INFO','rrn:' + rrn + '->' + rrnA);
    var terminalIdA = hex2a(terminalId); exports.log('INFO','terminalId:' + terminalId + '->' + terminalIdA);
    var fechaTransacA = hex2a(fechaTransac); exports.log('INFO','fechaTransac:' + fechaTransac + '->' + fechaTransacA);
    var horaTransacA = hex2a(horaTransac); exports.log('INFO','horaTransac:' + horaTransac + '->' + horaTransacA);
    var codRespuestaA = hex2a(codRespuesta); exports.log('INFO','codRespuesta:' + codRespuesta + '->' + codRespuestaA);
    //var tipoCuentaA = hex2a(tipoCuenta); console.log('tipoCuenta:' + tipoCuenta + '->' + tipoCuentaA);
    //var numCuotasA = hex2a(numCuotas); console.log('numCuotas:' + numCuotas + '->' + numCuotasA);
    var ult4DigitA = hex2a(ult4Digit); exports.log('INFO','ult4Digit:' + ult4Digit + '->' + ult4DigitA);
    var msgErrorA = hex2a(msgError); exports.log('INFO','msgError:' + msgError + '->' + msgErrorA);
    var binTarjetaA = hex2a(binTarjeta); exports.log('INFO','binTarjeta:' + binTarjeta + '->' + binTarjetaA);

    var jsono = {};
    jsono.codAutoriz = codAutorizA;
    jsono.montoCompra = montoCompraA;
    jsono.numRecibo = numReciboA;
    jsono.rtn = rrnA;
    jsono.terminalId = terminalIdA;
    jsono.fechaTransac = fechaTransacA;
    jsono.horaTransac = horaTransacA;
    jsono.codRespuesta = codRespuestaA;
    //jsono.tipoCuenta = tipoCuentaA;
    //jsono.numCuotas = numCuotasA;
    jsono.ult4Digit = ult4DigitA;
    jsono.msgError = msgErrorA;
    jsono.binTarjeta = binTarjetaA;
    return JSON.stringify(jsono);
}

exports.RespuestaHostCierreConTransac = function (respHost) {
    var codAutoriz = respHost.substr(50, 12);
    var codRespuesta = respHost.substr(72, 4);
    var codAutorizA = hex2a(codAutoriz); exports.log('INFO','codAutoriz:' + codAutoriz + '->' + codAutorizA);
    if(!codAutorizA){
        codAutorizA = "-";
    }
    var codRespuestaA = hex2a(codRespuesta); exports.log('INFO','codRespuesta:' + codRespuesta + '->' + codRespuestaA);
    
    var jsono = {};
    jsono.codAutoriz = codAutorizA;
    jsono.codRespuesta = codRespuestaA;
    return JSON.stringify(jsono);
    //return(jsono);
}

exports.RespuestaHostCierreSinTransac = function (resp) {
    var jsono = {};
    jsono.resp = "Lote sin transacciones";
    return JSON.stringify(jsono);
}

exports.RespuestaHostInicializacion = function (respHost) {
    var codRespuesta = respHost.substr(50, 4);
    var codRespuestaA = hex2a(codRespuesta); exports.log('INFO','codRespuesta:' + codRespuesta + '->' + codRespuestaA);

    var jsono = {};
    jsono.codRespuesta = codRespuestaA;
    return JSON.stringify(jsono);
}

exports.SendConnectionChipMulticom = function (sock, idcom) {
    var idcomb = "00" + idcom;
    idcomb = idcomb.substr(idcomb.length - 2);
    var inicio = "002436303030303030303030313030303030301C";
    var comercio = "37390002" + ascii_to_hexa(idcomb);
    var trama = inicio + comercio + "03";
    var xo = Xor(Buffer.from(trama, 'hex'));
    var tramafinal = "02" + trama + xo;
    SendMessageToPOS(tramafinal, sock);
    return tramafinal;
}

exports.SendConnectionCtlMulticom = function (sock, idcom) {
    var idcomb = "00" + idcom;
    idcomb = idcomb.substr(idcomb.length - 2);
    var inicio = "002436303030303030303030313030363030301C";
    var comercio = "37390002" + ascii_to_hexa(idcomb);
    var trama = inicio + comercio + "03";
    var xo = Xor(Buffer.from(trama, 'hex'));
    var tramafinal = "02" + trama + xo;
    SendMessageToPOS(tramafinal, sock);
    return tramafinal;
}

exports.SendSolicitudAnulacionMulticom = function (sock, idcom) {
    var idcomb = "00" + idcom;
    idcomb = idcomb.substr(idcomb.length - 2);
    var inicio = "002436303030303030303030313030353030301C";
    var comercio = "37390002" + ascii_to_hexa(idcomb);
    var trama = inicio + comercio + "03";
    var xo = Xor(Buffer.from(trama, 'hex'));
    var tramafinal = "02" + trama + xo;
    SendMessageToPOS(tramafinal, sock);
    return tramafinal;
}

exports.SendSolicitudCierreMulticom = function (sock, idcom) {
    var idcomb = "00" + idcom;
    idcomb = idcomb.substr(idcomb.length - 2);
    var inicio = "002436303030303030303030313030313030301C";
    var comercio = "37390002" + ascii_to_hexa(idcomb);
    var trama = inicio + comercio + "03";
    var xo = Xor(Buffer.from(trama, 'hex'));
    var tramafinal = "02" + trama + xo;
    SendMessageToPOS(tramafinal, sock);
    return tramafinal;
}

exports.SendDataToPos = function (montobob, sock) {
    var inicio = "007736303030303030303030313030303030321C";
    var monto = "3430000C" + ascii_to_hexa(montobob) + "1C";
    var mpkh = MPK + "          "; mpkh = mpkh.substr(0, 10);
    var numcaja = "3432000A" + ascii_to_hexa(mpkh) + "1C";
    var codresp = "34380002" + "2020" + "1C";
    var pnrh = PNR + "          "; pnrh = pnrh.substr(0, 10);
    var numtransac = "3533000A" + ascii_to_hexa(pnrh) + "1C";
    var tipocuenta = "38380001" + "31" + "03";
    var trama = inicio + monto + numcaja + codresp + numtransac + tipocuenta;
    var xo = Xor(Buffer.from(trama, 'hex'));
    var tramafinal = "02" + trama + xo;
    SendMessageToPOS(tramafinal, sock);
    return tramafinal;
}

exports.SendRefAnulToPos = function (ref, sock) {
    var inicio = "003536303030303030303030313030353030311C";
    var recibo = "34330006" + ascii_to_hexa(ref) + "1C";
    var codresp = "34380002" + "2020" + "03";
   
    var trama = inicio + recibo + codresp; //console.log('trama para xor:' + trama);
    var xo = Xor(Buffer.from(trama, 'hex'));
    var tramafinal = "02" + trama + xo;
    SendMessageToPOS(tramafinal, sock);
    return tramafinal;
}


exports.ValidarMonto = function (monto) {
    var montos = monto.toString();
    var n = montos.split('.');
    var num = n[0] + n[1];
    num = "000000000000" + num;
    return num.substr(num.length - 12);

}

exports.ValidarRef = function (ref) {
    var recibo = ref.toString();
    //var n = montos.split('.');
    //var num = n[0] + n[1];
    recibo = "000000" + recibo;
    return recibo.substr(recibo.length - 6);

}

exports.log = function(nivel, msg) {
    let ts = Date.now();
    let date_ob = new Date(ts);
    let date = date_ob.getDate();
    let month = date_ob.getMonth() + 1;
    let year = date_ob.getFullYear();
    let hour = date_ob.getHours();
    let min = date_ob.getMinutes();
    let sec = date_ob.getSeconds();
    let fecha = year + '-' + month + '-' + date + ' ' + hour + ':' + min + ':' + sec + ' ';
    console.log(fecha + '(' +nivel+') '+msg);
}

function ascii_to_hexa(str) {
    var arr1 = [];
    for (var n = 0, l = str.length; n < l; n++) {
        var hex = Number(str.charCodeAt(n)).toString(16);
        arr1.push(hex);
    }
    return arr1.join('');
}

function hex2a(hexx) {
    var hex = hexx.toString();//force conversion
    var str = '';
    for (var i = 0; (i < hex.length && hex.substr(i, 2) !== '00'); i += 2)
        str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
    return str;
}

function Xor(buff) {
    var x = 0;
    var len = buff.length;
    for (var i = 0; i < len; ++i) {
        x ^= buff[i];
    }
    //var xb = Buffer.from(x);
    //return x.toString(16);
    var xo = ('0' + x.toString(16)).slice(-2); //console.log('Xor:' + xo);
    return xo;
}




function SendMessageToPOS(msg, sock) {
    var msgHex = Buffer.from(msg, 'hex');
    //var sock = app.locals.sock;
    sock.write(msgHex);
    //console.log(`CAJA: ${msg}`);
    exports.log('INFO', 'CAJA: '+msg)
}

