YUI.namespace('Y.Slideshow');
YUI.add('slideshow', function (Y) {
  Y.Slideshow = function(){
	this.init.apply(this,arguments);
  }

  Y.mix(Y.Slideshow, {
	init: function(id, config){
	  var that = this;
	  that.processParam(config);
	  that.id = id;
	  that.container = Y.one('#'+id);
	  that.navs = that.container.all('.c-slideshow-nav li');
	  that.contents = that.container.all('.c-slideshow-content div');
	  that.currentIndex = 0;
	  that.navs.each(function(node, index){
		if(node.hasClass('selected')){
		  that.currentIndex = index;
		}
	  });
	  that.contents.setStyle('display', 'none');
	  that.contents.setStyle('opacity', '0');
	  that.contents.item(that.currentIndex).setStyle('display', '');
	  that.contents.item(that.currentIndex).setStyle('opacity', '1');
	  

	  if(that.clickEnable){
	  	// click切换
		Y.delegate('click', function(e){that.switchHandler(e, 'click')}, '#'+that.id, '.c-slideshow-nav li');
	  }else{
	  	// mouseover切换
	  	Y.delegate('mouseover',  function(e){that.switchHandler(e, 'mouseover')}, '#'+that.id, '.c-slideshow-nav li');
		if(that.autoPlay){
		  Y.delegate('mouseout',  function(){
			  that.autoInterval = setInterval(function(){that.autoSwitch()}, that.speed);
		  }, '#'+that.id, '.c-slideshow-nav li');
		}
	  }

	  if(that.autoPlay){
		that.autoInterval = setInterval(function(){that.autoSwitch()}, that.speed);
	  }
	},
	processParam: function(o){
	  var that = this;
	  if(typeof o == 'undefined' || o == null){
			  o = {};
	  }
	  that.clickEnable = (typeof o.clickEnable == 'undefined' || o.clickEnable == null)? false :o.clickEnable;
	  that.autoPlay = (typeof o.autoPlay == 'undefined' || o.autoPlay == null)? true :o.autoPlay;
	  that.anim = (typeof o.anim == 'undefined' || o.anim == null)? 'fade' :o.anim;
	  that.speed = (typeof o.speed == 'undefined' || o.speed == null)? 2000 :o.speed;
	},
	switchHandler: function(e, type){
	  var that = this;
	  if(type == 'mouseover'){
		clearInterval(that.autoInterval);
	  }
	  var currentNav = e.currentTarget;
	  var oldIndex = that.currentIndex;
	  for(var i=0,len=that.navs.size(); i<len; i++){
		if(that.navs.item(i) == currentNav){
		  that.currentIndex = i;
		  break;
		}
	  }

	  that.switchSlide(oldIndex, that.currentIndex);
	},
	switchSlide: function(oldIndex, newIndex){
	  if(oldIndex == newIndex){
		return;
	  }
	  var that = this;
	  that.navs.item(oldIndex).removeClass('selected');
	  that.navs.item(newIndex).addClass('selected');
	  
	  var anim1 = new Y.Anim({
		node: that.contents.item(oldIndex),
		to: {opacity: 0}
	  });
	  var anim2 = new Y.Anim({
		node: that.contents.item(newIndex),
		to: {opacity: 1}
	  });

	  that.contents.item(oldIndex).setStyle('display', 'none');
	  that.contents.item(newIndex).setStyle('display', '');

	  anim1.run();
	  anim2.run();
	},
	autoSwitch: function(){
	  var that = this;
	  var newIndex = that.currentIndex + 1;
	  if(newIndex >= that.navs.size()){
		newIndex = 0;
	  }
	  that.switchSlide(that.currentIndex, newIndex);
	  that.currentIndex = newIndex;
	}
  }, 0, null, 4);
},'3.0.0',{requires:['node', 'anim-base']});
