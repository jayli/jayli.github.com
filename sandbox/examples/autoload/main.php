<?php
function __autoload($class_name) {
	    include $class_name . '.php';
}

$obj  = new MyClass1();
$obj2 = new MyClass2(); 

print_r($obj);
print_r($obj2);

?>

