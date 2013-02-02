//global config

module.exports = {
    'production' : {
        'host' : "42.96.146.173", 
        'socket.io': {
            port : 8000
        },
        'port' : 80,
        'weibo' : {
            appkey : 3312201828
        },
        'version' : ''
    },
    'developement' : {
        'host' : "127.0.0.1", 
        'socket.io': {
            port : 8000
        },
        'port' : 8000,
        'weibo' : {
            appkey : 3312201828
        },
        'version' : '_local',
        'watch' : 'auto'
    }
}

