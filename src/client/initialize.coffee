url = "http://<%=config.host%>:<%=config.port%>" 
angular.module('initialize',[]).run( ( $http )->
  append_template = ( template, id )->
    htmlRef = angular.element(template);
    container = document.getElementById( id );
    angular.element(container).html( htmlRef );
    angular.bootstrap( htmlRef, ['openchat'] );
  
  decode_entity_quote = (str)->
    str = str.replace(/&quot;/g, '"');
    str = str.replace(/&#39;/g, "'") ;
    return str;

  $http.jsonp( url +'/resource/jsonp?resource=build/client/openchat.tpl.html&callback=JSON_CALLBACK').error(()->
    console.log("get template error");
  ).success( ( html )->
    append_template( decode_entity_quote( html ), 'openchat-container' );
  );

  load_css( url + "/build/css/openchat.css?" );
  angular.bootstrap( angular.element(document),["initialize"] );
  
  load_css = (css_file) ->
    html_doc = document.getElementsByTagName('head')[0];
    css = document.createElement('link');
    css.setAttribute('rel', 'stylesheet');
    css.setAttribute('type', 'text/css');
    css.setAttribute('href', css_file);
    html_doc.appendChild(css);
    
  )
