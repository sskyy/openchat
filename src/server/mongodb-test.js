
var mongoClient = require('mongodb').MongoClient

mongoClient.connect("mongodb://localhost:27017/openchat",function( err, db){
    db.createCollection('discuss', function( err, collection){
        if( err )
            console.log( "err" );
    })

    var collection = db.collection('discuss');
    collection.insert({"name":"jason"}, function(err, collectionR){
        console.log( collection === collectionR );
        var stream = collection.find({"name":"jason"}).stream();
        stream.on("data", function( item ){
            console.log( item)
        })
        stream.on('end', function(){
            process.exit().emit();
        });
    });
    
})

