var ConfirmAddress = {
  strList: function(address_list){
    var txt = "";
    for (var i=0; i<address_list.length; i++)
    {
        if (txt == "")
        {
            txt = address_list[i]["address"];
        }
        else
        {
            txt = txt + "," +  address_list[i]["address"];
        }
    }
    return txt;
  },

  checkAddress: function(){
  	var msgCompFields = gMsgCompose.compFields;

  	var toList = [];
  	var ccList = [];
  	var bccList = [];
    var otherList = [];
  	this.collectAddress(msgCompFields, toList, ccList, bccList, otherList);
  	dump("[TO] "+ this.strList(toList) + "\n");
  	dump("[CC] "+ this.strList(ccList) + "\n");
  	dump("[BCC] "+ this.strList(bccList) + "\n");

    var domainList = this.getDomainList();
	dump("[DOMAINLIST] "+ domainList + "\n");

  	var internalList = [];
  	var externalList = [];
  	this.judge(toList, domainList, internalList, externalList);
  	this.judge(ccList, domainList, internalList, externalList);
  	this.judge(bccList, domainList, internalList, externalList);
  	this.judge(otherList, domainList, internalList, externalList);
  	dump("[INTERNAL] "+ this.strList(internalList) + "\n");
  	dump("[EXTERNAL] "+ this.strList(externalList) + "\n");

  	var isNotDisplay = nsPreferences.getBoolPref(CA_CONST.IS_NOT_DISPLAY, false);
  	if(isNotDisplay && externalList.length == 0 && internalList.length > 0){
		  window.confirmOK = true;
  	}else{
      window.confirmOK = false;
      window.openDialog("chrome://confirm-address/content/confirm-address-dialog.xul",
        "ConfirmAddressDialog", "resizable,chrome,modal,titlebar,centerscreen",
        window, internalList, externalList);
    }

  	if(window.confirmOK){
  		var isCountDown = nsPreferences.getBoolPref(CA_CONST.IS_COUNT_DOWN, false);

  		if(isCountDown){
  			var countDonwTime = nsPreferences.copyUnicharPref(CA_CONST.COUNT_DOWN_TIME);

  			window.countDownComplete = false;
  			window.openDialog("chrome://confirm-address/content/countdown.xul", "CountDown Dialog",
  			"resizable,chrome,modal,titlebar,centerscreen",window, countDonwTime);
  			if(window.countDownComplete){
  				return true;
  			}else{
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

  collectAddress : function(msgCompFields, toList, ccList, bccList, otherList){

  	if (msgCompFields == null){
  		return;
  	}

    var includeReplyTo = nsPreferences.getBoolPref(CA_CONST.IS_CONFIRM_REPLY_TO, false);
  	var row = 0;
  	while(true){
      row++;
  		var inputField = document.getElementById("addressCol2#" + row);

  		if(inputField == null){
  			break;
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
  				toList.push({type: "To: ", address: recipient});
  				break;
  			case "addr_cc":
  				ccList.push({type: "Cc: ", address: recipient});
  				break;
  			case "addr_bcc":
  				bccList.push({type: "Bcc: ", address: recipient});
  				break;
        case "addr_reply":
          if (includeReplyTo) {
            bccList.push({type: "Reply-To: ", address: recipient});
          }
          break;
  			default:
  				otherList.push({type: "", address: recipient});
  				break;
  			}
  		}
  	}
  },

	/**
   * addressArrayに含まれるアドレスを判定し、組織外、組織内に振り分けます
	 */
  judge : function(addressArray, domainList, yourDomainAddress, otherDomainAddress){
  	dump("[JUDGE] "+ this.strList(addressArray)+"\n");

  	//if domainList is empty, all addresses are external.
  	if(domainList.length == 0){
  		for(var i = 0; i < addressArray.length; i++){
  			otherDomainAddress.push(addressArray[i]);
  		}
  		return;
  	}

  	//compare addresses with registered domain lists.
  	for(var i = 0; i < addressArray.length; i++){
  		var target = addressArray[i];
      var address = target.address;
  		if(address.length == 0){
  			continue;
  		}
			var domain = address.substring(address.indexOf("@")).toLowerCase();

			var match = false;
  		for(var j = 0; j < domainList.length; j++){
  			var insiderDomain = domainList[j].toLowerCase();
  			if(domain.indexOf(insiderDomain) != -1){
					match = true;
  			}
  		}
			if(match){
  			yourDomainAddress.push(target);
			}else{
 				otherDomainAddress.push(target);
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
