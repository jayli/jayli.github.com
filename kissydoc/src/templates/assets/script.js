// Agency code.


//4
//0,1,2,3
var getRandom = function(a){
	return Math.floor(parseInt((Math.random() * 10) % 10) * a / 10);
};

(function() {
$( document ).ready( function() {
	$('#show-off').html('<img src="templates/assets/img/show-off-'+getRandom(4)+'.png" />');

  //
  $( window ).bind( 'load resize', setMenuBackgroundHeight );

  // setMenuBackgroundHeight();

});


var setMenuBackgroundHeight = function() {
  var d = $( '#content').height();
  var w = $( window ).width();

  if( w > 760 ) {
    $( '#sidebar' ).css( { "min-height": (d - 40) } );
  } else {
    $( '#sidebar' ).css( { "min-height": (100) } );
  }

};

})();


