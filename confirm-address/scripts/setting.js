async function loadPrefs() {
	//init domain list.
	var prop = "CA_DOMAIN_LIST";
	var prefs = await browser.storage.local.get();

	if (prefs[prop]) {
		console.log("[REGISTERED DOMAINS] " + prefs[prop] + "\n");
		//console.dir(prefs[prop]);
		var domainList = prefs[prop].split(","),
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
	var noDisplayBox = document.getElementById("not-display");
	noDisplayBox.checked = prefs[prop] ? prefs[prop] : false;

	//init checkbox [countdown]
	var cdBox = document.getElementById("countdown");
	var cdTimeBox = document.getElementById("countdown-time");
	cdBox.addEventListener('change', (event) => {
		cdTimeBox.disabled = !cdBox.checked;
	});

	prop = "CA_IS_COUNT_DOWN";
	if (prefs[prop] === undefined || prefs[prop] === false) {
		cdBox.checked = false;
		cdTimeBox.disabled = true;
	} else {
		cdBox.checked = true;
		cdTimeBox.disable = false;
	}

	prop = "CA_COUNT_DOWN_TIME";
	cdTimeBox.value = prefs[prop] ? prefs[prop] : "";

	//init checkbox [countdown]
	var showBodyBox = document.getElementById("show-body");
	var showBodyLinesBox = document.getElementById("show-body-lines");
	showBodyBox.addEventListener('change', (event) => {
		showBodyLinesBox.disabled = !showBodyBox.checked;
	});

	prop = "CA_SHOW_BODY";
	if (prefs[prop] === undefined || prefs[prop] === false) {
		showBodyBox.checked = false;
		showBodyLinesBox.disabled = true;
	} else {
		showBodyBox.checked = true;
		showBodyLinesBox.disable = false;
	}

	prop = "CA_SHOW_BODY_LINES";
	showBodyLinesBox.value = prefs[prop] ? prefs[prop] : "";

	// init checkbox [confrim Reply-To address before sending]
	prop = "CA_IS_CONFIRM_REPLY_TO";
	var replyBox = document.getElementById("confirm-reply-to");
	replyBox.checked = prefs[prop] ? prefs[prop] : false;

	// init checkbox [confirm batch-check my domain]
	prop = "CA_IS_BATCH_CHECK_MYDOMAIN";
	var batchCheckBoxmy = document.getElementById("batchcheck-mydomain");
	batchCheckBoxmy.checked = prefs[prop] ? prefs[prop] : false;

	// init checkbox [confirm batch-check other domain]
	prop = "CA_IS_BATCH_CHECK_OTHERDOMAIN";
	var batchCheckBoxother = document.getElementById("batchcheck-otherdomain");
	batchCheckBoxother.checked = prefs[prop] ? prefs[prop] : false;

	// init checkbox [confirm batch-check attachments]
	prop = "CA_IS_BATCH_CHECK_ATTACHMENT";
	var batchCheckBoxAttach = document.getElementById("batchcheck-attachment");
	batchCheckBoxAttach.checked = prefs[prop] ? prefs[prop] : false;
}

function setEventListener() {
	document.ca_form.add.addEventListener("click", 
	(event) => {addItem()});
	document.ca_form.edit.addEventListener("click", 
	(event) => {editItem()});
	document.ca_form.remove.addEventListener("click", 
	(event) => {removeItem()});

	document.ca_form.domainOK.addEventListener("click",
	(event)=>{editDomainList();});
	document.ca_form.domainClose.addEventListener("click",
	(event)=>{closeDomainInputField()});

// Set Autosave Events outside of the Domain Settings
	document.getElementById("not-display").addEventListener("change", 
	(event) => { autoSave() });
	document.getElementById("countdown").addEventListener("change", 
	(event) => { autoSave() });
	document.getElementById("countdown-time").addEventListener("blur", 
	(event) => { autoSave() });
	document.getElementById("show-body").addEventListener("change", 
	(event) => { autoSave() });
	document.getElementById("show-body-lines").addEventListener("blur", 
	(event) => { autoSave() });
	document.getElementById("confirm-reply-to").addEventListener("change", 
	(event) => { autoSave() });
	document.getElementById("batchcheck-mydomain").addEventListener("change", 
	(event) => { autoSave() });
	document.getElementById("batchcheck-otherdomain").addEventListener("change", 
	(event) => { autoSave() });
	document.getElementById("batchcheck-attachment").addEventListener("change", (event) => { autoSave() });	
}


function openDomainInputField() {
	var dif = document.getElementById("domainInputField");
	var difs = dif.style;
	if(difs.display == "none"){
		difs.display = "block";
	}
}

function closeDomainInputField(){
	document.ca_form.domaintxt.value = "";
	document.ca_form.selectedIndex.value = "";

	var dif = document.getElementById("domainInputField");
	var difs = dif.style;
	difs.display = "none";
}

function editDomainList(){
	var param = {
		"domain": document.ca_form.domaintxt.value,
		"selectedIndex": document.ca_form.selectedIndex.value
	};

	if (param && param['selectedIndex'] == "") {
		// Handle as add mode:
		var domainName = param['domain'];
		if (domainName.length > 0) {
			//console.log("[ADD] " + domainName + "\n");
			var groupList = document.getElementById("group-list");
			var option = document.createElement("option");
			option.textContent = domainName;
			option.setAttribute("id", Math.random());
			groupList.add(option);
			autoSave();
		}
	} else {
		// Handle as edit mode:
		if (param) {
		var domainName = param['domain'];
			if (domainName.length > 0) {
				//console.log("[edit] " + domainName + "\n");
				var groupList = document.getElementById("group-list");
				var selectedId = groupList.options[param['selectedIndex']].getAttribute("id");
				document.getElementById(selectedId).textContent = domainName;
				autoSave();
			}
		}
	}

	closeDomainInputField();
}

function addItem() {
	openDomainInputField();
}

function editItem() {
	var groupList = document.getElementById("group-list");
	if (groupList.selectedIndex === -1) {
		return;
	}
	document.ca_form.selectedIndex.value = groupList.selectedIndex;
	document.ca_form.domaintxt.value = groupList.value;

	openDomainInputField();
}

function removeItem() {
	var groupList = document.getElementById("group-list"),
		selectedIndex = groupList.selectedIndex;
	if (selectedIndex === -1) {
		return;
	}
	//console.log("[REMOVE] " + groupList.options[selectedIndex].textContent + "\n");
	groupList.remove(selectedIndex);
	autoSave();
}

async function autoSave() {
	var domainListStr = await fetchDomainListString();
	var chk = await fetchCheckboxStates();

	// Input validate for countdown time
	if (((isNaN(Number(chk['cdTime'])) || chk['cdTime'] === "") && chk['isCountdown'])
	|| ((isNaN(Number(chk['sbLines'])) || chk['sbLines'] === "") && chk['isShowBody'])) {
		var alertMessage = browser.i18n.getMessage("caSettingWarnInteger");
		alert(alertMessage);
		return false;
	}

	// Save to local storage
	await browser.storage.local.set({
		CA_DOMAIN_LIST: domainListStr,
		CA_IS_NOT_DISPLAY: chk['notDisplay'],
		CA_IS_COUNT_DOWN: chk['isCountdown'],
		CA_COUNT_DOWN_TIME: chk['cdTime'],
		CA_SHOW_BODY: chk['isShowBody'],
		CA_SHOW_BODY_LINES: chk['sbLines'],
		CA_IS_CONFIRM_REPLY_TO: chk['replyTo'],
		CA_IS_BATCH_CHECK_MYDOMAIN: chk['batchCheck_my'],
		CA_IS_BATCH_CHECK_OTHERDOMAIN: chk['batchCheck_other'],
		CA_IS_BATCH_CHECK_ATTACHMENT: chk['attachments']
	});

	//console.log("autoSave() done.\n");
	//dumpPrefs();
}

async function fetchDomainListString() {
	var domainList = [];

	var groupList = document.getElementById("group-list");
	var options = groupList.options;
	for (var i = 0, len = options.length; i < len; i++) {
		domainList.push(options[i].textContent);
	}
	var domainListString = domainList.join(",");

	return domainListString;
}

async function fetchCheckboxStates() {
	let CheckboxStates = {
		notDisplay: document.getElementById("not-display").checked,
		isCountdown: document.getElementById("countdown").checked,
		cdTime: document.getElementById("countdown-time").value,
		isShowBody: document.getElementById("show-body").checked,
		sbLines: document.getElementById("show-body-lines").value,
		replyTo: document.getElementById("confirm-reply-to").checked,
		batchCheck_my: document.getElementById("batchcheck-mydomain").checked,
		batchCheck_other: document.getElementById("batchcheck-otherdomain").checked,
		attachments: document.getElementById("batchcheck-attachment").checked
	};

	return CheckboxStates;
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