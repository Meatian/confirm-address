var CA_CONST = {
	DOMAIN_LIST : "com.kenmaz.confirm-address.domain-list",
	IS_NOT_DISPLAY : "com.kenmaz.confirm-address.not-display",
	IS_COUNT_DOWN : "com.kenmaz.confirm-address.is-countdown",
	COUNT_DOWN_TIME : "com.kenmaz.confirm-address.cd-time",
  TREE_STYLE : "com.kenmaz.confirm-address.tree-style"
};

function startup(){
	//init domain list.
	var domains = nsPreferences.copyUnicharPref(CA_CONST.DOMAIN_LIST);
	dump("[registed domains] " + domains + "\n");

	if(domains != null) {
	  var domainList = domains.split(","),
	      groupList = document.getElementById("group-list");
	  for (var i = 0, len = domainList.length; i < len; i++){
	    var item = groupList.appendItem(domainList[i]);
	    item.setAttribute("id", Math.random());
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
	if (isCountDown == null || isCountDown == false) {
		cdBox.checked = false;
		cdTimeBox.disabled = true;
	} else {
		cdBox.checked = true;
		cdTimeBox.disable = false;
	}

	var countDonwTime = nsPreferences.copyUnicharPref(CA_CONST.COUNT_DOWN_TIME);
	cdTimeBox.value = countDonwTime;
}

function addItem() {
	window.confirmOK = false;
	window.domainName = null;
	window.openDialog("chrome://confirm-address/content/setting-add-domain.xul",
		"ConfirmAddressDialog", "chrome,modal,titlebar,centerscreen", window);

	if(window.confirmOK){
	  var domainName = window.domainName;
	  if(domainName.length > 0){
	    dump("[add!] " + domainName + "\n");
	    var groupList = document.getElementById("group-list");
	    var item = groupList.appendItem(domainName);
	    item.setAttribute("id", Math.random());
	  }
	}
}
function editItem() {
	var groupList = document.getElementById("group-list"),
	    selectedItem = groupList.selectedItem;

	window.confirmOK = false;
	window.domainName = selectedItem.label;
	window.openDialog("chrome://confirm-address/content/setting-add-domain.xul",
		"ConfirmAddressDialog", "chrome,modal,titlebar,centerscreen", window);
		
	if (window.confirmOK) {
		var domainName = window.domainName;
		if (domainName.length > 0) {
			dump("[edit!] " + domainName + "\n");
			selectedItem.setAttribute("label", domainName);
		}
	}
}
function removeItem() {
	var groupList = document.getElementById("group-list"),
	    selectedItem = groupList.selectedItem;
	dump("[remove] "+selectedItem + "\n");
	groupList.removeChild(selectedItem);
}

function doOK() {
	dump("[OK]\n");

	//ドメイン設定保存
	var domainList = [];

	var groupList = document.getElementById("group-list");
	var nodes = groupList.childNodes;
	for (var i = 0, len = nodes.length; i < len; i++){
		if(nodes[i].nodeName == "listitem"){
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

	return true;
}

function doCancel() {
	dump("[cancel]\n");
	return true;
}
