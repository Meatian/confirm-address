var parentWindow;

function startup(){
	dump("[setting start]\n");
	parentWindow = window.arguments[0];
	
	if(parentWindow.domainName != null){
		document.getElementById("textbox").value = parentWindow.domainName;
	}
}

function doOK(){
	parentWindow.domainName = document.getElementById("textbox").value;
	dump("[input] " + parentWindow.domainName + "\n");
	parentWindow.confirmOK = true;	
	return true;
}

function doCancel(){
	dump("[cancel]\n");
	parentWindow.confirmOK = false;	
	return true;
}
