function translate() {
  let elems = document.querySelectorAll('*[l10n-tag]');
  for (let i = 0; i < elems.length; i++) {
    elems[i].textContent = browser.i18n.getMessage(elems[i].getAttribute("l10n-tag"));
  }
  
  elems = document.querySelectorAll('*[l10n-val-tag]');
  for (let i = 0; i < elems.length; i++) {
    elems[i].value = browser.i18n.getMessage(elems[i].getAttribute("l10n-val-tag"));
  }
  
  elems = document.querySelectorAll('*[l10n-ph-tag]');
  for (let i = 0; i < elems.length; i++) {
    elems[i].placeholder = browser.i18n.getMessage(elems[i].getAttribute("l10n-ph-tag"));
  }
}

function getFullDayString(dayNum) {
  return browser.i18n.getMessage("casFullDay"+dayNum);
}
