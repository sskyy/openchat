
  angular.module('initialize',[]).run( ( $http )->
    append_template = ( template )->
      htmlRef = angular.element(template);
      angular.element("html").append( htmlRef );
      angular.bootstrap( htmlRef, ['logHelper'] );
    decode_entity_quote = (str)->
      str = str.replace(/&quot;/g, '"');
      str = str.replace(/&#39;/g, "'") ;
      return str;
        
    $http.jsonp(TOOLHOST+'/index.php?c=page&m=template&callback=JSON_CALLBACK').error(()->
      console.log("get template error");
    ).success(( html )->
      append_template( decode_entity_quote( html ) );
    );
  );
    
  load_css(TOOLHOST + "/application/views/css/tool.css?");

  angular.bootstrap( angular.element(document),["initialize"] );
