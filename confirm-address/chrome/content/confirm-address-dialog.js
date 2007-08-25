function startup(){

	var okBtn = document.documentElement.getButton("accept");
	okBtn.disabled = true;
	
	var strbundle = document.getElementById("strings");
	var BtnLabel = strbundle.getString("confirm.dialog.acceptbtn.lable");
	okBtn.label = BtnLabel;

	//自ドメインあて先リスト
	var internals = window.arguments[1];
	var internalList = document.getElementById("yourDomains");
	for(i = 0; i < internals.length; i++){
		var address = internals[i];
		var listitem = createListItem(address);
		internalList.appendChild(listitem);
	}
	
	//他ドメインあて先リスト
	var externals = window.arguments[2];
	var externalList = document.getElementById("otherDomains");
	if(externals.length > 0){
		externalList.setAttribute("style","font-weight: bold;");
	}
	for(i = 0; i < externals.length; i++){
		var address = externals[i];
		var listitem = createListItem(address);
		externalList.appendChild(listitem);
	}	
}

function createListItem(address){

	var listitem = document.createElement("listitem");
	
	var cell1 = document.createElement("listcell");
	var checkbox = document.createElement("checkbox");
	cell1.appendChild(checkbox);
	listitem.appendChild(cell1);
	
	listitem.checkbox = checkbox;
	listitem.onclick = function(event){
		var chekced = this.checkbox.checked;
		this.checkbox.setAttribute("checked", !chekced);
		checkAllChecked();
	};
	
	var cell2 = document.createElement("listcell");
	cell2.setAttribute("label", address);
	listitem.appendChild(cell2);
	
	return listitem;
}

function checkAllChecked(){
	var complete = true;
	var checkboxes = document.getElementsByTagName("checkbox");
	for(var i = 0; i < checkboxes.length; i++){
		var cb = checkboxes[i];
		if(!cb.checked){
			complete = false;
			break;
		}
	}
	var okBtn = document.documentElement.getButton("accept");
	if(complete){
		okBtn.disabled = false;
	}else{
		okBtn.disabled = true;
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
