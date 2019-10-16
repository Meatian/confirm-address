//Thankyou for cool patch!!  http://easy-small-world.com/2010/07/thunderbird_confirmaddress_fix.html

//overlay
//C:\Program Files\Mozilla Thunderbird\chrome\messenger\content\messenger\messengercompose\MsgComposeCommands.js
var SendMessage = function() {
  if( !ConfirmAddress.checkAddress() ) {
    return;
  }

  // Copied from MsgComposeCommands.js.
  var sendInBackground = Services.prefs.getBoolPref("mailnews.sendInBackground");
  if (sendInBackground && !Application.platformIsMac) {
    var enumerator = Services.wm.getEnumerator(null);
    var count = 0;
    while (enumerator.hasMoreElements() && count < 2) {
      var win = enumerator.getNext();
      count++;
    }
    if (count == 1)
      sendInBackground = false;
  }
  GenericSendMessage(sendInBackground ?
                     Components.interfaces.nsIMsgCompDeliverMode.Background :
                     Components.interfaces.nsIMsgCompDeliverMode.Now);
  ExitFullscreenMode();
}

//overlay
//C:\Program Files\Mozilla Thunderbird\chrome\messenger\content\messenger\messengercompose\MsgComposeCommands.js
var SendMessageWithCheck = function() {
  //add start
  if(!ConfirmAddress.checkAddress()){
    return;
  }
  //add end
  // Copied and modified from MsgComposeCommands.js.
  var warn = getPref("mail.warn_on_send_accel_key");
  if (warn) {
    var checkValue = {value:false};
    var bundle = document.getElementById("bundle_composeMsgs");
    var buttonPressed = Services.prompt.confirmEx(window,
          bundle.getString('sendMessageCheckWindowTitle'),
          bundle.getString('sendMessageCheckLabel'),
          (Services.prompt.BUTTON_TITLE_IS_STRING * Services.prompt.BUTTON_POS_0) +
          (Services.prompt.BUTTON_TITLE_CANCEL * Services.prompt.BUTTON_POS_1),
          bundle.getString('sendMessageCheckSendButtonLabel'),
          null, null,
          bundle.getString('CheckMsg'),
          checkValue);
    if (buttonPressed != 0) {
        return;
    }
    if (checkValue.value) {
      var branch = Components.classes["@mozilla.org/preferences-service;1"]
                             .getService(Components.interfaces.nsIPrefBranch);
      branch.setBoolPref("mail.warn_on_send_accel_key", false);
    }
  }
  var sendInBackground = Services.prefs.getBoolPref("mailnews.sendInBackground");
  GenericSendMessage(Services.io.offline ? Components.interfaces.nsIMsgCompDeliverMode.Later :
                     (sendInBackground ?
                      Components.interfaces.nsIMsgCompDeliverMode.Background :
                      Components.interfaces.nsIMsgCompDeliverMode.Now));
  ExitFullscreenMode();
}


var SendMessageLater = function() {
  //add start
  if(!ConfirmAddress.checkAddress()){
    return;
  }
  //add end

  // Copied from MsgComposeCommands.js.
  GenericSendMessage(Components.interfaces.nsIMsgCompDeliverMode.Later);
  ExitFullscreenMode();
}
