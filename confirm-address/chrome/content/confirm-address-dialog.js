var caDialog = {};

caDialog.startup = function () {
	var listitem;

	//自ドメインあて先リスト
	var internals = window.arguments[1];
	var internalList = document.getElementById("yourDomains");
	for (var i = 0, ilen = internals.length; i < ilen; i++) {
		listitem = caDialog.createListItem(internals[i]);
		internalList.appendChild(listitem);
	}

	//他ドメインあて先リスト
	var externals = window.arguments[2];
	var externalList = document.getElementById("otherDomains");
	/*
	if(externals.length > 0){
		externalList.setAttribute("style","font-weight: bold;");
	}
	*/
	for (var j = 0, elen = externals.length; j < elen; j++) {
		listitem = caDialog.createListItem(externals[j]);
		externalList.appendChild(listitem);
	}

	//自ドメインあて先リストヘッダ
	var yourDomainsHeader = document.getElementById("yourDomains_allcheck");
	yourDomainsHeader.onclick = caDialog.switchInternalCheckBox;

	//他ドメインあて先リストヘッダ
	var otherDomainsHeader = document.getElementById("otherDomains_allcheck");
	otherDomainsHeader.onclick = caDialog.switchInternalCheckBox;
};

caDialog.createListItem = function (item) {
	var listitem = document.createElement("listitem");
	listitem.setAttribute("type", "checkbox");
	var chkCell = document.createElement("listcell");
	chkCell.setAttribute("lebel", "");
	listitem.appendChild(chkCell);
	var typeCell = document.createElement("listcell");
	typeCell.setAttribute("label", item.type);
	listitem.appendChild(typeCell);
	var labelCell = document.createElement("listcell");
	labelCell.setAttribute("label", item.address);
	listitem.appendChild(labelCell);
	//listitem.setAttribute("checked", "true");

	listitem.onclick = caDialog.checkAllChecked;
	return listitem;
};


caDialog.checkAllChecked = function () {
	var internalComplete = true,
	    externalComplete = true;

	//自ドメインのチェック状況を確認
	var yourdomains = document.getElementById("yourDomains"),
	    yd_checkboxes = yourdomains.getElementsByTagName("listitem");
	for (var i = 0, ylen = yd_checkboxes.length; i < ylen; i++) {
		var yd_chkCell = yd_checkboxes[i].getElementsByTagName("listcell")[0];
		if (!yd_checkboxes[i].hasAttribute("checked")) {
			internalComplete = false;
			yd_chkCell.setAttribute("label", "");
		} else {
			yd_chkCell.setAttribute("label", "✓");
		}
	}
	//[すべて確認]チェックの設定
	yourdomains.setAttribute("check_all", internalComplete);

	//他ドメインのチェック状況を確認
	var otherdomains = document.getElementById("otherDomains"),
	    od_checkboxes = otherdomains.getElementsByTagName("listitem");
	for (var j = 0, len = od_checkboxes.length; j < len; j++){
		var od_chkCell = od_checkboxes[j].getElementsByTagName("listcell")[0];
		if (!od_checkboxes[j].hasAttribute("checked")) {
			externalComplete = false;
			od_chkCell.setAttribute("label", "");
		} else {
			od_chkCell.setAttribute("label", "✓");
		}
	}
	otherdomains.setAttribute("check_all", externalComplete);

	//送信ボタンのdisable切り替え
	var okBtn = document.documentElement.getButton("accept");
	okBtn.disabled = !(internalComplete && externalComplete);
};


//呼び出しドメインのアドレスのすべての確認ボックスをONまたはOFFにする。
caDialog.switchInternalCheckBox = function (event) {
	var targetdomains;
	switch (event.target.id) {
	  case "yourDomains_allcheck":
	    targetdomains = document.getElementById("yourDomains");
	    break;
	  case "otherDomains_allcheck":
	    targetdomains = document.getElementById("otherDomains");
	    break;
	  default:
	}
	var isCheck = targetdomains.getAttribute("check_all"),
	    items = targetdomains.getElementsByTagName("listitem");

	isCheck = (isCheck == "true") ? "false" : "true";
	for (var i=0, len = items.length; i < len; i++) {
		if (isCheck === "true") {
			items[i].setAttribute("checked", isCheck);
		} else {
			if (items[i].hasAttribute("checked")) {
				items[i].removeAttribute("checked");
			}
		}
	}

	caDialog.checkAllChecked();
};


caDialog.doOK = function () {
	window.arguments[0].confirmOK = true;
	return true;
};


caDialog.doCancel = function () {
	window.arguments[0].confirmOK = false;
	return true;
};
