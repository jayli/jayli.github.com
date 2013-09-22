# feature

硬件环境关键特性检测，直接通过KISSY全局对象调用

	KISSY.Features.isXXX();

这类功能通常在判断硬件环境时使用，比如在KISSY的modules定义的代码：

	KISSY.config('modules',{
		"dom/basic": {
			"alias": [
				'dom/base',
				Features.isIELessThan(9) ? 'dom/ie' : '',
				Features.isClassListSupported() ? '' : 'dom/class-list'
			]
		},
		"dom": {
			"alias": [
				'dom/basic',
				!Features.isQuerySelectorSupported() ? 'dom/selector' : ''
			]
		}
	});


### isDeviceMotionSupported()  `<static>`

判断当前宿主环境是否支持手势事件

### isMsPointerSupported()  `<static>`

判断当前宿主环境是否支持ie8的Pointer事件

### isTouchEventSupported()  `<static>`

判断当前宿主环境是否支持触屏事件

### isHashChangeSupported()  `<static>`

判断当前环境是否支持hashChange事件

### isTransitionSupported()  `<static>`

判断当前环境是否支持Transition动画

### isTransformSupported()  `<static>`

判断当前环境是否支持Transform动画

### isClassListSupported()  `<static>`

判断当前环境是否支持ClassList

### isQuerySelectorSupported()  `<static>`

判断当前环境是否支持QuerySelector方法

### getTransitionPrefix()  `<static>`

得到Transition属性的前缀

### getTransformPrefix()  `<static>`

得到Transform属性的前缀
