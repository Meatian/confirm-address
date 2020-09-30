var prefs = null;
var default_prefs = {
    CA_DOMAIN_LIST: "",
    CA_IS_NOT_DISPLAY: false,
    CA_IS_COUNTDOWN: false,
    CA_COUNT_DOWN_TIME: 5,
    CA_IS_CONFIRM_REPLY_TO: false,
    CA_IS_BATCH_CHECK_MYDOMAIN: false,
    CA_IS_BATCH_CHECK_OTHERDOMAIN: false
};
var promiseMap = new Map();

async function init() {
    browser.composeAction.disable();
    await loadPrefs();
}
init();

async function loadPrefs() {
    prefs = await browser.storage.local.get();
    if (!prefs) {
        // If preference is been unset, use default. 
        prefs = default_prefs;
    }
    //console.dir(prefs);
}

browser.compose.onBeforeSend.addListener((tab, details) => {
    let tabId = tab.id;
    let id = details.identityId;

    let iND = prefs["CA_IS_NOT_DISPLAY"];
    if (!iND) {
        browser.composeAction.enable(tabId);
        browser.composeAction.openPopup();
    } else {
        setTimeout(() => {
            let resolve = promiseMap.get(tabId);
            if (resolve) {
                resolve();
            }
        }, 100);
    }

    // Do NOT lose this Promise. Most of the compose window UI will be locked
    // until it is resolved. That's a very good way to annoy users.
    return new Promise(resolve => {
        promiseMap.set(tabId, resolve);
    });
});

browser.runtime.onMessage.addListener(async message => {
    switch (message.message) {
        case "GET_RECIPIENTS":
            var recipients = [];
            await collectAddress(message.tabId, recipients);
            let inSendSession = promiseMap.get(message.tabId) ? true : false;
            //console.dir(recipients);
            browser.runtime.sendMessage({
                message: "SEND_RECIPIENTS",
                recipients: recipients,
                prefs: prefs,
                session: inSendSession
            });
            break;
        case "USER_CHECKED":
            let resolve = promiseMap.get(message.tabId);
            if (!resolve) {
                break;
            }

            if (message.confirmed) {
                browser.composeAction.disable(message.tabId);
            } else {
                browser.composeAction.enable(message.tabId);
                resolve({
                    cancel: true
                });
            }

            break;
        default:
            break;
    }
});

async function collectAddress(tabId, recipients) {
    if (tabId == null) {
        return;
    }

    var includeReplyTo = prefs["CA_IS_CONFIRM_REPLY_TO"];

    let details = await browser.compose.getComposeDetails(tabId);
    let to = details.to;
    let cc = details.cc;
    let bcc = details.bcc;
    let replyTo = details.replyTo;
    let followupTo = details.followupTo;

    let reci = {
        to: to.slice(0, to.length),
        cc: cc.slice(0, cc.length),
        bcc: bcc.slice(0, bcc.length),
        replyTo: replyTo.slice(0, replyTo.length),
        followupTo: followupTo.slice(0, followupTo.length)
    }

    for (var reciType in reci) {
        switch (reciType) {
            case "to":
                for (let i = 0; i < reci["to"].length; i++) {
                    recipients.push({ type: "To: ", address: removeQuoteAddress(reci["to"][i]) });
                }
                break;
            case "cc":
                for (let i = 0; i < reci["cc"].length; i++) {
                    recipients.push({ type: "Cc: ", address: removeQuoteAddress(reci["cc"][i]) });
                }
                break;
            case "bcc":
                for (let i = 0; i < reci["bcc"].length; i++) {
                    recipients.push({ type: "Bcc: ", address: removeQuoteAddress(reci["bcc"][i]) });
                }
                break;
            case "replyTo":
                if (includeReplyTo) {
                    for (let i = 0; i < reci["replyTo"].length; i++) {
                        recipients.push({ type: "Reply-To: ", address: removeQuoteAddress(reci["replyTo"][i]) });
                    }
                }
                break;
            case "followupTo":
                if (includeReplyTo) {
                    for (let i = 0; i < reci["followupTo"].length; i++) {
                        recipients.push({ type: "Follow up-To: ", address: removeQuoteAddress(reci["followupTo"][i]) });
                    }
                }
                break;
            default:
                break;
        }
    }
}

function removeQuoteAddress(rawAddress) {
    var removedAddress = null;
    try {
        removedAddress = MailServices.headerParser.reformatUnquotedAddresses(rawAddress);
    } catch (ex) {
        removedAddress = rawAddress;
    }

    return removedAddress
}