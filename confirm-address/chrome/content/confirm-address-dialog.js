function startup(){

	//自ドメインあて先リスト
	var hsks = window.arguments[1];
	var hskslist = document.getElementById("yourDomains");
	for(i = 0; i < hsks.length; i++){
		var listitem = document.createElement("listitem");
		listitem.setAttribute("label", hsks[i]);
		hskslist.appendChild(listitem);
	}
	
	//他ドメインあて先リスト
	var others = window.arguments[2];
	var otherslist = document.getElementById("otherDomains");
	if(others.length > 0){
		otherslist.setAttribute("style","font-weight: bold;");
	}
	for(i = 0; i < others.length; i++){
		var listitem = document.createElement("listitem");
		listitem.setAttribute("label", others[i]);
		otherslist.appendChild(listitem);
	}	
}

function doOK(){
	var parentWindow = window.arguments[0];
	parentWindow.confirmOK = true;
	return true;
}

function doCancel(){
	var parentWindow = window.arguments[0];
	parentWindow.confirmOK = false;
	return true;
}
