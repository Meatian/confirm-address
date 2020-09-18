async function loadPrefs() {
	//init domain list.
	var prop = "CA_DOMAIN_LIST";
	var result = await browser.storage.local.get(prop);

	if (result[prop]) {
		console.log("[REGISTERED DOMAINS] " + result[prop] + "\n");
		console.dir(result[prop]);
		var domainList = result[prop].split(","),
			groupList = document.getElementById("group-list");
		for (var i = 0, len = domainList.length; i < len; i++) {
			var option = document.createElement("option");
			option.textContent = domainList[i];
			option.setAttribute("id", Math.random());
			groupList.add(option);
		}
	}

	//init checkbox [not dispaly when only my domain mail]
	prop = "CA_IS_NOT_DISPLAY";
	var iND = await browser.storage.local.get(prop);
	var noDisplayBox = document.getElementById("not-display");
	noDisplayBox.checked = iND ? iND[prop] : false;

	//init checkbox [countdown]
	var cdBox = document.getElementById("countdown");
	var cdTimeBox = document.getElementById("countdown-time");
	cdBox.addEventListener('change', (event) => {
		cdTimeBox.disabled = !cdBox.checked;
	});

	prop = "CA_IS_COUNT_DOWN";
	var iCD = await browser.storage.local.get(prop);
	if (iCD[prop] === undefined || iCD[prop] === false) {
		cdBox.checked = false;
		cdTimeBox.disabled = true;
	} else {
		cdBox.checked = true;
		cdTimeBox.disable = false;
	}

	prop = "CA_COUNT_DOWN_TIME";
	var cDT = await browser.storage.local.get(prop);
	cdTimeBox.value = cDT[prop] ? cDT[prop] : "";

	// init checkbox [confrim Reply-To address before sending]
	prop = "CA_IS_CONFIRM_REPLY_TO";
	var iCRT = await browser.storage.local.get(prop);
	var replyBox = document.getElementById("confirm-reply-to");
	replyBox.checked = iCRT ? iCRT[prop] : false;

	// init checkbox [confirm batch-check my domain]
	prop = "CA_IS_BATCH_CHECK_MYDOMAIN";
	var iBCM = await browser.storage.local.get(prop);
	var batchCheckBoxmy = document.getElementById("batchcheck-mydomain");
	batchCheckBoxmy.checked = iBCM ? iBCM[prop] : false;

	// init checkbox [confirm batch-check other domain]
	prop = "CA_IS_BATCH_CHECK_OTHERDOMAIN";
	var iBCO = await browser.storage.local.get(prop);
	var batchCheckBoxother = document.getElementById("batchcheck-otherdomain");
	batchCheckBoxother.checked = iBCO ? iBCO[prop] : false;
}

function setEventListener() {
	document.ca_form.add.addEventListener("click", (event) => { addItem() });
	document.ca_form.edit.addEventListener("click", (event) => { editItem() });
	document.ca_form.remove.addEventListener("click", (event) => { removeItem() });

	// ドメイン指定以外のオートセーブイベント
	document.getElementById("not-display").addEventListener("change", (event) => { autoSave() });
	document.getElementById("countdown").addEventListener("change", (event) => { autoSave() });
	document.getElementById("countdown-time").addEventListener("blur", (event) => { autoSave() });
	document.getElementById("confirm-reply-to").addEventListener("change", (event) => { autoSave() });
	document.getElementById("batchcheck-mydomain").addEventListener("change", (event) => { autoSave() });
	document.getElementById("batchcheck-otherdomain").addEventListener("change", (event) => { autoSave() });
}

function addItem() {
	var promptMessage = browser.i18n.getMessage("caSettingDomainMessage");
	var param = window.prompt(promptMessage, "")
	if (param) {
		var domainName = param;
		if (domainName.length > 0) {
			console.log("[ADD] " + domainName + "\n");
			var groupList = document.getElementById("group-list");
			var option = document.createElement("option");
			option.textContent = domainName;
			option.setAttribute("id", Math.random());
			groupList.add(option);
			autoSave();
		}
	}
}

function editItem() {
	var groupList = document.getElementById("group-list"),
		selectedIndex = groupList.selectedIndex;
	if (selectedIndex === -1) {
		return;
	}

	var promptMessage = browser.i18n.getMessage("caSettingDomainMessage");
	var param = window.prompt(promptMessage, groupList.value)

	if (param) {
		var domainName = param;
		if (domainName.length > 0) {
			console.log("[edit] " + domainName + "\n");
			var selectedId = groupList.options[selectedIndex].getAttribute("id");
			document.getElementById(selectedId).textContent = domainName;
			autoSave();
		}
	}
}

function removeItem() {
	var groupList = document.getElementById("group-list"),
		selectedIndex = groupList.selectedIndex;
	if (selectedIndex === -1) {
		return;
	}
	console.log("[REMOVE] " + groupList.options[selectedIndex].textContent + "\n");
	groupList.remove(selectedIndex);
	autoSave();
}

async function autoSave() {
	console.log("autoSave() fired.\n");

	//ドメイン設定保存
	var domainList = [];

	var groupList = document.getElementById("group-list");
	var options = groupList.options;
	for (var i = 0, len = options.length; i < len; i++) {
		domainList.push(options[i].textContent);
	}
	var domainListStr = domainList.join(",");
	await browser.storage.local.set({ CA_DOMAIN_LIST: domainListStr });

	//チェックボックス設定保存
	var notDisplay = document.getElementById("not-display").checked;
	await browser.storage.local.set({ CA_IS_NOT_DISPLAY: notDisplay });

	var isCountdown = document.getElementById("countdown").checked;
	await browser.storage.local.set({ CA_IS_COUNT_DOWN: isCountdown });

	var cdTime = document.getElementById("countdown-time").value;
	if ((isNaN(Number(cdTime)) || cdTime === "") && isCountdown) {
		alert("please input integer");
		return false;
	}
	await browser.storage.local.set({ CA_COUNT_DOWN_TIME: cdTime });

	var replyTo = document.getElementById("confirm-reply-to").checked;
	await browser.storage.local.set({ CA_IS_CONFIRM_REPLY_TO: replyTo });

	var batchCheck_my = document.getElementById("batchcheck-mydomain").checked;
	await browser.storage.local.set({ CA_IS_BATCH_CHECK_MYDOMAIN: batchCheck_my });

	var batchCheck_other = document.getElementById("batchcheck-otherdomain").checked;
	await browser.storage.local.set({ CA_IS_BATCH_CHECK_OTHERDOMAIN: batchCheck_other });

	//dumpPrefs();
}

async function dumpPrefs() {
	// for debugging
	var prefs = await browser.storage.local.get(null);
	if (prefs) {
		console.dir(prefs);
	}
}

async function startup() {
	translate(); //from L10n.js
	//dumpPrefs();
	loadPrefs();
	setEventListener();
}

startup();