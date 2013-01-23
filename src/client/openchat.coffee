
#console = { log:()-> } unless console?

window._OPENCHAT_BUILD = '<%=_openchat_build%>'
#{include "module_define.coffee"}
#{include "service-connect.coffee"}
#{include "service-user.coffee"}
#{include "service-chat.coffee"}
#{include "controller-basic.coffee"}
#{include "controller-private_chat.coffee"}
#{include "controller-public_chat.coffee"}
#{include "controller-user_list.coffee"}