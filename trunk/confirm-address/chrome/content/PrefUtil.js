PrefUtil = {
	PREF : Components.classes['@mozilla.org/preferences;1'].getService(Components.interfaces.nsIPrefBranch),
	
	KEY : "com.kenmaz.confirm-address.domain-list",

	getDomainList : function() {
		try{
			const nsIPrefBranch = Components.interfaces.nsIPrefBranch;
			var value = "";

			var type = this.PREF.getPrefType(this.KEY);
			switch (type) {
			case nsIPrefBranch.PREF_STRING:
				value = this.PREF.getCharPref(this.KEY);
				break;
				
			case nsIPrefBranch.PREF_INT:
				value = this.PREF.getIntPref(this.KEY);
				break;
				
		    case nsIPrefBranch.PREF_BOOL:
			default:
				value = this.PREF.getBoolPref(this.KEY);
				break;
			}
			dump("[GET PREF] "+ value + "\n");
			return value;
			
		}catch(e){
			dump("[NO PREF] " + this.KEY +"\n");
			return "";
		}
	},
	setDomainList : function(listStr) {
		dump("[SET PREF] "+ listStr + "\n");
		PrefUtil.PREF.setCharPref(PrefUtil.KEY, listStr);
	}
}