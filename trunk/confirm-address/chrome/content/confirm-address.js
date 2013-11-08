var ConfirmAddress = {

	var	vars	=	{
		confirmOK:	false
	};

	checkAddress: function(){
		var msgCompFields = gMsgCompose.compFields;
		var toList = [];
		var ccList = [];
		var bccList = [];
		this.collectAddress(msgCompFields, toList, ccList, bccList)
		dump("[TO] "+ toList + "\n");
		dump("[CC] "+ ccList + "\n");
		dump("[BCC] "+ bccList + "\n");

		var domainList = this.getDomainList();
		dump("[DOMAINLIST] "+ domainList + "\n");

		var internalList = [];
		var externalList = [];
		this.judge(toList, domainList, internalList, externalList);
		this.judge(ccList, domainList, internalList, externalList);
		this.judge(bccList, domainList, internalList, externalList);
		dump("[INTERNAL] "+ internalList + "\n");
		dump("[EXTERNAL] "+ externalList + "\n");

		var isNotDisplay = nsPreferences.getBoolPref(CA_CONST.IS_NOT_DISPLAY, false);

		if(isNotDisplay && externalList.length == 0 && internalList.length > 0) {
			vars.confirmOK = true;
		} else {
			vars.confirmOK = false;
			window.openDialog("chrome://confirm-address/content/confirm-address-dialog.xul",
				"ConfirmAddressDialog", "resizable,chrome,modal,titlebar,centerscreen", 
				window, internalList, externalList);
		}

		if(vars.confirmOK)
		{
			var isCountDown = nsPreferences.getBoolPref(CA_CONST.IS_COUNT_DOWN, false);

			if(isCountDown){
				var countDonwTime = nsPreferences.copyUnicharPref(CA_CONST.COUNT_DOWN_TIME);

				window.countDownComplete = false;
				window.openDialog("chrome://confirm-address/content/countdown.xul", "CountDown Dialog", 
					"resizable,chrome,modal,titlebar,centerscreen",window, countDonwTime);

				if(window.countDownComplete){
					return true;
				}else{
					dump("cancel");
					return false;
				}
			}else{
				return true;
			}
		}else{
			return false;
		}
	},

	getByDomainMap : function(list){
		var resultMap = new Array();

		for(var i=0; i<list.length; i++){
			var adrs = list[i];
			dump(adrs);
			var idx = adrs.indexOf("@");
			var domain = adrs.substring(idx);
			if(!resultMap[domain]){
				resultMap[domain] = new Array();
			}
			resultMap[domain].push(adrs);
			dump(resultMap[domain]);
		}
		dump(resultMap);
		return resultMap;
	},
  
	collectAddress : function(msgCompFields, toList, ccList, bccList){
		if (msgCompFields == null){
			return;
		}
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
					recipient = MailServices.headerParser.reformatUnquotedAddresses(fieldValue);
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
	},

	/**
	* addressArrayに含まれるアドレスを判定し、組織外、組織内に振り分けます
	*/
	judge : function(addressArray, domainList, yourDomainAddress, otherDomainAddress){
		dump("[JUDGE] "+addressArray+"\n");

		//if domainList is empty, all addresses are external.
		if(domainList.length == 0){
			for(var i = 0; i < addressArray.length; i++){
				otherDomainAddress.push(addressArray[i]);
			}
			return;
		}

		//compare addresses with registered domain lists.
		for(var i = 0; i < addressArray.length; i++){
			var address = addressArray[i];
			if(address.length == 0){
				continue;
			}
			var domain = address.substring(address.indexOf("@")).toLowerCase();
			match = false;
			for(var j = 0; j < domainList.length; j++){
				var insiderDomain = domainList[j].toLowerCase();
				if(domain.indexOf(insiderDomain) != -1){
					match = true;
				}
			}
			if(match){
				yourDomainAddress.push(address);
			}else{
				otherDomainAddress.push(address);
			}
		}
	},

	getDomainList : function(){
		var domains = nsPreferences.copyUnicharPref(CA_CONST.DOMAIN_LIST);
		if(domains == null || domains.length == 0){
			return new Array();
		}
		return domains.split(",");
	}
}

