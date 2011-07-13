(function(window,undefined){
	var html = [
		//'<div id="update-your-ie6" style="display:hidden;">',
			'<div class="icon" style="">',
				'<img class="normal" src="ie6update/images/icon.png">',
				'<img class="hover" src="ie6update/images/icon-over.png" style="display: none;">',
			'</div>',
			'<div class="close" style="">',
				'<img class="normal" src="ie6update/images/close.png">',
				'<img class="hover" src="ie6update/images/close-over.png" style="display: none;">',
			'</div>',
			'<div class="content">',
				'<div>',
					'Internet Explorer is missing updates required to view this site. Click here to update... ',
				'</div>',
			'</div>'
		//'</div>'
	].join(''),
		
		head = document.getElementsByTagName('head')[0],
		body = document.getElementsByTagName('body')[0],
		viewPortWidth = document.body.clientWidth,
		viewPortHeight = document.body.clientHeight,
		firstChild = body.childNodes[0],
		con = document.createElement('div');

	con.id = 'update-your-ie6',
	con.style.display = 'none',
	con.innerHTML = html,
	body.insertBefore(con,firstChild),
	//body.style.margin = '0px',
	con.style.width = viewPortWidth + 'px',
	con.style.display = 'block';
		


})(window);