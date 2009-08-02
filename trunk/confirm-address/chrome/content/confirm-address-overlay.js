//overlay
//C:\Program Files\Mozilla Thunderbird\chrome\messenger\content\messenger\messengercompose\MsgComposeCommands.js
function SendMessage()
{
	//add start
	if(!ConfirmAddress.checkAddress()){
		return;
	}
	//add end

  dump("SendMessage from XUL\n");
  GenericSendMessage(nsIMsgCompDeliverMode.Now);
}

//overlay
//C:\Program Files\Mozilla Thunderbird\chrome\messenger\content\messenger\messengercompose\MsgComposeCommands.js
function SendMessageWithCheck()
{
	//add start
	if(!ConfirmAddress.checkAddress()){
		return;
	}
	//add end

    var warn = sPrefs.getBoolPref("mail.warn_on_send_accel_key");

    if (warn) {
        var checkValue = {value:false};
        var buttonPressed = gPromptService.confirmEx(window, 
              sComposeMsgsBundle.getString('sendMessageCheckWindowTitle'), 
              sComposeMsgsBundle.getString('sendMessageCheckLabel'),
              (gPromptService.BUTTON_TITLE_IS_STRING * gPromptService.BUTTON_POS_0) +
              (gPromptService.BUTTON_TITLE_CANCEL * gPromptService.BUTTON_POS_1),
              sComposeMsgsBundle.getString('sendMessageCheckSendButtonLabel'),
              null, null,
              sComposeMsgsBundle.getString('CheckMsg'), 
              checkValue);
        if (buttonPressed != 0) {
            return;
        }
        if (checkValue.value) {
            sPrefs.setBoolPref("mail.warn_on_send_accel_key", false);
        }
    }

  GenericSendMessage(gIsOffline ? nsIMsgCompDeliverMode.Later
                                 : nsIMsgCompDeliverMode.Now);
}
