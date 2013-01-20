//global config

module.exports = {
    'production' : {
        'host' : "jieq1u3u19.elb7.stacklab.org", 
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

