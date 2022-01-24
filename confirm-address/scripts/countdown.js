var prefs = null;
var numCountdown = 0;

function pushSendQueue(message){
    //console.dir(message);
    const template = document.getElementById("caCDQItem");
    const content = template.content;
    const sendQueue = document.importNode(content, true);

    const tabId = message.tabId;
    var limit = message.countdownSec;

    sendQueue.getElementById("mailSubject").innerText = message.mailsubject;
    sendQueue.getElementById("counter").innerText = limit;

    // set Unique ID by tabId
    sendQueue.getElementById("counter").id = "counter-" + tabId;
    var send_now = sendQueue.getElementById("btn_send_now");
    send_now.id = "btn_send_now_" + tabId;
    var abort = sendQueue.getElementById("btn_abort");
    abort.id = "btn_abort_" + tabId;
    sendQueue.getElementById("caCD").id = "caCD-" + tabId;

    var timer = setInterval(function(){
            limit--;
            if (limit < 0) {
                clearInterval(timer);
                sendResult(true, tabId);
                popSendQueue(tabId);
            } else {
                document.getElementById("counter-"+tabId).innerText = limit;
            }
        },1000);

    send_now.addEventListener("click", function(){
        clearInterval(timer);
        sendResult(true, tabId);
        popSendQueue(tabId);
    });

    abort.addEventListener("click",function(){
        clearInterval(timer);
        sendResult(false, tabId);
        popSendQueue(tabId);
    });
    
    document.getElementById("caCountdownQueue").appendChild(sendQueue);
    numCountdown++;
    translate();
}

function popSendQueue(tabId){
    var target = document.getElementById("caCD-"+tabId);
    target.parentNode.removeChild(target);
    numCountdown--;
    if(numCountdown == 0){
        document.getElementById("noitems").style.display = "block";
        setTimeout(function(){
            var winId = browser.windows.WINDOW_ID_CURRENT;
            browser.windows.remove(winId);
        },1000);
    }
}

async function sendResult(confirmed, tabId) {
    if(confirmed){
        await browser.runtime.sendMessage({
            message: "SEND_MAIL_NOW",
            tabId: tabId
        });
    } else {
       await browser.runtime.sendMessage({
           message: "ABORT_SEND_MAIL",
           tabId: tabId
       });
    }
}

browser.runtime.onMessage.addListener(async (message) => {
     switch (message.message) {
         case "START_COUNTDOWN":
            //console.dir(message);
            pushSendQueue(message);
            break;
        default:
            break;
    }
});

//init();