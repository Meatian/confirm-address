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

var numCountdown = 0;

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

    browser.composeAction.enable(tabId);
    browser.composeAction.openPopup();

    // Do NOT lose this Promise. Most of the compose window UI will be locked
    // until it is resolved. That's a very good way to annoy users.
    return new Promise(resolve => {
        promiseMap.set(tabId, resolve);
    });
});

browser.runtime.onMessage.addListener(async message => {
    switch (message.message) {
        case "GET_RECIPIENTS":
            await loadPrefs();
            var recipients = [];
            await collectAddress(message.tabId, recipients);
            var mailsubject = await getMailSubject(message.tabId);
            var mailbody = await getMailBody(message.tabId);
            var attachments = [];
            await getAttachments(message.tabId, attachments);
            let inSendSession = promiseMap.get(message.tabId) ? true : false;
            //console.dir(recipients);
            browser.runtime.sendMessage({
                message: "SEND_RECIPIENTS",
                recipients: recipients,
                mailsubject: mailsubject,
                mailbody: mailbody,
                attachments: attachments,
                prefs: prefs,
                session: inSendSession
            });
            break;
        case "USER_CHECKED":
            var resolve = promiseMap.get(message.tabId);
            if (!resolve) {
                break;
            }

            if (message.confirmed) {
                browser.composeAction.disable(message.tabId);
                resolve({
                    cancel: false
                });
            } else {
                browser.composeAction.enable(message.tabId);
                resolve({
                    cancel: true
                });
            }
            break;
        case "USER_CHECKED_WITH_COUNTDOWN":
            var resolve = promiseMap.get(message.tabId);
            if (!resolve) {
                break;
            }

            if (message.confirmed) {
                browser.composeAction.disable(message.tabId);
                var limit = prefs["CA_COUNT_DOWN_TIME"];
                if(numCountdown == 0){
                    var newDialog = {
                        type: "detached_panel",
                        url: "html/countdown.html",
                        width: 550,
                        height: 400
                    };
                    
                    browser.windows.create(newDialog);
                }

                numCountdown++;
                const ms = 333;
                setTimeout(() => {
                    browser.runtime.sendMessage({
                        message: "START_COUNTDOWN",
                        mailsubject: message.mailsubject,
                        tabId: message.tabId,
                        countdownSec: limit
                    });  
                }, ms);
            } else {
                browser.composeAction.enable(message.tabId);
                resolve({
                    cancel: true // for onBeforeSend event
                });
            }
            break;
        case "SEND_MAIL_NOW":
            var resolve = promiseMap.get(message.tabId);
            if (!resolve) {
                break;
            }
            resolve({
                cancel: false  
            });
            numCountdown--;
            break;
        case "ABORT_SEND_MAIL":
            var resolve = promiseMap.get(message.tabId);
            if (!resolve) {
                break;
            }
            browser.composeAction.enable(message.tabId);
            resolve({
                cancel: true
            });
            numCountdown--;
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

async function getMailSubject(tabId){
    if (tabId == null) {
        return;
    }

    let details = await browser.compose.getComposeDetails(tabId);
    var mailsubject = details.subject;

    //console.log(mailsubject);
    return mailsubject;
}
 
async function getMailBody(tabId){
    if (tabId == null) {
        return;
    }

    let details = await browser.compose.getComposeDetails(tabId);
    //Even when composing plain text mail, it outputs as HTML!
    var htmlbody = details.body;

    const parser = new DOMParser();
    var doc = parser.parseFromString(htmlbody, 'text/html');
    var htmlbody = doc.getElementsByTagName("body")[0].innerHTML;

    var splitedBody = htmlbody.split("<br>");
    var bodyLines = Number(prefs['CA_SHOW_BODY_LINES']);
    if(splitedBody.length < bodyLines){
        bodyLines = splitedBody.length;
    }
    var mailbody = "";
    
    for (var i=0; i<bodyLines; i++){
        mailbody += splitedBody[i] + "<br>\n";
    }
    //console.log(mailbody);
    return mailbody;
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