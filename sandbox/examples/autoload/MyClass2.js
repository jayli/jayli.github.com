MyClass2 = {
	
	init:function(){
		log('MyClass2.init');
	}


};

Sandbox.namespace('X.Y.Z');
X.Y.Z.init = function(){
	log('X.Y.Z.init');
};

console.log('MyClass2.js');
