var selectedItem;

function startup(){

	//ドメイン名リスト初期化
	document.getElementById("add").addEventListener('command', add, true);
	document.getElementById("edit").addEventListener('command', edit, true);
	document.getElementById("remove").addEventListener('command', remove, true);
	
	var groupList = document.getElementById("group-list");
	var domains = PrefUtil.getDomainList();
	
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
	
	//チェックボックス初期化
	var checkbox = document.getElementById("not-display");
	var isNotDisplay = PrefUtil.isNotDisplay();
	if(isNotDisplay == null || isNotDisplay == false){
		checkbox.checked=false;
	}else{
		checkbox.checked=true;
	}
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
	PrefUtil.setDomainList(domainListStr);

	//チェックボックス設定保存
	var checked = document.getElementById("not-display").checked;
	PrefUtil.setNotDisplay(checked);
	
	return true;
}

function doCancel(){
	dump("[cancel]\n");
	return true;
}

