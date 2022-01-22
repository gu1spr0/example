var MPK = "720";
var PNR = "028510";

exports.SendAck = function(sock){
    var msg = '06';
    SendMessageToPOS(msg, sock);

}
exports.SendSolicitudInicializar = function(sock){
    var msg = '02001736303030303030303030313030323030300321';
    SendMessageToPOS(msg, sock);
}
exports.RespuestaHostInicializacion = function(respHost){
    var codRespuesta = respHost.substr(50,40);
    var codRespuestaA = hex2a(codRespuesta);
    exports.log('INFO','codRespuesta:'+codRespuesta+'->'+codRespuestaA);

    var jsono = {};
    jsono.codRespuesta = codRespuestaA;
    return JSON.stringify(jsono);
}
exports.log = function(nivel, msg){
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

function SendMessageToPOS(msg, sock){
    var msgHex = Buffer.from(msg, 'hex');
    sock.write(msgHex);
    exports.log('INFO', 'CAJA: '+msg)
}
function hex2a(hexx) {
    var hex = hexx.toString();//force conversion
    var str = '';
    for (var i = 0; (i < hex.length && hex.substr(i, 2) !== '00'); i += 2)
        str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
    return str;
}