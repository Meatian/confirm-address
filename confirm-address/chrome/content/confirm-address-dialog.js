"use strict";

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

	//自ドメインあて先リストヘッダ イベント設定
	var yourDomainsHeader = document.getElementById("yourDomains_allcheck");
	var isBatchCheckYour = nsPreferences.getBoolPref(CA_CONST.IS_BATCH_CHECK_MYDOMAIN);
	yourDomainsHeader.onclick = function(e) {
		caDialog.switchInternalCheckBox(internalList);
	};
	if (isBatchCheckYour){
		document.getElementById("yourDomains").getElementsByClassName("all_check")[0].removeAttribute("disabled");
	}
		
	//他ドメインあて先リストヘッダ イベント設定
	var otherDomainsHeader = document.getElementById("otherDomains_allcheck");
	var isBatchCheckOther = nsPreferences.getBoolPref(CA_CONST.IS_BATCH_CHECK_OTHERDOMAIN);
	otherDomainsHeader.onclick = function(e) {
		caDialog.switchInternalCheckBox(externalList);
	};
	if (isBatchCheckOther){
		document.getElementById("otherDomains").getElementsByClassName("all_check")[0].removeAttribute("disabled");
	}

	document.addEventListener("dialogaccept", caDialog.doOK.bind(this));
	document.addEventListener("dialogcancel", caDialog.doCancel.bind(this));
};

caDialog.createListItem = function (item) {
	var listitem = document.createElement("richlistitem");

	var checkbox = document.createElement("checkbox");
	checkbox.setAttribute("class", "confirmed");
	listitem.appendChild(checkbox);

	var typeCell = document.createElement("label");
	typeCell.setAttribute("value", item.type);
	listitem.appendChild(typeCell);

	var labelCell = document.createElement("label");
	labelCell.setAttribute("value", item.address);
	listitem.appendChild(labelCell);

	listitem.checked = false;
	listitem.onclick = function(e) {
		var checked = this.checked;
		this.checked = !this.checked;
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
	    items = targetdomains.getElementsByTagName("richlistitem");
	var isCheck = allCheck.checked;
	for (var i = 0, len = items.length; i < len; i++) {
		targetdomains.ensureIndexIsVisible( i );
		var listitem = items[i];
		items[i].childNodes[0].checked = isCheck;
		items[i].className = isCheck ? 'confirmed-item' : '';
	}
	targetdomains.ensureIndexIsVisible( 0 );
	caDialog.checkAllChecked();
};

caDialog.doOK = function (event) {
	window.arguments[0].confirmOK = true;
	dump("[OK] \n");
};


caDialog.doCancel = function (event) {
	window.arguments[0].confirmOK = false;
	dump("[CANCEL] \n");
};
