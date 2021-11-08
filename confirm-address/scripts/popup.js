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
        var state = document.caPopup.batchCheck_otherDomains.checked;
        batchCheck("otherDomainAddresses", state);
        checkAllChecked();
    });
    document.caPopup.batchCheck_Attachments.addEventListener("change", (event) => {
        var state = document.caPopup.batchCheck_Attachments.checked;
        batchCheck("Attachments", state);
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
    var internalConfirmed = true;
    var externalConfirmed = true;
    var mailHeadConfirmed = true;
    var attachmentsConfirmed = true;

    //Confirm my domain check states
    var yourdomains = document.getElementById("yourDomainAddresses"),
        yd_checkboxes = yourdomains.getElementsByTagName("input");
        if (0 < yd_checkboxes.length) {
            for (var i = 0, ylen = yd_checkboxes.length; i < ylen; i++) {
                if (!yd_checkboxes[i].checked) {
                    internalConfirmed = false;
                }
            }
            //When my domain checkboxes all checked, "all select" checkbox state turns on.
            document.caPopup.batchCheck_yourDomains.checked = internalConfirmed;
        }
    
    //Confirm other domain check states
    var otherdomains = document.getElementById("otherDomainAddresses"),
        od_checkboxes = otherdomains.getElementsByTagName("input");
    if (0 < od_checkboxes.length) {
        for (var j = 0, len = od_checkboxes.length; j < len; j++) {
            if (!od_checkboxes[j].checked) {
                externalConfirmed = false;
            }
        }
        document.caPopup.batchCheck_otherDomains.checked = externalConfirmed;
    }
    
    //Confirm first mail body states
    mailHeadConfirmed = document.caPopup.check_firstLinesOfBody.checked;

    //Confirm Attachments
    var attachments = document.getElementById("Attachments"),
        att_checkboxes = attachments.getElementsByTagName("input");
    if(0 < att_checkboxes.length){
        for (var k = 0, len=att_checkboxes.length; k<len; k++){
            if(!att_checkboxes[k].checked){
                attachmentsConfirmed = false;
            }
        }
        document.caPopup.batchCheck_Attachments.checked = attachmentsConfirmed;
    }

    //Switch disable state to Send button
    var okBtn = document.caPopup.btn_send;
    okBtn.disabled = !(internalConfirmed && externalConfirmed && mailHeadConfirmed && attachmentsConfirmed);
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
            //console.log(mailbody);
            attachments = message.attachments;
            prefs = message.prefs;
            console.dir(prefs);
 
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
                var pushArgs = {
                    targetId: "yourDomainAddresses",
                    listType: "Addresses",
                    pushingList: internalList
                };
                pushToList(pushArgs);
                
                pushArgs = {
                    targetId: "otherDomainAddresses",
                    listType: "Addresses",
                    pushingList: externalList
                };
                pushToList(pushArgs);

                var isShowBody = prefs["CA_SHOW_BODY"];
                if(isShowBody){
                    document.getElementById("firstLinesofBody").style = "display:block;";
                    document.getElementById("mailBody").innerHTML = mailbody;
                } else {
                    document.caPopup.check_firstLinesOfBody.checked = true;
                }

                if(attachments.length >= 1){
                    document.getElementById("confirmAttachments").style = "display:block;";
                    pushArgs = {
                        targetId: "Attachments",
                        listType: "Attachments",
                        pushingList: attachments
                    };
                    pushToList(pushArgs);    
                }
            }
 
             // Change batch check checkboxes state
            document.caPopup.batchCheck_yourDomains.disabled = !prefs["CA_IS_BATCH_CHECK_MYDOMAIN"];
            document.caPopup.batchCheck_otherDomains.disabled = !prefs["CA_IS_BATCH_CHECK_OTHERDOMAIN"];
            document.caPopup.batchCheck_Attachments.disabled = !prefs["CA_IS_BATCH_CHECK_ATTACHMENT"];

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

function pushToList(args) {
    /*
    args:
    {
        targetId: "divfoo",
        listType: "Addresses" or "Attachments",
        pushingList: []
    }
    */
   //console.dir(args);
   var targetDiv = document.getElementById(args.targetId);
   var pushTxtNode;

   for (var i = 0; i < args.pushingList.length; i++) {
       switch(args.listType){
           case "Addresses":
               pushTxtNode = args.pushingList[i].type + args.pushingList[i].address;
               break;
           case "Attachments":
               pushTxtNode = args.pushingList[i].name;
               break;
       }
       var chkbox = document.createElement("input");
       chkbox.setAttribute("type", "checkbox");
       chkbox.setAttribute("id", Math.random());
       chkbox.addEventListener("change", (event) => {
           checkAllChecked();
       });
       var label = document.createElement("label");
       label.appendChild(chkbox);
       label.appendChild(document.createTextNode(pushTxtNode));
       targetDiv.appendChild(label);
       targetDiv.appendChild(document.createElement("br"));
   }
}

init();