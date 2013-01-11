~function(){
    angular.module('initialize',[]).run(function( $http ){
        function append_template( template ){
            var htmlRef = angular.element(template);
            var container = document.getElementById('openchat-container');
            angular.element(container).append( htmlRef );
            angular.bootstrap( htmlRef, ['openchat'] );
        }
        function decode_entity_quote(str) {
            str = str.replace(/&quot;/g, '"');
            str = str.replace(/&#39;/g, "'") ;
            return str;
        }
        
        $http.jsonp(TOOLHOST+'/build/openchat.tpl.html').error(function(){
            console.log("get template error");
        }).success(function( html ){
            append_template( decode_entity_quote( html ) );
        });
    });
    
    load_css(TOOLHOST + "/build/css/openchat.css?");

    angular.bootstrap( angular.element(document),["initialize"] );
    function load_css(css_file) {
        var html_doc = document.getElementsByTagName('head')[0];
        var css = document.createElement('link');
        css.setAttribute('rel', 'stylesheet');
        css.setAttribute('type', 'text/css');
        css.setAttribute('href', css_file);
        html_doc.appendChild(css);
    }
}()
