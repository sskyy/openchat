var mongoClient = require('mongodb').MongoClient

module.exports = {
    set_session : function( req, callback ){
        this._get_current( req.param('url') , function( page ){
            console.log('get current page',page);
            page.id= page._id;
            req.session.page = page;
            callback();
        });
    },
    _get_current : function( url,callback ){
        mongoClient.connect("mongodb://127.0.0.1:27017/openchat",function( err, db){
            var collection = db.collection('page');
            collection.findOne({url:url},function(err,item){
               if( !item ){
                   collection.insert({url:url},function(err,item){
                       callback(item);
                   })
               }else{
                   callback(item);
               } 
            });
        });
    }
}


