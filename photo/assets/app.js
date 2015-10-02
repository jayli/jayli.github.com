
KISSY.ready(function(S){
	var pageNum = 0; // 从第0页开始
	var pageStep = 6; // 每页数据条数
	var photoContainer = S.one('#J_PhotoListContainer');
	var photoItemTpl = S.one('#J_PhotoItemTpl').text();
	var Juicer = juicer;

	function renderPhotos(){
		var a = getPhotoList(pageNum ++);
		var inHtml = Juicer(photoItemTpl,{
			itemList:a		
		});
		photoContainer.append(inHtml);
	}

	function getPhotoList(page){
		var a = [];
		for(var i = page * pageStep; i < (page + 1) * pageStep; i++){
			a.push(PhotoList[i]);
		}
		return a;
	}
	
	function addScroll2End(){
		// 判断滚动到页面底部
		S.one(window).on('scroll',function(){
			if((S.one("body").height() - S.one("body").scrollTop()) <= (document.documentElement.clientHeight + 20)){
				renderPhotos();
			}
		});
	}

	(function(){
		renderPhotos();
		addScroll2End();
	})();
});
