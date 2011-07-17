function doWindowPopup(url) { 
	window.open(url, 'NewWindow','toolbar=1,scrollbars=1,height=600,width=800');
}

function clear_search_field(fld){
	txtfld = document.getElementById(fld);
	if(txtfld.value == "Keyword Search"){
		txtfld.value = "";
	}
}

function toggleDiv(imgid, divid, showsrc, hidesrc){
	imgfld = document.getElementById(imgid)
	divfld = document.getElementById(divid)
	if(divfld.style.display == 'none'){
	  divfld.style.display = 'block';
	  imgfld.src = hidesrc
	}else{
	  divfld.style.display = 'none';
	  imgfld.src = showsrc
	}
		
}
