async function loadPrefs() {
	//init domain list.
	var prop = "CA_DOMAIN_LIST";
	var prefs = await browser.storage.local.get();

	if (prefs[prop]) {
		console.log("[REGISTERED DOMAINS] " + prefs[prop] + "\n");
		// Entries are shown cleaned up (no spaces, capitals or "@"), without
		// empty entries and repeats. Entries that are not a full domain stay
		// in the list, marked, so the user can see and edit them.
		for (var entry of caOwnDomainList(prefs[prop])) {
			appendDomainOption(entry);
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
		cdTimeBox.disabled = false;
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
		showBodyLinesBox.disabled = false;
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

	// Enter = OK, Escape = Cancel in the domain field.
	document.ca_form.domaintxt.addEventListener("keydown", (event) => {
		if (event.key === "Enter") {
			event.preventDefault();
			editDomainList();
		} else if (event.key === "Escape") {
			event.preventDefault();
			event.stopPropagation();
			closeDomainInputField();
		}
	});
	document.ca_form.domaintxt.addEventListener("input",
	(event) => { showDomainError(false) });
	// Double-click on a domain to edit it.
	document.getElementById("group-list").addEventListener("dblclick",
	(event) => { editItem() });
	// The page never submits; settings save as they change.
	document.ca_form.addEventListener("submit",
	(event) => { event.preventDefault() });

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

function appendDomainOption(domain) {
	var option = document.createElement("option");
	option.textContent = domain;
	if (!caIsValidDomain(domain)) {
		// Kept from an older version, but it can never match an address.
		option.classList.add("ca-invalid");
		option.title = browser.i18n.getMessage("caSettingDomainInvalid");
	}
	document.getElementById("group-list").add(option);
	return option;
}

function domainIndex(domain) {
	var options = document.getElementById("group-list").options;
	for (var i = 0, len = options.length; i < len; i++) {
		if (options[i].textContent === domain) {
			return i;
		}
	}
	return -1;
}

function showDomainError(show) {
	var box = document.getElementById("domainError");
	box.textContent = show ? browser.i18n.getMessage("caSettingDomainInvalid") : "";
	box.hidden = !show;
}

function openDomainInputField() {
	var dif = document.getElementById("domainInputField");
	var difs = dif.style;
	if(difs.display == "none"){
		difs.display = "block";
	}
	var input = document.ca_form.domaintxt;
	input.focus();
	input.select();
}

function closeDomainInputField(){
	document.ca_form.domaintxt.value = "";
	document.ca_form.selectedIndex.value = "";
	showDomainError(false);

	var dif = document.getElementById("domainInputField");
	var difs = dif.style;
	difs.display = "none";
}

// OK in the domain field. Several domains can be given at once, separated by
// commas or spaces. Nothing is changed while any part is not a domain: the
// field stays open with a message, so the user can correct it.
function editDomainList(){
	var groupList = document.getElementById("group-list");
	var indexText = document.ca_form.selectedIndex.value;
	var editIndex = indexText === "" ? -1 : Number(indexText);
	var parsed = caParseDomainInput(document.ca_form.domaintxt.value);

	if (parsed.invalid.length > 0) {
		showDomainError(true);
		document.ca_form.domaintxt.focus();
		return;
	}
	if (parsed.valid.length == 0) {
		closeDomainInputField();
		return;
	}

	var domains = parsed.valid;
	var lastIndex = -1;
	if (editIndex >= 0 && editIndex < groupList.options.length) {
		// Handle as edit mode: the first domain replaces the edited entry.
		var first = domains.shift();
		var existing = domainIndex(first);
		if (existing === -1 || existing === editIndex) {
			var option = groupList.options[editIndex];
			option.textContent = first;
			option.classList.remove("ca-invalid");
			option.removeAttribute("title");
			lastIndex = editIndex;
		} else {
			// Already in the list: drop the edited entry instead of repeating it.
			groupList.remove(editIndex);
			lastIndex = domainIndex(first);
		}
	}
	// Handle as add mode (and any further domains of an edit): skip repeats.
	for (var domain of domains) {
		var index = domainIndex(domain);
		if (index === -1) {
			appendDomainOption(domain);
			index = groupList.options.length - 1;
		}
		lastIndex = index;
	}
	groupList.selectedIndex = lastIndex;

	closeDomainInputField();
	autoSave();
}

function addItem() {
	// Always a new entry, even if Edit was pressed before.
	document.ca_form.selectedIndex.value = "";
	document.ca_form.domaintxt.value = "";
	showDomainError(false);
	openDomainInputField();
}

function editItem() {
	var groupList = document.getElementById("group-list");
	if (groupList.selectedIndex === -1) {
		return;
	}
	document.ca_form.selectedIndex.value = groupList.selectedIndex;
	document.ca_form.domaintxt.value = groupList.options[groupList.selectedIndex].textContent;
	showDomainError(false);

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
	// An open edit would point at the wrong entry now.
	closeDomainInputField();
	autoSave();
}

// "１０" (typed with a Japanese keyboard) counts as "10".
function toHalfWidthDigits(text) {
	return String(text).replace(/[０-９]/g,
		(c) => String.fromCharCode(c.charCodeAt(0) - 0xFEE0));
}

// One "checkbox + number" setting (countdown, body lines). A wrong number
// shows a message next to the box and keeps the stored setting as it was,
// but never stops the other settings, like the domain list, from saving.
function addNumberSetting(values, boxId, fieldId, boolKey, numberKey) {
	var box = document.getElementById(boxId);
	var field = document.getElementById(fieldId);
	var error = document.getElementById(fieldId + "-error");
	var text = toHalfWidthDigits(field.value).trim();
	var isNumber = /^[0-9]+$/.test(text);

	if (isNumber) {
		if (field.value !== text) {
			field.value = text;
		}
		values[boolKey] = box.checked;
		values[numberKey] = text;
		error.hidden = true;
	} else if (!box.checked) {
		values[boolKey] = false;
		error.hidden = true;
	} else {
		error.hidden = false;
	}
}

async function autoSave() {
	var domainListStr = await fetchDomainListString();
	var chk = await fetchCheckboxStates();

	var values = {
		CA_DOMAIN_LIST: domainListStr,
		CA_IS_NOT_DISPLAY: chk['notDisplay'],
		CA_IS_CONFIRM_REPLY_TO: chk['replyTo'],
		CA_IS_BATCH_CHECK_MYDOMAIN: chk['batchCheck_my'],
		CA_IS_BATCH_CHECK_OTHERDOMAIN: chk['batchCheck_other'],
		CA_IS_BATCH_CHECK_ATTACHMENT: chk['attachments']
	};
	addNumberSetting(values, "countdown", "countdown-time", "CA_IS_COUNT_DOWN", "CA_COUNT_DOWN_TIME");
	addNumberSetting(values, "show-body", "show-body-lines", "CA_SHOW_BODY", "CA_SHOW_BODY_LINES");

	// Save to local storage
	await browser.storage.local.set(values);

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
	// Load the saved list before any button works, so a quick click can
	// never save an empty list over it.
	await loadPrefs();
	setEventListener();
}

startup();
