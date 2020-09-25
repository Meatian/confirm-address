var promiseMap = new Map();

async function init() {
    browser.composeAction.disable();
}
init();

browser.compose.onBeforeSend.addListener((tab, details) => {
    let tabId = tab.id;
    let id = details.identityId;

    let iND = await browser.storage.local.get("CA_IS_NOT_DISPLAY");
    if (!iND || !iND["CA_IS_NOT_DISPLAY"]) {
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
        case "BLAHBLAH":
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