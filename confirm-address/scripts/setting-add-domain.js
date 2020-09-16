"use strict";

var add_domain = {
    onload: function(){
    	dump("[SETTING]\n");
    	if(window.arguments[0].inn.domainName !== null){
    		document.getElementById("textbox").value = window.arguments[0].inn.domainName;
    	}
        document.addEventListener("dialogaccept",  add_domain.accept.bind(this));
        window.addEventListener("unload", add_domain.cancel.bind(this));
    },

    accept: function(event) {
    	window.arguments[0].out = {
    	    domainName:document.getElementById("textbox").value};
    },

    cancel: function(event) {
        return;
    }
}