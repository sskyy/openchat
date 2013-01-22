var mongoClient = require('mongodb').MongoClient

module.exports = {
    set_session : function( req ){
        this._get_current( req.originalUrl )
    },
    _get_current : function( url ){
        console.log( url );
        mongoClient.connect("mongodb://127.0.0.1:27017/openchat",function( err, db){
            console.log( err );
            if( !db.collection('page') ){
                db.createCollection('page', function( err, collection){
                        collection.insert({"url":url}, function(err, collection){
                            var stream = collection.find({"url":url}).stream();
                            stream.on("data", function( item ){
                                console.log( item)
                            })
                            stream.on('end', function(){
                                process.exit().emit();
                            });
                        });
                })
            }else{
                var collection = db.collection('page');
                collection.insert({"url":url}, function(err, object){
                    console.log( collection );return;
                    var stream = collection.find({"url":url}).stream();
                    stream.on("data", function( item ){
                        console.log( item)
                    })
                    stream.on('end', function(){
                        process.exit().emit();
                    });
                });
            }
        });
    },
    insert_page : function(){
        
    }
}


