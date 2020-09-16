var CountDown = {
	/**
	 * カウントダウンを開始します
	 */
	onLoad : function(){
		var time = window.arguments[1];
		var limit = time;
		var label = document.getElementById("counter");
	
		label.value = limit;
		setInterval(function() {
			limit--;
			if(limit < 0) {
				CountDown.complete();
				close();	
			} else {
				label.value = limit;
			}
		},1000);
		document.addEventListener("dialogaccept",  CountDown.doOK.bind(this));
		document.addEventListener("dialogcancel",  CountDown.doCancel.bind(this));	
	},

	/**
	 * カウントダウン完了フラグを立てます
	 */
	complete : function(){
		var parentWindow = window.arguments[0];
		parentWindow.countDownComplete = true;
		return true;
	},	

	doOK : function(){
		var parentWindow = window.arguments[0];
		parentWindow.countDownComplete = true;
		return true;
	},

	doCancel : function(){
		var parentWindow = window.arguments[0];
		parentWindow.countDownComplete = false;
		return true;
	}

}
