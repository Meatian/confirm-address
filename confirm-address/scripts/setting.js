function startup(){
	//init domain list.
	var domains = nsPreferences.copyUnicharPref(CA_CONST.DOMAIN_LIST);

	if(domains && domains !== "") {
		dump("[REGISTERED DOMAINS] " + domains + "\n");
	  var domainList = domains.split(","),
      groupList = document.getElementById("group-list");
	  for (var i = 0, len = domainList.length; i < len; i++){
	    var listItem = document.createXULElement("richlistitem");
      var labelCell = document.createXULElement("label");
	    labelCell.setAttribute("value", domainList[i]);
	    listItem.appendChild(labelCell);
	    listItem.setAttribute("id", Math.random());
      groupList.appendChild(listItem);
	  }
	}

	//init checkbox [not dispaly when only my domain mail]
	var isNotDisplay = nsPreferences.getBoolPref(CA_CONST.IS_NOT_DISPLAY, false);
	var noDisplayBox = document.getElementById("not-display");
	noDisplayBox.checked = isNotDisplay;

	//init checkbox [countdown]
	var cdBox = document.getElementById("countdown");
	var cdTimeBox = document.getElementById("countdown-time");
	cdBox.addEventListener('command', function(event){
		cdTimeBox.disabled = !cdBox.checked;
	}, true);

	var isCountDown = nsPreferences.getBoolPref(CA_CONST.IS_COUNT_DOWN, false);
	if (isCountDown === null || isCountDown === false) {
		cdBox.checked = false;
		cdTimeBox.disabled = true;
	} else {
		cdBox.checked = true;
		cdTimeBox.disable = false;
	}

	var countDonwTime = nsPreferences.copyUnicharPref(CA_CONST.COUNT_DOWN_TIME);
	cdTimeBox.value = countDonwTime;

	// init checkbox [confrim Reply-To address before sending]
	var isConfirmReplyTo = nsPreferences.getBoolPref(CA_CONST.IS_CONFIRM_REPLY_TO);
	var replyBox = document.getElementById("confirm-reply-to");
	replyBox.checked = isConfirmReplyTo;

	// init checkbox [confirm batch-check my domain]
	var isBatchCheckmy = nsPreferences.getBoolPref(CA_CONST.IS_BATCH_CHECK_MYDOMAIN);
	var batchCheckBoxmy = document.getElementById("batchcheck-mydomain");
	batchCheckBoxmy.checked = isBatchCheckmy;

	// init checkbox [confirm batch-check other domain]
	var isBatchCheckother = nsPreferences.getBoolPref(CA_CONST.IS_BATCH_CHECK_OTHERDOMAIN);
	var batchCheckBoxother = document.getElementById("batchcheck-otherdomain");
	batchCheckBoxother.checked = isBatchCheckother;

	document.addEventListener("dialogaccept", doOK.bind(this));
	document.addEventListener("dialogcancel", doCancel.bind(this));
}

function addItem() {
	var params = {inn:{domainName:null}, out:null};
	window.openDialog("chrome://confirm-address/content/setting-add-domain.xul",
	    "ConfirmAddressDialog", "chrome,modal,titlebar,centerscreen", params).focus();
	if(params.out){
	  var domainName = params.out.domainName;
	  if(domainName.length > 0){
	    dump("[ADD] " + domainName + "\n");
	    var groupList = document.getElementById("group-list");
        var listItem = document.createXULElement("richlistitem");
	    var labelCell = document.createXULElement("label");
	    labelCell.setAttribute("value", domainName);
	    listItem.appendChild(labelCell);
        listItem.setAttribute("id", Math.random());
        groupList.appendChild(listItem);
	  }
	}
}

function editItem() {
	var groupList = document.getElementById("group-list"),
	    selectedItem = groupList.selectedItem;
	if (selectedItem === null) {
		return;
	}

	var params = {inn:{domainName:selectedItem.label}, out:null};
	window.openDialog("chrome://confirm-address/content/setting-add-domain.xul",
		"ConfirmAddressDialog", "chrome,modal,titlebar,centerscreen", params).focus();

	if (params.out) {
		var domainName = params.out.domainName;
		if (domainName.length > 0) {
			dump("[edit] " + domainName + "\n");
			var selectedId = selectedItem.getAttribute("id");
			document.getElementById(selectedId).childNodes[0].setAttribute("value", domainName);
		}
	}
}

function removeItem() {
	var groupList = document.getElementById("group-list"),
	    selectedItem = groupList.selectedItem;
	if (selectedItem === null) {
		return;
	}
	dump("[REMOVE] "+selectedItem + "\n");
	groupList.removeChild(selectedItem);
}

function doOK(event) {
	dump("[OK]\n");

	//ドメイン設定保存
	var domainList = [];

	var groupList = document.getElementById("group-list");
	var nodes = groupList.childNodes;
	for (var i = 0, len = nodes.length; i < len; i++){
		if(nodes[i].nodeName == "richlistitem"){
			domainList.push(nodes[i].label);
		}
	}
	var domainListStr = domainList.join(",");
	nsPreferences.setUnicharPref(CA_CONST.DOMAIN_LIST, domainListStr);

	//チェックボックス設定保存
	var notDisplay = document.getElementById("not-display").checked;
	nsPreferences.setBoolPref(CA_CONST.IS_NOT_DISPLAY, notDisplay);

	var isCountdown = document.getElementById("countdown").checked;
	nsPreferences.setBoolPref(CA_CONST.IS_COUNT_DOWN, isCountdown);

	var cdTime = document.getElementById("countdown-time").value;
	if(isNaN(Number(cdTime)) && isCountdown ){
		alert("please input integer");
		return false;
	}
	nsPreferences.setUnicharPref(CA_CONST.COUNT_DOWN_TIME, cdTime);

	var replyTo = document.getElementById("confirm-reply-to").checked;
	nsPreferences.setBoolPref(CA_CONST.IS_CONFIRM_REPLY_TO, replyTo);
	
	var batchCheck_my = document.getElementById("batchcheck-mydomain").checked;
	nsPreferences.setBoolPref(CA_CONST.IS_BATCH_CHECK_MYDOMAIN, batchCheck_my);

	var batchCheck_other = document.getElementById("batchcheck-otherdomain").checked;
	nsPreferences.setBoolPref(CA_CONST.IS_BATCH_CHECK_OTHERDOMAIN, batchCheck_other);
}

function doCancel(event) {
	dump("[CANCEL]\n");
}
