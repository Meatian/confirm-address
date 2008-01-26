PrefUtil = {
	PREF : Components.classes['@mozilla.org/preferences;1'].getService(Components.interfaces.nsIPrefBranch),
	
	KEY_DOMAIN_LIST : "com.kenmaz.confirm-address.domain-list",
	KEY_NOT_DISPLAY : "com.kenmaz.confirm-address.not-display",
	COUNT_DOWN_TIME : "com.kenmaz.confirm-address.countdown-time",

	getDomainList : function() {
		return this.getPref(PrefUtil.KEY_DOMAIN_LIST);
	},
	setDomainList : function(listStr) {
		PrefUtil.setPref(PrefUtil.KEY_DOMAIN_LIST, listStr);
	},
	
	isNotDisplay : function() {
		return this.getPref(PrefUtil.KEY_NOT_DISPLAY);
	},
	setNotDisplay : function(b) {
		PrefUtil.setPref(PrefUtil.KEY_NOT_DISPLAY, b);
	},
	
	isCountDown : function(){
		return this.getPref(PrefUtil.IS_COUNT_DOWN);
	},
	setCountDown : function(b){
		PrefUtil.setPref(PrefUtil.IS_COUNT_DOWN, b);
	},

	getCountDownTime : function(){
		return this.getPref(PrefUtil.COUNT_DOWN_TIME);
	},
	setCountDownTime : function(t){
		PrefUtil.setPref(PrefUtil.COUNT_DOWN_TIME, t);
	},
	
	getPref : function(key) {
		try{
			const nsIPrefBranch = Components.interfaces.nsIPrefBranch;
			var value = "";

			var type = this.PREF.getPrefType(key);
			switch (type) {
			case nsIPrefBranch.PREF_STRING:
				value = this.PREF.getCharPref(key);
				break;
				
			case nsIPrefBranch.PREF_INT:
				value = this.PREF.getIntPref(key);
				break;
				
		    case nsIPrefBranch.PREF_BOOL:
			default:
				value = this.PREF.getBoolPref(key);
				break;
			}
			dump("[GET PREF] key="+ key + ", value=" + value + "\n");
			return value;
			
		}catch(e){
			dump("[GET PREF ERROR] key="+ key + "\n");
			return null;
		}
	},
	setPref : function(key, value) {
		var type = typeof(value);
		if(type == "string"){
			PrefUtil.PREF.setCharPref(key, value);
		}else if(type == "boolean"){
			PrefUtil.PREF.setBoolPref(key, value);
		}else if(type == "integer"){
			PrefUtil.PREF.setIntPref(key, value);
		}else{
		}
		dump("[SET PREF] key="+ key + ", value=" + value + "\n");
	}
}