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
	for (var j = 0, elen = externals.length; j < elen; j++) {
		listitem = caDialog.createListItem(externals[j]);
		externalList.appendChild(listitem);
	}

	//自ドメインあて先リストヘッダ
	var yourDomainsHeader = document.getElementById("yourDomains_allcheck");
	yourDomainsHeader.onclick = function(e) {
		caDialog.switchInternalCheckBox(internalList);
	};

	//他ドメインあて先リストヘッダ
	var otherDomainsHeader = document.getElementById("otherDomains_allcheck");
	otherDomainsHeader.onclick = function(e) {
		caDialog.switchInternalCheckBox(externalList);
	};
};

caDialog.createListItem = function (item) {
	var listitem = document.createElement("listitem");

	var checkCell = document.createElement("listcell");
	var checkbox = document.createElement("checkbox");
	checkbox.setAttribute("class", "confirmed");
	checkCell.appendChild(checkbox);
	listitem.appendChild(checkCell);

	var typeCell = document.createElement("listcell");
	typeCell.setAttribute("label", item.type);
	listitem.appendChild(typeCell);

	var labelCell = document.createElement("listcell");
	labelCell.setAttribute("label", item.address);
	listitem.appendChild(labelCell);

	listitem.checkbox = checkbox;
	listitem.onclick = function(e) {
		var checked = this.checkbox.checked;
		this.checkbox.checked = !checked;
		this.className = !checked ? 'confirmed-item' : '';
		caDialog.checkAllChecked();
	};
	return listitem;
};


caDialog.checkAllChecked = function () {
	var internalComplete = true,
	    externalComplete = true;

	//自ドメインのチェック状況を確認
	var yourdomains = document.getElementById("yourDomains"),
	    yd_checkboxes = yourdomains.getElementsByClassName("confirmed");
	if (0 < yd_checkboxes.length) {
		for (var i = 0, ylen = yd_checkboxes.length; i < ylen; i++) {
			if (!yd_checkboxes[i].checked) {
				internalComplete = false;
			}
		}
		// 全て選択チェックもつけておく
		yourdomains.getElementsByClassName("all_check")[0].checked = internalComplete;
	}

	//他ドメインのチェック状況を確認
	var otherdomains = document.getElementById("otherDomains"),
	    od_checkboxes = otherdomains.getElementsByClassName("confirmed");
	if (0 < od_checkboxes.length) {
		for (var j = 0, len = od_checkboxes.length; j < len; j++){
			if (!od_checkboxes[j].checked) {
				externalComplete = false;
			}
		}
		otherdomains.getElementsByClassName("all_check")[0].checked = externalComplete;
	}

	//送信ボタンのdisable切り替え
	var okBtn = document.documentElement.getButton("accept");
	okBtn.disabled = !(internalComplete && externalComplete);
};


//呼び出しドメインのアドレスのすべての確認ボックスをONまたはOFFにする。
caDialog.switchInternalCheckBox = function (targetdomains) {
	var allCheck = targetdomains.getElementsByClassName("all_check")[0],
	    items = targetdomains.getElementsByTagName("listitem");

	var isCheck = allCheck.checked;
	for (var i = 0, len = items.length; i < len; i++) {
		targetdomains.ensureIndexIsVisible( i );
		var listitem = items[i];
		listitem.checkbox.checked = isCheck;
		listitem.className = isCheck ? 'confirmed-item' : '';
	}
	targetdomains.ensureIndexIsVisible( 0 );

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
