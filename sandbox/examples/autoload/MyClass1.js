MyClass1 = {
	
	init:function(){
		log('MyClass1.init');
	}


};

Sandbox.namespace('A.B.C.D');
A.B.C.D.init = function(){
	log('A.B.C.D.init');
};

console.log('MyClass1.js');
