
#detect page 
angular.module('openchat.service').service('$chat',()->
  $chat =
    _callback : {}
    set_connect : (@connect)-> this
    set_target : ( target )-> 
      @target = angular.copy( target );
      delete @target.messages
      @_invoke_callback 'set_target', @target
    set_message : (@message)-> console.log @target;this
    get_target : ()-> @target
    get_message : ()-> @message
    send : ( )->
      if not @connect?.connected
        return console.log( 'I have no connection to use')
      if not( @target&&@message )
        return console.log( 'target or message not set', @target, @message)
      console.log( 'sending message to:', @target )
      @connect.emit 'send_message', { target:@target, message:@message}
    on : ( event, fn, context )->
      if not event of this
        return false
      @_callback[event] ?= []
      context ?= fn
      @_callback[event].push( {fn,context} )
      this
    _invoke_callback : ( event, data )->
      console.log( 'call chat callback', event, data )
      if @_callback[event]?
        for callback in @_callback[event]
          callback.fn.call( callback.context, data )
      this
    
  return $chat
)



