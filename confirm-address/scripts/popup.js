var recipients = {};
var prefs = {};

function init() {
    document.caPopup.btn_send.addEventListener("click", (event) => {
        confirmOK();
    });
    document.caPopup.btn_cancel.addEventListener("click", (event) => {
        sendResult(false);
    });
    translate();
    requestRecipients();
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

async function confirmOK() {
    var isCountdown = prefs["CA_IS_COUNTDOWN"];
    if (isCountdown) {
        var countDownTime = prefs["CA_COUNT_DOWN_TIME"];

        var countDownComplete = await startCountdown(countDownTime);
        if (countDownComplete) {
            sendResult(true);
        } else {
            sendResult(false);
        }
    } else {
        sendResult(true);
    }
}

async function startCountdown(countDownTime) {

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
            //console.dir(recipients);

            prefs = message.prefs;
            var domainList = prefs["CA_DOMAIN_LIST"].split(",");

            var internalList = [];
            var externalList = [];
            await judge(recipients, domainList, internalList, externalList);
            //console.dir(internalList);
            //console.dir(externalList);

            await pushToList("yourDomainsAddresses", internalList);
            await pushToList("otherDomainsAddresses", externalList);

            break;
        default:
            break;
    }
});

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
        chkbox.setAttribute("id", AddressList[i].address);
        var label = document.createElement("label");
        label.htmlFor = AddressList[i].address;
        label.appendChild(document.createTextNode(AddressList[i].type + AddressList[i].address));
        var small = document.createElement("small");
        small.appendChild(chkbox);
        small.appendChild(label);
        targetDiv.appendChild(small);
        targetDiv.appendChild(document.createElement("br"));
    }
}

init();