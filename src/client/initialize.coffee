url = "http://<%=config.host%>:<%=config.port%>" 
angular.module('initialize',[]).run( ( $http,$window )->
  append_template = ( template, id )->
    htmlRef = angular.element(template);
    container = document.getElementById( id );
    angular.element(container).append( htmlRef );
    angular.bootstrap( htmlRef, ['openchat'] );
  
  decode_entity_quote = (str)->
    str = str.replace(/&quot;/g, '"');
    str = str.replace(/&#39;/g, "'") ;
    return str;
    
  load_css = (css_file) ->
    html_doc = document.getElementsByTagName('head')[0];
    css = document.createElement('link');
    css.setAttribute('rel', 'stylesheet');
    css.setAttribute('type', 'text/css');
    css.setAttribute('href', css_file);
    html_doc.appendChild(css);
    
  $http.jsonp( "#{url}/resource/jsonp?resource=build/client/openchat.tpl.html&callback=JSON_CALLBACK").error(()->
    console.log("get template error");
  ).success( ( html )->
    append_template( decode_entity_quote( html ), 'openchat-container' );
  );

  load_css(  "#{url}/build/client/css/openchat.css?" );
  
  #设置轮训检测脚本更新
  if( '<%=config.watch%>'== 'auto' )
    $window.setInterval(()->
      $http.jsonp( "#{url}/build_spy/get_build?callback=JSON_CALLBACK").success(( res )->
        if( res.build != undefined  && res.build != _OPENCHAT_BUILD )
          console.log('need refressh', res.build, _OPENCHAT_BUILD)
          $window.location.reload()
      )
    ,1000)
  )
  
angular.bootstrap( angular.element(document),["initialize"] );
