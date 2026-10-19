var prefs = null;
var default_prefs = {
    CA_DOMAIN_LIST: "",
    CA_IS_NOT_DISPLAY: false,
    CA_IS_COUNT_DOWN: false,
    CA_COUNT_DOWN_TIME: 5,
    CA_SHOW_BODY: false,
    CA_SHOW_BODY_LINES: 3,
    CA_IS_CONFIRM_REPLY_TO: false,
    CA_IS_BATCH_CHECK_MYDOMAIN: false,
    CA_IS_BATCH_CHECK_OTHERDOMAIN: false,
    CA_IS_BATCH_CHECK_ATTACHMENT: false
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

// Compose tab id -> id of the separate check window (fallback mode).
var checkWindows = new Map();

browser.compose.onBeforeSend.addListener((tab, details) => {
    let tabId = tab.id;

    // Do NOT lose this Promise. Most of the compose window UI will be locked
    // until it is resolved. That's a very good way to annoy users.
    // It is stored before the check UI opens, so the UI always finds it.
    let promise = new Promise(resolve => {
        promiseMap.set(tabId, resolve);
    });
    showCheck(tab);
    return promise;
});

// Resolve the pending send of a compose tab exactly once.
function finishSend(tabId, cancel) {
    let resolve = promiseMap.get(tabId);
    if (!resolve) {
        return;
    }
    promiseMap.delete(tabId);
    resolve({ cancel: cancel });
}

// Open the check UI. Newer Thunderbird versions refuse to open the toolbar
// popup from onBeforeSend (openPopup returns false or throws), which left the
// check window closed. Then a separate popup window is opened instead.
async function showCheck(tab) {
    let tabId = tab.id;
    let opened = false;
    try {
        await browser.composeAction.enable(tabId);
        opened = await browser.composeAction.openPopup({ windowId: tab.windowId });
    } catch (e) {
        opened = false;
    }
    // Thunderbird before 113 returns undefined on success.
    if (opened === undefined) {
        opened = true;
    }
    if (opened) {
        return;
    }
    try {
        let win = await browser.windows.create({
            type: "popup",
            url: browser.runtime.getURL("html/confirm-address-popup.html") + "?tabId=" + tabId,
            width: 560,
            height: 640
        });
        checkWindows.set(tabId, win.id);
    } catch (e) {
        // No way to show the check. Never lock the compose window forever:
        // let the mail go, as Thunderbird would without the add-on.
        console.error("Confirm-Address: could not open the check window", e);
        finishSend(tabId, false);
    }
}

// Closing the separate check window without choosing counts as Cancel.
browser.windows.onRemoved.addListener(windowId => {
    for (let [tabId, winId] of checkWindows) {
        if (winId === windowId) {
            checkWindows.delete(tabId);
            if (promiseMap.has(tabId)) {
                browser.composeAction.enable(tabId);
                finishSend(tabId, true);
            }
        }
    }
});

browser.runtime.onMessage.addListener(async message => {
    switch (message.message) {
        case "GET_RECIPIENTS":
            await loadPrefs();
            var recipients = [];
            await collectAddress(message.tabId, recipients);
            var mailbody = await getMailBody(message.tabId);
            var attachments = [];
            await getAttachments(message.tabId, attachments);
            let inSendSession = promiseMap.get(message.tabId) ? true : false;
            //console.dir(recipients);
            browser.runtime.sendMessage({
                message: "SEND_RECIPIENTS",
                recipients: recipients,
                mailbody: mailbody,
                attachments: attachments,
                prefs: prefs,
                session: inSendSession
            });
            break;
        case "USER_CHECKED":
            if (!promiseMap.has(message.tabId)) {
                break;
            }
            checkWindows.delete(message.tabId);

            if (message.confirmed) {
                browser.composeAction.disable(message.tabId);
                finishSend(message.tabId, false);
            } else {
                browser.composeAction.enable(message.tabId);
                finishSend(message.tabId, true);
            }
            break;
       default:
           break;
    }
});

async function getAttachments(tabId, attachments){
    if (tabId == null){
        return;
    }

    var atts = await browser.compose.listAttachments(tabId);
    //console.dir(atts);
    for(var item in atts){
        attachments.push({name: atts[item].name});
    }
}
 
async function getMailBody(tabId){
    if (tabId == null) {
        return;
    }

    let details = await browser.compose.getComposeDetails(tabId);
    //Even when composing plain text mail, it outputs as HTML!
    var htmlbody = details.body;

    // Turn the HTML into plain text lines. The popup shows them as text only,
    // so HTML in a quoted message can never run or change the check window.
    const parser = new DOMParser();
    var doc = parser.parseFromString(htmlbody || "", 'text/html');
    var body = doc.body;
    if (!body) {
        return [];
    }
    for (let br of Array.from(body.querySelectorAll("br"))) {
        br.replaceWith("\n");
    }
    for (let block of Array.from(body.querySelectorAll("p, div, li, tr, blockquote"))) {
        block.append("\n");
    }
    var lines = body.textContent.split("\n").map(l => l.trim()).filter(l => l.length > 0);
    var bodyLines = Number(prefs['CA_SHOW_BODY_LINES']) || 3;
    return lines.slice(0, bodyLines);
}

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