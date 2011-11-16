(function() {
    if (!navigator.userAgent.indexOf('MSIE')) return;
    var e = "abbr,article,aside,audio,canvas,datalist,details,dialog,eventsource,figure,footer,header,hgroup,mark,menu,meter,nav,output,progress,section,time,video".split(‘,’),
    i = e.length;
    while (i–) {
        document.createElement(e[i]);
    }
})();
