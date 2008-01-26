var selectedItem;

var CA_CONST = {
	DOMAIN_LIST : "com.kenmaz.confirm-address.domain-list",
	IS_NOT_DISPLAY : "com.kenmaz.confirm-address.not-display",
	IS_COUNT_DOWN : "com.kenmaz.confirm-address.is-countdown",
	COUNT_DOWN_TIME : "com.kenmaz.confirm-address.cd-time",
};

function startup(){

	//init domain list.
	document.getElementById("add").addEventListener('command', add, true);
	document.getElementById("edit").addEventListener('command', edit, true);
	document.getElementById("remove").addEventListener('command', remove, true);
	var groupList = document.getElementById("group-list");

	var domains = nsPreferences.copyUnicharPref(CA_CONST.DOMAIN_LIST);
	dump("[registed domains] " + domains + "\n");
	
	if(domains == null || domains.length == 0){
		return;
	}
	var domainList = domains.split(",");

	for(var i=0; i < domainList.length; i++){
		var listitem = document.createElement("listitem");
		listitem.setAttribute("label", domainList[i]);
		listitem.setAttribute("id", Math.random());
		groupList.appendChild(listitem);
	}
	
	//init checkbox [not dispaly when only my domain mail]
	var isNotDisplay = nsPreferences.getBoolPref(CA_CONST.IS_NOT_DISPLAY, false);
	var noDisplayBox = document.getElementById("not-display");
	if(isNotDisplay){
		noDisplayBox.checked=true;
	}else{
		noDisplayBox.checked=false;
	}
	
	//init checkbox [countdown]
	var cdBox = document.getElementById("countdown");
	var cdTimeBox = document.getElementById("countdown-time");

	cdBox.addEventListener('command',
		function(event){
			cdTimeBox.disabled = !cdBox.checked;
		},
		true);

	var isCountDown = nsPreferences.getBoolPref(CA_CONST.IS_COUNT_DOWN, false);
	if(isCountDown == null || isCountDown == false){
		cdBox.checked = false;
		cdTimeBox.disabled = true;
	}else{
		cdBox.checked = true;
		cdTimeBox.disable = false;
	}

	var countDonwTime = nsPreferences.copyUnicharPref(CA_CONST.COUNT_DOWN_TIME);
	cdTimeBox.value = countDonwTime;
}

function add(event){
	window.confirmOK = false;
	window.domainName = null;
	window.openDialog("chrome://confirm-address/content/setting-add-domain.xul",
		"ConfirmAddressDialog", "chrome,modal,titlebar,centerscreen", window);

	if(window.confirmOK){
		var domainName = window.domainName;
		
		if(domainName.length > 0){
			dump("[add!] " + domainName + "\n");
			var groupList = document.getElementById("group-list");
			var listitem = document.createElement("listitem");
			listitem.setAttribute("label", domainName);
			listitem.setAttribute("id", Math.random());
			groupList.appendChild(listitem);
		}
	}
}
function edit(event){
	window.confirmOK = false;
	window.domainName = selectedItem.label;
	window.openDialog("chrome://confirm-address/content/setting-add-domain.xul",
		"ConfirmAddressDialog", "chrome,modal,titlebar,centerscreen", window);
		
	if(window.confirmOK){
		var domainName = window.domainName;
		
		if(domainName.length > 0){
			dump("[edit!] " + domainName + "\n");
			selectedItem.setAttribute("label", domainName);
		}
	}
}
function remove(event){
	var groupList = document.getElementById("group-list");
	dump("[remove] "+selectedItem + "\n");
	groupList.removeChild(selectedItem);
}

function selectList(item){
	selectedItem = item;
}

function doOK(){
	dump("[OK]\n");

	//ドメイン設定保存
	var domainList = new Array();
	
	var groupList = document.getElementById("group-list");
	var nodes = groupList.childNodes;
	for(i = 0; i < nodes.length; i++){
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

function doCancel(){
	dump("[cancel]\n");
	return true;
}

