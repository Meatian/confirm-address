var CountDown = {
	onLoad : function(){
		var time = window.arguments[1];
		var limit = time;
		var label = document.getElementById("counter");
		
		for(var i=0; i<time; i++){
			setTimeout(function(){limit -= 1; label.value=limit;}, i*1000);
		}
		setTimeout(function(){CountDown.doSkip(); close();}, (time-1)*1000);
	},
	doSkip : function(){
		var parentWindow = window.arguments[0];
		parentWindow.countDownComplete = true;
		return true;
	}	
}