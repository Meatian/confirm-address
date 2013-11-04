//Thankyou for cool patch!!  http://easy-small-world.com/2010/07/thunderbird_confirmaddress_fix.html

//overlay
//C:\Program Files\Mozilla Thunderbird\chrome\messenger\content\messenger\messengercompose\MsgComposeCommands.js
var	ConfirmAddress_org_SendMessage = SendMessage;
var	SendMessage = function()
{
	if( !ConfirmAddress.checkAddress() )	{ return; }

	//add start
	if(!ConfirmAddress.checkAddress()){
		return;
	}
	//add end
	ConfirmAddress_org_SendMessage();
}

//overlay
//C:\Program Files\Mozilla Thunderbird\chrome\messenger\content\messenger\messengercompose\MsgComposeCommands.js
var ConfirmAddress_org_SendMessageWithCheck = SendMessageWithCheck;
var	SendMessageWithCheck	=	function()
{
	//add start
	if(!ConfirmAddress.checkAddress()){
		return;
	}
	//add end
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
	ConfirmAddress_org_SendMessageWithCheck();
}
