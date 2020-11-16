DUMP = false;

/*
 * ドメインリストが空なら全員部外者
 */
function testJudge_domainListIsNull() {
	addressList = new Array({ address: "aaa@me.com" }, { address: "bbb@me.com" });
	domainList = new Array();
	insiders = new Array();
	outsiders = new Array();
	r = judge(addressList, domainList, insiders, outsiders);
	assertEquals(0, insiders.length);
	assertEquals(2, outsiders.length);
}

/*
 * 同僚だけ
 */
function testJudge_onlyInSiders() {
	addressList = new Array({ address: "aaa@me.com" }, { address: "bbb@me.com" });
	domainList = new Array("me.com");
	insiders = new Array();
	outsiders = new Array();
	r = judge(addressList, domainList, insiders, outsiders);
	assertEquals(2, insiders.length);
	assertEquals(0, outsiders.length);
}

/*
 * 部外者だけ
 */
function testJudge_onlyOutSiders() {
	addressList = new Array({ address: "aaa@out.com" }, { address: "bbb@out.com" });
	domainList = new Array("me.com");
	insiders = new Array();
	outsiders = new Array();
	r = judge(addressList, domainList, insiders, outsiders);
	assertEquals(0, insiders.length);
	assertEquals(2, outsiders.length);
}

/*
 * 部外者、同僚いりまじり
 */
function testJudge_InOutSiders() {
	addressList = new Array({ address: "zzz@me.com" }, { address: "aaa@out.com" }, { address: "bbb@out.com" }, { address: "ccc@me.com" });
	domainList = new Array("me.com");
	insiders = new Array();
	outsiders = new Array();
	r = judge(addressList, domainList, insiders, outsiders);
	assertEquals(2, insiders.length);
	assertEquals(2, outsiders.length);
}

/*
 * 大文字でもOK
 */
function testJudge_UpperCase() {
	addressList = new Array({ address: "TARO@ME.COM" });
	domainList = new Array("me.com");
	insiders = new Array();
	outsiders = new Array();
	r = judge(addressList, domainList, insiders, outsiders);
	assertEquals(1, insiders.length);
	assertEquals(0, outsiders.length);
}

/*
 * 組織外メールアドレスのユーザ名部が、組織内ドメイン名と同様の文字列を含んでいる
 * 場合に、ただしくそのアドレスを組織外として認識するか
 */
function testJudge_OutSiderNameLooksLikeInSiderDomainName() {
	addressList = new Array({ address: "me.com@outsider.com" }, { address: "bbb@me.com" });
	domainList = new Array("me.com");
	insiders = new Array();
	outsiders = new Array();
	r = judge(addressList, domainList, insiders, outsiders);
	assertEquals(1, insiders.length);
	assertEquals(1, outsiders.length);
}

/*
 * ドメインリストの取得ができるか
 */
function testGetDomainList() {
	var prefs = {
		CA_DOMAIN_LIST: "gmail.com,me.com"
	}
	list = prefs["CA_DOMAIN_LIST"].split(",");
	assertEquals(2, list.length);
}

/*
 * ドメインリストが空文字のときに、
 * 空の配列を取得できるか
 */
function testGetDomainList_listInEmpty() {
	var prefs = {
		CA_DOMAIN_LIST: ""
	}

	list = getDomainList(prefs["CA_DOMAIN_LIST"]);
	assertEquals(0, list.length);
}

/*
 * ドメインリストがnullのときに、
 * 空の配列を取得できるか
 */
function testGetDomainList_listInNull() {
	var prefs = {
		CA_DOMAIN_LIST: null
	}

	list = getDomainList(prefs["CA_DOMAIN_LIST"]);
	assertEquals(0, list.length);
}
