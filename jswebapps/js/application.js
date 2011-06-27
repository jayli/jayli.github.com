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