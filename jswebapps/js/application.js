(function($){

$.fn.toggleShow = function(bool){
  if ( typeof bool == "undefined" ) {
    bool = !$(this).filter(":first:visible")[0];
  }
  return $(this)[bool ? "show" : "hide"]();
};

$.fn.disable = function(){
  $(this).find(":input").attr("disabled", "disabled");
  return this;
};

$(function($){ 
  $("#toc li").each(function(){
    if ($(this).find(">ol").length)
      $(this).addClass("expand");
  });
  
  $("#toc ol").hide();
  $("#toc li").click(function(){
    $(this).children("ol").toggleShow();
    return false;
  })
});

$(function(){
  $("form").submit(function(){
    var form  = $(this);
    var email = form.find("input").val();
    if (email && email.match(/.@./)) {
      form.disable();
      $.post(form.attr("action"), {email: email}, function(){
        form.html("<p>Thanks, we'll let you know when it's released!</p>");
      });
    }

    return false
  })
});

})(jQuery);

// added by jayli
(function($){
	$(function(){
		if(window.location.host !== 'ued.taobao.com'){
			return;
		}

		var str = '<p>特别贡献奖：<b>杨明明，朱琦，孙博</b></p> \
					<p>积极参与奖项：<b>江栋科，李任之，杨振楠，陈良，杨翰文，车思慧，Eric（网名）</b></p> \
					<p>恭喜以上获奖者!~</p> \
					<p>说明：本次活动奖品由机械工业出版社华章公司赠送，工作人员会与每位获奖者联系奖品及寄送问题，如有任何问题，请致电：010-88379618，联系人：何艳</p>';

		$('.sub-section').html(str);
		$('.sub-section').removeClass('sub-section');
		
		
	});



})(jQuery);
