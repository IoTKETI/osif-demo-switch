/**
 * Created by kimtaehyun on 2017. 7. 14..
 */

var HazelcastClient = require('hazelcast-client').Client;
var Config = require('hazelcast-client').Config;



var GLOBAL_NODE_ADDRESS = "dev.synctechno.com";
var MAP_NAME = "CUSTOMERS2";




var ketiCiotGlobalObjectKeys = {
    'CIOT_PROCESS': 'CIOT_PROCESS',
    'CIOT_TEST': 'CIOT_TEST',
    'CUSTOMERS2' : 'CUSTOMERS2',
    'CIOT_DEMO_SWITCH': 'CIOT_DEMO_SWITCH'
};


var KetiCiotClient = {
    setValue: _setValue,
    getValue: _getValue,
    entries: _entries,

    setEventListener: _setEventListener,

    KEYS: ketiCiotGlobalObjectKeys
}


var ketiCiotGlobalObject = {
    initialized: false
};



//  expose Sortie
exports = module.exports = KetiCiotClient;


function _initClient() {
    return new Promise(function(resolve, reject){
        if( ketiCiotGlobalObject.initialized ) {
            resolve(ketiCiotGlobalObject);
        }
        else {
            var config = new Config.ClientConfig();
            config.networkConfig.addresses = [{host: GLOBAL_NODE_ADDRESS, port: '5701'}];


            HazelcastClient.newHazelcastClient(config)
                .then(function (hazelcastClient) {

                    Object.keys(ketiCiotGlobalObjectKeys).map(function(key){
                        ketiCiotGlobalObject[key] = hazelcastClient.getMap(key);
                    });


                    ketiCiotGlobalObject.initialized = true;
                    resolve(ketiCiotGlobalObject);
                })
                .catch(function(err){
                    reject( err );
                });
        }

    });

}


function _setValue(category, key, value) {
    return new Promise(function(resolve, reject){
        _initClient()
            .then( function(ketiCiotGlobalObject ) {
                if( !ketiCiotGlobalObject[category] )
                    reject( new Error("Invalid Argument: category not found") );
                else {
                    ketiCiotGlobalObject[category].put( key, value )
                        .then(function(val){
                            resolve( val );
                        })
                        .catch( function(err) {
                            reject( err );
                        });
                }
            })
            .catch( function(err) {
                reject( err );
            } );
    });
}


function _getValue(category, key) {
    return new Promise(function(resolve, reject){
        _initClient()
            .then( function(ketiCiotGlobalObject ) {
                if( !ketiCiotGlobalObject[category] )
                    reject( new Error("Invalid Argument: category not found") );
                else {
                    ketiCiotGlobalObject[category].get( key)
                        .then(function(val){
                            resolve( val );
                        })
                        .catch( function(err) {
                            reject( err );
                        });
                }
            })
            .catch( function(err) {
                reject( err );
            } );
    });
}


function _entries(category) {
    return new Promise(function(resolve, reject){
        _initClient()
            .then( function(ketiCiotGlobalObject ) {
                if( !ketiCiotGlobalObject[category] )
                    reject( new Error("Invalid Argument: category not found") );
                else {
                    ketiCiotGlobalObject[category].entrySet()
                        .then(function(val){
                            resolve( val );
                        })
                        .catch( function(err) {
                            reject( err );
                        });
                }
            })
            .catch( function(err) {
                reject( err );
            } );
    });
}


function _setEventListener(category, key, listener) {
    return new Promise(function(resolve, reject){

        try{
            _initClient()
                .then( function(ketiCiotGlobalObject ) {
                    if( !ketiCiotGlobalObject[category] )
                        reject( new Error("Invalid Argument: category not found") );
                    else {
                        ketiCiotGlobalObject[category].addEntryListener(listener, key)
                            .then(function(val){
                                resolve( val );
                            })
                            .catch( function(err) {
                                reject( err );
                            });
                    }
                })
                .catch( function(err) {
                    reject( err );
                } );
        }
        catch(ex) {
            console.log(ex);
            reject(ex);
        }

    });
}