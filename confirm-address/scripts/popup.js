var recipients = {};
var prefs = null;
var countdown_running = false;

function init() {
    document.caPopup.batchCheck_yourDomains.addEventListener("change", (event) => {
        var state = document.caPopup.batchCheck_yourDomains.checked;
        batchCheck("yourDomainAddresses", state);
        checkAllChecked();
    });
    document.caPopup.batchCheck_otherDomains.addEventListener("change", (event) => {
        var state = document.caPopup.batchCheck_otherDomains.checked
        batchCheck("otherDomainAddresses", state);
        checkAllChecked();
    });
    document.caPopup.check_firstLinesOfBody.addEventListener("change", (event) => {
        checkAllChecked();
    });
    document.caPopup.btn_send.addEventListener("click", (event) => {
        if (countdown_running) {
            sendResult(true);
        } else {
            confirmOK();
        }
    });
    document.caPopup.btn_cancel.addEventListener("click", (event) => {
        countdown_running = false;
        sendResult(false);
    });
    translate();
    requestRecipients();
}

function batchCheck(targetId, val) {
    targetDiv = document.getElementById(targetId);
    var inputs = targetDiv.getElementsByTagName("input");
    var count = inputs.length;
    for (var i = 0; i < count; i++) {
        inputs[i].checked = val;
    }
}

function checkAllChecked() {
    //console.log("checkAllChecked() fired.");
    var internalComplete = true;
    externalComplete = true;
    var externalComplete = true;
    var mailHeadComfirmed = true;

    //Confirm my domain check states
    var yourdomains = document.getElementById("yourDomainAddresses"),
        yd_checkboxes = yourdomains.getElementsByTagName("input");
    if (0 < yd_checkboxes.length) {
        for (var i = 0, ylen = yd_checkboxes.length; i < ylen; i++) {
            if (!yd_checkboxes[i].checked) {
                internalComplete = false;
            }
        }
        //When my domain checkboxes all checked, "all select" checkbox state turns on.
        document.caPopup.batchCheck_yourDomains.checked = internalComplete;
    }

    //Confirm other domain check states
    var otherdomains = document.getElementById("otherDomainAddresses"),
        od_checkboxes = otherdomains.getElementsByTagName("input");
    if (0 < od_checkboxes.length) {
        for (var j = 0, len = od_checkboxes.length; j < len; j++) {
            if (!od_checkboxes[j].checked) {
                externalComplete = false;
            }
         }
         document.caPopup.batchCheck_otherDomains.checked = externalComplete;
     }

    //Confirm first mail body states
    mailHeadComfirmed = document.caPopup.check_firstLinesOfBody.checked;

    //Switch disable state to Send button
    var okBtn = document.caPopup.btn_send;
    okBtn.disabled = !(internalComplete && externalComplete && mailHeadComfirmed);
}

async function requestRecipients() {
    let tabs = await browser.tabs.query({
        active: true,
        currentWindow: true
    });
    let tabId = tabs[0].id;
    browser.runtime.sendMessage({
        message: "GET_RECIPIENTS",
        tabId: tabId
    });
}

function confirmOK() {
    //console.log("confirmOK() fired.");
    //console.dir(prefs);
    var isCountdown = prefs["CA_IS_COUNT_DOWN"];
    //console.log("isCountdown: " + isCountdown);
    if (isCountdown) {
        var countDownTime = prefs["CA_COUNT_DOWN_TIME"];

        var limit = countDownTime;
        var label = document.getElementById("counter");
        document.getElementById("countdownArea").style = "display:block";
        countdown_running = true;
        label.innerHTML = limit;
        setInterval(function () {
            limit--;
            if (limit < 0) {
                sendResult(true);
            } else {
                label.innerHTML = limit;
            }
        }, 1000);
    } else {
        sendResult(true);
    }
}

async function sendResult(confirmed) {
    let tabs = await browser.tabs.query({
        active: true,
        currentWindow: true
    });
    let tabId = tabs[0].id;
    await browser.runtime.sendMessage({
        message: "USER_CHECKED",
        tabId: tabId,
        confirmed: confirmed
    });

    window.close();
}

browser.runtime.onMessage.addListener(async (message) => {
     switch (message.message) {
         case "SEND_RECIPIENTS":
             recipients = message.recipients;
             mailbody = message.mailbody;
             console.log(mailbody);
             prefs = message.prefs;
 
             var domainList = getDomainList(prefs["CA_DOMAIN_LIST"]);

            var internalList = [];
            var externalList = [];
            await judge(recipients, domainList, internalList, externalList);

            var isNotDisplay = prefs["CA_IS_NOT_DISPLAY"];
            if (isNotDisplay && externalList.length == 0 && internalList.length > 0) {
                document.caPopup.btn_send.disabled = false;
                confirmOK();
            } else {
                document.getElementById("DialogMessage").style = "display:block;";
                document.getElementById("yourDomains").style = "display:block;";
                 document.getElementById("otherDomains").style = "display:block;";
                 await pushToList("yourDomainAddresses", internalList);
                 await pushToList("otherDomainAddresses", externalList);

                 var isShowBody = prefs["CA_SHOW_BODY"];
                 if(isShowBody){
                     document.getElementById("firstLinesofBody").style = "display:block;";
                     document.getElementById("mailBody").innerHTML = mailbody;
                 } else {
                     document.caPopup.check_firstLinesOfBody.checked = true;
                 }
             }
 
             // Change batch check checkboxes state
            document.caPopup.batchCheck_yourDomains.disabled = !prefs["CA_IS_BATCH_CHECK_MYDOMAIN"];
            document.caPopup.batchCheck_otherDomains.disabled = !prefs["CA_IS_BATCH_CHECK_OTHERDOMAIN"];

            break;
        default:
            break;
    }
});

function getDomainList(domains) {
    if (domains == null || domains.length == 0) {
        return new Array();
    } else {
        var domainList = domains.split(",");
        return domainList;
    }
}

async function judge(addressArray, domainList, yourDomainAddress, otherDomainAddress) {
    //console.dir(recipients);
    //if domainList is empty, all addresses are external.
    if (domainList.length == 0) {
        for (var i = 0; i < addressArray.length; i++) {
            otherDomainAddress.push(addressArray[i]);
        }
        return;
    }

    //compare addresses with registered domain lists.
    for (var i = 0; i < addressArray.length; i++) {
        var target = addressArray[i];
        var address = target.address;
        if (address.length == 0) {
            continue;
        }
        var domain = address.substring(address.indexOf("@")).toLowerCase();

        var match = false;
        for (var j = 0; j < domainList.length; j++) {
            var insiderDomain = domainList[j].toLowerCase();
            if (domain.indexOf(insiderDomain) != -1) {
                match = true;
            }
        }
        if (match) {
            yourDomainAddress.push(target);
        } else {
            otherDomainAddress.push(target);
        }
    }
}

async function pushToList(targetId, AddressList) {
    var targetDiv = document.getElementById(targetId);
    for (var i = 0; i < AddressList.length; i++) {
        var chkbox = document.createElement("input");
        chkbox.setAttribute("type", "checkbox");
        chkbox.setAttribute("id", Math.random());
        chkbox.addEventListener("change", (event) => {
            checkAllChecked();
        });
        var label = document.createElement("label");
        label.appendChild(chkbox);
        label.appendChild(document.createTextNode(AddressList[i].type + AddressList[i].address));
        targetDiv.appendChild(label);
        targetDiv.appendChild(document.createElement("br"));
    }
}

init();