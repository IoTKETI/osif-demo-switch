'use strict';

const express = require('express');
var http = require('http');


const ketiCiotClient = require('./lib/keti.ciot.client.js');

// Constants
const PORT = 8080;
const HOST = 'localhost';

var SWITCH_STATE = 'off';



var listener = {
    'updated': function(arg1, arg2, arg3){
        console.log( arguments );

        ketiCiotClient.getValue(ketiCiotClient.KEYS.CIOT_DEMO_SWITCH, arg1)
            .then(function(value){
                SWITCH_STATE = value;
            })
            .catch(function(err){
                console.log( err );
            });

    }
}


ketiCiotClient.setEventListener(ketiCiotClient.KEYS.CIOT_DEMO_SWITCH, 'state', listener)
    .then(function(result){
        console.log( 'evnet listener result: ', result );
    })





ketiCiotClient.setValue(ketiCiotClient.KEYS.CIOT_DEMO_SWITCH, 'state', SWITCH_STATE)
    .then(function(value){
        console.log( value );
    })
    .catch(function(err){
        console.log( err );
    });


// App
const app = express();

app.use('/', express.static('public'));

app.get('/api/switch/', function(req, res) {
    res.send(SWITCH_STATE);
});

app.put('/api/switch/', function(req, res) {
    if(SWITCH_STATE === 'on')
        SWITCH_STATE = 'off';
    else
        SWITCH_STATE = 'on';


    ketiCiotClient.setValue(ketiCiotClient.KEYS.CIOT_DEMO_SWITCH, 'state', SWITCH_STATE)
        .then(function(value){
            console.log( value );
        })
        .catch(function(err){
            console.log( err );
        });


    res.send(SWITCH_STATE);
});


var server = http.createServer(app);
server.listen(PORT);

server.on('error', onError);
server.on('listening', onListening);

/**
 * Event listener for HTTP server "error" event.
 */

function onError(error) {
    if (error.syscall !== 'listen') {
        throw error;
    }

    var bind = typeof port === 'string'
        ? 'Pipe ' + port
        : 'Port ' + port;

    // handle specific listen errors with friendly messages
    switch (error.code) {
        case 'EACCES':
            console.error(bind + ' requires elevated privileges');
            process.exit(1);
            break;
        case 'EADDRINUSE':
            console.error(bind + ' is already in use');
            process.exit(1);
            break;
        default:
            throw error;
    }
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening() {
    var addr = server.address();
    var bind = typeof addr === 'string'
        ? 'pipe ' + addr
        : 'port ' + addr.port;
    console.log('Listening on ' + bind);



    ketiCiotClient.setValue(ketiCiotClient.KEYS.CIOT_PROCESS, 'demo-switch', {state: 'run', instanceid: '383f327dd3'})
        .then(function(value){
            console.log( value );

        })
        .catch(function(err){
            console.log( err );
        });
}


function serviceShutdown() {
    server.close(function () {
        ketiCiotClient.setValue(ketiCiotClient.KEYS.CIOT_PROCESS, 'demo-seqgen', {state: 'stop', instanceid: '383f327dd3'})
            .then(function(value){
                console.log( value );
                process.exit(0);
            })
            .catch(function(err){
                console.log( err );
                process.exit(0);
            });
    });
}

process.on('SIGINT', function () {
    serviceShutdown();
});
process.on('SIGTERM', function () {
    serviceShutdown();
});