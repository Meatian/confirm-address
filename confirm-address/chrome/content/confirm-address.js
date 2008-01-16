function CheckAddresses()
{
	var msgCompFields = gMsgCompose.compFields;
	
	var toList = new Array();
	var ccList = new Array();
	var bccList = new Array();
	collectAddresses(msgCompFields, toList, ccList, bccList)
	
	dump("[TO] "+ toList + "\n");
	dump("[CC] "+ ccList + "\n");
	dump("[BCC] "+ bccList + "\n");
	
	var internalList = new Array();
	var externalList = new Array();

	var domainList = getDomainList();
	
	dump("[DOMAINLIST] "+ domainList + "\n");
	
	judge(toList, domainList, internalList, externalList);
	judge(ccList, domainList, internalList, externalList);
	judge(bccList, domainList, internalList, externalList);

	dump("[INTERNAL] "+ internalList + "\n");
	dump("[EXTERNAL] "+ externalList + "\n");

	if(PrefUtil.isNotDisplay()){
		if(externalList.length == 0){
			return true;
		}
	}
	
	window.confirmOK = false;
	window.openDialog("chrome://confirm-address/content/confirm-address-dialog.xul",
		"ConfirmAddressDialog", "resizable,chrome,modal,titlebar,centerscreen", window, internalList, externalList);
	
	if(window.confirmOK){
		return true;
	}else{
		return false;
	}
}

function collectAddresses(msgCompFields, toList, ccList, bccList){

	if (msgCompFields == null){
		return;
	}
	var gMimeHeaderParser = Components.classes["@mozilla.org/messenger/headerparser;1"].getService(Components.interfaces.nsIMsgHeaderParser);
	
	var row = 1;
	while(true){
		var inputField = document.getElementById("addressCol2#" + row);
		
		if(inputField == null){
			break;
		}else{
			row++;
		}
		var fieldValue = inputField.value;
		if (fieldValue == null){
			fieldValue = inputField.getAttribute("value");
		}
		
		if (fieldValue != ""){
			
			var recipient = null;
			try {
				recipient = gMimeHeaderParser.reformatUnquotedAddresses(fieldValue);
			} catch (ex) {
				recipient = fieldValue;
			}

			var recipientType = "";
			var popupElement = document.getElementById("addressCol1#" + row);
			if(popupElement != null){
				recipientType = popupElement.selectedItem.getAttribute("value");
			}

			switch (recipientType){
			case "addr_to":
				toList.push(recipient);
				break;
			case "addr_cc":
				ccList.push(recipient);
				break;
			case "addr_bcc":
				bccList.push(recipient);
				break;
			default:
				toList.push(recipient);
				break;
			}
		}
	}
}

function judge(addressArray, domainList, yourDomainAddress, otherDomainAddress)
{
	dump("[JUDGE] "+addressArray+"\n");
		
	for(i = 0; i < addressArray.length; i++){
		var address = addressArray[i];
		if(address.length == 0){
			continue;
		}
		
		var addressLowerCase = address.toLowerCase();

		var yourDomain = false;
		
		for(j = 0; j < domainList.length; j++){
			var domainListEntry = domainList[j].toLowerCase();
			if(addressLowerCase.indexOf(domainListEntry) != -1){
				yourDomain = true;
				break;
			}
		}

		if(yourDomain){
			yourDomainAddress.push(address);
		}else{
			otherDomainAddress.push(address);
		}
	}
}

function getDomainList()
{
	var domains = PrefUtil.getDomainList();
	var list = new Array();
		
	var domainList = domains.split(",");
	for(var i=0; i < domainList.length; i++){
		list.push(domainList[i]);
	}	
	return list;
}

//overlay
//C:\Program Files\Mozilla Thunderbird\chrome\messenger\content\messenger\messengercompose\MsgComposeCommands.js
function SendMessage()
{
	//add start
	if(!CheckAddresses()){
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
	if(!CheckAddresses()){
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
