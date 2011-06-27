var ConfirmAddressTreeDialog = {

  startup : function(){
    var okBtn = document.documentElement.getButton("accept");
  	okBtn.disabled = true;
  	
  	//ボタン名設定
  	var strbundle = document.getElementById("strings");
  	var BtnLabel = strbundle.getString("confirm.dialog.acceptbtn.label");
  	okBtn.label = BtnLabel;

    var rootcell = document.getElementById("rootcell");
        
  	//自ドメインあて先リスト
    var treeElement = document.getElementById("internal-tree");
    this.createTree(treeElement);
    treeElement.onclick = this.refreshTreeSel;

    var externalTree = document.getElementById("external-tree");
    //this.createTree(treeElement);
    externalTree.onclick = this.refreshTreeSel;    
    //createTree(document.getElementById("internal-tree"));
  },
  
  refreshTreeSel : function(event){
    var root = event.target;
    for(var i in root.childNodes){
      var item = root.childNodes[i];
      dump(this.isCheck(item)+"\n");

      var treechildren = item.childNodes[1];
      for(var j in treechildren.childNodes){
        var childitem = treechildren.childNodes[j];
        dump(this.isCheck(childitem)+"\n");
      }

    }
  },
  
  isCheck : function(treeitem){
    var row = item.childNodes[0];
    var rowcheck = row.childNodes[0];
    return rowcheck.getAttribute("value");
  },
  
  createTree : function(treeElement){
    var map = window.arguments[1];
    for(var domainName in map){

      var treeitem = document.createElement("treeitem");
      treeitem.setAttribute("container","true");
      treeitem.setAttribute("open","true");
      treeElement.appendChild(treeitem);
    
      var treerow = document.createElement("treerow");
      treeitem.appendChild(treerow);
      
      var treecell1 = document.createElement("treecell");
      treecell1.setAttribute("value","false");
      treerow.appendChild(treecell1);

      var treecell2 = document.createElement("treecell");
      treecell2.setAttribute("label"," "+domainName);
      treerow.appendChild(treecell2);
      
      var treechildren = document.createElement("treechildren");
      treeitem.appendChild(treechildren);
        
      var list = map[domainName];
      for(var j in list){

        var child_treeitem = document.createElement("treeitem");
        child_treeitem.setAttribute("container","true");
        child_treeitem.setAttribute("open","true");
        treechildren.appendChild(child_treeitem);

        var child_treerow = document.createElement("treerow");
        child_treeitem.appendChild(child_treerow);
        
        var child_treecell1 = document.createElement("treecell");
        child_treecell1.setAttribute("value","false");
        child_treerow.appendChild(child_treecell1);

        var child_treecell2 = document.createElement("treecell");
        child_treecell2.setAttribute("label"," "+list[j]);
        child_treerow.appendChild(child_treecell2);
      }
    }
    
  	// var internalTree = document.getElementById("internal-tree");
  	// for(i = 0; i < internals.length; i++){
  		// var address = internals[i];
  		// var listitem = createListItem(address);
  		// internalList.appendChild(listitem);
  	// }
  	//自ドメインあて先リストヘッダ
  	// var checkboxHeader = document.getElementById("checkbox_header");
  	// checkboxHeader.onclick = function(event){
  		// if(internals.length==0) return;
  		// switchInternalCheckBox(internalList);
  		// checkAllChecked();
  	// };
  	
  	//他ドメインあて先リスト
  	// var externals = window.arguments[2];
  	// var externalList = document.getElementById("otherDomains");
  	// if(externals.length > 0){
  		// externalList.setAttribute("style","font-weight: bold;");
  	// }
  	// for(i = 0; i < externals.length; i++){
  		// var address = externals[i];
  		// var listitem = createListItem(address);
  		// externalList.appendChild(listitem);
  	// }	
  },

  createListItem : function(address){

  	var listitem = document.createElement("listitem");
  	
  	var cell1 = document.createElement("listcell");
  	var checkbox = document.createElement("checkbox");
  	checkbox.setAttribute("style", "margin-left:7px;");
  	cell1.appendChild(checkbox);
  	listitem.appendChild(cell1);
  	
  	listitem.checkbox = checkbox;
  	listitem.onclick = function(event){
  		var chekced = this.checkbox.checked;
  		this.checkbox.setAttribute("checked", !chekced);
  		checkAllChecked();
  	};
  	
  	var cell2 = document.createElement("listcell");
  	cell2.setAttribute("label", address);
  	listitem.appendChild(cell2);
  	
  	return listitem;
  },

  checkAllChecked : function(){

  	//自ドメインのチェック状況を確認
  	var yourdomains = document.getElementById("yourDomains");
  	var checkboxes = yourdomains.getElementsByTagName("checkbox");
  	var isAllcheckON = checkboxes[0].checked; //[すべて確認]チェックボックスの状況
  	var internalComplete = true;
  	for(var i=1; i<checkboxes.length; i++){
  		var chk = checkboxes[i].checked
  		if(!chk){
  			internalComplete = false;
  			break;
  		}
  	}
  	checkboxes[0].checked = internalComplete;
  	
  	//すべてのチェックボックスの状況確認
  	var complete = true;
  	var checkboxes = document.getElementsByTagName("checkbox");
  	for(var i = 0; i < checkboxes.length; i++){
  		var cb = checkboxes[i];
  		
  		if(cb.id == "check_all") continue;
  		
  		if(!cb.checked){
  			complete = false;
  			break;
  		}
  	}
  	
  	//送信ボタンのdisable切り替え
  	var okBtn = document.documentElement.getButton("accept");
  	if(complete){
  		okBtn.disabled = false;
  	}else{
  		okBtn.disabled = true;
  	}
  },

  //[すべて確認]チェックボックスがONなら、すべての自ドメインアドレスの確認ボックスをONにする。
  switchInternalCheckBox : function(internalList){

  	var checkAll = document.getElementById("check_all");
  	var isCheck = !checkAll.checked;

  	var yourdomains = document.getElementById("yourDomains");
  	var checkboxes = yourdomains.getElementsByTagName("checkbox");
  	for(var i=0; i<checkboxes.length; i++){
  		checkboxes[i].checked = isCheck;
  	}
  },

  doOK : function(){
  	var parentWindow = window.arguments[0];
  	parentWindow.confirmOK = true;
  	return true;
  },

  doCancel : function(){
  	var parentWindow = window.arguments[0];
  	parentWindow.confirmOK = false;
  	return true;
  }
};


