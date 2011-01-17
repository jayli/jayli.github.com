/*  Prototype JavaScript framework, version 1.6.0.2
 *  (c) 2005-2008 Sam Stephenson
 *
 *  Prototype is freely distributable under the terms of an MIT-style license.
 *  For details, see the Prototype web site: http://www.prototypejs.org/
 *
 *--------------------------------------------------------------------------*/

var Prototype = {
  Version: '1.6.0.2',

  Browser: {
    IE:     !!(window.attachEvent && !window.opera),
    Opera:  !!window.opera,
    WebKit: navigator.userAgent.indexOf('AppleWebKit/') > -1,
    Gecko:  navigator.userAgent.indexOf('Gecko') > -1 && navigator.userAgent.indexOf('KHTML') == -1,
    MobileSafari: !!navigator.userAgent.match(/Apple.*Mobile.*Safari/)
  },

  BrowserFeatures: {
    XPath: !!document.evaluate,
    ElementExtensions: !!window.HTMLElement,
    SpecificElementExtensions:
      document.createElement('div').__proto__ &&
      document.createElement('div').__proto__ !==
        document.createElement('form').__proto__
  },

  ScriptFragment: '<script[^>]*>([\\S\\s]*?)<\/script>',
  JSONFilter: /^\/\*-secure-([\s\S]*)\*\/\s*$/,

  emptyFunction: function() { },
  K: function(x) { return x }
};

if (Prototype.Browser.MobileSafari)
  Prototype.BrowserFeatures.SpecificElementExtensions = false;


/* Based on Alex Arnell's inheritance implementation. */
var Class = {
  create: function() {
    var parent = null, properties = $A(arguments);
    if (Object.isFunction(properties[0]))
      parent = properties.shift();

    function klass() {
      this.initialize.apply(this, arguments);
    }

    Object.extend(klass, Class.Methods);
    klass.superclass = parent;
    klass.subclasses = [];

    if (parent) {
      var subclass = function() { };
      subclass.prototype = parent.prototype;
      klass.prototype = new subclass;
      parent.subclasses.push(klass);
    }

    for (var i = 0; i < properties.length; i++)
      klass.addMethods(properties[i]);

    if (!klass.prototype.initialize)
      klass.prototype.initialize = Prototype.emptyFunction;

    klass.prototype.constructor = klass;

    return klass;
  }
};

Class.Methods = {
  addMethods: function(source) {
    var ancestor   = this.superclass && this.superclass.prototype;
    var properties = Object.keys(source);

    if (!Object.keys({ toString: true }).length)
      properties.push("toString", "valueOf");

    for (var i = 0, length = properties.length; i < length; i++) {
      var property = properties[i], value = source[property];
      if (ancestor && Object.isFunction(value) &&
          value.argumentNames().first() == "$super") {
        var method = value, value = Object.extend((function(m) {
          return function() { return ancestor[m].apply(this, arguments) };
        })(property).wrap(method), {
          valueOf:  function() { return method },
          toString: function() { return method.toString() }
        });
      }
      this.prototype[property] = value;
    }

    return this;
  }
};

var Abstract = { };

Object.extend = function(destination, source) {
  for (var property in source)
    destination[property] = source[property];
  return destination;
};

Object.extend(Object, {
  inspect: function(object) {
    try {
      if (Object.isUndefined(object)) return 'undefined';
      if (object === null) return 'null';
      return object.inspect ? object.inspect() : String(object);
    } catch (e) {
      if (e instanceof RangeError) return '...';
      throw e;
    }
  },

  toJSON: function(object) {
    var type = typeof object;
    switch (type) {
      case 'undefined':
      case 'function':
      case 'unknown': return;
      case 'boolean': return object.toString();
    }

    if (object === null) return 'null';
    if (object.toJSON) return object.toJSON();
    if (Object.isElement(object)) return;

    var results = [];
    for (var property in object) {
      var value = Object.toJSON(object[property]);
      if (!Object.isUndefined(value))
        results.push(property.toJSON() + ': ' + value);
    }

    return '{' + results.join(', ') + '}';
  },

  toQueryString: function(object) {
    return $H(object).toQueryString();
  },

  toHTML: function(object) {
    return object && object.toHTML ? object.toHTML() : String.interpret(object);
  },

  keys: function(object) {
    var keys = [];
    for (var property in object)
      keys.push(property);
    return keys;
  },

  values: function(object) {
    var values = [];
    for (var property in object)
      values.push(object[property]);
    return values;
  },

  clone: function(object) {
    return Object.extend({ }, object);
  },

  isElement: function(object) {
    return object && object.nodeType == 1;
  },

  isArray: function(object) {
    return object != null && typeof object == "object" &&
      'splice' in object && 'join' in object;
  },

  isHash: function(object) {
    return object instanceof Hash;
  },

  isFunction: function(object) {
    return typeof object == "function";
  },

  isString: function(object) {
    return typeof object == "string";
  },

  isNumber: function(object) {
    return typeof object == "number";
  },

  isUndefined: function(object) {
    return typeof object == "undefined";
  }
});

Object.extend(Function.prototype, {
  argumentNames: function() {
    var names = this.toString().match(/^[\s\(]*function[^(]*\((.*?)\)/)[1].split(",").invoke("strip");
    return names.length == 1 && !names[0] ? [] : names;
  },

  bind: function() {
    if (arguments.length < 2 && Object.isUndefined(arguments[0])) return this;
    var __method = this, args = $A(arguments), object = args.shift();
    return function() {
      return __method.apply(object, args.concat($A(arguments)));
    }
  },

  bindAsEventListener: function() {
    var __method = this, args = $A(arguments), object = args.shift();
    return function(event) {
      return __method.apply(object, [event || window.event].concat(args));
    }
  },

  curry: function() {
    if (!arguments.length) return this;
    var __method = this, args = $A(arguments);
    return function() {
      return __method.apply(this, args.concat($A(arguments)));
    }
  },

  delay: function() {
    var __method = this, args = $A(arguments), timeout = args.shift() * 1000;
    return window.setTimeout(function() {
      return __method.apply(__method, args);
    }, timeout);
  },

  wrap: function(wrapper) {
    var __method = this;
    return function() {
      return wrapper.apply(this, [__method.bind(this)].concat($A(arguments)));
    }
  },

  methodize: function() {
    if (this._methodized) return this._methodized;
    var __method = this;
    return this._methodized = function() {
      return __method.apply(null, [this].concat($A(arguments)));
    };
  }
});

Function.prototype.defer = Function.prototype.delay.curry(0.01);

Date.prototype.toJSON = function() {
  return '"' + this.getUTCFullYear() + '-' +
    (this.getUTCMonth() + 1).toPaddedString(2) + '-' +
    this.getUTCDate().toPaddedString(2) + 'T' +
    this.getUTCHours().toPaddedString(2) + ':' +
    this.getUTCMinutes().toPaddedString(2) + ':' +
    this.getUTCSeconds().toPaddedString(2) + 'Z"';
};

var Try = {
  these: function() {
    var returnValue;

    for (var i = 0, length = arguments.length; i < length; i++) {
      var lambda = arguments[i];
      try {
        returnValue = lambda();
        break;
      } catch (e) { }
    }

    return returnValue;
  }
};

RegExp.prototype.match = RegExp.prototype.test;

RegExp.escape = function(str) {
  return String(str).replace(/([.*+?^=!:${}()|[\]\/\\])/g, '\\$1');
};

/*--------------------------------------------------------------------------*/

var PeriodicalExecuter = Class.create({
  initialize: function(callback, frequency) {
    this.callback = callback;
    this.frequency = frequency;
    this.currentlyExecuting = false;

    this.registerCallback();
  },

  registerCallback: function() {
    this.timer = setInterval(this.onTimerEvent.bind(this), this.frequency * 1000);
  },

  execute: function() {
    this.callback(this);
  },

  stop: function() {
    if (!this.timer) return;
    clearInterval(this.timer);
    this.timer = null;
  },

  onTimerEvent: function() {
    if (!this.currentlyExecuting) {
      try {
        this.currentlyExecuting = true;
        this.execute();
      } finally {
        this.currentlyExecuting = false;
      }
    }
  }
});
Object.extend(String, {
  interpret: function(value) {
    return value == null ? '' : String(value);
  },
  specialChar: {
    '\b': '\\b',
    '\t': '\\t',
    '\n': '\\n',
    '\f': '\\f',
    '\r': '\\r',
    '\\': '\\\\'
  }
});

Object.extend(String.prototype, {
  gsub: function(pattern, replacement) {
    var result = '', source = this, match;
    replacement = arguments.callee.prepareReplacement(replacement);

    while (source.length > 0) {
      if (match = source.match(pattern)) {
        result += source.slice(0, match.index);
        result += String.interpret(replacement(match));
        source  = source.slice(match.index + match[0].length);
      } else {
        result += source, source = '';
      }
    }
    return result;
  },

  sub: function(pattern, replacement, count) {
    replacement = this.gsub.prepareReplacement(replacement);
    count = Object.isUndefined(count) ? 1 : count;

    return this.gsub(pattern, function(match) {
      if (--count < 0) return match[0];
      return replacement(match);
    });
  },

  scan: function(pattern, iterator) {
    this.gsub(pattern, iterator);
    return String(this);
  },

  truncate: function(length, truncation) {
    length = length || 30;
    truncation = Object.isUndefined(truncation) ? '...' : truncation;
    return this.length > length ?
      this.slice(0, length - truncation.length) + truncation : String(this);
  },

  strip: function() {
    return this.replace(/^\s+/, '').replace(/\s+$/, '');
  },

  stripTags: function() {
    return this.replace(/<\/?[^>]+>/gi, '');
  },

  stripScripts: function() {
    return this.replace(new RegExp(Prototype.ScriptFragment, 'img'), '');
  },

  extractScripts: function() {
    var matchAll = new RegExp(Prototype.ScriptFragment, 'img');
    var matchOne = new RegExp(Prototype.ScriptFragment, 'im');
    return (this.match(matchAll) || []).map(function(scriptTag) {
      return (scriptTag.match(matchOne) || ['', ''])[1];
    });
  },

  evalScripts: function() {
    return this.extractScripts().map(function(script) { return eval(script) });
  },

  escapeHTML: function() {
    var self = arguments.callee;
    self.text.data = this;
    return self.div.innerHTML;
  },

  unescapeHTML: function() {
    var div = new Element('div');
    div.innerHTML = this.stripTags();
    return div.childNodes[0] ? (div.childNodes.length > 1 ?
      $A(div.childNodes).inject('', function(memo, node) { return memo+node.nodeValue }) :
      div.childNodes[0].nodeValue) : '';
  },

  toQueryParams: function(separator) {
    var match = this.strip().match(/([^?#]*)(#.*)?$/);
    if (!match) return { };

    return match[1].split(separator || '&').inject({ }, function(hash, pair) {
      if ((pair = pair.split('='))[0]) {
        var key = decodeURIComponent(pair.shift());
        var value = pair.length > 1 ? pair.join('=') : pair[0];
        if (value != undefined) value = decodeURIComponent(value);

        if (key in hash) {
          if (!Object.isArray(hash[key])) hash[key] = [hash[key]];
          hash[key].push(value);
        }
        else hash[key] = value;
      }
      return hash;
    });
  },

  toArray: function() {
    return this.split('');
  },

  succ: function() {
    return this.slice(0, this.length - 1) +
      String.fromCharCode(this.charCodeAt(this.length - 1) + 1);
  },

  times: function(count) {
    return count < 1 ? '' : new Array(count + 1).join(this);
  },

  camelize: function() {
    var parts = this.split('-'), len = parts.length;
    if (len == 1) return parts[0];

    var camelized = this.charAt(0) == '-'
      ? parts[0].charAt(0).toUpperCase() + parts[0].substring(1)
      : parts[0];

    for (var i = 1; i < len; i++)
      camelized += parts[i].charAt(0).toUpperCase() + parts[i].substring(1);

    return camelized;
  },

  capitalize: function() {
    return this.charAt(0).toUpperCase() + this.substring(1).toLowerCase();
  },

  underscore: function() {
    return this.gsub(/::/, '/').gsub(/([A-Z]+)([A-Z][a-z])/,'#{1}_#{2}').gsub(/([a-z\d])([A-Z])/,'#{1}_#{2}').gsub(/-/,'_').toLowerCase();
  },

  dasherize: function() {
    return this.gsub(/_/,'-');
  },

  inspect: function(useDoubleQuotes) {
    var escapedString = this.gsub(/[\x00-\x1f\\]/, function(match) {
      var character = String.specialChar[match[0]];
      return character ? character : '\\u00' + match[0].charCodeAt().toPaddedString(2, 16);
    });
    if (useDoubleQuotes) return '"' + escapedString.replace(/"/g, '\\"') + '"';
    return "'" + escapedString.replace(/'/g, '\\\'') + "'";
  },

  toJSON: function() {
    return this.inspect(true);
  },

  unfilterJSON: function(filter) {
    return this.sub(filter || Prototype.JSONFilter, '#{1}');
  },

  isJSON: function() {
    var str = this;
    if (str.blank()) return false;
    str = this.replace(/\\./g, '@').replace(/"[^"\\\n\r]*"/g, '');
    return (/^[,:{}\[\]0-9.\-+Eaeflnr-u \n\r\t]*$/).test(str);
  },

  evalJSON: function(sanitize) {
    var json = this.unfilterJSON();
    try {
      if (!sanitize || json.isJSON()) return eval('(' + json + ')');
    } catch (e) { }
    throw new SyntaxError('Badly formed JSON string: ' + this.inspect());
  },

  include: function(pattern) {
    return this.indexOf(pattern) > -1;
  },

  startsWith: function(pattern) {
    return this.indexOf(pattern) === 0;
  },

  endsWith: function(pattern) {
    var d = this.length - pattern.length;
    return d >= 0 && this.lastIndexOf(pattern) === d;
  },

  empty: function() {
    return this == '';
  },

  blank: function() {
    return /^\s*$/.test(this);
  },

  interpolate: function(object, pattern) {
    return new Template(this, pattern).evaluate(object);
  }
});

if (Prototype.Browser.WebKit || Prototype.Browser.IE) Object.extend(String.prototype, {
  escapeHTML: function() {
    return this.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  },
  unescapeHTML: function() {
    return this.replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>');
  }
});

String.prototype.gsub.prepareReplacement = function(replacement) {
  if (Object.isFunction(replacement)) return replacement;
  var template = new Template(replacement);
  return function(match) { return template.evaluate(match) };
};

String.prototype.parseQuery = String.prototype.toQueryParams;

Object.extend(String.prototype.escapeHTML, {
  div:  document.createElement('div'),
  text: document.createTextNode('')
});

with (String.prototype.escapeHTML) div.appendChild(text);

var Template = Class.create({
  initialize: function(template, pattern) {
    this.template = template.toString();
    this.pattern = pattern || Template.Pattern;
  },

  evaluate: function(object) {
    if (Object.isFunction(object.toTemplateReplacements))
      object = object.toTemplateReplacements();

    return this.template.gsub(this.pattern, function(match) {
      if (object == null) return '';

      var before = match[1] || '';
      if (before == '\\') return match[2];

      var ctx = object, expr = match[3];
      var pattern = /^([^.[]+|\[((?:.*?[^\\])?)\])(\.|\[|$)/;
      match = pattern.exec(expr);
      if (match == null) return before;

      while (match != null) {
        var comp = match[1].startsWith('[') ? match[2].gsub('\\\\]', ']') : match[1];
        ctx = ctx[comp];
        if (null == ctx || '' == match[3]) break;
        expr = expr.substring('[' == match[3] ? match[1].length : match[0].length);
        match = pattern.exec(expr);
      }

      return before + String.interpret(ctx);
    });
  }
});
Template.Pattern = /(^|.|\r|\n)(#\{(.*?)\})/;

var $break = { };

var Enumerable = {
  each: function(iterator, context) {
    var index = 0;
    iterator = iterator.bind(context);
    try {
      this._each(function(value) {
        iterator(value, index++);
      });
    } catch (e) {
      if (e != $break) throw e;
    }
    return this;
  },

  eachSlice: function(number, iterator, context) {
    iterator = iterator ? iterator.bind(context) : Prototype.K;
    var index = -number, slices = [], array = this.toArray();
    while ((index += number) < array.length)
      slices.push(array.slice(index, index+number));
    return slices.collect(iterator, context);
  },

  all: function(iterator, context) {
    iterator = iterator ? iterator.bind(context) : Prototype.K;
    var result = true;
    this.each(function(value, index) {
      result = result && !!iterator(value, index);
      if (!result) throw $break;
    });
    return result;
  },

  any: function(iterator, context) {
    iterator = iterator ? iterator.bind(context) : Prototype.K;
    var result = false;
    this.each(function(value, index) {
      if (result = !!iterator(value, index))
        throw $break;
    });
    return result;
  },

  collect: function(iterator, context) {
    iterator = iterator ? iterator.bind(context) : Prototype.K;
    var results = [];
    this.each(function(value, index) {
      results.push(iterator(value, index));
    });
    return results;
  },

  detect: function(iterator, context) {
    iterator = iterator.bind(context);
    var result;
    this.each(function(value, index) {
      if (iterator(value, index)) {
        result = value;
        throw $break;
      }
    });
    return result;
  },

  findAll: function(iterator, context) {
    iterator = iterator.bind(context);
    var results = [];
    this.each(function(value, index) {
      if (iterator(value, index))
        results.push(value);
    });
    return results;
  },

  grep: function(filter, iterator, context) {
    iterator = iterator ? iterator.bind(context) : Prototype.K;
    var results = [];

    if (Object.isString(filter))
      filter = new RegExp(filter);

    this.each(function(value, index) {
      if (filter.match(value))
        results.push(iterator(value, index));
    });
    return results;
  },

  include: function(object) {
    if (Object.isFunction(this.indexOf))
      if (this.indexOf(object) != -1) return true;

    var found = false;
    this.each(function(value) {
      if (value == object) {
        found = true;
        throw $break;
      }
    });
    return found;
  },

  inGroupsOf: function(number, fillWith) {
    fillWith = Object.isUndefined(fillWith) ? null : fillWith;
    return this.eachSlice(number, function(slice) {
      while(slice.length < number) slice.push(fillWith);
      return slice;
    });
  },

  inject: function(memo, iterator, context) {
    iterator = iterator.bind(context);
    this.each(function(value, index) {
      memo = iterator(memo, value, index);
    });
    return memo;
  },

  invoke: function(method) {
    var args = $A(arguments).slice(1);
    return this.map(function(value) {
      return value[method].apply(value, args);
    });
  },

  max: function(iterator, context) {
    iterator = iterator ? iterator.bind(context) : Prototype.K;
    var result;
    this.each(function(value, index) {
      value = iterator(value, index);
      if (result == null || value >= result)
        result = value;
    });
    return result;
  },

  min: function(iterator, context) {
    iterator = iterator ? iterator.bind(context) : Prototype.K;
    var result;
    this.each(function(value, index) {
      value = iterator(value, index);
      if (result == null || value < result)
        result = value;
    });
    return result;
  },

  partition: function(iterator, context) {
    iterator = iterator ? iterator.bind(context) : Prototype.K;
    var trues = [], falses = [];
    this.each(function(value, index) {
      (iterator(value, index) ?
        trues : falses).push(value);
    });
    return [trues, falses];
  },

  pluck: function(property) {
    var results = [];
    this.each(function(value) {
      results.push(value[property]);
    });
    return results;
  },

  reject: function(iterator, context) {
    iterator = iterator.bind(context);
    var results = [];
    this.each(function(value, index) {
      if (!iterator(value, index))
        results.push(value);
    });
    return results;
  },

  sortBy: function(iterator, context) {
    iterator = iterator.bind(context);
    return this.map(function(value, index) {
      return {value: value, criteria: iterator(value, index)};
    }).sort(function(left, right) {
      var a = left.criteria, b = right.criteria;
      return a < b ? -1 : a > b ? 1 : 0;
    }).pluck('value');
  },

  toArray: function() {
    return this.map();
  },

  zip: function() {
    var iterator = Prototype.K, args = $A(arguments);
    if (Object.isFunction(args.last()))
      iterator = args.pop();

    var collections = [this].concat(args).map($A);
    return this.map(function(value, index) {
      return iterator(collections.pluck(index));
    });
  },

  size: function() {
    return this.toArray().length;
  },

  inspect: function() {
    return '#<Enumerable:' + this.toArray().inspect() + '>';
  }
};

Object.extend(Enumerable, {
  map:     Enumerable.collect,
  find:    Enumerable.detect,
  select:  Enumerable.findAll,
  filter:  Enumerable.findAll,
  member:  Enumerable.include,
  entries: Enumerable.toArray,
  every:   Enumerable.all,
  some:    Enumerable.any
});
function $A(iterable) {
  if (!iterable) return [];
  if (iterable.toArray) return iterable.toArray();
  var length = iterable.length || 0, results = new Array(length);
  while (length--) results[length] = iterable[length];
  return results;
}

if (Prototype.Browser.WebKit) {
  $A = function(iterable) {
    if (!iterable) return [];
    if (!(Object.isFunction(iterable) && iterable == '[object NodeList]') &&
        iterable.toArray) return iterable.toArray();
    var length = iterable.length || 0, results = new Array(length);
    while (length--) results[length] = iterable[length];
    return results;
  };
}

Array.from = $A;

Object.extend(Array.prototype, Enumerable);

if (!Array.prototype._reverse) Array.prototype._reverse = Array.prototype.reverse;

Object.extend(Array.prototype, {
  _each: function(iterator) {
    for (var i = 0, length = this.length; i < length; i++)
      iterator(this[i]);
  },

  clear: function() {
    this.length = 0;
    return this;
  },

  first: function() {
    return this[0];
  },

  last: function() {
    return this[this.length - 1];
  },

  compact: function() {
    return this.select(function(value) {
      return value != null;
    });
  },

  flatten: function() {
    return this.inject([], function(array, value) {
      return array.concat(Object.isArray(value) ?
        value.flatten() : [value]);
    });
  },

  without: function() {
    var values = $A(arguments);
    return this.select(function(value) {
      return !values.include(value);
    });
  },

  reverse: function(inline) {
    return (inline !== false ? this : this.toArray())._reverse();
  },

  reduce: function() {
    return this.length > 1 ? this : this[0];
  },

  uniq: function(sorted) {
    return this.inject([], function(array, value, index) {
      if (0 == index || (sorted ? array.last() != value : !array.include(value)))
        array.push(value);
      return array;
    });
  },

  intersect: function(array) {
    return this.uniq().findAll(function(item) {
      return array.detect(function(value) { return item === value });
    });
  },

  clone: function() {
    return [].concat(this);
  },

  size: function() {
    return this.length;
  },

  inspect: function() {
    return '[' + this.map(Object.inspect).join(', ') + ']';
  },

  toJSON: function() {
    var results = [];
    this.each(function(object) {
      var value = Object.toJSON(object);
      if (!Object.isUndefined(value)) results.push(value);
    });
    return '[' + results.join(', ') + ']';
  }
});

// use native browser JS 1.6 implementation if available
if (Object.isFunction(Array.prototype.forEach))
  Array.prototype._each = Array.prototype.forEach;

if (!Array.prototype.indexOf) Array.prototype.indexOf = function(item, i) {
  i || (i = 0);
  var length = this.length;
  if (i < 0) i = length + i;
  for (; i < length; i++)
    if (this[i] === item) return i;
  return -1;
};

if (!Array.prototype.lastIndexOf) Array.prototype.lastIndexOf = function(item, i) {
  i = isNaN(i) ? this.length : (i < 0 ? this.length + i : i) + 1;
  var n = this.slice(0, i).reverse().indexOf(item);
  return (n < 0) ? n : i - n - 1;
};

Array.prototype.toArray = Array.prototype.clone;

function $w(string) {
  if (!Object.isString(string)) return [];
  string = string.strip();
  return string ? string.split(/\s+/) : [];
}

if (Prototype.Browser.Opera){
  Array.prototype.concat = function() {
    var array = [];
    for (var i = 0, length = this.length; i < length; i++) array.push(this[i]);
    for (var i = 0, length = arguments.length; i < length; i++) {
      if (Object.isArray(arguments[i])) {
        for (var j = 0, arrayLength = arguments[i].length; j < arrayLength; j++)
          array.push(arguments[i][j]);
      } else {
        array.push(arguments[i]);
      }
    }
    return array;
  };
}
Object.extend(Number.prototype, {
  toColorPart: function() {
    return this.toPaddedString(2, 16);
  },

  succ: function() {
    return this + 1;
  },

  times: function(iterator) {
    $R(0, this, true).each(iterator);
    return this;
  },

  toPaddedString: function(length, radix) {
    var string = this.toString(radix || 10);
    return '0'.times(length - string.length) + string;
  },

  toJSON: function() {
    return isFinite(this) ? this.toString() : 'null';
  }
});

$w('abs round ceil floor').each(function(method){
  Number.prototype[method] = Math[method].methodize();
});
function $H(object) {
  return new Hash(object);
};

var Hash = Class.create(Enumerable, (function() {

  function toQueryPair(key, value) {
    if (Object.isUndefined(value)) return key;
    return key + '=' + encodeURIComponent(String.interpret(value));
  }

  return {
    initialize: function(object) {
      this._object = Object.isHash(object) ? object.toObject() : Object.clone(object);
    },

    _each: function(iterator) {
      for (var key in this._object) {
        var value = this._object[key], pair = [key, value];
        pair.key = key;
        pair.value = value;
        iterator(pair);
      }
    },

    set: function(key, value) {
      return this._object[key] = value;
    },

    get: function(key) {
      return this._object[key];
    },

    unset: function(key) {
      var value = this._object[key];
      delete this._object[key];
      return value;
    },

    toObject: function() {
      return Object.clone(this._object);
    },

    keys: function() {
      return this.pluck('key');
    },

    values: function() {
      return this.pluck('value');
    },

    index: function(value) {
      var match = this.detect(function(pair) {
        return pair.value === value;
      });
      return match && match.key;
    },

    merge: function(object) {
      return this.clone().update(object);
    },

    update: function(object) {
      return new Hash(object).inject(this, function(result, pair) {
        result.set(pair.key, pair.value);
        return result;
      });
    },

    toQueryString: function() {
      return this.map(function(pair) {
        var key = encodeURIComponent(pair.key), values = pair.value;

        if (values && typeof values == 'object') {
          if (Object.isArray(values))
            return values.map(toQueryPair.curry(key)).join('&');
        }
        return toQueryPair(key, values);
      }).join('&');
    },

    inspect: function() {
      return '#<Hash:{' + this.map(function(pair) {
        return pair.map(Object.inspect).join(': ');
      }).join(', ') + '}>';
    },

    toJSON: function() {
      return Object.toJSON(this.toObject());
    },

    clone: function() {
      return new Hash(this);
    }
  }
})());

Hash.prototype.toTemplateReplacements = Hash.prototype.toObject;
Hash.from = $H;
var ObjectRange = Class.create(Enumerable, {
  initialize: function(start, end, exclusive) {
    this.start = start;
    this.end = end;
    this.exclusive = exclusive;
  },

  _each: function(iterator) {
    var value = this.start;
    while (this.include(value)) {
      iterator(value);
      value = value.succ();
    }
  },

  include: function(value) {
    if (value < this.start)
      return false;
    if (this.exclusive)
      return value < this.end;
    return value <= this.end;
  }
});

var $R = function(start, end, exclusive) {
  return new ObjectRange(start, end, exclusive);
};

var Ajax = {
  getTransport: function() {
    return Try.these(
      function() {return new XMLHttpRequest()},
      function() {return new ActiveXObject('Msxml2.XMLHTTP')},
      function() {return new ActiveXObject('Microsoft.XMLHTTP')}
    ) || false;
  },

  activeRequestCount: 0
};

Ajax.Responders = {
  responders: [],

  _each: function(iterator) {
    this.responders._each(iterator);
  },

  register: function(responder) {
    if (!this.include(responder))
      this.responders.push(responder);
  },

  unregister: function(responder) {
    this.responders = this.responders.without(responder);
  },

  dispatch: function(callback, request, transport, json) {
    this.each(function(responder) {
      if (Object.isFunction(responder[callback])) {
        try {
          responder[callback].apply(responder, [request, transport, json]);
        } catch (e) { }
      }
    });
  }
};

Object.extend(Ajax.Responders, Enumerable);

Ajax.Responders.register({
  onCreate:   function() { Ajax.activeRequestCount++ },
  onComplete: function() { Ajax.activeRequestCount-- }
});

Ajax.Base = Class.create({
  initialize: function(options) {
    this.options = {
      method:       'post',
      asynchronous: true,
      contentType:  'application/x-www-form-urlencoded',
      encoding:     'UTF-8',
      parameters:   '',
      evalJSON:     true,
      evalJS:       true
    };
    Object.extend(this.options, options || { });

    this.options.method = this.options.method.toLowerCase();

    if (Object.isString(this.options.parameters))
      this.options.parameters = this.options.parameters.toQueryParams();
    else if (Object.isHash(this.options.parameters))
      this.options.parameters = this.options.parameters.toObject();
  }
});

Ajax.Request = Class.create(Ajax.Base, {
  _complete: false,

  initialize: function($super, url, options) {
    $super(options);
    this.transport = Ajax.getTransport();
    this.request(url);
  },

  request: function(url) {
    this.url = url;
    this.method = this.options.method;
    var params = Object.clone(this.options.parameters);

    if (!['get', 'post'].include(this.method)) {
      // simulate other verbs over post
      params['_method'] = this.method;
      this.method = 'post';
    }

    this.parameters = params;

    if (params = Object.toQueryString(params)) {
      // when GET, append parameters to URL
      if (this.method == 'get')
        this.url += (this.url.include('?') ? '&' : '?') + params;
      else if (/Konqueror|Safari|KHTML/.test(navigator.userAgent))
        params += '&_=';
    }

    try {
      var response = new Ajax.Response(this);
      if (this.options.onCreate) this.options.onCreate(response);
      Ajax.Responders.dispatch('onCreate', this, response);

      this.transport.open(this.method.toUpperCase(), this.url,
        this.options.asynchronous);

      if (this.options.asynchronous) this.respondToReadyState.bind(this).defer(1);

      this.transport.onreadystatechange = this.onStateChange.bind(this);
      this.setRequestHeaders();

      this.body = this.method == 'post' ? (this.options.postBody || params) : null;
      this.transport.send(this.body);

      /* Force Firefox to handle ready state 4 for synchronous requests */
      if (!this.options.asynchronous && this.transport.overrideMimeType)
        this.onStateChange();

    }
    catch (e) {
      this.dispatchException(e);
    }
  },

  onStateChange: function() {
    var readyState = this.transport.readyState;
    if (readyState > 1 && !((readyState == 4) && this._complete))
      this.respondToReadyState(this.transport.readyState);
  },

  setRequestHeaders: function() {
    var headers = {
      'X-Requested-With': 'XMLHttpRequest',
      'X-Prototype-Version': Prototype.Version,
      'Accept': 'text/javascript, text/html, application/xml, text/xml, */*'
    };

    if (this.method == 'post') {
      headers['Content-type'] = this.options.contentType +
        (this.options.encoding ? '; charset=' + this.options.encoding : '');

      /* Force "Connection: close" for older Mozilla browsers to work
       * around a bug where XMLHttpRequest sends an incorrect
       * Content-length header. See Mozilla Bugzilla #246651.
       */
      if (this.transport.overrideMimeType &&
          (navigator.userAgent.match(/Gecko\/(\d{4})/) || [0,2005])[1] < 2005)
            headers['Connection'] = 'close';
    }

    // user-defined headers
    if (typeof this.options.requestHeaders == 'object') {
      var extras = this.options.requestHeaders;

      if (Object.isFunction(extras.push))
        for (var i = 0, length = extras.length; i < length; i += 2)
          headers[extras[i]] = extras[i+1];
      else
        $H(extras).each(function(pair) { headers[pair.key] = pair.value });
    }

    for (var name in headers)
      this.transport.setRequestHeader(name, headers[name]);
  },

  success: function() {
    var status = this.getStatus();
    return !status || (status >= 200 && status < 300);
  },

  getStatus: function() {
    try {
      return this.transport.status || 0;
    } catch (e) { return 0 }
  },

  respondToReadyState: function(readyState) {
    var state = Ajax.Request.Events[readyState], response = new Ajax.Response(this);

    if (state == 'Complete') {
      try {
        this._complete = true;
        (this.options['on' + response.status]
         || this.options['on' + (this.success() ? 'Success' : 'Failure')]
         || Prototype.emptyFunction)(response, response.headerJSON);
      } catch (e) {
        this.dispatchException(e);
      }

      var contentType = response.getHeader('Content-type');
      if (this.options.evalJS == 'force'
          || (this.options.evalJS && this.isSameOrigin() && contentType
          && contentType.match(/^\s*(text|application)\/(x-)?(java|ecma)script(;.*)?\s*$/i)))
        this.evalResponse();
    }

    try {
      (this.options['on' + state] || Prototype.emptyFunction)(response, response.headerJSON);
      Ajax.Responders.dispatch('on' + state, this, response, response.headerJSON);
    } catch (e) {
      this.dispatchException(e);
    }

    if (state == 'Complete') {
      // avoid memory leak in MSIE: clean up
      this.transport.onreadystatechange = Prototype.emptyFunction;
    }
  },

  isSameOrigin: function() {
    var m = this.url.match(/^\s*https?:\/\/[^\/]*/);
    return !m || (m[0] == '#{protocol}//#{domain}#{port}'.interpolate({
      protocol: location.protocol,
      domain: document.domain,
      port: location.port ? ':' + location.port : ''
    }));
  },

  getHeader: function(name) {
    try {
      return this.transport.getResponseHeader(name) || null;
    } catch (e) { return null }
  },

  evalResponse: function() {
    try {
      return eval((this.transport.responseText || '').unfilterJSON());
    } catch (e) {
      this.dispatchException(e);
    }
  },

  dispatchException: function(exception) {
    (this.options.onException || Prototype.emptyFunction)(this, exception);
    Ajax.Responders.dispatch('onException', this, exception);
  }
});

Ajax.Request.Events =
  ['Uninitialized', 'Loading', 'Loaded', 'Interactive', 'Complete'];

Ajax.Response = Class.create({
  initialize: function(request){
    this.request = request;
    var transport  = this.transport  = request.transport,
        readyState = this.readyState = transport.readyState;

    if((readyState > 2 && !Prototype.Browser.IE) || readyState == 4) {
      this.status       = this.getStatus();
      this.statusText   = this.getStatusText();
      this.responseText = String.interpret(transport.responseText);
      this.headerJSON   = this._getHeaderJSON();
    }

    if(readyState == 4) {
      var xml = transport.responseXML;
      this.responseXML  = Object.isUndefined(xml) ? null : xml;
      this.responseJSON = this._getResponseJSON();
    }
  },

  status:      0,
  statusText: '',

  getStatus: Ajax.Request.prototype.getStatus,

  getStatusText: function() {
    try {
      return this.transport.statusText || '';
    } catch (e) { return '' }
  },

  getHeader: Ajax.Request.prototype.getHeader,

  getAllHeaders: function() {
    try {
      return this.getAllResponseHeaders();
    } catch (e) { return null }
  },

  getResponseHeader: function(name) {
    return this.transport.getResponseHeader(name);
  },

  getAllResponseHeaders: function() {
    return this.transport.getAllResponseHeaders();
  },

  _getHeaderJSON: function() {
    var json = this.getHeader('X-JSON');
    if (!json) return null;
    json = decodeURIComponent(escape(json));
    try {
      return json.evalJSON(this.request.options.sanitizeJSON ||
        !this.request.isSameOrigin());
    } catch (e) {
      this.request.dispatchException(e);
    }
  },

  _getResponseJSON: function() {
    var options = this.request.options;
    if (!options.evalJSON || (options.evalJSON != 'force' &&
      !(this.getHeader('Content-type') || '').include('application/json')) ||
        this.responseText.blank())
          return null;
    try {
      return this.responseText.evalJSON(options.sanitizeJSON ||
        !this.request.isSameOrigin());
    } catch (e) {
      this.request.dispatchException(e);
    }
  }
});

Ajax.Updater = Class.create(Ajax.Request, {
  initialize: function($super, container, url, options) {
    this.container = {
      success: (container.success || container),
      failure: (container.failure || (container.success ? null : container))
    };

    options = Object.clone(options);
    var onComplete = options.onComplete;
    options.onComplete = (function(response, json) {
      this.updateContent(response.responseText);
      if (Object.isFunction(onComplete)) onComplete(response, json);
    }).bind(this);

    $super(url, options);
  },

  updateContent: function(responseText) {
    var receiver = this.container[this.success() ? 'success' : 'failure'],
        options = this.options;

    if (!options.evalScripts) responseText = responseText.stripScripts();

    if (receiver = $(receiver)) {
      if (options.insertion) {
        if (Object.isString(options.insertion)) {
          var insertion = { }; insertion[options.insertion] = responseText;
          receiver.insert(insertion);
        }
        else options.insertion(receiver, responseText);
      }
      else receiver.update(responseText);
    }
  }
});

Ajax.PeriodicalUpdater = Class.create(Ajax.Base, {
  initialize: function($super, container, url, options) {
    $super(options);
    this.onComplete = this.options.onComplete;

    this.frequency = (this.options.frequency || 2);
    this.decay = (this.options.decay || 1);

    this.updater = { };
    this.container = container;
    this.url = url;

    this.start();
  },

  start: function() {
    this.options.onComplete = this.updateComplete.bind(this);
    this.onTimerEvent();
  },

  stop: function() {
    this.updater.options.onComplete = undefined;
    clearTimeout(this.timer);
    (this.onComplete || Prototype.emptyFunction).apply(this, arguments);
  },

  updateComplete: function(response) {
    if (this.options.decay) {
      this.decay = (response.responseText == this.lastText ?
        this.decay * this.options.decay : 1);

      this.lastText = response.responseText;
    }
    this.timer = this.onTimerEvent.bind(this).delay(this.decay * this.frequency);
  },

  onTimerEvent: function() {
    this.updater = new Ajax.Updater(this.container, this.url, this.options);
  }
});
function $(element) {
  if (arguments.length > 1) {
    for (var i = 0, elements = [], length = arguments.length; i < length; i++)
      elements.push($(arguments[i]));
    return elements;
  }
  if (Object.isString(element))
    element = document.getElementById(element);
  return Element.extend(element);
}

if (Prototype.BrowserFeatures.XPath) {
  document._getElementsByXPath = function(expression, parentElement) {
    var results = [];
    var query = document.evaluate(expression, $(parentElement) || document,
      null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
    for (var i = 0, length = query.snapshotLength; i < length; i++)
      results.push(Element.extend(query.snapshotItem(i)));
    return results;
  };
}

/*--------------------------------------------------------------------------*/

if (!window.Node) var Node = { };

if (!Node.ELEMENT_NODE) {
  // DOM level 2 ECMAScript Language Binding
  Object.extend(Node, {
    ELEMENT_NODE: 1,
    ATTRIBUTE_NODE: 2,
    TEXT_NODE: 3,
    CDATA_SECTION_NODE: 4,
    ENTITY_REFERENCE_NODE: 5,
    ENTITY_NODE: 6,
    PROCESSING_INSTRUCTION_NODE: 7,
    COMMENT_NODE: 8,
    DOCUMENT_NODE: 9,
    DOCUMENT_TYPE_NODE: 10,
    DOCUMENT_FRAGMENT_NODE: 11,
    NOTATION_NODE: 12
  });
}

(function() {
  var element = this.Element;
  this.Element = function(tagName, attributes) {
    attributes = attributes || { };
    tagName = tagName.toLowerCase();
    var cache = Element.cache;
    if (Prototype.Browser.IE && attributes.name) {
      tagName = '<' + tagName + ' name="' + attributes.name + '">';
      delete attributes.name;
      return Element.writeAttribute(document.createElement(tagName), attributes);
    }
    if (!cache[tagName]) cache[tagName] = Element.extend(document.createElement(tagName));
    return Element.writeAttribute(cache[tagName].cloneNode(false), attributes);
  };
  Object.extend(this.Element, element || { });
}).call(window);

Element.cache = { };

Element.Methods = {
  visible: function(element) {
    return $(element).style.display != 'none';
  },

  toggle: function(element) {
    element = $(element);
    Element[Element.visible(element) ? 'hide' : 'show'](element);
    return element;
  },

  hide: function(element) {
    $(element).style.display = 'none';
    return element;
  },

  show: function(element) {
    $(element).style.display = '';
    return element;
  },

  remove: function(element) {
    element = $(element);
    element.parentNode.removeChild(element);
    return element;
  },

  update: function(element, content) {
    element = $(element);
    if (content && content.toElement) content = content.toElement();
    if (Object.isElement(content)) return element.update().insert(content);
    content = Object.toHTML(content);
    element.innerHTML = content.stripScripts();
    content.evalScripts.bind(content).defer();
    return element;
  },

  replace: function(element, content) {
    element = $(element);
    if (content && content.toElement) content = content.toElement();
    else if (!Object.isElement(content)) {
      content = Object.toHTML(content);
      var range = element.ownerDocument.createRange();
      range.selectNode(element);
      content.evalScripts.bind(content).defer();
      content = range.createContextualFragment(content.stripScripts());
    }
    element.parentNode.replaceChild(content, element);
    return element;
  },

  insert: function(element, insertions) {
    element = $(element);

    if (Object.isString(insertions) || Object.isNumber(insertions) ||
        Object.isElement(insertions) || (insertions && (insertions.toElement || insertions.toHTML)))
          insertions = {bottom:insertions};

    var content, insert, tagName, childNodes;

    for (var position in insertions) {
      content  = insertions[position];
      position = position.toLowerCase();
      insert = Element._insertionTranslations[position];

      if (content && content.toElement) content = content.toElement();
      if (Object.isElement(content)) {
        insert(element, content);
        continue;
      }

      content = Object.toHTML(content);

      tagName = ((position == 'before' || position == 'after')
        ? element.parentNode : element).tagName.toUpperCase();

      childNodes = Element._getContentFromAnonymousElement(tagName, content.stripScripts());

      if (position == 'top' || position == 'after') childNodes.reverse();
      childNodes.each(insert.curry(element));

      content.evalScripts.bind(content).defer();
    }

    return element;
  },

  wrap: function(element, wrapper, attributes) {
    element = $(element);
    if (Object.isElement(wrapper))
      $(wrapper).writeAttribute(attributes || { });
    else if (Object.isString(wrapper)) wrapper = new Element(wrapper, attributes);
    else wrapper = new Element('div', wrapper);
    if (element.parentNode)
      element.parentNode.replaceChild(wrapper, element);
    wrapper.appendChild(element);
    return wrapper;
  },

  inspect: function(element) {
    element = $(element);
    var result = '<' + element.tagName.toLowerCase();
    $H({'id': 'id', 'className': 'class'}).each(function(pair) {
      var property = pair.first(), attribute = pair.last();
      var value = (element[property] || '').toString();
      if (value) result += ' ' + attribute + '=' + value.inspect(true);
    });
    return result + '>';
  },

  recursivelyCollect: function(element, property) {
    element = $(element);
    var elements = [];
    while (element = element[property])
      if (element.nodeType == 1)
        elements.push(Element.extend(element));
    return elements;
  },

  ancestors: function(element) {
    return $(element).recursivelyCollect('parentNode');
  },

  descendants: function(element) {
    return $(element).select("*");
  },

  firstDescendant: function(element) {
    element = $(element).firstChild;
    while (element && element.nodeType != 1) element = element.nextSibling;
    return $(element);
  },

  immediateDescendants: function(element) {
    if (!(element = $(element).firstChild)) return [];
    while (element && element.nodeType != 1) element = element.nextSibling;
    if (element) return [element].concat($(element).nextSiblings());
    return [];
  },

  previousSiblings: function(element) {
    return $(element).recursivelyCollect('previousSibling');
  },

  nextSiblings: function(element) {
    return $(element).recursivelyCollect('nextSibling');
  },

  siblings: function(element) {
    element = $(element);
    return element.previousSiblings().reverse().concat(element.nextSiblings());
  },

  match: function(element, selector) {
    if (Object.isString(selector))
      selector = new Selector(selector);
    return selector.match($(element));
  },

  up: function(element, expression, index) {
    element = $(element);
    if (arguments.length == 1) return $(element.parentNode);
    var ancestors = element.ancestors();
    return Object.isNumber(expression) ? ancestors[expression] :
      Selector.findElement(ancestors, expression, index);
  },

  down: function(element, expression, index) {
    element = $(element);
    if (arguments.length == 1) return element.firstDescendant();
    return Object.isNumber(expression) ? element.descendants()[expression] :
      element.select(expression)[index || 0];
  },

  previous: function(element, expression, index) {
    element = $(element);
    if (arguments.length == 1) return $(Selector.handlers.previousElementSibling(element));
    var previousSiblings = element.previousSiblings();
    return Object.isNumber(expression) ? previousSiblings[expression] :
      Selector.findElement(previousSiblings, expression, index);
  },

  next: function(element, expression, index) {
    element = $(element);
    if (arguments.length == 1) return $(Selector.handlers.nextElementSibling(element));
    var nextSiblings = element.nextSiblings();
    return Object.isNumber(expression) ? nextSiblings[expression] :
      Selector.findElement(nextSiblings, expression, index);
  },

  select: function() {
    var args = $A(arguments), element = $(args.shift());
    return Selector.findChildElements(element, args);
  },

  adjacent: function() {
    var args = $A(arguments), element = $(args.shift());
    return Selector.findChildElements(element.parentNode, args).without(element);
  },

  identify: function(element) {
    element = $(element);
    var id = element.readAttribute('id'), self = arguments.callee;
    if (id) return id;
    do { id = 'anonymous_element_' + self.counter++ } while ($(id));
    element.writeAttribute('id', id);
    return id;
  },

  readAttribute: function(element, name) {
    element = $(element);
    if (Prototype.Browser.IE) {
      var t = Element._attributeTranslations.read;
      if (t.values[name]) return t.values[name](element, name);
      if (t.names[name]) name = t.names[name];
      if (name.include(':')) {
        return (!element.attributes || !element.attributes[name]) ? null :
         element.attributes[name].value;
      }
    }
    return element.getAttribute(name);
  },

  writeAttribute: function(element, name, value) {
    element = $(element);
    var attributes = { }, t = Element._attributeTranslations.write;

    if (typeof name == 'object') attributes = name;
    else attributes[name] = Object.isUndefined(value) ? true : value;

    for (var attr in attributes) {
      name = t.names[attr] || attr;
      value = attributes[attr];
      if (t.values[attr]) name = t.values[attr](element, value);
      if (value === false || value === null)
        element.removeAttribute(name);
      else if (value === true)
        element.setAttribute(name, name);
      else element.setAttribute(name, value);
    }
    return element;
  },

  getHeight: function(element) {
    return $(element).getDimensions().height;
  },

  getWidth: function(element) {
    return $(element).getDimensions().width;
  },

  classNames: function(element) {
    return new Element.ClassNames(element);
  },

  hasClassName: function(element, className) {
    if (!(element = $(element))) return;
    var elementClassName = element.className;
    return (elementClassName.length > 0 && (elementClassName == className ||
      new RegExp("(^|\\s)" + className + "(\\s|$)").test(elementClassName)));
  },

  addClassName: function(element, className) {
    if (!(element = $(element))) return;
    if (!element.hasClassName(className))
      element.className += (element.className ? ' ' : '') + className;
    return element;
  },

  removeClassName: function(element, className) {
    if (!(element = $(element))) return;
    element.className = element.className.replace(
      new RegExp("(^|\\s+)" + className + "(\\s+|$)"), ' ').strip();
    return element;
  },

  toggleClassName: function(element, className) {
    if (!(element = $(element))) return;
    return element[element.hasClassName(className) ?
      'removeClassName' : 'addClassName'](className);
  },

  // removes whitespace-only text node children
  cleanWhitespace: function(element) {
    element = $(element);
    var node = element.firstChild;
    while (node) {
      var nextNode = node.nextSibling;
      if (node.nodeType == 3 && !/\S/.test(node.nodeValue))
        element.removeChild(node);
      node = nextNode;
    }
    return element;
  },

  empty: function(element) {
    return $(element).innerHTML.blank();
  },

  descendantOf: function(element, ancestor) {
    element = $(element), ancestor = $(ancestor);
    var originalAncestor = ancestor;

    if (element.compareDocumentPosition)
      return (element.compareDocumentPosition(ancestor) & 8) === 8;

    if (element.sourceIndex && !Prototype.Browser.Opera) {
      var e = element.sourceIndex, a = ancestor.sourceIndex,
       nextAncestor = ancestor.nextSibling;
      if (!nextAncestor) {
        do { ancestor = ancestor.parentNode; }
        while (!(nextAncestor = ancestor.nextSibling) && ancestor.parentNode);
      }
      if (nextAncestor && nextAncestor.sourceIndex)
       return (e > a && e < nextAncestor.sourceIndex);
    }

    while (element = element.parentNode)
      if (element == originalAncestor) return true;
    return false;
  },

  scrollTo: function(element) {
    element = $(element);
    var pos = element.cumulativeOffset();
    window.scrollTo(pos[0], pos[1]);
    return element;
  },

  getStyle: function(element, style) {
    element = $(element);
    style = style == 'float' ? 'cssFloat' : style.camelize();
    var value = element.style[style];
    if (!value) {
      var css = document.defaultView.getComputedStyle(element, null);
      value = css ? css[style] : null;
    }
    if (style == 'opacity') return value ? parseFloat(value) : 1.0;
    return value == 'auto' ? null : value;
  },

  getOpacity: function(element) {
    return $(element).getStyle('opacity');
  },

  setStyle: function(element, styles) {
    element = $(element);
    var elementStyle = element.style, match;
    if (Object.isString(styles)) {
      element.style.cssText += ';' + styles;
      return styles.include('opacity') ?
        element.setOpacity(styles.match(/opacity:\s*(\d?\.?\d*)/)[1]) : element;
    }
    for (var property in styles)
      if (property == 'opacity') element.setOpacity(styles[property]);
      else
        elementStyle[(property == 'float' || property == 'cssFloat') ?
          (Object.isUndefined(elementStyle.styleFloat) ? 'cssFloat' : 'styleFloat') :
            property] = styles[property];

    return element;
  },

  setOpacity: function(element, value) {
    element = $(element);
    element.style.opacity = (value == 1 || value === '') ? '' :
      (value < 0.00001) ? 0 : value;
    return element;
  },

  getDimensions: function(element) {
    element = $(element);
    var display = $(element).getStyle('display');
    if (display != 'none' && display != null) // Safari bug
      return {width: element.offsetWidth, height: element.offsetHeight};

    // All *Width and *Height properties give 0 on elements with display none,
    // so enable the element temporarily
    var els = element.style;
    var originalVisibility = els.visibility;
    var originalPosition = els.position;
    var originalDisplay = els.display;
    els.visibility = 'hidden';
    els.position = 'absolute';
    els.display = 'block';
    var originalWidth = element.clientWidth;
    var originalHeight = element.clientHeight;
    els.display = originalDisplay;
    els.position = originalPosition;
    els.visibility = originalVisibility;
    return {width: originalWidth, height: originalHeight};
  },

  makePositioned: function(element) {
    element = $(element);
    var pos = Element.getStyle(element, 'position');
    if (pos == 'static' || !pos) {
      element._madePositioned = true;
      element.style.position = 'relative';
      // Opera returns the offset relative to the positioning context, when an
      // element is position relative but top and left have not been defined
      if (window.opera) {
        element.style.top = 0;
        element.style.left = 0;
      }
    }
    return element;
  },

  undoPositioned: function(element) {
    element = $(element);
    if (element._madePositioned) {
      element._madePositioned = undefined;
      element.style.position =
        element.style.top =
        element.style.left =
        element.style.bottom =
        element.style.right = '';
    }
    return element;
  },

  makeClipping: function(element) {
    element = $(element);
    if (element._overflow) return element;
    element._overflow = Element.getStyle(element, 'overflow') || 'auto';
    if (element._overflow !== 'hidden')
      element.style.overflow = 'hidden';
    return element;
  },

  undoClipping: function(element) {
    element = $(element);
    if (!element._overflow) return element;
    element.style.overflow = element._overflow == 'auto' ? '' : element._overflow;
    element._overflow = null;
    return element;
  },

  cumulativeOffset: function(element) {
    var valueT = 0, valueL = 0;
    do {
      valueT += element.offsetTop  || 0;
      valueL += element.offsetLeft || 0;
      element = element.offsetParent;
    } while (element);
    return Element._returnOffset(valueL, valueT);
  },

  positionedOffset: function(element) {
    var valueT = 0, valueL = 0;
    do {
      valueT += element.offsetTop  || 0;
      valueL += element.offsetLeft || 0;
      element = element.offsetParent;
      if (element) {
        if (element.tagName == 'BODY') break;
        var p = Element.getStyle(element, 'position');
        if (p !== 'static') break;
      }
    } while (element);
    return Element._returnOffset(valueL, valueT);
  },

  absolutize: function(element) {
    element = $(element);
    if (element.getStyle('position') == 'absolute') return;
    // Position.prepare(); // To be done manually by Scripty when it needs it.

    var offsets = element.positionedOffset();
    var top     = offsets[1];
    var left    = offsets[0];
    var width   = element.clientWidth;
    var height  = element.clientHeight;

    element._originalLeft   = left - parseFloat(element.style.left  || 0);
    element._originalTop    = top  - parseFloat(element.style.top || 0);
    element._originalWidth  = element.style.width;
    element._originalHeight = element.style.height;

    element.style.position = 'absolute';
    element.style.top    = top + 'px';
    element.style.left   = left + 'px';
    element.style.width  = width + 'px';
    element.style.height = height + 'px';
    return element;
  },

  relativize: function(element) {
    element = $(element);
    if (element.getStyle('position') == 'relative') return;
    // Position.prepare(); // To be done manually by Scripty when it needs it.

    element.style.position = 'relative';
    var top  = parseFloat(element.style.top  || 0) - (element._originalTop || 0);
    var left = parseFloat(element.style.left || 0) - (element._originalLeft || 0);

    element.style.top    = top + 'px';
    element.style.left   = left + 'px';
    element.style.height = element._originalHeight;
    element.style.width  = element._originalWidth;
    return element;
  },

  cumulativeScrollOffset: function(element) {
    var valueT = 0, valueL = 0;
    do {
      valueT += element.scrollTop  || 0;
      valueL += element.scrollLeft || 0;
      element = element.parentNode;
    } while (element);
    return Element._returnOffset(valueL, valueT);
  },

  getOffsetParent: function(element) {
    if (element.offsetParent) return $(element.offsetParent);
    if (element == document.body) return $(element);

    while ((element = element.parentNode) && element != document.body)
      if (Element.getStyle(element, 'position') != 'static')
        return $(element);

    return $(document.body);
  },

  viewportOffset: function(forElement) {
    var valueT = 0, valueL = 0;

    var element = forElement;
    do {
      valueT += element.offsetTop  || 0;
      valueL += element.offsetLeft || 0;

      // Safari fix
      if (element.offsetParent == document.body &&
        Element.getStyle(element, 'position') == 'absolute') break;

    } while (element = element.offsetParent);

    element = forElement;
    do {
      if (!Prototype.Browser.Opera || element.tagName == 'BODY') {
        valueT -= element.scrollTop  || 0;
        valueL -= element.scrollLeft || 0;
      }
    } while (element = element.parentNode);

    return Element._returnOffset(valueL, valueT);
  },

  clonePosition: function(element, source) {
    var options = Object.extend({
      setLeft:    true,
      setTop:     true,
      setWidth:   true,
      setHeight:  true,
      offsetTop:  0,
      offsetLeft: 0
    }, arguments[2] || { });

    // find page position of source
    source = $(source);
    var p = source.viewportOffset();

    // find coordinate system to use
    element = $(element);
    var delta = [0, 0];
    var parent = null;
    // delta [0,0] will do fine with position: fixed elements,
    // position:absolute needs offsetParent deltas
    if (Element.getStyle(element, 'position') == 'absolute') {
      parent = element.getOffsetParent();
      delta = parent.viewportOffset();
    }

    // correct by body offsets (fixes Safari)
    if (parent == document.body) {
      delta[0] -= document.body.offsetLeft;
      delta[1] -= document.body.offsetTop;
    }

    // set position
    if (options.setLeft)   element.style.left  = (p[0] - delta[0] + options.offsetLeft) + 'px';
    if (options.setTop)    element.style.top   = (p[1] - delta[1] + options.offsetTop) + 'px';
    if (options.setWidth)  element.style.width = source.offsetWidth + 'px';
    if (options.setHeight) element.style.height = source.offsetHeight + 'px';
    return element;
  }
};

Element.Methods.identify.counter = 1;

Object.extend(Element.Methods, {
  getElementsBySelector: Element.Methods.select,
  childElements: Element.Methods.immediateDescendants
});

Element._attributeTranslations = {
  write: {
    names: {
      className: 'class',
      htmlFor:   'for'
    },
    values: { }
  }
};

if (Prototype.Browser.Opera) {
  Element.Methods.getStyle = Element.Methods.getStyle.wrap(
    function(proceed, element, style) {
      switch (style) {
        case 'left': case 'top': case 'right': case 'bottom':
          if (proceed(element, 'position') === 'static') return null;
        case 'height': case 'width':
          // returns '0px' for hidden elements; we want it to return null
          if (!Element.visible(element)) return null;

          // returns the border-box dimensions rather than the content-box
          // dimensions, so we subtract padding and borders from the value
          var dim = parseInt(proceed(element, style), 10);

          if (dim !== element['offset' + style.capitalize()])
            return dim + 'px';

          var properties;
          if (style === 'height') {
            properties = ['border-top-width', 'padding-top',
             'padding-bottom', 'border-bottom-width'];
          }
          else {
            properties = ['border-left-width', 'padding-left',
             'padding-right', 'border-right-width'];
          }
          return properties.inject(dim, function(memo, property) {
            var val = proceed(element, property);
            return val === null ? memo : memo - parseInt(val, 10);
          }) + 'px';
        default: return proceed(element, style);
      }
    }
  );

  Element.Methods.readAttribute = Element.Methods.readAttribute.wrap(
    function(proceed, element, attribute) {
      if (attribute === 'title') return element.title;
      return proceed(element, attribute);
    }
  );
}

else if (Prototype.Browser.IE) {
  // IE doesn't report offsets correctly for static elements, so we change them
  // to "relative" to get the values, then change them back.
  Element.Methods.getOffsetParent = Element.Methods.getOffsetParent.wrap(
    function(proceed, element) {
      element = $(element);
      var position = element.getStyle('position');
      if (position !== 'static') return proceed(element);
      element.setStyle({ position: 'relative' });
      var value = proceed(element);
      element.setStyle({ position: position });
      return value;
    }
  );

  $w('positionedOffset viewportOffset').each(function(method) {
    Element.Methods[method] = Element.Methods[method].wrap(
      function(proceed, element) {
        element = $(element);
        var position = element.getStyle('position');
        if (position !== 'static') return proceed(element);
        // Trigger hasLayout on the offset parent so that IE6 reports
        // accurate offsetTop and offsetLeft values for position: fixed.
        var offsetParent = element.getOffsetParent();
        if (offsetParent && offsetParent.getStyle('position') === 'fixed')
          offsetParent.setStyle({ zoom: 1 });
        element.setStyle({ position: 'relative' });
        var value = proceed(element);
        element.setStyle({ position: position });
        return value;
      }
    );
  });

  Element.Methods.getStyle = function(element, style) {
    element = $(element);
    style = (style == 'float' || style == 'cssFloat') ? 'styleFloat' : style.camelize();
    var value = element.style[style];
    if (!value && element.currentStyle) value = element.currentStyle[style];

    if (style == 'opacity') {
      if (value = (element.getStyle('filter') || '').match(/alpha\(opacity=(.*)\)/))
        if (value[1]) return parseFloat(value[1]) / 100;
      return 1.0;
    }

    if (value == 'auto') {
      if ((style == 'width' || style == 'height') && (element.getStyle('display') != 'none'))
        return element['offset' + style.capitalize()] + 'px';
      return null;
    }
    return value;
  };

  Element.Methods.setOpacity = function(element, value) {
    function stripAlpha(filter){
      return filter.replace(/alpha\([^\)]*\)/gi,'');
    }
    element = $(element);
    var currentStyle = element.currentStyle;
    if ((currentStyle && !currentStyle.hasLayout) ||
      (!currentStyle && element.style.zoom == 'normal'))
        element.style.zoom = 1;

    var filter = element.getStyle('filter'), style = element.style;
    if (value == 1 || value === '') {
      (filter = stripAlpha(filter)) ?
        style.filter = filter : style.removeAttribute('filter');
      return element;
    } else if (value < 0.00001) value = 0;
    style.filter = stripAlpha(filter) +
      'alpha(opacity=' + (value * 100) + ')';
    return element;
  };

  Element._attributeTranslations = {
    read: {
      names: {
        'class': 'className',
        'for':   'htmlFor'
      },
      values: {
        _getAttr: function(element, attribute) {
          return element.getAttribute(attribute, 2);
        },
        _getAttrNode: function(element, attribute) {
          var node = element.getAttributeNode(attribute);
          return node ? node.value : "";
        },
        _getEv: function(element, attribute) {
          attribute = element.getAttribute(attribute);
          return attribute ? attribute.toString().slice(23, -2) : null;
        },
        _flag: function(element, attribute) {
          return $(element).hasAttribute(attribute) ? attribute : null;
        },
        style: function(element) {
          return element.style.cssText.toLowerCase();
        },
        title: function(element) {
          return element.title;
        }
      }
    }
  };

  Element._attributeTranslations.write = {
    names: Object.extend({
      cellpadding: 'cellPadding',
      cellspacing: 'cellSpacing'
    }, Element._attributeTranslations.read.names),
    values: {
      checked: function(element, value) {
        element.checked = !!value;
      },

      style: function(element, value) {
        element.style.cssText = value ? value : '';
      }
    }
  };

  Element._attributeTranslations.has = {};

  $w('colSpan rowSpan vAlign dateTime accessKey tabIndex ' +
      'encType maxLength readOnly longDesc').each(function(attr) {
    Element._attributeTranslations.write.names[attr.toLowerCase()] = attr;
    Element._attributeTranslations.has[attr.toLowerCase()] = attr;
  });

  (function(v) {
    Object.extend(v, {
      href:        v._getAttr,
      src:         v._getAttr,
      type:        v._getAttr,
      action:      v._getAttrNode,
      disabled:    v._flag,
      checked:     v._flag,
      readonly:    v._flag,
      multiple:    v._flag,
      onload:      v._getEv,
      onunload:    v._getEv,
      onclick:     v._getEv,
      ondblclick:  v._getEv,
      onmousedown: v._getEv,
      onmouseup:   v._getEv,
      onmouseover: v._getEv,
      onmousemove: v._getEv,
      onmouseout:  v._getEv,
      onfocus:     v._getEv,
      onblur:      v._getEv,
      onkeypress:  v._getEv,
      onkeydown:   v._getEv,
      onkeyup:     v._getEv,
      onsubmit:    v._getEv,
      onreset:     v._getEv,
      onselect:    v._getEv,
      onchange:    v._getEv
    });
  })(Element._attributeTranslations.read.values);
}

else if (Prototype.Browser.Gecko && /rv:1\.8\.0/.test(navigator.userAgent)) {
  Element.Methods.setOpacity = function(element, value) {
    element = $(element);
    element.style.opacity = (value == 1) ? 0.999999 :
      (value === '') ? '' : (value < 0.00001) ? 0 : value;
    return element;
  };
}

else if (Prototype.Browser.WebKit) {
  Element.Methods.setOpacity = function(element, value) {
    element = $(element);
    element.style.opacity = (value == 1 || value === '') ? '' :
      (value < 0.00001) ? 0 : value;

    if (value == 1)
      if(element.tagName == 'IMG' && element.width) {
        element.width++; element.width--;
      } else try {
        var n = document.createTextNode(' ');
        element.appendChild(n);
        element.removeChild(n);
      } catch (e) { }

    return element;
  };

  // Safari returns margins on body which is incorrect if the child is absolutely
  // positioned.  For performance reasons, redefine Element#cumulativeOffset for
  // KHTML/WebKit only.
  Element.Methods.cumulativeOffset = function(element) {
    var valueT = 0, valueL = 0;
    do {
      valueT += element.offsetTop  || 0;
      valueL += element.offsetLeft || 0;
      if (element.offsetParent == document.body)
        if (Element.getStyle(element, 'position') == 'absolute') break;

      element = element.offsetParent;
    } while (element);

    return Element._returnOffset(valueL, valueT);
  };
}

if (Prototype.Browser.IE || Prototype.Browser.Opera) {
  // IE and Opera are missing .innerHTML support for TABLE-related and SELECT elements
  Element.Methods.update = function(element, content) {
    element = $(element);

    if (content && content.toElement) content = content.toElement();
    if (Object.isElement(content)) return element.update().insert(content);

    content = Object.toHTML(content);
    var tagName = element.tagName.toUpperCase();

    if (tagName in Element._insertionTranslations.tags) {
      $A(element.childNodes).each(function(node) { element.removeChild(node) });
      Element._getContentFromAnonymousElement(tagName, content.stripScripts())
        .each(function(node) { element.appendChild(node) });
    }
    else element.innerHTML = content.stripScripts();

    content.evalScripts.bind(content).defer();
    return element;
  };
}

if ('outerHTML' in document.createElement('div')) {
  Element.Methods.replace = function(element, content) {
    element = $(element);

    if (content && content.toElement) content = content.toElement();
    if (Object.isElement(content)) {
      element.parentNode.replaceChild(content, element);
      return element;
    }

    content = Object.toHTML(content);
    var parent = element.parentNode, tagName = parent.tagName.toUpperCase();

    if (Element._insertionTranslations.tags[tagName]) {
      var nextSibling = element.next();
      var fragments = Element._getContentFromAnonymousElement(tagName, content.stripScripts());
      parent.removeChild(element);
      if (nextSibling)
        fragments.each(function(node) { parent.insertBefore(node, nextSibling) });
      else
        fragments.each(function(node) { parent.appendChild(node) });
    }
    else element.outerHTML = content.stripScripts();

    content.evalScripts.bind(content).defer();
    return element;
  };
}

Element._returnOffset = function(l, t) {
  var result = [l, t];
  result.left = l;
  result.top = t;
  return result;
};

Element._getContentFromAnonymousElement = function(tagName, html) {
  var div = new Element('div'), t = Element._insertionTranslations.tags[tagName];
  if (t) {
    div.innerHTML = t[0] + html + t[1];
    t[2].times(function() { div = div.firstChild });
  } else div.innerHTML = html;
  return $A(div.childNodes);
};

Element._insertionTranslations = {
  before: function(element, node) {
    element.parentNode.insertBefore(node, element);
  },
  top: function(element, node) {
    element.insertBefore(node, element.firstChild);
  },
  bottom: function(element, node) {
    element.appendChild(node);
  },
  after: function(element, node) {
    element.parentNode.insertBefore(node, element.nextSibling);
  },
  tags: {
    TABLE:  ['<table>',                '</table>',                   1],
    TBODY:  ['<table><tbody>',         '</tbody></table>',           2],
    TR:     ['<table><tbody><tr>',     '</tr></tbody></table>',      3],
    TD:     ['<table><tbody><tr><td>', '</td></tr></tbody></table>', 4],
    SELECT: ['<select>',               '</select>',                  1]
  }
};

(function() {
  Object.extend(this.tags, {
    THEAD: this.tags.TBODY,
    TFOOT: this.tags.TBODY,
    TH:    this.tags.TD
  });
}).call(Element._insertionTranslations);

Element.Methods.Simulated = {
  hasAttribute: function(element, attribute) {
    attribute = Element._attributeTranslations.has[attribute] || attribute;
    var node = $(element).getAttributeNode(attribute);
    return node && node.specified;
  }
};

Element.Methods.ByTag = { };

Object.extend(Element, Element.Methods);

if (!Prototype.BrowserFeatures.ElementExtensions &&
    document.createElement('div').__proto__) {
  window.HTMLElement = { };
  window.HTMLElement.prototype = document.createElement('div').__proto__;
  Prototype.BrowserFeatures.ElementExtensions = true;
}

Element.extend = (function() {
  if (Prototype.BrowserFeatures.SpecificElementExtensions)
    return Prototype.K;

  var Methods = { }, ByTag = Element.Methods.ByTag;

  var extend = Object.extend(function(element) {
    if (!element || element._extendedByPrototype ||
        element.nodeType != 1 || element == window) return element;

    var methods = Object.clone(Methods),
      tagName = element.tagName, property, value;

    // extend methods for specific tags
    if (ByTag[tagName]) Object.extend(methods, ByTag[tagName]);

    for (property in methods) {
      value = methods[property];
      if (Object.isFunction(value) && !(property in element))
        element[property] = value.methodize();
    }

    element._extendedByPrototype = Prototype.emptyFunction;
    return element;

  }, {
    refresh: function() {
      // extend methods for all tags (Safari doesn't need this)
      if (!Prototype.BrowserFeatures.ElementExtensions) {
        Object.extend(Methods, Element.Methods);
        Object.extend(Methods, Element.Methods.Simulated);
      }
    }
  });

  extend.refresh();
  return extend;
})();

Element.hasAttribute = function(element, attribute) {
  if (element.hasAttribute) return element.hasAttribute(attribute);
  return Element.Methods.Simulated.hasAttribute(element, attribute);
};

Element.addMethods = function(methods) {
  var F = Prototype.BrowserFeatures, T = Element.Methods.ByTag;

  if (!methods) {
    Object.extend(Form, Form.Methods);
    Object.extend(Form.Element, Form.Element.Methods);
    Object.extend(Element.Methods.ByTag, {
      "FORM":     Object.clone(Form.Methods),
      "INPUT":    Object.clone(Form.Element.Methods),
      "SELECT":   Object.clone(Form.Element.Methods),
      "TEXTAREA": Object.clone(Form.Element.Methods)
    });
  }

  if (arguments.length == 2) {
    var tagName = methods;
    methods = arguments[1];
  }

  if (!tagName) Object.extend(Element.Methods, methods || { });
  else {
    if (Object.isArray(tagName)) tagName.each(extend);
    else extend(tagName);
  }

  function extend(tagName) {
    tagName = tagName.toUpperCase();
    if (!Element.Methods.ByTag[tagName])
      Element.Methods.ByTag[tagName] = { };
    Object.extend(Element.Methods.ByTag[tagName], methods);
  }

  function copy(methods, destination, onlyIfAbsent) {
    onlyIfAbsent = onlyIfAbsent || false;
    for (var property in methods) {
      var value = methods[property];
      if (!Object.isFunction(value)) continue;
      if (!onlyIfAbsent || !(property in destination))
        destination[property] = value.methodize();
    }
  }

  function findDOMClass(tagName) {
    var klass;
    var trans = {
      "OPTGROUP": "OptGroup", "TEXTAREA": "TextArea", "P": "Paragraph",
      "FIELDSET": "FieldSet", "UL": "UList", "OL": "OList", "DL": "DList",
      "DIR": "Directory", "H1": "Heading", "H2": "Heading", "H3": "Heading",
      "H4": "Heading", "H5": "Heading", "H6": "Heading", "Q": "Quote",
      "INS": "Mod", "DEL": "Mod", "A": "Anchor", "IMG": "Image", "CAPTION":
      "TableCaption", "COL": "TableCol", "COLGROUP": "TableCol", "THEAD":
      "TableSection", "TFOOT": "TableSection", "TBODY": "TableSection", "TR":
      "TableRow", "TH": "TableCell", "TD": "TableCell", "FRAMESET":
      "FrameSet", "IFRAME": "IFrame"
    };
    if (trans[tagName]) klass = 'HTML' + trans[tagName] + 'Element';
    if (window[klass]) return window[klass];
    klass = 'HTML' + tagName + 'Element';
    if (window[klass]) return window[klass];
    klass = 'HTML' + tagName.capitalize() + 'Element';
    if (window[klass]) return window[klass];

    window[klass] = { };
    window[klass].prototype = document.createElement(tagName).__proto__;
    return window[klass];
  }

  if (F.ElementExtensions) {
    copy(Element.Methods, HTMLElement.prototype);
    copy(Element.Methods.Simulated, HTMLElement.prototype, true);
  }

  if (F.SpecificElementExtensions) {
    for (var tag in Element.Methods.ByTag) {
      var klass = findDOMClass(tag);
      if (Object.isUndefined(klass)) continue;
      copy(T[tag], klass.prototype);
    }
  }

  Object.extend(Element, Element.Methods);
  delete Element.ByTag;

  if (Element.extend.refresh) Element.extend.refresh();
  Element.cache = { };
};

document.viewport = {
  getDimensions: function() {
    var dimensions = { };
    var B = Prototype.Browser;
    $w('width height').each(function(d) {
      var D = d.capitalize();
      dimensions[d] = (B.WebKit && !document.evaluate) ? self['inner' + D] :
        (B.Opera) ? document.body['client' + D] : document.documentElement['client' + D];
    });
    return dimensions;
  },

  getWidth: function() {
    return this.getDimensions().width;
  },

  getHeight: function() {
    return this.getDimensions().height;
  },

  getScrollOffsets: function() {
    return Element._returnOffset(
      window.pageXOffset || document.documentElement.scrollLeft || document.body.scrollLeft,
      window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop);
  }
};
/* Portions of the Selector class are derived from Jack Slocum’s DomQuery,
 * part of YUI-Ext version 0.40, distributed under the terms of an MIT-style
 * license.  Please see http://www.yui-ext.com/ for more information. */

var Selector = Class.create({
  initialize: function(expression) {
    this.expression = expression.strip();
    this.compileMatcher();
  },

  shouldUseXPath: function() {
    if (!Prototype.BrowserFeatures.XPath) return false;

    var e = this.expression;

    // Safari 3 chokes on :*-of-type and :empty
    if (Prototype.Browser.WebKit &&
     (e.include("-of-type") || e.include(":empty")))
      return false;

    // XPath can't do namespaced attributes, nor can it read
    // the "checked" property from DOM nodes
    if ((/(\[[\w-]*?:|:checked)/).test(this.expression))
      return false;

    return true;
  },

  compileMatcher: function() {
    if (this.shouldUseXPath())
      return this.compileXPathMatcher();

    var e = this.expression, ps = Selector.patterns, h = Selector.handlers,
        c = Selector.criteria, le, p, m;

    if (Selector._cache[e]) {
      this.matcher = Selector._cache[e];
      return;
    }

    this.matcher = ["this.matcher = function(root) {",
                    "var r = root, h = Selector.handlers, c = false, n;"];

    while (e && le != e && (/\S/).test(e)) {
      le = e;
      for (var i in ps) {
        p = ps[i];
        if (m = e.match(p)) {
          this.matcher.push(Object.isFunction(c[i]) ? c[i](m) :
    	      new Template(c[i]).evaluate(m));
          e = e.replace(m[0], '');
          break;
        }
      }
    }

    this.matcher.push("return h.unique(n);\n}");
    eval(this.matcher.join('\n'));
    Selector._cache[this.expression] = this.matcher;
  },

  compileXPathMatcher: function() {
    var e = this.expression, ps = Selector.patterns,
        x = Selector.xpath, le, m;

    if (Selector._cache[e]) {
      this.xpath = Selector._cache[e]; return;
    }

    this.matcher = ['.//*'];
    while (e && le != e && (/\S/).test(e)) {
      le = e;
      for (var i in ps) {
        if (m = e.match(ps[i])) {
          this.matcher.push(Object.isFunction(x[i]) ? x[i](m) :
            new Template(x[i]).evaluate(m));
          e = e.replace(m[0], '');
          break;
        }
      }
    }

    this.xpath = this.matcher.join('');
    Selector._cache[this.expression] = this.xpath;
  },

  findElements: function(root) {
    root = root || document;
    if (this.xpath) return document._getElementsByXPath(this.xpath, root);
    return this.matcher(root);
  },

  match: function(element) {
    this.tokens = [];

    var e = this.expression, ps = Selector.patterns, as = Selector.assertions;
    var le, p, m;

    while (e && le !== e && (/\S/).test(e)) {
      le = e;
      for (var i in ps) {
        p = ps[i];
        if (m = e.match(p)) {
          // use the Selector.assertions methods unless the selector
          // is too complex.
          if (as[i]) {
            this.tokens.push([i, Object.clone(m)]);
            e = e.replace(m[0], '');
          } else {
            // reluctantly do a document-wide search
            // and look for a match in the array
            return this.findElements(document).include(element);
          }
        }
      }
    }

    var match = true, name, matches;
    for (var i = 0, token; token = this.tokens[i]; i++) {
      name = token[0], matches = token[1];
      if (!Selector.assertions[name](element, matches)) {
        match = false; break;
      }
    }

    return match;
  },

  toString: function() {
    return this.expression;
  },

  inspect: function() {
    return "#<Selector:" + this.expression.inspect() + ">";
  }
});

Object.extend(Selector, {
  _cache: { },

  xpath: {
    descendant:   "//*",
    child:        "/*",
    adjacent:     "/following-sibling::*[1]",
    laterSibling: '/following-sibling::*',
    tagName:      function(m) {
      if (m[1] == '*') return '';
      return "[local-name()='" + m[1].toLowerCase() +
             "' or local-name()='" + m[1].toUpperCase() + "']";
    },
    className:    "[contains(concat(' ', @class, ' '), ' #{1} ')]",
    id:           "[@id='#{1}']",
    attrPresence: function(m) {
      m[1] = m[1].toLowerCase();
      return new Template("[@#{1}]").evaluate(m);
    },
    attr: function(m) {
      m[1] = m[1].toLowerCase();
      m[3] = m[5] || m[6];
      return new Template(Selector.xpath.operators[m[2]]).evaluate(m);
    },
    pseudo: function(m) {
      var h = Selector.xpath.pseudos[m[1]];
      if (!h) return '';
      if (Object.isFunction(h)) return h(m);
      return new Template(Selector.xpath.pseudos[m[1]]).evaluate(m);
    },
    operators: {
      '=':  "[@#{1}='#{3}']",
      '!=': "[@#{1}!='#{3}']",
      '^=': "[starts-with(@#{1}, '#{3}')]",
      '$=': "[substring(@#{1}, (string-length(@#{1}) - string-length('#{3}') + 1))='#{3}']",
      '*=': "[contains(@#{1}, '#{3}')]",
      '~=': "[contains(concat(' ', @#{1}, ' '), ' #{3} ')]",
      '|=': "[contains(concat('-', @#{1}, '-'), '-#{3}-')]"
    },
    pseudos: {
      'first-child': '[not(preceding-sibling::*)]',
      'last-child':  '[not(following-sibling::*)]',
      'only-child':  '[not(preceding-sibling::* or following-sibling::*)]',
      'empty':       "[count(*) = 0 and (count(text()) = 0 or translate(text(), ' \t\r\n', '') = '')]",
      'checked':     "[@checked]",
      'disabled':    "[@disabled]",
      'enabled':     "[not(@disabled)]",
      'not': function(m) {
        var e = m[6], p = Selector.patterns,
            x = Selector.xpath, le, v;

        var exclusion = [];
        while (e && le != e && (/\S/).test(e)) {
          le = e;
          for (var i in p) {
            if (m = e.match(p[i])) {
              v = Object.isFunction(x[i]) ? x[i](m) : new Template(x[i]).evaluate(m);
              exclusion.push("(" + v.substring(1, v.length - 1) + ")");
              e = e.replace(m[0], '');
              break;
            }
          }
        }
        return "[not(" + exclusion.join(" and ") + ")]";
      },
      'nth-child':      function(m) {
        return Selector.xpath.pseudos.nth("(count(./preceding-sibling::*) + 1) ", m);
      },
      'nth-last-child': function(m) {
        return Selector.xpath.pseudos.nth("(count(./following-sibling::*) + 1) ", m);
      },
      'nth-of-type':    function(m) {
        return Selector.xpath.pseudos.nth("position() ", m);
      },
      'nth-last-of-type': function(m) {
        return Selector.xpath.pseudos.nth("(last() + 1 - position()) ", m);
      },
      'first-of-type':  function(m) {
        m[6] = "1"; return Selector.xpath.pseudos['nth-of-type'](m);
      },
      'last-of-type':   function(m) {
        m[6] = "1"; return Selector.xpath.pseudos['nth-last-of-type'](m);
      },
      'only-of-type':   function(m) {
        var p = Selector.xpath.pseudos; return p['first-of-type'](m) + p['last-of-type'](m);
      },
      nth: function(fragment, m) {
        var mm, formula = m[6], predicate;
        if (formula == 'even') formula = '2n+0';
        if (formula == 'odd')  formula = '2n+1';
        if (mm = formula.match(/^(\d+)$/)) // digit only
          return '[' + fragment + "= " + mm[1] + ']';
        if (mm = formula.match(/^(-?\d*)?n(([+-])(\d+))?/)) { // an+b
          if (mm[1] == "-") mm[1] = -1;
          var a = mm[1] ? Number(mm[1]) : 1;
          var b = mm[2] ? Number(mm[2]) : 0;
          predicate = "[((#{fragment} - #{b}) mod #{a} = 0) and " +
          "((#{fragment} - #{b}) div #{a} >= 0)]";
          return new Template(predicate).evaluate({
            fragment: fragment, a: a, b: b });
        }
      }
    }
  },

  criteria: {
    tagName:      'n = h.tagName(n, r, "#{1}", c);      c = false;',
    className:    'n = h.className(n, r, "#{1}", c);    c = false;',
    id:           'n = h.id(n, r, "#{1}", c);           c = false;',
    attrPresence: 'n = h.attrPresence(n, r, "#{1}", c); c = false;',
    attr: function(m) {
      m[3] = (m[5] || m[6]);
      return new Template('n = h.attr(n, r, "#{1}", "#{3}", "#{2}", c); c = false;').evaluate(m);
    },
    pseudo: function(m) {
      if (m[6]) m[6] = m[6].replace(/"/g, '\\"');
      return new Template('n = h.pseudo(n, "#{1}", "#{6}", r, c); c = false;').evaluate(m);
    },
    descendant:   'c = "descendant";',
    child:        'c = "child";',
    adjacent:     'c = "adjacent";',
    laterSibling: 'c = "laterSibling";'
  },

  patterns: {
    // combinators must be listed first
    // (and descendant needs to be last combinator)
    laterSibling: /^\s*~\s*/,
    child:        /^\s*>\s*/,
    adjacent:     /^\s*\+\s*/,
    descendant:   /^\s/,

    // selectors follow
    tagName:      /^\s*(\*|[\w\-]+)(\b|$)?/,
    id:           /^#([\w\-\*]+)(\b|$)/,
    className:    /^\.([\w\-\*]+)(\b|$)/,
    pseudo:
/^:((first|last|nth|nth-last|only)(-child|-of-type)|empty|checked|(en|dis)abled|not)(\((.*?)\))?(\b|$|(?=\s|[:+~>]))/,
    attrPresence: /^\[([\w]+)\]/,
    attr:         /\[((?:[\w-]*:)?[\w-]+)\s*(?:([!^$*~|]?=)\s*((['"])([^\4]*?)\4|([^'"][^\]]*?)))?\]/
  },

  // for Selector.match and Element#match
  assertions: {
    tagName: function(element, matches) {
      return matches[1].toUpperCase() == element.tagName.toUpperCase();
    },

    className: function(element, matches) {
      return Element.hasClassName(element, matches[1]);
    },

    id: function(element, matches) {
      return element.id === matches[1];
    },

    attrPresence: function(element, matches) {
      return Element.hasAttribute(element, matches[1]);
    },

    attr: function(element, matches) {
      var nodeValue = Element.readAttribute(element, matches[1]);
      return nodeValue && Selector.operators[matches[2]](nodeValue, matches[5] || matches[6]);
    }
  },

  handlers: {
    // UTILITY FUNCTIONS
    // joins two collections
    concat: function(a, b) {
      for (var i = 0, node; node = b[i]; i++)
        a.push(node);
      return a;
    },

    // marks an array of nodes for counting
    mark: function(nodes) {
      var _true = Prototype.emptyFunction;
      for (var i = 0, node; node = nodes[i]; i++)
        node._countedByPrototype = _true;
      return nodes;
    },

    unmark: function(nodes) {
      for (var i = 0, node; node = nodes[i]; i++)
        node._countedByPrototype = undefined;
      return nodes;
    },

    // mark each child node with its position (for nth calls)
    // "ofType" flag indicates whether we're indexing for nth-of-type
    // rather than nth-child
    index: function(parentNode, reverse, ofType) {
      parentNode._countedByPrototype = Prototype.emptyFunction;
      if (reverse) {
        for (var nodes = parentNode.childNodes, i = nodes.length - 1, j = 1; i >= 0; i--) {
          var node = nodes[i];
          if (node.nodeType == 1 && (!ofType || node._countedByPrototype)) node.nodeIndex = j++;
        }
      } else {
        for (var i = 0, j = 1, nodes = parentNode.childNodes; node = nodes[i]; i++)
          if (node.nodeType == 1 && (!ofType || node._countedByPrototype)) node.nodeIndex = j++;
      }
    },

    // filters out duplicates and extends all nodes
    unique: function(nodes) {
      if (nodes.length == 0) return nodes;
      var results = [], n;
      for (var i = 0, l = nodes.length; i < l; i++)
        if (!(n = nodes[i])._countedByPrototype) {
          n._countedByPrototype = Prototype.emptyFunction;
          results.push(Element.extend(n));
        }
      return Selector.handlers.unmark(results);
    },

    // COMBINATOR FUNCTIONS
    descendant: function(nodes) {
      var h = Selector.handlers;
      for (var i = 0, results = [], node; node = nodes[i]; i++)
        h.concat(results, node.getElementsByTagName('*'));
      return results;
    },

    child: function(nodes) {
      var h = Selector.handlers;
      for (var i = 0, results = [], node; node = nodes[i]; i++) {
        for (var j = 0, child; child = node.childNodes[j]; j++)
          if (child.nodeType == 1 && child.tagName != '!') results.push(child);
      }
      return results;
    },

    adjacent: function(nodes) {
      for (var i = 0, results = [], node; node = nodes[i]; i++) {
        var next = this.nextElementSibling(node);
        if (next) results.push(next);
      }
      return results;
    },

    laterSibling: function(nodes) {
      var h = Selector.handlers;
      for (var i = 0, results = [], node; node = nodes[i]; i++)
        h.concat(results, Element.nextSiblings(node));
      return results;
    },

    nextElementSibling: function(node) {
      while (node = node.nextSibling)
	      if (node.nodeType == 1) return node;
      return null;
    },

    previousElementSibling: function(node) {
      while (node = node.previousSibling)
        if (node.nodeType == 1) return node;
      return null;
    },

    // TOKEN FUNCTIONS
    tagName: function(nodes, root, tagName, combinator) {
      var uTagName = tagName.toUpperCase();
      var results = [], h = Selector.handlers;
      if (nodes) {
        if (combinator) {
          // fastlane for ordinary descendant combinators
          if (combinator == "descendant") {
            for (var i = 0, node; node = nodes[i]; i++)
              h.concat(results, node.getElementsByTagName(tagName));
            return results;
          } else nodes = this[combinator](nodes);
          if (tagName == "*") return nodes;
        }
        for (var i = 0, node; node = nodes[i]; i++)
          if (node.tagName.toUpperCase() === uTagName) results.push(node);
        return results;
      } else return root.getElementsByTagName(tagName);
    },

    id: function(nodes, root, id, combinator) {
      var targetNode = $(id), h = Selector.handlers;
      if (!targetNode) return [];
      if (!nodes && root == document) return [targetNode];
      if (nodes) {
        if (combinator) {
          if (combinator == 'child') {
            for (var i = 0, node; node = nodes[i]; i++)
              if (targetNode.parentNode == node) return [targetNode];
          } else if (combinator == 'descendant') {
            for (var i = 0, node; node = nodes[i]; i++)
              if (Element.descendantOf(targetNode, node)) return [targetNode];
          } else if (combinator == 'adjacent') {
            for (var i = 0, node; node = nodes[i]; i++)
              if (Selector.handlers.previousElementSibling(targetNode) == node)
                return [targetNode];
          } else nodes = h[combinator](nodes);
        }
        for (var i = 0, node; node = nodes[i]; i++)
          if (node == targetNode) return [targetNode];
        return [];
      }
      return (targetNode && Element.descendantOf(targetNode, root)) ? [targetNode] : [];
    },

    className: function(nodes, root, className, combinator) {
      if (nodes && combinator) nodes = this[combinator](nodes);
      return Selector.handlers.byClassName(nodes, root, className);
    },

    byClassName: function(nodes, root, className) {
      if (!nodes) nodes = Selector.handlers.descendant([root]);
      var needle = ' ' + className + ' ';
      for (var i = 0, results = [], node, nodeClassName; node = nodes[i]; i++) {
        nodeClassName = node.className;
        if (nodeClassName.length == 0) continue;
        if (nodeClassName == className || (' ' + nodeClassName + ' ').include(needle))
          results.push(node);
      }
      return results;
    },

    attrPresence: function(nodes, root, attr, combinator) {
      if (!nodes) nodes = root.getElementsByTagName("*");
      if (nodes && combinator) nodes = this[combinator](nodes);
      var results = [];
      for (var i = 0, node; node = nodes[i]; i++)
        if (Element.hasAttribute(node, attr)) results.push(node);
      return results;
    },

    attr: function(nodes, root, attr, value, operator, combinator) {
      if (!nodes) nodes = root.getElementsByTagName("*");
      if (nodes && combinator) nodes = this[combinator](nodes);
      var handler = Selector.operators[operator], results = [];
      for (var i = 0, node; node = nodes[i]; i++) {
        var nodeValue = Element.readAttribute(node, attr);
        if (nodeValue === null) continue;
        if (handler(nodeValue, value)) results.push(node);
      }
      return results;
    },

    pseudo: function(nodes, name, value, root, combinator) {
      if (nodes && combinator) nodes = this[combinator](nodes);
      if (!nodes) nodes = root.getElementsByTagName("*");
      return Selector.pseudos[name](nodes, value, root);
    }
  },

  pseudos: {
    'first-child': function(nodes, value, root) {
      for (var i = 0, results = [], node; node = nodes[i]; i++) {
        if (Selector.handlers.previousElementSibling(node)) continue;
          results.push(node);
      }
      return results;
    },
    'last-child': function(nodes, value, root) {
      for (var i = 0, results = [], node; node = nodes[i]; i++) {
        if (Selector.handlers.nextElementSibling(node)) continue;
          results.push(node);
      }
      return results;
    },
    'only-child': function(nodes, value, root) {
      var h = Selector.handlers;
      for (var i = 0, results = [], node; node = nodes[i]; i++)
        if (!h.previousElementSibling(node) && !h.nextElementSibling(node))
          results.push(node);
      return results;
    },
    'nth-child':        function(nodes, formula, root) {
      return Selector.pseudos.nth(nodes, formula, root);
    },
    'nth-last-child':   function(nodes, formula, root) {
      return Selector.pseudos.nth(nodes, formula, root, true);
    },
    'nth-of-type':      function(nodes, formula, root) {
      return Selector.pseudos.nth(nodes, formula, root, false, true);
    },
    'nth-last-of-type': function(nodes, formula, root) {
      return Selector.pseudos.nth(nodes, formula, root, true, true);
    },
    'first-of-type':    function(nodes, formula, root) {
      return Selector.pseudos.nth(nodes, "1", root, false, true);
    },
    'last-of-type':     function(nodes, formula, root) {
      return Selector.pseudos.nth(nodes, "1", root, true, true);
    },
    'only-of-type':     function(nodes, formula, root) {
      var p = Selector.pseudos;
      return p['last-of-type'](p['first-of-type'](nodes, formula, root), formula, root);
    },

    // handles the an+b logic
    getIndices: function(a, b, total) {
      if (a == 0) return b > 0 ? [b] : [];
      return $R(1, total).inject([], function(memo, i) {
        if (0 == (i - b) % a && (i - b) / a >= 0) memo.push(i);
        return memo;
      });
    },

    // handles nth(-last)-child, nth(-last)-of-type, and (first|last)-of-type
    nth: function(nodes, formula, root, reverse, ofType) {
      if (nodes.length == 0) return [];
      if (formula == 'even') formula = '2n+0';
      if (formula == 'odd')  formula = '2n+1';
      var h = Selector.handlers, results = [], indexed = [], m;
      h.mark(nodes);
      for (var i = 0, node; node = nodes[i]; i++) {
        if (!node.parentNode._countedByPrototype) {
          h.index(node.parentNode, reverse, ofType);
          indexed.push(node.parentNode);
        }
      }
      if (formula.match(/^\d+$/)) { // just a number
        formula = Number(formula);
        for (var i = 0, node; node = nodes[i]; i++)
          if (node.nodeIndex == formula) results.push(node);
      } else if (m = formula.match(/^(-?\d*)?n(([+-])(\d+))?/)) { // an+b
        if (m[1] == "-") m[1] = -1;
        var a = m[1] ? Number(m[1]) : 1;
        var b = m[2] ? Number(m[2]) : 0;
        var indices = Selector.pseudos.getIndices(a, b, nodes.length);
        for (var i = 0, node, l = indices.length; node = nodes[i]; i++) {
          for (var j = 0; j < l; j++)
            if (node.nodeIndex == indices[j]) results.push(node);
        }
      }
      h.unmark(nodes);
      h.unmark(indexed);
      return results;
    },

    'empty': function(nodes, value, root) {
      for (var i = 0, results = [], node; node = nodes[i]; i++) {
        // IE treats comments as element nodes
        if (node.tagName == '!' || (node.firstChild && !node.innerHTML.match(/^\s*$/))) continue;
        results.push(node);
      }
      return results;
    },

    'not': function(nodes, selector, root) {
      var h = Selector.handlers, selectorType, m;
      var exclusions = new Selector(selector).findElements(root);
      h.mark(exclusions);
      for (var i = 0, results = [], node; node = nodes[i]; i++)
        if (!node._countedByPrototype) results.push(node);
      h.unmark(exclusions);
      return results;
    },

    'enabled': function(nodes, value, root) {
      for (var i = 0, results = [], node; node = nodes[i]; i++)
        if (!node.disabled) results.push(node);
      return results;
    },

    'disabled': function(nodes, value, root) {
      for (var i = 0, results = [], node; node = nodes[i]; i++)
        if (node.disabled) results.push(node);
      return results;
    },

    'checked': function(nodes, value, root) {
      for (var i = 0, results = [], node; node = nodes[i]; i++)
        if (node.checked) results.push(node);
      return results;
    }
  },

  operators: {
    '=':  function(nv, v) { return nv == v; },
    '!=': function(nv, v) { return nv != v; },
    '^=': function(nv, v) { return nv.startsWith(v); },
    '$=': function(nv, v) { return nv.endsWith(v); },
    '*=': function(nv, v) { return nv.include(v); },
    '~=': function(nv, v) { return (' ' + nv + ' ').include(' ' + v + ' '); },
    '|=': function(nv, v) { return ('-' + nv.toUpperCase() + '-').include('-' + v.toUpperCase() + '-'); }
  },

  split: function(expression) {
    var expressions = [];
    expression.scan(/(([\w#:.~>+()\s-]+|\*|\[.*?\])+)\s*(,|$)/, function(m) {
      expressions.push(m[1].strip());
    });
    return expressions;
  },

  matchElements: function(elements, expression) {
    var matches = $$(expression), h = Selector.handlers;
    h.mark(matches);
    for (var i = 0, results = [], element; element = elements[i]; i++)
      if (element._countedByPrototype) results.push(element);
    h.unmark(matches);
    return results;
  },

  findElement: function(elements, expression, index) {
    if (Object.isNumber(expression)) {
      index = expression; expression = false;
    }
    return Selector.matchElements(elements, expression || '*')[index || 0];
  },

  findChildElements: function(element, expressions) {
    expressions = Selector.split(expressions.join(','));
    var results = [], h = Selector.handlers;
    for (var i = 0, l = expressions.length, selector; i < l; i++) {
      selector = new Selector(expressions[i].strip());
      h.concat(results, selector.findElements(element));
    }
    return (l > 1) ? h.unique(results) : results;
  }
});

if (Prototype.Browser.IE) {
  Object.extend(Selector.handlers, {
    // IE returns comment nodes on getElementsByTagName("*").
    // Filter them out.
    concat: function(a, b) {
      for (var i = 0, node; node = b[i]; i++)
        if (node.tagName !== "!") a.push(node);
      return a;
    },

    // IE improperly serializes _countedByPrototype in (inner|outer)HTML.
    unmark: function(nodes) {
      for (var i = 0, node; node = nodes[i]; i++)
        node.removeAttribute('_countedByPrototype');
      return nodes;
    }
  });
}

function $$() {
  return Selector.findChildElements(document, $A(arguments));
}
var Form = {
  reset: function(form) {
    $(form).reset();
    return form;
  },

  serializeElements: function(elements, options) {
    if (typeof options != 'object') options = { hash: !!options };
    else if (Object.isUndefined(options.hash)) options.hash = true;
    var key, value, submitted = false, submit = options.submit;

    var data = elements.inject({ }, function(result, element) {
      if (!element.disabled && element.name) {
        key = element.name; value = $(element).getValue();
        if (value != null && (element.type != 'submit' || (!submitted &&
            submit !== false && (!submit || key == submit) && (submitted = true)))) {
          if (key in result) {
            // a key is already present; construct an array of values
            if (!Object.isArray(result[key])) result[key] = [result[key]];
            result[key].push(value);
          }
          else result[key] = value;
        }
      }
      return result;
    });

    return options.hash ? data : Object.toQueryString(data);
  }
};

Form.Methods = {
  serialize: function(form, options) {
    return Form.serializeElements(Form.getElements(form), options);
  },

  getElements: function(form) {
    return $A($(form).getElementsByTagName('*')).inject([],
      function(elements, child) {
        if (Form.Element.Serializers[child.tagName.toLowerCase()])
          elements.push(Element.extend(child));
        return elements;
      }
    );
  },

  getInputs: function(form, typeName, name) {
    form = $(form);
    var inputs = form.getElementsByTagName('input');

    if (!typeName && !name) return $A(inputs).map(Element.extend);

    for (var i = 0, matchingInputs = [], length = inputs.length; i < length; i++) {
      var input = inputs[i];
      if ((typeName && input.type != typeName) || (name && input.name != name))
        continue;
      matchingInputs.push(Element.extend(input));
    }

    return matchingInputs;
  },

  disable: function(form) {
    form = $(form);
    Form.getElements(form).invoke('disable');
    return form;
  },

  enable: function(form) {
    form = $(form);
    Form.getElements(form).invoke('enable');
    return form;
  },

  findFirstElement: function(form) {
    var elements = $(form).getElements().findAll(function(element) {
      return 'hidden' != element.type && !element.disabled;
    });
    var firstByIndex = elements.findAll(function(element) {
      return element.hasAttribute('tabIndex') && element.tabIndex >= 0;
    }).sortBy(function(element) { return element.tabIndex }).first();

    return firstByIndex ? firstByIndex : elements.find(function(element) {
      return ['input', 'select', 'textarea'].include(element.tagName.toLowerCase());
    });
  },

  focusFirstElement: function(form) {
    form = $(form);
    form.findFirstElement().activate();
    return form;
  },

  request: function(form, options) {
    form = $(form), options = Object.clone(options || { });

    var params = options.parameters, action = form.readAttribute('action') || '';
    if (action.blank()) action = window.location.href;
    options.parameters = form.serialize(true);

    if (params) {
      if (Object.isString(params)) params = params.toQueryParams();
      Object.extend(options.parameters, params);
    }

    if (form.hasAttribute('method') && !options.method)
      options.method = form.method;

    return new Ajax.Request(action, options);
  }
};

/*--------------------------------------------------------------------------*/

Form.Element = {
  focus: function(element) {
    $(element).focus();
    return element;
  },

  select: function(element) {
    $(element).select();
    return element;
  }
};

Form.Element.Methods = {
  serialize: function(element) {
    element = $(element);
    if (!element.disabled && element.name) {
      var value = element.getValue();
      if (value != undefined) {
        var pair = { };
        pair[element.name] = value;
        return Object.toQueryString(pair);
      }
    }
    return '';
  },

  getValue: function(element) {
    element = $(element);
    var method = element.tagName.toLowerCase();
    return Form.Element.Serializers[method](element);
  },

  setValue: function(element, value) {
    element = $(element);
    var method = element.tagName.toLowerCase();
    Form.Element.Serializers[method](element, value);
    return element;
  },

  clear: function(element) {
    $(element).value = '';
    return element;
  },

  present: function(element) {
    return $(element).value != '';
  },

  activate: function(element) {
    element = $(element);
    try {
      element.focus();
      if (element.select && (element.tagName.toLowerCase() != 'input' ||
          !['button', 'reset', 'submit'].include(element.type)))
        element.select();
    } catch (e) { }
    return element;
  },

  disable: function(element) {
    element = $(element);
    element.blur();
    element.disabled = true;
    return element;
  },

  enable: function(element) {
    element = $(element);
    element.disabled = false;
    return element;
  }
};

/*--------------------------------------------------------------------------*/

var Field = Form.Element;
var $F = Form.Element.Methods.getValue;

/*--------------------------------------------------------------------------*/

Form.Element.Serializers = {
  input: function(element, value) {
    switch (element.type.toLowerCase()) {
      case 'checkbox':
      case 'radio':
        return Form.Element.Serializers.inputSelector(element, value);
      default:
        return Form.Element.Serializers.textarea(element, value);
    }
  },

  inputSelector: function(element, value) {
    if (Object.isUndefined(value)) return element.checked ? element.value : null;
    else element.checked = !!value;
  },

  textarea: function(element, value) {
    if (Object.isUndefined(value)) return element.value;
    else element.value = value;
  },

  select: function(element, index) {
    if (Object.isUndefined(index))
      return this[element.type == 'select-one' ?
        'selectOne' : 'selectMany'](element);
    else {
      var opt, value, single = !Object.isArray(index);
      for (var i = 0, length = element.length; i < length; i++) {
        opt = element.options[i];
        value = this.optionValue(opt);
        if (single) {
          if (value == index) {
            opt.selected = true;
            return;
          }
        }
        else opt.selected = index.include(value);
      }
    }
  },

  selectOne: function(element) {
    var index = element.selectedIndex;
    return index >= 0 ? this.optionValue(element.options[index]) : null;
  },

  selectMany: function(element) {
    var values, length = element.length;
    if (!length) return null;

    for (var i = 0, values = []; i < length; i++) {
      var opt = element.options[i];
      if (opt.selected) values.push(this.optionValue(opt));
    }
    return values;
  },

  optionValue: function(opt) {
    // extend element because hasAttribute may not be native
    return Element.extend(opt).hasAttribute('value') ? opt.value : opt.text;
  }
};

/*--------------------------------------------------------------------------*/

Abstract.TimedObserver = Class.create(PeriodicalExecuter, {
  initialize: function($super, element, frequency, callback) {
    $super(callback, frequency);
    this.element   = $(element);
    this.lastValue = this.getValue();
  },

  execute: function() {
    var value = this.getValue();
    if (Object.isString(this.lastValue) && Object.isString(value) ?
        this.lastValue != value : String(this.lastValue) != String(value)) {
      this.callback(this.element, value);
      this.lastValue = value;
    }
  }
});

Form.Element.Observer = Class.create(Abstract.TimedObserver, {
  getValue: function() {
    return Form.Element.getValue(this.element);
  }
});

Form.Observer = Class.create(Abstract.TimedObserver, {
  getValue: function() {
    return Form.serialize(this.element);
  }
});

/*--------------------------------------------------------------------------*/

Abstract.EventObserver = Class.create({
  initialize: function(element, callback) {
    this.element  = $(element);
    this.callback = callback;

    this.lastValue = this.getValue();
    if (this.element.tagName.toLowerCase() == 'form')
      this.registerFormCallbacks();
    else
      this.registerCallback(this.element);
  },

  onElementEvent: function() {
    var value = this.getValue();
    if (this.lastValue != value) {
      this.callback(this.element, value);
      this.lastValue = value;
    }
  },

  registerFormCallbacks: function() {
    Form.getElements(this.element).each(this.registerCallback, this);
  },

  registerCallback: function(element) {
    if (element.type) {
      switch (element.type.toLowerCase()) {
        case 'checkbox':
        case 'radio':
          Event.observe(element, 'click', this.onElementEvent.bind(this));
          break;
        default:
          Event.observe(element, 'change', this.onElementEvent.bind(this));
          break;
      }
    }
  }
});

Form.Element.EventObserver = Class.create(Abstract.EventObserver, {
  getValue: function() {
    return Form.Element.getValue(this.element);
  }
});

Form.EventObserver = Class.create(Abstract.EventObserver, {
  getValue: function() {
    return Form.serialize(this.element);
  }
});
if (!window.Event) var Event = { };

Object.extend(Event, {
  KEY_BACKSPACE: 8,
  KEY_TAB:       9,
  KEY_RETURN:   13,
  KEY_ESC:      27,
  KEY_LEFT:     37,
  KEY_UP:       38,
  KEY_RIGHT:    39,
  KEY_DOWN:     40,
  KEY_DELETE:   46,
  KEY_HOME:     36,
  KEY_END:      35,
  KEY_PAGEUP:   33,
  KEY_PAGEDOWN: 34,
  KEY_INSERT:   45,

  cache: { },

  relatedTarget: function(event) {
    var element;
    switch(event.type) {
      case 'mouseover': element = event.fromElement; break;
      case 'mouseout':  element = event.toElement;   break;
      default: return null;
    }
    return Element.extend(element);
  }
});

Event.Methods = (function() {
  var isButton;

  if (Prototype.Browser.IE) {
    var buttonMap = { 0: 1, 1: 4, 2: 2 };
    isButton = function(event, code) {
      return event.button == buttonMap[code];
    };

  } else if (Prototype.Browser.WebKit) {
    isButton = function(event, code) {
      switch (code) {
        case 0: return event.which == 1 && !event.metaKey;
        case 1: return event.which == 1 && event.metaKey;
        default: return false;
      }
    };

  } else {
    isButton = function(event, code) {
      return event.which ? (event.which === code + 1) : (event.button === code);
    };
  }

  return {
    isLeftClick:   function(event) { return isButton(event, 0) },
    isMiddleClick: function(event) { return isButton(event, 1) },
    isRightClick:  function(event) { return isButton(event, 2) },

    element: function(event) {
      var node = Event.extend(event).target;
      return Element.extend(node.nodeType == Node.TEXT_NODE ? node.parentNode : node);
    },

    findElement: function(event, expression) {
      var element = Event.element(event);
      if (!expression) return element;
      var elements = [element].concat(element.ancestors());
      return Selector.findElement(elements, expression, 0);
    },

    pointer: function(event) {
      return {
        x: event.pageX || (event.clientX +
          (document.documentElement.scrollLeft || document.body.scrollLeft)),
        y: event.pageY || (event.clientY +
          (document.documentElement.scrollTop || document.body.scrollTop))
      };
    },

    pointerX: function(event) { return Event.pointer(event).x },
    pointerY: function(event) { return Event.pointer(event).y },

    stop: function(event) {
      Event.extend(event);
      event.preventDefault();
      event.stopPropagation();
      event.stopped = true;
    }
  };
})();

Event.extend = (function() {
  var methods = Object.keys(Event.Methods).inject({ }, function(m, name) {
    m[name] = Event.Methods[name].methodize();
    return m;
  });

  if (Prototype.Browser.IE) {
    Object.extend(methods, {
      stopPropagation: function() { this.cancelBubble = true },
      preventDefault:  function() { this.returnValue = false },
      inspect: function() { return "[object Event]" }
    });

    return function(event) {
      if (!event) return false;
      if (event._extendedByPrototype) return event;

      event._extendedByPrototype = Prototype.emptyFunction;
      var pointer = Event.pointer(event);
      Object.extend(event, {
        target: event.srcElement,
        relatedTarget: Event.relatedTarget(event),
        pageX:  pointer.x,
        pageY:  pointer.y
      });
      return Object.extend(event, methods);
    };

  } else {
    Event.prototype = Event.prototype || document.createEvent("HTMLEvents").__proto__;
    Object.extend(Event.prototype, methods);
    return Prototype.K;
  }
})();

Object.extend(Event, (function() {
  var cache = Event.cache;

  function getEventID(element) {
    if (element._prototypeEventID) return element._prototypeEventID[0];
    arguments.callee.id = arguments.callee.id || 1;
    return element._prototypeEventID = [++arguments.callee.id];
  }

  function getDOMEventName(eventName) {
    if (eventName && eventName.include(':')) return "dataavailable";
    return eventName;
  }

  function getCacheForID(id) {
    return cache[id] = cache[id] || { };
  }

  function getWrappersForEventName(id, eventName) {
    var c = getCacheForID(id);
    return c[eventName] = c[eventName] || [];
  }

  function createWrapper(element, eventName, handler) {
    var id = getEventID(element);
    var c = getWrappersForEventName(id, eventName);
    if (c.pluck("handler").include(handler)) return false;

    var wrapper = function(event) {
      if (!Event || !Event.extend ||
        (event.eventName && event.eventName != eventName))
          return false;

      Event.extend(event);
      handler.call(element, event);
    };

    wrapper.handler = handler;
    c.push(wrapper);
    return wrapper;
  }

  function findWrapper(id, eventName, handler) {
    var c = getWrappersForEventName(id, eventName);
    return c.find(function(wrapper) { return wrapper.handler == handler });
  }

  function destroyWrapper(id, eventName, handler) {
    var c = getCacheForID(id);
    if (!c[eventName]) return false;
    c[eventName] = c[eventName].without(findWrapper(id, eventName, handler));
  }

  function destroyCache() {
    for (var id in cache)
      for (var eventName in cache[id])
        cache[id][eventName] = null;
  }

  if (window.attachEvent) {
    window.attachEvent("onunload", destroyCache);
  }

  return {
    observe: function(element, eventName, handler) {
      element = $(element);
      var name = getDOMEventName(eventName);

      var wrapper = createWrapper(element, eventName, handler);
      if (!wrapper) return element;

      if (element.addEventListener) {
        element.addEventListener(name, wrapper, false);
      } else {
        element.attachEvent("on" + name, wrapper);
      }

      return element;
    },

    stopObserving: function(element, eventName, handler) {
      element = $(element);
      var id = getEventID(element), name = getDOMEventName(eventName);

      if (!handler && eventName) {
        getWrappersForEventName(id, eventName).each(function(wrapper) {
          element.stopObserving(eventName, wrapper.handler);
        });
        return element;

      } else if (!eventName) {
        Object.keys(getCacheForID(id)).each(function(eventName) {
          element.stopObserving(eventName);
        });
        return element;
      }

      var wrapper = findWrapper(id, eventName, handler);
      if (!wrapper) return element;

      if (element.removeEventListener) {
        element.removeEventListener(name, wrapper, false);
      } else {
        element.detachEvent("on" + name, wrapper);
      }

      destroyWrapper(id, eventName, handler);

      return element;
    },

    fire: function(element, eventName, memo) {
      element = $(element);
      if (element == document && document.createEvent && !element.dispatchEvent)
        element = document.documentElement;

      var event;
      if (document.createEvent) {
        event = document.createEvent("HTMLEvents");
        event.initEvent("dataavailable", true, true);
      } else {
        event = document.createEventObject();
        event.eventType = "ondataavailable";
      }

      event.eventName = eventName;
      event.memo = memo || { };

      if (document.createEvent) {
        element.dispatchEvent(event);
      } else {
        element.fireEvent(event.eventType, event);
      }

      return Event.extend(event);
    }
  };
})());

Object.extend(Event, Event.Methods);

Element.addMethods({
  fire:          Event.fire,
  observe:       Event.observe,
  stopObserving: Event.stopObserving
});

Object.extend(document, {
  fire:          Element.Methods.fire.methodize(),
  observe:       Element.Methods.observe.methodize(),
  stopObserving: Element.Methods.stopObserving.methodize(),
  loaded:        false
});

(function() {
  /* Support for the DOMContentLoaded event is based on work by Dan Webb,
     Matthias Miller, Dean Edwards and John Resig. */

  var timer;

  function fireContentLoadedEvent() {
    if (document.loaded) return;
    if (timer) window.clearInterval(timer);
    document.fire("dom:loaded");
    document.loaded = true;
  }

  if (document.addEventListener) {
    if (Prototype.Browser.WebKit) {
      timer = window.setInterval(function() {
        if (/loaded|complete/.test(document.readyState))
          fireContentLoadedEvent();
      }, 0);

      Event.observe(window, "load", fireContentLoadedEvent);

    } else {
      document.addEventListener("DOMContentLoaded",
        fireContentLoadedEvent, false);
    }

  } else {
    document.write("<script id=__onDOMContentLoaded defer src=//:><\/script>");
    $("__onDOMContentLoaded").onreadystatechange = function() {
      if (this.readyState == "complete") {
        this.onreadystatechange = null;
        fireContentLoadedEvent();
      }
    };
  }
})();
/*------------------------------- DEPRECATED -------------------------------*/

Hash.toQueryString = Object.toQueryString;

var Toggle = { display: Element.toggle };

Element.Methods.childOf = Element.Methods.descendantOf;

var Insertion = {
  Before: function(element, content) {
    return Element.insert(element, {before:content});
  },

  Top: function(element, content) {
    return Element.insert(element, {top:content});
  },

  Bottom: function(element, content) {
    return Element.insert(element, {bottom:content});
  },

  After: function(element, content) {
    return Element.insert(element, {after:content});
  }
};

var $continue = new Error('"throw $continue" is deprecated, use "return" instead');

// This should be moved to script.aculo.us; notice the deprecated methods
// further below, that map to the newer Element methods.
var Position = {
  // set to true if needed, warning: firefox performance problems
  // NOT neeeded for page scrolling, only if draggable contained in
  // scrollable elements
  includeScrollOffsets: false,

  // must be called before calling withinIncludingScrolloffset, every time the
  // page is scrolled
  prepare: function() {
    this.deltaX =  window.pageXOffset
                || document.documentElement.scrollLeft
                || document.body.scrollLeft
                || 0;
    this.deltaY =  window.pageYOffset
                || document.documentElement.scrollTop
                || document.body.scrollTop
                || 0;
  },

  // caches x/y coordinate pair to use with overlap
  within: function(element, x, y) {
    if (this.includeScrollOffsets)
      return this.withinIncludingScrolloffsets(element, x, y);
    this.xcomp = x;
    this.ycomp = y;
    this.offset = Element.cumulativeOffset(element);

    return (y >= this.offset[1] &&
            y <  this.offset[1] + element.offsetHeight &&
            x >= this.offset[0] &&
            x <  this.offset[0] + element.offsetWidth);
  },

  withinIncludingScrolloffsets: function(element, x, y) {
    var offsetcache = Element.cumulativeScrollOffset(element);

    this.xcomp = x + offsetcache[0] - this.deltaX;
    this.ycomp = y + offsetcache[1] - this.deltaY;
    this.offset = Element.cumulativeOffset(element);

    return (this.ycomp >= this.offset[1] &&
            this.ycomp <  this.offset[1] + element.offsetHeight &&
            this.xcomp >= this.offset[0] &&
            this.xcomp <  this.offset[0] + element.offsetWidth);
  },

  // within must be called directly before
  overlap: function(mode, element) {
    if (!mode) return 0;
    if (mode == 'vertical')
      return ((this.offset[1] + element.offsetHeight) - this.ycomp) /
        element.offsetHeight;
    if (mode == 'horizontal')
      return ((this.offset[0] + element.offsetWidth) - this.xcomp) /
        element.offsetWidth;
  },

  // Deprecation layer -- use newer Element methods now (1.5.2).

  cumulativeOffset: Element.Methods.cumulativeOffset,

  positionedOffset: Element.Methods.positionedOffset,

  absolutize: function(element) {
    Position.prepare();
    return Element.absolutize(element);
  },

  relativize: function(element) {
    Position.prepare();
    return Element.relativize(element);
  },

  realOffset: Element.Methods.cumulativeScrollOffset,

  offsetParent: Element.Methods.getOffsetParent,

  page: Element.Methods.viewportOffset,

  clone: function(source, target, options) {
    options = options || { };
    return Element.clonePosition(target, source, options);
  }
};

/*--------------------------------------------------------------------------*/

if (!document.getElementsByClassName) document.getElementsByClassName = function(instanceMethods){
  function iter(name) {
    return name.blank() ? null : "[contains(concat(' ', @class, ' '), ' " + name + " ')]";
  }

  instanceMethods.getElementsByClassName = Prototype.BrowserFeatures.XPath ?
  function(element, className) {
    className = className.toString().strip();
    var cond = /\s/.test(className) ? $w(className).map(iter).join('') : iter(className);
    return cond ? document._getElementsByXPath('.//*' + cond, element) : [];
  } : function(element, className) {
    className = className.toString().strip();
    var elements = [], classNames = (/\s/.test(className) ? $w(className) : null);
    if (!classNames && !className) return elements;

    var nodes = $(element).getElementsByTagName('*');
    className = ' ' + className + ' ';

    for (var i = 0, child, cn; child = nodes[i]; i++) {
      if (child.className && (cn = ' ' + child.className + ' ') && (cn.include(className) ||
          (classNames && classNames.all(function(name) {
            return !name.toString().blank() && cn.include(' ' + name + ' ');
          }))))
        elements.push(Element.extend(child));
    }
    return elements;
  };

  return function(className, parentElement) {
    return $(parentElement || document.body).getElementsByClassName(className);
  };
}(Element.Methods);

/*--------------------------------------------------------------------------*/

Element.ClassNames = Class.create();
Element.ClassNames.prototype = {
  initialize: function(element) {
    this.element = $(element);
  },

  _each: function(iterator) {
    this.element.className.split(/\s+/).select(function(name) {
      return name.length > 0;
    })._each(iterator);
  },

  set: function(className) {
    this.element.className = className;
  },

  add: function(classNameToAdd) {
    if (this.include(classNameToAdd)) return;
    this.set($A(this).concat(classNameToAdd).join(' '));
  },

  remove: function(classNameToRemove) {
    if (!this.include(classNameToRemove)) return;
    this.set($A(this).without(classNameToRemove).join(' '));
  },

  toString: function() {
    return $A(this).join(' ');
  }
};

Object.extend(Element.ClassNames.prototype, Enumerable);

/*--------------------------------------------------------------------------*/

Element.addMethods();/*
* Copyright (c) 2006-2007 Erin Catto http:
*
* This software is provided 'as-is', without any express or implied
* warranty.  In no event will the authors be held liable for any damages
* arising from the use of this software.
* Permission is granted to anyone to use this software for any purpose,
* including commercial applications, and to alter it and redistribute it
* freely, subject to the following restrictions:
* 1. The origin of this software must not be misrepresented; you must not
* claim that you wrote the original software. If you use this software
* in a product, an acknowledgment in the product documentation would be
* appreciated but is not required.
* 2. Altered source versions must be plainly marked, and must not be
* misrepresented the original software.
* 3. This notice may not be removed or altered from any source distribution.
*/





var b2Settings = Class.create();
b2Settings.prototype = {



	// Define your unit system here. The default system is
	// meters-kilograms-seconds. For the tuning to work well,
	// your dynamic objects should be bigger than a pebble and smaller
	// than a house.
	//static public const b2Settings.b2_lengthUnitsPerMeter = 1.0;

	// Use this for pixels:

	// Global tuning constants based on MKS units.

	// Collision

	// Dynamics

	// Sleep

	// assert

	initialize: function() {}}
b2Settings.USHRT_MAX = 0x0000ffff;
b2Settings.b2_pi = Math.PI;
b2Settings.b2_massUnitsPerKilogram = 1.0;
b2Settings.b2_timeUnitsPerSecond = 1.0;
b2Settings.b2_lengthUnitsPerMeter = 30.0;
b2Settings.b2_maxManifoldPoints = 2;
b2Settings.b2_maxShapesPerBody = 64;
b2Settings.b2_maxPolyVertices = 8;
b2Settings.b2_maxProxies = 1024;
b2Settings.b2_maxPairs = 8 * b2Settings.b2_maxProxies;
b2Settings.b2_linearSlop = 0.005 * b2Settings.b2_lengthUnitsPerMeter;
b2Settings.b2_angularSlop = 2.0 / 180.0 * b2Settings.b2_pi;
b2Settings.b2_velocityThreshold = 1.0 * b2Settings.b2_lengthUnitsPerMeter / b2Settings.b2_timeUnitsPerSecond;
b2Settings.b2_maxLinearCorrection = 0.2 * b2Settings.b2_lengthUnitsPerMeter;
b2Settings.b2_maxAngularCorrection = 8.0 / 180.0 * b2Settings.b2_pi;
b2Settings.b2_contactBaumgarte = 0.2;
b2Settings.b2_timeToSleep = 0.5 * b2Settings.b2_timeUnitsPerSecond;
b2Settings.b2_linearSleepTolerance = 0.01 * b2Settings.b2_lengthUnitsPerMeter / b2Settings.b2_timeUnitsPerSecond;
b2Settings.b2_angularSleepTolerance = 2.0 / 180.0 / b2Settings.b2_timeUnitsPerSecond;
b2Settings.b2Assert = function(a)
	{
		if (!a){
			var nullVec;
			nullVec.x++;
		}
	};
/*
* Copyright (c) 2006-2007 Erin Catto http:
*
* This software is provided 'as-is', without any express or implied
* warranty.  In no event will the authors be held liable for any damages
* arising from the use of this software.
* Permission is granted to anyone to use this software for any purpose,
* including commercial applications, and to alter it and redistribute it
* freely, subject to the following restrictions:
* 1. The origin of this software must not be misrepresented; you must not
* claim that you wrote the original software. If you use this software
* in a product, an acknowledgment in the product documentation would be
* appreciated but is not required.
* 2. Altered source versions must be plainly marked, and must not be
* misrepresented the original software.
* 3. This notice may not be removed or altered from any source distribution.
*/





// b2Vec2 has no constructor so that it
// can be placed in a union.
var b2Vec2 = Class.create();
b2Vec2.prototype = 
{
	initialize: function(x_, y_) {this.x=x_; this.y=y_;},

	SetZero: function() { this.x = 0.0; this.y = 0.0; },
	Set: function(x_, y_) {this.x=x_; this.y=y_;},
	SetV: function(v) {this.x=v.x; this.y=v.y;},

	Negative: function(){ return new b2Vec2(-this.x, -this.y); },


	Copy: function(){
		return new b2Vec2(this.x,this.y);
	},

	Add: function(v)
	{
		this.x += v.x; this.y += v.y;
	},

	Subtract: function(v)
	{
		this.x -= v.x; this.y -= v.y;
	},

	Multiply: function(a)
	{
		this.x *= a; this.y *= a;
	},

	MulM: function(A)
	{
		var tX = this.x;
		this.x = A.col1.x * tX + A.col2.x * this.y;
		this.y = A.col1.y * tX + A.col2.y * this.y;
	},

	MulTM: function(A)
	{
		var tX = b2Math.b2Dot(this, A.col1);
		this.y = b2Math.b2Dot(this, A.col2);
		this.x = tX;
	},

	CrossVF: function(s)
	{
		var tX = this.x;
		this.x = s * this.y;
		this.y = -s * tX;
	},

	CrossFV: function(s)
	{
		var tX = this.x;
		this.x = -s * this.y;
		this.y = s * tX;
	},

	MinV: function(b)
	{
		this.x = this.x < b.x ? this.x : b.x;
		this.y = this.y < b.y ? this.y : b.y;
	},

	MaxV: function(b)
	{
		this.x = this.x > b.x ? this.x : b.x;
		this.y = this.y > b.y ? this.y : b.y;
	},

	Abs: function()
	{
		this.x = Math.abs(this.x);
		this.y = Math.abs(this.y);
	},

	Length: function()
	{
		return Math.sqrt(this.x * this.x + this.y * this.y);
	},

	Normalize: function()
	{
		var length = this.Length();
		if (length < Number.MIN_VALUE)
		{
			return 0.0;
		}
		var invLength = 1.0 / length;
		this.x *= invLength;
		this.y *= invLength;

		return length;
	},

	IsValid: function()
	{
		return b2Math.b2IsValid(this.x) && b2Math.b2IsValid(this.y);
	},

	x: null,
	y: null};
b2Vec2.Make = function(x_, y_)
	{
		return new b2Vec2(x_, y_);
	};
/*
* Copyright (c) 2006-2007 Erin Catto http:
*
* This software is provided 'as-is', without any express or implied
* warranty.  In no event will the authors be held liable for any damages
* arising from the use of this software.
* Permission is granted to anyone to use this software for any purpose,
* including commercial applications, and to alter it and redistribute it
* freely, subject to the following restrictions:
* 1. The origin of this software must not be misrepresented; you must not
* claim that you wrote the original software. If you use this software
* in a product, an acknowledgment in the product documentation would be
* appreciated but is not required.
* 2. Altered source versions must be plainly marked, and must not be
* misrepresented the original software.
* 3. This notice may not be removed or altered from any source distribution.
*/





var b2Mat22 = Class.create();
b2Mat22.prototype = 
{
	initialize: function(angle, c1, c2)
	{
		if (angle==null) angle = 0;
		// initialize instance variables for references
		this.col1 = new b2Vec2();
		this.col2 = new b2Vec2();
		//

		if (c1!=null && c2!=null){
			this.col1.SetV(c1);
			this.col2.SetV(c2);
		}
		else{
			var c = Math.cos(angle);
			var s = Math.sin(angle);
			this.col1.x = c; this.col2.x = -s;
			this.col1.y = s; this.col2.y = c;
		}
	},

	Set: function(angle)
	{
		var c = Math.cos(angle);
		var s = Math.sin(angle);
		this.col1.x = c; this.col2.x = -s;
		this.col1.y = s; this.col2.y = c;
	},

	SetVV: function(c1, c2)
	{
		this.col1.SetV(c1);
		this.col2.SetV(c2);
	},

	Copy: function(){
		return new b2Mat22(0, this.col1, this.col2);
	},

	SetM: function(m)
	{
		this.col1.SetV(m.col1);
		this.col2.SetV(m.col2);
	},

	AddM: function(m)
	{
		this.col1.x += m.col1.x;
		this.col1.y += m.col1.y;
		this.col2.x += m.col2.x;
		this.col2.y += m.col2.y;
	},

	SetIdentity: function()
	{
		this.col1.x = 1.0; this.col2.x = 0.0;
		this.col1.y = 0.0; this.col2.y = 1.0;
	},

	SetZero: function()
	{
		this.col1.x = 0.0; this.col2.x = 0.0;
		this.col1.y = 0.0; this.col2.y = 0.0;
	},

	Invert: function(out)
	{
		var a = this.col1.x;
		var b = this.col2.x;
		var c = this.col1.y;
		var d = this.col2.y;
		//var B = new b2Mat22();
		var det = a * d - b * c;
		//b2Settings.b2Assert(det != 0.0);
		det = 1.0 / det;
		out.col1.x =  det * d;	out.col2.x = -det * b;
		out.col1.y = -det * c;	out.col2.y =  det * a;
		return out;
	},

	// this.Solve A * x = b
	Solve: function(out, bX, bY)
	{
		//float32 a11 = this.col1.x, a12 = this.col2.x, a21 = this.col1.y, a22 = this.col2.y;
		var a11 = this.col1.x;
		var a12 = this.col2.x;
		var a21 = this.col1.y;
		var a22 = this.col2.y;
		//float32 det = a11 * a22 - a12 * a21;
		var det = a11 * a22 - a12 * a21;
		//b2Settings.b2Assert(det != 0.0);
		det = 1.0 / det;
		out.x = det * (a22 * bX - a12 * bY);
		out.y = det * (a11 * bY - a21 * bX);

		return out;
	},

	Abs: function()
	{
		this.col1.Abs();
		this.col2.Abs();
	},

	col1: new b2Vec2(),
	col2: new b2Vec2()};
/*
* Copyright (c) 2006-2007 Erin Catto http:
*
* This software is provided 'as-is', without any express or implied
* warranty.  In no event will the authors be held liable for any damages
* arising from the use of this software.
* Permission is granted to anyone to use this software for any purpose,
* including commercial applications, and to alter it and redistribute it
* freely, subject to the following restrictions:
* 1. The origin of this software must not be misrepresented; you must not
* claim that you wrote the original software. If you use this software
* in a product, an acknowledgment in the product documentation would be
* appreciated but is not required.
* 2. Altered source versions must be plainly marked, and must not be
* misrepresented the original software.
* 3. This notice may not be removed or altered from any source distribution.
*/



var b2Math = Class.create();
b2Math.prototype = {


	/*static public function b2InvSqrt(x)
	{
		float32 xhalf = 0.5f * x;
		int32 i = *(int32*)&x;
		i = 0x5f3759df - (i >> 1);
		x = *(float32*)&i;
		x = x * (1.5f - xhalf * x * x);
		return x;
	}*/











	// A * B

	// A^T * B











	// b2Math.b2Random number in range [-1,1]

	/*inline float32 b2Math.b2Random(float32 lo, float32 hi)
	{
		float32 r = (float32)rand();
		r /= RAND_MAX;
		r = (hi - lo) * r + lo;
		return r;
	}*/

	// "Next Largest Power of 2
	// Given a binary integer value x, the next largest power of 2 can be computed by a SWAR algorithm
	// that recursively "folds" the upper bits into the lower bits. This process yields a bit vector with
	// the same most significant 1, but all 1's below it. Adding 1 to that value yields the next
	// largest power of 2. For a 32-bit value:"



	// Temp vector functions to reduce calls to 'new'
	/*static public var tempVec = new b2Vec2();


	static public var tempAABB = new b2AABB();	*/



	initialize: function() {}}
b2Math.b2IsValid = function(x)
	{
		return isFinite(x);
	};
b2Math.b2Dot = function(a, b)
	{
		return a.x * b.x + a.y * b.y;
	};
b2Math.b2CrossVV = function(a, b)
	{
		return a.x * b.y - a.y * b.x;
	};
b2Math.b2CrossVF = function(a, s)
	{
		var v = new b2Vec2(s * a.y, -s * a.x);
		return v;
	};
b2Math.b2CrossFV = function(s, a)
	{
		var v = new b2Vec2(-s * a.y, s * a.x);
		return v;
	};
b2Math.b2MulMV = function(A, v)
	{
		var u = new b2Vec2(A.col1.x * v.x + A.col2.x * v.y, A.col1.y * v.x + A.col2.y * v.y);
		return u;
	};
b2Math.b2MulTMV = function(A, v)
	{
		var u = new b2Vec2(b2Math.b2Dot(v, A.col1), b2Math.b2Dot(v, A.col2));
		return u;
	};
b2Math.AddVV = function(a, b)
	{
		var v = new b2Vec2(a.x + b.x, a.y + b.y);
		return v;
	};
b2Math.SubtractVV = function(a, b)
	{
		var v = new b2Vec2(a.x - b.x, a.y - b.y);
		return v;
	};
b2Math.MulFV = function(s, a)
	{
		var v = new b2Vec2(s * a.x, s * a.y);
		return v;
	};
b2Math.AddMM = function(A, B)
	{
		var C = new b2Mat22(0, b2Math.AddVV(A.col1, B.col1), b2Math.AddVV(A.col2, B.col2));
		return C;
	};
b2Math.b2MulMM = function(A, B)
	{
		var C = new b2Mat22(0, b2Math.b2MulMV(A, B.col1), b2Math.b2MulMV(A, B.col2));
		return C;
	};
b2Math.b2MulTMM = function(A, B)
	{
		var c1 = new b2Vec2(b2Math.b2Dot(A.col1, B.col1), b2Math.b2Dot(A.col2, B.col1));
		var c2 = new b2Vec2(b2Math.b2Dot(A.col1, B.col2), b2Math.b2Dot(A.col2, B.col2));
		var C = new b2Mat22(0, c1, c2);
		return C;
	};
b2Math.b2Abs = function(a)
	{
		return a > 0.0 ? a : -a;
	};
b2Math.b2AbsV = function(a)
	{
		var b = new b2Vec2(b2Math.b2Abs(a.x), b2Math.b2Abs(a.y));
		return b;
	};
b2Math.b2AbsM = function(A)
	{
		var B = new b2Mat22(0, b2Math.b2AbsV(A.col1), b2Math.b2AbsV(A.col2));
		return B;
	};
b2Math.b2Min = function(a, b)
	{
		return a < b ? a : b;
	};
b2Math.b2MinV = function(a, b)
	{
		var c = new b2Vec2(b2Math.b2Min(a.x, b.x), b2Math.b2Min(a.y, b.y));
		return c;
	};
b2Math.b2Max = function(a, b)
	{
		return a > b ? a : b;
	};
b2Math.b2MaxV = function(a, b)
	{
		var c = new b2Vec2(b2Math.b2Max(a.x, b.x), b2Math.b2Max(a.y, b.y));
		return c;
	};
b2Math.b2Clamp = function(a, low, high)
	{
		return b2Math.b2Max(low, b2Math.b2Min(a, high));
	};
b2Math.b2ClampV = function(a, low, high)
	{
		return b2Math.b2MaxV(low, b2Math.b2MinV(a, high));
	};
b2Math.b2Swap = function(a, b)
	{
		var tmp = a[0];
		a[0] = b[0];
		b[0] = tmp;
	};
b2Math.b2Random = function()
	{
		return Math.random() * 2 - 1;
	};
b2Math.b2NextPowerOfTwo = function(x)
	{
		x |= (x >> 1) & 0x7FFFFFFF;
		x |= (x >> 2) & 0x3FFFFFFF;
		x |= (x >> 4) & 0x0FFFFFFF;
		x |= (x >> 8) & 0x00FFFFFF;
		x |= (x >> 16)& 0x0000FFFF;
		return x + 1;
	};
b2Math.b2IsPowerOfTwo = function(x)
	{
		var result = x > 0 && (x & (x - 1)) == 0;
		return result;
	};
b2Math.tempVec2 = new b2Vec2();
b2Math.tempVec3 = new b2Vec2();
b2Math.tempVec4 = new b2Vec2();
b2Math.tempVec5 = new b2Vec2();
b2Math.tempMat = new b2Mat22();
/*
* Copyright (c) 2006-2007 Erin Catto http:
*
* This software is provided 'as-is', without any express or implied
* warranty.  In no event will the authors be held liable for any damages
* arising from the use of this software.
* Permission is granted to anyone to use this software for any purpose,
* including commercial applications, and to alter it and redistribute it
* freely, subject to the following restrictions:
* 1. The origin of this software must not be misrepresented; you must not
* claim that you wrote the original software. If you use this software
* in a product, an acknowledgment in the product documentation would be
* appreciated but is not required.
* 2. Altered source versions must be plainly marked, and must not be
* misrepresented the original software.
* 3. This notice may not be removed or altered from any source distribution.
*/



// A manifold for two touching convex shapes.
var b2AABB = Class.create();
b2AABB.prototype = 
{
	IsValid: function(){
		//var d = b2Math.SubtractVV(this.maxVertex, this.minVertex);
		var dX = this.maxVertex.x;
		var dY = this.maxVertex.y;
		dX = this.maxVertex.x;
		dY = this.maxVertex.y;
		dX -= this.minVertex.x;
		dY -= this.minVertex.y;
		var valid = dX >= 0.0 && dY >= 0.0;
		valid = valid && this.minVertex.IsValid() && this.maxVertex.IsValid();
		return valid;
	},

	minVertex: new b2Vec2(),
	maxVertex: new b2Vec2(),
	initialize: function() {
		// initialize instance variables for references
		this.minVertex = new b2Vec2();
		this.maxVertex = new b2Vec2();
		//
}};
/*
* Copyright (c) 2006-2007 Erin Catto http:
*
* This software is provided 'as-is', without any express or implied
* warranty.  In no event will the authors be held liable for any damages
* arising from the use of this software.
* Permission is granted to anyone to use this software for any purpose,
* including commercial applications, and to alter it and redistribute it
* freely, subject to the following restrictions:
* 1. The origin of this software must not be misrepresented; you must not
* claim that you wrote the original software. If you use this software
* in a product, an acknowledgment in the product documentation would be
* appreciated but is not required.
* 2. Altered source versions must be plainly marked, and must not be
* misrepresented the original software.
* 3. This notice may not be removed or altered from any source distribution.
*/



var b2Bound = Class.create();
b2Bound.prototype = {
	IsLower: function(){ return (this.value & 1) == 0; },
	IsUpper: function(){ return (this.value & 1) == 1; },
	Swap: function(b){
		var tempValue = this.value;
		var tempProxyId = this.proxyId;
		var tempStabbingCount = this.stabbingCount;

		this.value = b.value;
		this.proxyId = b.proxyId;
		this.stabbingCount = b.stabbingCount;

		b.value = tempValue;
		b.proxyId = tempProxyId;
		b.stabbingCount = tempStabbingCount;
	},

	value: 0,
	proxyId: 0,
	stabbingCount: 0,

	initialize: function() {}}
/*
* Copyright (c) 2006-2007 Erin Catto http:
*
* This software is provided 'as-is', without any express or implied
* warranty.  In no event will the authors be held liable for any damages
* arising from the use of this software.
* Permission is granted to anyone to use this software for any purpose,
* including commercial applications, and to alter it and redistribute it
* freely, subject to the following restrictions:
* 1. The origin of this software must not be misrepresented; you must not
* claim that you wrote the original software. If you use this software
* in a product, an acknowledgment in the product documentation would be
* appreciated but is not required.
* 2. Altered source versions must be plainly marked, and must not be
* misrepresented the original software.
* 3. This notice may not be removed or altered from any source distribution.
*/



var b2BoundValues = Class.create();
b2BoundValues.prototype = {
	lowerValues: [0,0],
	upperValues: [0,0],

	initialize: function() {
		// initialize instance variables for references
		this.lowerValues = [0,0];
		this.upperValues = [0,0];
		//
}}
/*
* Copyright (c) 2006-2007 Erin Catto http:
*
* This software is provided 'as-is', without any express or implied
* warranty.  In no event will the authors be held liable for any damages
* arising from the use of this software.
* Permission is granted to anyone to use this software for any purpose,
* including commercial applications, and to alter it and redistribute it
* freely, subject to the following restrictions:
* 1. The origin of this software must not be misrepresented; you must not
* claim that you wrote the original software. If you use this software
* in a product, an acknowledgment in the product documentation would be
* appreciated but is not required.
* 2. Altered source versions must be plainly marked, and must not be
* misrepresented the original software.
* 3. This notice may not be removed or altered from any source distribution.
*/

// The pair manager is used by the broad-phase to quickly add/remove/find pairs
// of overlapping proxies. It is based closely on code provided by Pierre Terdiman.
// http:





var b2Pair = Class.create();
b2Pair.prototype = 
{


	SetBuffered: function()	{ this.status |= b2Pair.e_pairBuffered; },
	ClearBuffered: function()	{ this.status &= ~b2Pair.e_pairBuffered; },
	IsBuffered: function(){ return (this.status & b2Pair.e_pairBuffered) == b2Pair.e_pairBuffered; },

	SetRemoved: function()		{ this.status |= b2Pair.e_pairRemoved; },
	ClearRemoved: function()	{ this.status &= ~b2Pair.e_pairRemoved; },
	IsRemoved: function(){ return (this.status & b2Pair.e_pairRemoved) == b2Pair.e_pairRemoved; },

	SetFinal: function()		{ this.status |= b2Pair.e_pairFinal; },
	IsFinal: function(){ return (this.status & b2Pair.e_pairFinal) == b2Pair.e_pairFinal; },

	userData: null,
	proxyId1: 0,
	proxyId2: 0,
	next: 0,
	status: 0,

	// STATIC

	// enum

	initialize: function() {}};
b2Pair.b2_nullPair = b2Settings.USHRT_MAX;
b2Pair.b2_nullProxy = b2Settings.USHRT_MAX;
b2Pair.b2_tableCapacity = b2Settings.b2_maxPairs;
b2Pair.b2_tableMask = b2Pair.b2_tableCapacity - 1;
b2Pair.e_pairBuffered = 0x0001;
b2Pair.e_pairRemoved = 0x0002;
b2Pair.e_pairFinal = 0x0004;
/*
* Copyright (c) 2006-2007 Erin Catto http:
*
* This software is provided 'as-is', without any express or implied
* warranty.  In no event will the authors be held liable for any damages
* arising from the use of this software.
* Permission is granted to anyone to use this software for any purpose,
* including commercial applications, and to alter it and redistribute it
* freely, subject to the following restrictions:
* 1. The origin of this software must not be misrepresented; you must not
* claim that you wrote the original software. If you use this software
* in a product, an acknowledgment in the product documentation would be
* appreciated but is not required.
* 2. Altered source versions must be plainly marked, and must not be
* misrepresented the original software.
* 3. This notice may not be removed or altered from any source distribution.
*/



var b2PairCallback = Class.create();
b2PairCallback.prototype = 
{
	//virtual ~b2PairCallback() {}

	// This returns the new pair user data.
	PairAdded: function(proxyUserData1, proxyUserData2){return null},

	// This should free the pair's user data. In extreme circumstances, it is possible
	// this will be called with null pairUserData because the pair never existed.
	PairRemoved: function(proxyUserData1, proxyUserData2, pairUserData){},
	initialize: function() {}};


/*
* Copyright (c) 2006-2007 Erin Catto http:
*
* This software is provided 'as-is', without any express or implied
* warranty.  In no event will the authors be held liable for any damages
* arising from the use of this software.
* Permission is granted to anyone to use this software for any purpose,
* including commercial applications, and to alter it and redistribute it
* freely, subject to the following restrictions:
* 1. The origin of this software must not be misrepresented; you must not
* claim that you wrote the original software. If you use this software
* in a product, an acknowledgment in the product documentation would be
* appreciated but is not required.
* 2. Altered source versions must be plainly marked, and must not be
* misrepresented the original software.
* 3. This notice may not be removed or altered from any source distribution.
*/



var b2BufferedPair = Class.create();
b2BufferedPair.prototype = {
	proxyId1: 0,
	proxyId2: 0,

	initialize: function() {}}
/*
* Copyright (c) 2006-2007 Erin Catto http:
*
* This software is provided 'as-is', without any express or implied
* warranty.  In no event will the authors be held liable for any damages
* arising from the use of this software.
* Permission is granted to anyone to use this software for any purpose,
* including commercial applications, and to alter it and redistribute it
* freely, subject to the following restrictions:
* 1. The origin of this software must not be misrepresented; you must not
* claim that you wrote the original software. If you use this software
* in a product, an acknowledgment in the product documentation would be
* appreciated but is not required.
* 2. Altered source versions must be plainly marked, and must not be
* misrepresented the original software.
* 3. This notice may not be removed or altered from any source distribution.
*/

// The pair manager is used by the broad-phase to quickly add/remove/find pairs
// of overlapping proxies. It is based closely on code provided by Pierre Terdiman.
// http:





var b2PairManager = Class.create();
b2PairManager.prototype = 
{
//public:
	initialize: function(){
		var i = 0;
		//b2Settings.b2Assert(b2Math.b2IsPowerOfTwo(b2Pair.b2_tableCapacity) == true);
		//b2Settings.b2Assert(b2Pair.b2_tableCapacity >= b2Settings.b2_maxPairs);
		this.m_hashTable = new Array(b2Pair.b2_tableCapacity);
		for (i = 0; i < b2Pair.b2_tableCapacity; ++i)
		{
			this.m_hashTable[i] = b2Pair.b2_nullPair;
		}
		this.m_pairs = new Array(b2Settings.b2_maxPairs);
		for (i = 0; i < b2Settings.b2_maxPairs; ++i)
		{
			this.m_pairs[i] = new b2Pair();
		}
		this.m_pairBuffer = new Array(b2Settings.b2_maxPairs);
		for (i = 0; i < b2Settings.b2_maxPairs; ++i)
		{
			this.m_pairBuffer[i] = new b2BufferedPair();
		}

		for (i = 0; i < b2Settings.b2_maxPairs; ++i)
		{
			this.m_pairs[i].proxyId1 = b2Pair.b2_nullProxy;
			this.m_pairs[i].proxyId2 = b2Pair.b2_nullProxy;
			this.m_pairs[i].userData = null;
			this.m_pairs[i].status = 0;
			this.m_pairs[i].next = (i + 1);
		}
		this.m_pairs[b2Settings.b2_maxPairs-1].next = b2Pair.b2_nullPair;
		this.m_pairCount = 0;
	},
	//~b2PairManager();

	Initialize: function(broadPhase, callback){
		this.m_broadPhase = broadPhase;
		this.m_callback = callback;
	},

	/*
	As proxies are created and moved, many pairs are created and destroyed. Even worse, the same
	pair may be added and removed multiple times in a single time step of the physics engine. To reduce
	traffic in the pair manager, we try to avoid destroying pairs in the pair manager until the
	end of the physics step. This is done by buffering all the this.RemovePair requests. this.AddPair
	requests are processed immediately because we need the hash table entry for quick lookup.

	All user user callbacks are delayed until the buffered pairs are confirmed in this.Commit.
	This is very important because the user callbacks may be very expensive and client logic
	may be harmed if pairs are added and removed within the same time step.

	Buffer a pair for addition.
	We may add a pair that is not in the pair manager or pair buffer.
	We may add a pair that is already in the pair manager and pair buffer.
	If the added pair is not a new pair, then it must be in the pair buffer (because this.RemovePair was called).
	*/
	AddBufferedPair: function(proxyId1, proxyId2){
		//b2Settings.b2Assert(id1 != b2_nullProxy && id2 != b2_nullProxy);
		//b2Settings.b2Assert(this.m_pairBufferCount < b2_maxPairs);

		var pair = this.AddPair(proxyId1, proxyId2);

		// If this pair is not in the pair buffer ...
		if (pair.IsBuffered() == false)
		{
			// This must be a newly added pair.
			//b2Settings.b2Assert(pair.IsFinal() == false);

			// Add it to the pair buffer.
			pair.SetBuffered();
			this.m_pairBuffer[this.m_pairBufferCount].proxyId1 = pair.proxyId1;
			this.m_pairBuffer[this.m_pairBufferCount].proxyId2 = pair.proxyId2;
			++this.m_pairBufferCount;

			//b2Settings.b2Assert(this.m_pairBufferCount <= this.m_pairCount);
		}

		// Confirm this pair for the subsequent call to this.Commit.
		pair.ClearRemoved();

		if (b2BroadPhase.s_validate)
		{
			this.ValidateBuffer();
		}
	},

	// Buffer a pair for removal.
	RemoveBufferedPair: function(proxyId1, proxyId2){
		//b2Settings.b2Assert(id1 != b2_nullProxy && id2 != b2_nullProxy);
		//b2Settings.b2Assert(this.m_pairBufferCount < b2_maxPairs);

		var pair = this.Find(proxyId1, proxyId2);

		if (pair == null)
		{
			// The pair never existed. This is legal (due to collision filtering).
			return;
		}

		// If this pair is not in the pair buffer ...
		if (pair.IsBuffered() == false)
		{
			// This must be an old pair.
			//b2Settings.b2Assert(pair.IsFinal() == true);

			pair.SetBuffered();
			this.m_pairBuffer[this.m_pairBufferCount].proxyId1 = pair.proxyId1;
			this.m_pairBuffer[this.m_pairBufferCount].proxyId2 = pair.proxyId2;
			++this.m_pairBufferCount;

			//b2Settings.b2Assert(this.m_pairBufferCount <= this.m_pairCount);
		}

		pair.SetRemoved();

		if (b2BroadPhase.s_validate)
		{
			this.ValidateBuffer();
		}
	},

	Commit: function(){
		var i = 0;

		var removeCount = 0;

		var proxies = this.m_broadPhase.m_proxyPool;

		for (i = 0; i < this.m_pairBufferCount; ++i)
		{
			var pair = this.Find(this.m_pairBuffer[i].proxyId1, this.m_pairBuffer[i].proxyId2);
			//b2Settings.b2Assert(pair.IsBuffered());
			pair.ClearBuffered();

			//b2Settings.b2Assert(pair.proxyId1 < b2Settings.b2_maxProxies && pair.proxyId2 < b2Settings.b2_maxProxies);

			var proxy1 = proxies[ pair.proxyId1 ];
			var proxy2 = proxies[ pair.proxyId2 ];

			//b2Settings.b2Assert(proxy1.IsValid());
			//b2Settings.b2Assert(proxy2.IsValid());

			if (pair.IsRemoved())
			{
				// It is possible a pair was added then removed before a commit. Therefore,
				// we should be careful not to tell the user the pair was removed when the
				// the user didn't receive a matching add.
				if (pair.IsFinal() == true)
				{
					this.m_callback.PairRemoved(proxy1.userData, proxy2.userData, pair.userData);
				}

				// Store the ids so we can actually remove the pair below.
				this.m_pairBuffer[removeCount].proxyId1 = pair.proxyId1;
				this.m_pairBuffer[removeCount].proxyId2 = pair.proxyId2;
				++removeCount;
			}
			else
			{
				//b2Settings.b2Assert(this.m_broadPhase.TestOverlap(proxy1, proxy2) == true);

				if (pair.IsFinal() == false)
				{
					pair.userData = this.m_callback.PairAdded(proxy1.userData, proxy2.userData);
					pair.SetFinal();
				}
			}
		}

		for (i = 0; i < removeCount; ++i)
		{
			this.RemovePair(this.m_pairBuffer[i].proxyId1, this.m_pairBuffer[i].proxyId2);
		}

		this.m_pairBufferCount = 0;

		if (b2BroadPhase.s_validate)
		{
			this.ValidateTable();
		}
	},

//private:

	// Add a pair and return the new pair. If the pair already exists,
	// no new pair is created and the old one is returned.
	AddPair: function(proxyId1, proxyId2){

		if (proxyId1 > proxyId2){
			var temp = proxyId1;
			proxyId1 = proxyId2;
			proxyId2 = temp;
			//b2Math.b2Swap(p1, p2);
		}

		var hash = b2PairManager.Hash(proxyId1, proxyId2) & b2Pair.b2_tableMask;

		//var pairIndex = this.FindHash(proxyId1, proxyId2, hash);
		var pair = pair = this.FindHash(proxyId1, proxyId2, hash);

		if (pair != null)
		{
			return pair;
		}

		//b2Settings.b2Assert(this.m_pairCount < b2Settings.b2_maxPairs && this.m_freePair != b2_nullPair);

		var pIndex = this.m_freePair;
		pair = this.m_pairs[pIndex];
		this.m_freePair = pair.next;

		pair.proxyId1 = proxyId1;
		pair.proxyId2 = proxyId2;
		pair.status = 0;
		pair.userData = null;
		pair.next = this.m_hashTable[hash];

		this.m_hashTable[hash] = pIndex;

		++this.m_pairCount;

		return pair;
	},

	// Remove a pair, return the pair's userData.
	RemovePair: function(proxyId1, proxyId2){

		//b2Settings.b2Assert(this.m_pairCount > 0);

		if (proxyId1 > proxyId2){
			var temp = proxyId1;
			proxyId1 = proxyId2;
			proxyId2 = temp;
			//b2Math.b2Swap(proxyId1, proxyId2);
		}

		var hash = b2PairManager.Hash(proxyId1, proxyId2) & b2Pair.b2_tableMask;

		var node = this.m_hashTable[hash];
		var pNode = null;

		while (node != b2Pair.b2_nullPair)
		{
			if (b2PairManager.Equals(this.m_pairs[node], proxyId1, proxyId2))
			{
				var index = node;

				//*node = this.m_pairs[*node].next;
				if (pNode){
					pNode.next = this.m_pairs[node].next;
				}
				else{
					this.m_hashTable[hash] = this.m_pairs[node].next;
				}

				var pair = this.m_pairs[ index ];
				var userData = pair.userData;

				// Scrub
				pair.next = this.m_freePair;
				pair.proxyId1 = b2Pair.b2_nullProxy;
				pair.proxyId2 = b2Pair.b2_nullProxy;
				pair.userData = null;
				pair.status = 0;

				this.m_freePair = index;
				--this.m_pairCount;
				return userData;
			}
			else
			{
				//node = &this.m_pairs[*node].next;
				pNode = this.m_pairs[node];
				node = pNode.next;
			}
		}

		//b2Settings.b2Assert(false);
		return null;
	},

	Find: function(proxyId1, proxyId2){

		if (proxyId1 > proxyId2){
			var temp = proxyId1;
			proxyId1 = proxyId2;
			proxyId2 = temp;
			//b2Math.b2Swap(proxyId1, proxyId2);
		}

		var hash = b2PairManager.Hash(proxyId1, proxyId2) & b2Pair.b2_tableMask;

		return this.FindHash(proxyId1, proxyId2, hash);
	},
	FindHash: function(proxyId1, proxyId2, hash){
		var index = this.m_hashTable[hash];

		while( index != b2Pair.b2_nullPair && b2PairManager.Equals(this.m_pairs[index], proxyId1, proxyId2) == false)
		{
			index = this.m_pairs[index].next;
		}

		if ( index == b2Pair.b2_nullPair )
		{
			return null;
		}

		//b2Settings.b2Assert(index < b2_maxPairs);

		return this.m_pairs[ index ];
	},

	ValidateBuffer: function(){
		// DEBUG
	},

	ValidateTable: function(){
		// DEBUG
	},

//public:
	m_broadPhase: null,
	m_callback: null,
	m_pairs: null,
	m_freePair: 0,
	m_pairCount: 0,

	m_pairBuffer: null,
	m_pairBufferCount: 0,

	m_hashTable: null


// static
	// Thomas Wang's hash, see: http:



};
b2PairManager.Hash = function(proxyId1, proxyId2)
	{
		var key = ((proxyId2 << 16) & 0xffff0000) | proxyId1;
		key = ~key + ((key << 15) & 0xFFFF8000);
		key = key ^ ((key >> 12) & 0x000fffff);
		key = key + ((key << 2) & 0xFFFFFFFC);
		key = key ^ ((key >> 4) & 0x0fffffff);
		key = key * 2057;
		key = key ^ ((key >> 16) & 0x0000ffff);
		return key;
	};
b2PairManager.Equals = function(pair, proxyId1, proxyId2)
	{
		return (pair.proxyId1 == proxyId1 && pair.proxyId2 == proxyId2);
	};
b2PairManager.EqualsPair = function(pair1, pair2)
	{
		return pair1.proxyId1 == pair2.proxyId1 && pair1.proxyId2 == pair2.proxyId2;
	};
/*
* Copyright (c) 2006-2007 Erin Catto http:
*
* This software is provided 'as-is', without any express or implied
* warranty.  In no event will the authors be held liable for any damages
* arising from the use of this software.
* Permission is granted to anyone to use this software for any purpose,
* including commercial applications, and to alter it and redistribute it
* freely, subject to the following restrictions:
* 1. The origin of this software must not be misrepresented; you must not
* claim that you wrote the original software. If you use this software
* in a product, an acknowledgment in the product documentation would be
* appreciated but is not required.
* 2. Altered source versions must be plainly marked, and must not be
* misrepresented the original software.
* 3. This notice may not be removed or altered from any source distribution.
*/





/*
This broad phase uses the Sweep and Prune algorithm in:
Collision Detection in Interactive 3D Environments by Gino van den Bergen
Also, some ideas, such integral values for fast compares comes from
Bullet (http:/www.bulletphysics.com).
*/


// Notes:
// - we use bound arrays instead of linked lists for cache coherence.
// - we use quantized integral values for fast compares.
// - we use short indices rather than pointers to save memory.
// - we use a stabbing count for fast overlap queries (less than order N).
// - we also use a time stamp on each proxy to speed up the registration of
//   overlap query results.
// - where possible, we compare bound indices instead of values to reduce
//   cache misses (TODO_ERIN).
// - no broadphase is perfect and neither is this one: it is not great for huge
//   worlds (use a multi-SAP instead), it is not great for large objects.

var b2BroadPhase = Class.create();
b2BroadPhase.prototype = 
{
//public:
	initialize: function(worldAABB, callback){
		// initialize instance variables for references
		this.m_pairManager = new b2PairManager();
		this.m_proxyPool = new Array(b2Settings.b2_maxPairs);
		this.m_bounds = new Array(2*b2Settings.b2_maxProxies);
		this.m_queryResults = new Array(b2Settings.b2_maxProxies);
		this.m_quantizationFactor = new b2Vec2();
		//

		//b2Settings.b2Assert(worldAABB.IsValid());
		var i = 0;

		this.m_pairManager.Initialize(this, callback);

		this.m_worldAABB = worldAABB;

		this.m_proxyCount = 0;

		// query results
		for (i = 0; i < b2Settings.b2_maxProxies; i++){
			this.m_queryResults[i] = 0;
		}

		// bounds array
		this.m_bounds = new Array(2);
		for (i = 0; i < 2; i++){
			this.m_bounds[i] = new Array(2*b2Settings.b2_maxProxies);
			for (var j = 0; j < 2*b2Settings.b2_maxProxies; j++){
				this.m_bounds[i][j] = new b2Bound();
			}
		}

		//var d = b2Math.SubtractVV(worldAABB.maxVertex, worldAABB.minVertex);
		var dX = worldAABB.maxVertex.x;
		var dY = worldAABB.maxVertex.y;
		dX -= worldAABB.minVertex.x;
		dY -= worldAABB.minVertex.y;

		this.m_quantizationFactor.x = b2Settings.USHRT_MAX / dX;
		this.m_quantizationFactor.y = b2Settings.USHRT_MAX / dY;

		var tProxy;
		for (i = 0; i < b2Settings.b2_maxProxies - 1; ++i)
		{
			tProxy = new b2Proxy();
			this.m_proxyPool[i] = tProxy;
			tProxy.SetNext(i + 1);
			tProxy.timeStamp = 0;
			tProxy.overlapCount = b2BroadPhase.b2_invalid;
			tProxy.userData = null;
		}
		tProxy = new b2Proxy();
		this.m_proxyPool[b2Settings.b2_maxProxies-1] = tProxy;
		tProxy.SetNext(b2Pair.b2_nullProxy);
		tProxy.timeStamp = 0;
		tProxy.overlapCount = b2BroadPhase.b2_invalid;
		tProxy.userData = null;
		this.m_freeProxy = 0;

		this.m_timeStamp = 1;
		this.m_queryResultCount = 0;
	},
	//~b2BroadPhase();

	// Use this to see if your proxy is in range. If it is not in range,
	// it should be destroyed. Otherwise you may get O(m^2) pairs, where m
	// is the number of proxies that are out of range.
	InRange: function(aabb){
		//var d = b2Math.b2MaxV(b2Math.SubtractVV(aabb.minVertex, this.m_worldAABB.maxVertex), b2Math.SubtractVV(this.m_worldAABB.minVertex, aabb.maxVertex));
		var dX;
		var dY;
		var d2X;
		var d2Y;

		dX = aabb.minVertex.x;
		dY = aabb.minVertex.y;
		dX -= this.m_worldAABB.maxVertex.x;
		dY -= this.m_worldAABB.maxVertex.y;

		d2X = this.m_worldAABB.minVertex.x;
		d2Y = this.m_worldAABB.minVertex.y;
		d2X -= aabb.maxVertex.x;
		d2Y -= aabb.maxVertex.y;

		dX = b2Math.b2Max(dX, d2X);
		dY = b2Math.b2Max(dY, d2Y);

		return b2Math.b2Max(dX, dY) < 0.0;
	},

	// Get a single proxy. Returns NULL if the id is invalid.
	GetProxy: function(proxyId){
		if (proxyId == b2Pair.b2_nullProxy || this.m_proxyPool[proxyId].IsValid() == false)
		{
			return null;
		}

		return this.m_proxyPool[ proxyId ];
	},

	// Create and destroy proxies. These call Flush first.
	CreateProxy: function(aabb, userData){
		var index = 0;
		var proxy;

		//b2Settings.b2Assert(this.m_proxyCount < b2_maxProxies);
		//b2Settings.b2Assert(this.m_freeProxy != b2Pair.b2_nullProxy);

		var proxyId = this.m_freeProxy;
		proxy = this.m_proxyPool[ proxyId ];
		this.m_freeProxy = proxy.GetNext();

		proxy.overlapCount = 0;
		proxy.userData = userData;

		var boundCount = 2 * this.m_proxyCount;

		var lowerValues = new Array();
		var upperValues = new Array();
		this.ComputeBounds(lowerValues, upperValues, aabb);

		for (var axis = 0; axis < 2; ++axis)
		{
			var bounds = this.m_bounds[axis];
			var lowerIndex = 0;
			var upperIndex = 0;
			var lowerIndexOut = [lowerIndex];
			var upperIndexOut = [upperIndex];
			this.Query(lowerIndexOut, upperIndexOut, lowerValues[axis], upperValues[axis], bounds, boundCount, axis);
			lowerIndex = lowerIndexOut[0];
			upperIndex = upperIndexOut[0];

			// Replace memmove calls
			//memmove(bounds + upperIndex + 2, bounds + upperIndex, (edgeCount - upperIndex) * sizeof(b2Bound));
			var tArr = new Array();
			var j = 0;
			var tEnd = boundCount - upperIndex
			var tBound1;
			var tBound2;
			// make temp array
			for (j = 0; j < tEnd; j++){
				tArr[j] = new b2Bound();
				tBound1 = tArr[j];
				tBound2 = bounds[upperIndex+j];
				tBound1.value = tBound2.value;
				tBound1.proxyId = tBound2.proxyId;
				tBound1.stabbingCount = tBound2.stabbingCount;
			}
			// move temp array back in to bounds
			tEnd = tArr.length;
			var tIndex = upperIndex+2;
			for (j = 0; j < tEnd; j++){
				//bounds[tIndex+j] = tArr[j];
				tBound2 = tArr[j];
				tBound1 = bounds[tIndex+j]
				tBound1.value = tBound2.value;
				tBound1.proxyId = tBound2.proxyId;
				tBound1.stabbingCount = tBound2.stabbingCount;
			}
			//memmove(bounds + lowerIndex + 1, bounds + lowerIndex, (upperIndex - lowerIndex) * sizeof(b2Bound));
			// make temp array
			tArr = new Array();
			tEnd = upperIndex - lowerIndex;
			for (j = 0; j < tEnd; j++){
				tArr[j] = new b2Bound();
				tBound1 = tArr[j];
				tBound2 = bounds[lowerIndex+j];
				tBound1.value = tBound2.value;
				tBound1.proxyId = tBound2.proxyId;
				tBound1.stabbingCount = tBound2.stabbingCount;
			}
			// move temp array back in to bounds
			tEnd = tArr.length;
			tIndex = lowerIndex+1;
			for (j = 0; j < tEnd; j++){
				//bounds[tIndex+j] = tArr[j];
				tBound2 = tArr[j];
				tBound1 = bounds[tIndex+j]
				tBound1.value = tBound2.value;
				tBound1.proxyId = tBound2.proxyId;
				tBound1.stabbingCount = tBound2.stabbingCount;
			}

			// The upper index has increased because of the lower bound insertion.
			++upperIndex;

			// Copy in the new bounds.
			bounds[lowerIndex].value = lowerValues[axis];
			bounds[lowerIndex].proxyId = proxyId;
			bounds[upperIndex].value = upperValues[axis];
			bounds[upperIndex].proxyId = proxyId;

			bounds[lowerIndex].stabbingCount = lowerIndex == 0 ? 0 : bounds[lowerIndex-1].stabbingCount;
			bounds[upperIndex].stabbingCount = bounds[upperIndex-1].stabbingCount;

			// Adjust the stabbing count between the new bounds.
			for (index = lowerIndex; index < upperIndex; ++index)
			{
				bounds[index].stabbingCount++;
			}

			// Adjust the all the affected bound indices.
			for (index = lowerIndex; index < boundCount + 2; ++index)
			{
				var proxy2 = this.m_proxyPool[ bounds[index].proxyId ];
				if (bounds[index].IsLower())
				{
					proxy2.lowerBounds[axis] = index;
				}
				else
				{
					proxy2.upperBounds[axis] = index;
				}
			}
		}

		++this.m_proxyCount;

		//b2Settings.b2Assert(this.m_queryResultCount < b2Settings.b2_maxProxies);

		for (var i = 0; i < this.m_queryResultCount; ++i)
		{
			//b2Settings.b2Assert(this.m_queryResults[i] < b2_maxProxies);
			//b2Settings.b2Assert(this.m_proxyPool[this.m_queryResults[i]].IsValid());

			this.m_pairManager.AddBufferedPair(proxyId, this.m_queryResults[i]);
		}

		this.m_pairManager.Commit();

		// Prepare for next query.
		this.m_queryResultCount = 0;
		this.IncrementTimeStamp();

		return proxyId;
	},

	DestroyProxy: function(proxyId){

		//b2Settings.b2Assert(0 < this.m_proxyCount && this.m_proxyCount <= b2_maxProxies);

		var proxy = this.m_proxyPool[ proxyId ];
		//b2Settings.b2Assert(proxy.IsValid());

		var boundCount = 2 * this.m_proxyCount;

		for (var axis = 0; axis < 2; ++axis)
		{
			var bounds = this.m_bounds[axis];

			var lowerIndex = proxy.lowerBounds[axis];
			var upperIndex = proxy.upperBounds[axis];
			var lowerValue = bounds[lowerIndex].value;
			var upperValue = bounds[upperIndex].value;

			// replace memmove calls
			//memmove(bounds + lowerIndex, bounds + lowerIndex + 1, (upperIndex - lowerIndex - 1) * sizeof(b2Bound));
			var tArr = new Array();
			var j = 0;
			var tEnd = upperIndex - lowerIndex - 1;
			var tBound1;
			var tBound2;
			// make temp array
			for (j = 0; j < tEnd; j++){
				tArr[j] = new b2Bound();
				tBound1 = tArr[j];
				tBound2 = bounds[lowerIndex+1+j];
				tBound1.value = tBound2.value;
				tBound1.proxyId = tBound2.proxyId;
				tBound1.stabbingCount = tBound2.stabbingCount;
			}
			// move temp array back in to bounds
			tEnd = tArr.length;
			var tIndex = lowerIndex;
			for (j = 0; j < tEnd; j++){
				//bounds[tIndex+j] = tArr[j];
				tBound2 = tArr[j];
				tBound1 = bounds[tIndex+j]
				tBound1.value = tBound2.value;
				tBound1.proxyId = tBound2.proxyId;
				tBound1.stabbingCount = tBound2.stabbingCount;
			}
			//memmove(bounds + upperIndex-1, bounds + upperIndex + 1, (edgeCount - upperIndex - 1) * sizeof(b2Bound));
			// make temp array
			tArr = new Array();
			tEnd = boundCount - upperIndex - 1;
			for (j = 0; j < tEnd; j++){
				tArr[j] = new b2Bound();
				tBound1 = tArr[j];
				tBound2 = bounds[upperIndex+1+j];
				tBound1.value = tBound2.value;
				tBound1.proxyId = tBound2.proxyId;
				tBound1.stabbingCount = tBound2.stabbingCount;
			}
			// move temp array back in to bounds
			tEnd = tArr.length;
			tIndex = upperIndex-1;
			for (j = 0; j < tEnd; j++){
				//bounds[tIndex+j] = tArr[j];
				tBound2 = tArr[j];
				tBound1 = bounds[tIndex+j]
				tBound1.value = tBound2.value;
				tBound1.proxyId = tBound2.proxyId;
				tBound1.stabbingCount = tBound2.stabbingCount;
			}

			// Fix bound indices.
			tEnd = boundCount - 2;
			for (var index = lowerIndex; index < tEnd; ++index)
			{
				var proxy2 = this.m_proxyPool[ bounds[index].proxyId ];
				if (bounds[index].IsLower())
				{
					proxy2.lowerBounds[axis] = index;
				}
				else
				{
					proxy2.upperBounds[axis] = index;
				}
			}

			// Fix stabbing count.
			tEnd = upperIndex - 1;
			for (var index2 = lowerIndex; index2 < tEnd; ++index2)
			{
				bounds[index2].stabbingCount--;
			}

			// this.Query for pairs to be removed. lowerIndex and upperIndex are not needed.
			// make lowerIndex and upper output using an array and do this for others if compiler doesn't pick them up
			this.Query([0], [0], lowerValue, upperValue, bounds, boundCount - 2, axis);
		}

		//b2Settings.b2Assert(this.m_queryResultCount < b2Settings.b2_maxProxies);

		for (var i = 0; i < this.m_queryResultCount; ++i)
		{
			//b2Settings.b2Assert(this.m_proxyPool[this.m_queryResults[i]].IsValid());

			this.m_pairManager.RemoveBufferedPair(proxyId, this.m_queryResults[i]);
		}

		this.m_pairManager.Commit();

		// Prepare for next query.
		this.m_queryResultCount = 0;
		this.IncrementTimeStamp();

		// Return the proxy to the pool.
		proxy.userData = null;
		proxy.overlapCount = b2BroadPhase.b2_invalid;
		proxy.lowerBounds[0] = b2BroadPhase.b2_invalid;
		proxy.lowerBounds[1] = b2BroadPhase.b2_invalid;
		proxy.upperBounds[0] = b2BroadPhase.b2_invalid;
		proxy.upperBounds[1] = b2BroadPhase.b2_invalid;

		proxy.SetNext(this.m_freeProxy);
		this.m_freeProxy = proxyId;
		--this.m_proxyCount;
	},


	// Call this.MoveProxy times like, then when you are done
	// call this.Commit to finalized the proxy pairs (for your time step).
	MoveProxy: function(proxyId, aabb){
		var axis = 0;
		var index = 0;
		var bound;
		var prevBound
		var nextBound
		var nextProxyId = 0;
		var nextProxy;

		if (proxyId == b2Pair.b2_nullProxy || b2Settings.b2_maxProxies <= proxyId)
		{
			//b2Settings.b2Assert(false);
			return;
		}

		if (aabb.IsValid() == false)
		{
			//b2Settings.b2Assert(false);
			return;
		}

		var boundCount = 2 * this.m_proxyCount;

		var proxy = this.m_proxyPool[ proxyId ];
		// Get new bound values
		var newValues = new b2BoundValues();
		this.ComputeBounds(newValues.lowerValues, newValues.upperValues, aabb);

		// Get old bound values
		var oldValues = new b2BoundValues();
		for (axis = 0; axis < 2; ++axis)
		{
			oldValues.lowerValues[axis] = this.m_bounds[axis][proxy.lowerBounds[axis]].value;
			oldValues.upperValues[axis] = this.m_bounds[axis][proxy.upperBounds[axis]].value;
		}

		for (axis = 0; axis < 2; ++axis)
		{
			var bounds = this.m_bounds[axis];

			var lowerIndex = proxy.lowerBounds[axis];
			var upperIndex = proxy.upperBounds[axis];

			var lowerValue = newValues.lowerValues[axis];
			var upperValue = newValues.upperValues[axis];

			var deltaLower = lowerValue - bounds[lowerIndex].value;
			var deltaUpper = upperValue - bounds[upperIndex].value;

			bounds[lowerIndex].value = lowerValue;
			bounds[upperIndex].value = upperValue;

			//
			// Expanding adds overlaps
			//

			// Should we move the lower bound down?
			if (deltaLower < 0)
			{
				index = lowerIndex;
				while (index > 0 && lowerValue < bounds[index-1].value)
				{
					bound = bounds[index];
					prevBound = bounds[index - 1];

					var prevProxyId = prevBound.proxyId;
					var prevProxy = this.m_proxyPool[ prevBound.proxyId ];

					prevBound.stabbingCount++;

					if (prevBound.IsUpper() == true)
					{
						if (this.TestOverlap(newValues, prevProxy))
						{
							this.m_pairManager.AddBufferedPair(proxyId, prevProxyId);
						}

						prevProxy.upperBounds[axis]++;
						bound.stabbingCount++;
					}
					else
					{
						prevProxy.lowerBounds[axis]++;
						bound.stabbingCount--;
					}

					proxy.lowerBounds[axis]--;

					// swap
					//var temp = bound;
					//bound = prevEdge;
					//prevEdge = temp;
					bound.Swap(prevBound);
					//b2Math.b2Swap(bound, prevEdge);
					--index;
				}
			}

			// Should we move the upper bound up?
			if (deltaUpper > 0)
			{
				index = upperIndex;
				while (index < boundCount-1 && bounds[index+1].value <= upperValue)
				{
					bound = bounds[ index ];
					nextBound = bounds[ index + 1 ];
					nextProxyId = nextBound.proxyId;
					nextProxy = this.m_proxyPool[ nextProxyId ];

					nextBound.stabbingCount++;

					if (nextBound.IsLower() == true)
					{
						if (this.TestOverlap(newValues, nextProxy))
						{
							this.m_pairManager.AddBufferedPair(proxyId, nextProxyId);
						}

						nextProxy.lowerBounds[axis]--;
						bound.stabbingCount++;
					}
					else
					{
						nextProxy.upperBounds[axis]--;
						bound.stabbingCount--;
					}

					proxy.upperBounds[axis]++;
					// swap
					//var temp = bound;
					//bound = nextEdge;
					//nextEdge = temp;
					bound.Swap(nextBound);
					//b2Math.b2Swap(bound, nextEdge);
					index++;
				}
			}

			//
			// Shrinking removes overlaps
			//

			// Should we move the lower bound up?
			if (deltaLower > 0)
			{
				index = lowerIndex;
				while (index < boundCount-1 && bounds[index+1].value <= lowerValue)
				{
					bound = bounds[ index ];
					nextBound = bounds[ index + 1 ];

					nextProxyId = nextBound.proxyId;
					nextProxy = this.m_proxyPool[ nextProxyId ];

					nextBound.stabbingCount--;

					if (nextBound.IsUpper())
					{
						if (this.TestOverlap(oldValues, nextProxy))
						{
							this.m_pairManager.RemoveBufferedPair(proxyId, nextProxyId);
						}

						nextProxy.upperBounds[axis]--;
						bound.stabbingCount--;
					}
					else
					{
						nextProxy.lowerBounds[axis]--;
						bound.stabbingCount++;
					}

					proxy.lowerBounds[axis]++;
					// swap
					//var temp = bound;
					//bound = nextEdge;
					//nextEdge = temp;
					bound.Swap(nextBound);
					//b2Math.b2Swap(bound, nextEdge);
					index++;
				}
			}

			// Should we move the upper bound down?
			if (deltaUpper < 0)
			{
				index = upperIndex;
				while (index > 0 && upperValue < bounds[index-1].value)
				{
					bound = bounds[index];
					prevBound = bounds[index - 1];

					prevProxyId = prevBound.proxyId;
					prevProxy = this.m_proxyPool[ prevProxyId ];

					prevBound.stabbingCount--;

					if (prevBound.IsLower() == true)
					{
						if (this.TestOverlap(oldValues, prevProxy))
						{
							this.m_pairManager.RemoveBufferedPair(proxyId, prevProxyId);
						}

						prevProxy.lowerBounds[axis]++;
						bound.stabbingCount--;
					}
					else
					{
						prevProxy.upperBounds[axis]++;
						bound.stabbingCount++;
					}

					proxy.upperBounds[axis]--;
					// swap
					//var temp = bound;
					//bound = prevEdge;
					//prevEdge = temp;
					bound.Swap(prevBound);
					//b2Math.b2Swap(bound, prevEdge);
					index--;
				}
			}
		}
	},

	Commit: function(){
		this.m_pairManager.Commit();
	},

	// this.Query an AABB for overlapping proxies, returns the user data and
	// the count, up to the supplied maximum count.
	QueryAABB: function(aabb, userData, maxCount){
		var lowerValues = new Array();
		var upperValues = new Array();
		this.ComputeBounds(lowerValues, upperValues, aabb);

		var lowerIndex = 0;
		var upperIndex = 0;
		var lowerIndexOut = [lowerIndex];
		var upperIndexOut = [upperIndex];
		this.Query(lowerIndexOut, upperIndexOut, lowerValues[0], upperValues[0], this.m_bounds[0], 2*this.m_proxyCount, 0);
		this.Query(lowerIndexOut, upperIndexOut, lowerValues[1], upperValues[1], this.m_bounds[1], 2*this.m_proxyCount, 1);

		//b2Settings.b2Assert(this.m_queryResultCount < b2Settings.b2_maxProxies);

		var count = 0;
		for (var i = 0; i < this.m_queryResultCount && count < maxCount; ++i, ++count)
		{
			//b2Settings.b2Assert(this.m_queryResults[i] < b2Settings.b2_maxProxies);
			var proxy = this.m_proxyPool[ this.m_queryResults[i] ];
			//b2Settings.b2Assert(proxy.IsValid());
			userData[i] = proxy.userData;
		}

		// Prepare for next query.
		this.m_queryResultCount = 0;
		this.IncrementTimeStamp();

		return count;
	},

	Validate: function(){
		var pair;
		var proxy1;
		var proxy2;
		var overlap;

		for (var axis = 0; axis < 2; ++axis)
		{
			var bounds = this.m_bounds[axis];

			var boundCount = 2 * this.m_proxyCount;
			var stabbingCount = 0;

			for (var i = 0; i < boundCount; ++i)
			{
				var bound = bounds[i];
				//b2Settings.b2Assert(i == 0 || bounds[i-1].value <= bound->value);
				//b2Settings.b2Assert(bound->proxyId != b2_nullProxy);
				//b2Settings.b2Assert(this.m_proxyPool[bound->proxyId].IsValid());

				if (bound.IsLower() == true)
				{
					//b2Settings.b2Assert(this.m_proxyPool[bound.proxyId].lowerBounds[axis] == i);
					stabbingCount++;
				}
				else
				{
					//b2Settings.b2Assert(this.m_proxyPool[bound.proxyId].upperBounds[axis] == i);
					stabbingCount--;
				}

				//b2Settings.b2Assert(bound.stabbingCount == stabbingCount);
			}
		}

	},

//private:
	ComputeBounds: function(lowerValues, upperValues, aabb)
	{
		//b2Settings.b2Assert(aabb.maxVertex.x > aabb.minVertex.x);
		//b2Settings.b2Assert(aabb.maxVertex.y > aabb.minVertex.y);

		//var minVertex = b2Math.b2ClampV(aabb.minVertex, this.m_worldAABB.minVertex, this.m_worldAABB.maxVertex);
		var minVertexX = aabb.minVertex.x;
		var minVertexY = aabb.minVertex.y;
		minVertexX = b2Math.b2Min(minVertexX, this.m_worldAABB.maxVertex.x);
		minVertexY = b2Math.b2Min(minVertexY, this.m_worldAABB.maxVertex.y);
		minVertexX = b2Math.b2Max(minVertexX, this.m_worldAABB.minVertex.x);
		minVertexY = b2Math.b2Max(minVertexY, this.m_worldAABB.minVertex.y);

		//var maxVertex = b2Math.b2ClampV(aabb.maxVertex, this.m_worldAABB.minVertex, this.m_worldAABB.maxVertex);
		var maxVertexX = aabb.maxVertex.x;
		var maxVertexY = aabb.maxVertex.y;
		maxVertexX = b2Math.b2Min(maxVertexX, this.m_worldAABB.maxVertex.x);
		maxVertexY = b2Math.b2Min(maxVertexY, this.m_worldAABB.maxVertex.y);
		maxVertexX = b2Math.b2Max(maxVertexX, this.m_worldAABB.minVertex.x);
		maxVertexY = b2Math.b2Max(maxVertexY, this.m_worldAABB.minVertex.y);

		// Bump lower bounds downs and upper bounds up. This ensures correct sorting of
		// lower/upper bounds that would have equal values.
		// TODO_ERIN implement fast float to uint16 conversion.
		lowerValues[0] = /*uint*/(this.m_quantizationFactor.x * (minVertexX - this.m_worldAABB.minVertex.x)) & (b2Settings.USHRT_MAX - 1);
		upperValues[0] = (/*uint*/(this.m_quantizationFactor.x * (maxVertexX - this.m_worldAABB.minVertex.x))& 0x0000ffff) | 1;

		lowerValues[1] = /*uint*/(this.m_quantizationFactor.y * (minVertexY - this.m_worldAABB.minVertex.y)) & (b2Settings.USHRT_MAX - 1);
		upperValues[1] = (/*uint*/(this.m_quantizationFactor.y * (maxVertexY - this.m_worldAABB.minVertex.y))& 0x0000ffff) | 1;
	},

	// This one is only used for validation.
	TestOverlapValidate: function(p1, p2){

		for (var axis = 0; axis < 2; ++axis)
		{
			var bounds = this.m_bounds[axis];

			//b2Settings.b2Assert(p1.lowerBounds[axis] < 2 * this.m_proxyCount);
			//b2Settings.b2Assert(p1.upperBounds[axis] < 2 * this.m_proxyCount);
			//b2Settings.b2Assert(p2.lowerBounds[axis] < 2 * this.m_proxyCount);
			//b2Settings.b2Assert(p2.upperBounds[axis] < 2 * this.m_proxyCount);

			if (bounds[p1.lowerBounds[axis]].value > bounds[p2.upperBounds[axis]].value)
				return false;

			if (bounds[p1.upperBounds[axis]].value < bounds[p2.lowerBounds[axis]].value)
				return false;
		}

		return true;
	},

	TestOverlap: function(b, p)
	{
		for (var axis = 0; axis < 2; ++axis)
		{
			var bounds = this.m_bounds[axis];

			//b2Settings.b2Assert(p.lowerBounds[axis] < 2 * this.m_proxyCount);
			//b2Settings.b2Assert(p.upperBounds[axis] < 2 * this.m_proxyCount);

			if (b.lowerValues[axis] > bounds[p.upperBounds[axis]].value)
				return false;

			if (b.upperValues[axis] < bounds[p.lowerBounds[axis]].value)
				return false;
		}

		return true;
	},

	Query: function(lowerQueryOut, upperQueryOut, lowerValue, upperValue, bounds, boundCount, axis){

		var lowerQuery = b2BroadPhase.BinarySearch(bounds, boundCount, lowerValue);
		var upperQuery = b2BroadPhase.BinarySearch(bounds, boundCount, upperValue);

		// Easy case: lowerQuery <= lowerIndex(i) < upperQuery
		// Solution: search query range for min bounds.
		for (var j = lowerQuery; j < upperQuery; ++j)
		{
			if (bounds[j].IsLower())
			{
				this.IncrementOverlapCount(bounds[j].proxyId);
			}
		}

		// Hard case: lowerIndex(i) < lowerQuery < upperIndex(i)
		// Solution: use the stabbing count to search down the bound array.
		if (lowerQuery > 0)
		{
			var i = lowerQuery - 1;
			var s = bounds[i].stabbingCount;

			// Find the s overlaps.
			while (s)
			{
				//b2Settings.b2Assert(i >= 0);

				if (bounds[i].IsLower())
				{
					var proxy = this.m_proxyPool[ bounds[i].proxyId ];
					if (lowerQuery <= proxy.upperBounds[axis])
					{
						this.IncrementOverlapCount(bounds[i].proxyId);
						--s;
					}
				}
				--i;
			}
		}

		lowerQueryOut[0] = lowerQuery;
		upperQueryOut[0] = upperQuery;
	},


	IncrementOverlapCount: function(proxyId){
		var proxy = this.m_proxyPool[ proxyId ];
		if (proxy.timeStamp < this.m_timeStamp)
		{
			proxy.timeStamp = this.m_timeStamp;
			proxy.overlapCount = 1;
		}
		else
		{
			proxy.overlapCount = 2;
			//b2Settings.b2Assert(this.m_queryResultCount < b2Settings.b2_maxProxies);
			this.m_queryResults[this.m_queryResultCount] = proxyId;
			++this.m_queryResultCount;
		}
	},
	IncrementTimeStamp: function(){
		if (this.m_timeStamp == b2Settings.USHRT_MAX)
		{
			for (var i = 0; i < b2Settings.b2_maxProxies; ++i)
			{
				this.m_proxyPool[i].timeStamp = 0;
			}
			this.m_timeStamp = 1;
		}
		else
		{
			++this.m_timeStamp;
		}
	},

//public:
	m_pairManager: new b2PairManager(),

	m_proxyPool: new Array(b2Settings.b2_maxPairs),
	m_freeProxy: 0,

	m_bounds: new Array(2*b2Settings.b2_maxProxies),

	m_queryResults: new Array(b2Settings.b2_maxProxies),
	m_queryResultCount: 0,

	m_worldAABB: null,
	m_quantizationFactor: new b2Vec2(),
	m_proxyCount: 0,
	m_timeStamp: 0};
b2BroadPhase.s_validate = false;
b2BroadPhase.b2_invalid = b2Settings.USHRT_MAX;
b2BroadPhase.b2_nullEdge = b2Settings.USHRT_MAX;
b2BroadPhase.BinarySearch = function(bounds, count, value)
	{
		var low = 0;
		var high = count - 1;
		while (low <= high)
		{
			var mid = Math.floor((low + high) / 2);
			if (bounds[mid].value > value)
			{
				high = mid - 1;
			}
			else if (bounds[mid].value < value)
			{
				low = mid + 1;
			}
			else
			{
				return /*uint*/(mid);
			}
		}

		return /*uint*/(low);
	};
/*
* Copyright (c) 2006-2007 Erin Catto http:
*
* This software is provided 'as-is', without any express or implied
* warranty.  In no event will the authors be held liable for any damages
* arising from the use of this software.
* Permission is granted to anyone to use this software for any purpose,
* including commercial applications, and to alter it and redistribute it
* freely, subject to the following restrictions:
* 1. The origin of this software must not be misrepresented; you must not
* claim that you wrote the original software. If you use this software
* in a product, an acknowledgment in the product documentation would be
* appreciated but is not required.
* 2. Altered source versions must be plainly marked, and must not be
* misrepresented the original software.
* 3. This notice may not be removed or altered from any source distribution.
*/




var b2Collision = Class.create();
b2Collision.prototype = {

	// Null feature




	// Find the separation between poly1 and poly2 for a give edge normal on poly1.




	// Find the max separation between poly1 and poly2 using edge normals
	// from poly1.







	// Find edge normal of max separation on A - return if separating axis is found
	// Find edge normal of max separation on B - return if separation axis is found
	// Choose reference edge(minA, minB)
	// Find incident edge
	// Clip
	// The normal points from 1 to 2















	initialize: function() {}}
b2Collision.b2_nullFeature = 0x000000ff;
b2Collision.ClipSegmentToLine = function(vOut, vIn, normal, offset)
	{
		// Start with no output points
		var numOut = 0;

		var vIn0 = vIn[0].v;
		var vIn1 = vIn[1].v;

		// Calculate the distance of end points to the line
		var distance0 = b2Math.b2Dot(normal, vIn[0].v) - offset;
		var distance1 = b2Math.b2Dot(normal, vIn[1].v) - offset;

		// If the points are behind the plane
		if (distance0 <= 0.0) vOut[numOut++] = vIn[0];
		if (distance1 <= 0.0) vOut[numOut++] = vIn[1];

		// If the points are on different sides of the plane
		if (distance0 * distance1 < 0.0)
		{
			// Find intersection point of edge and plane
			var interp = distance0 / (distance0 - distance1);
			// expanded for performance
			var tVec = vOut[numOut].v;
			tVec.x = vIn0.x + interp * (vIn1.x - vIn0.x);
			tVec.y = vIn0.y + interp * (vIn1.y - vIn0.y);
			if (distance0 > 0.0)
			{
				vOut[numOut].id = vIn[0].id;
			}
			else
			{
				vOut[numOut].id = vIn[1].id;
			}
			++numOut;
		}

		return numOut;
	};
b2Collision.EdgeSeparation = function(poly1, edge1, poly2)
	{
		var vert1s = poly1.m_vertices;
		var count2 = poly2.m_vertexCount;
		var vert2s = poly2.m_vertices;

		// Convert normal from into poly2's frame.
		//b2Settings.b2Assert(edge1 < poly1.m_vertexCount);

		//var normal = b2Math.b2MulMV(poly1.m_R, poly1->m_normals[edge1]);
		var normalX = poly1.m_normals[edge1].x;
		var normalY = poly1.m_normals[edge1].y;
		var tX = normalX;
		var tMat = poly1.m_R;
		normalX = tMat.col1.x * tX + tMat.col2.x * normalY;
		normalY = tMat.col1.y * tX + tMat.col2.y * normalY;
		// ^^^^^^^ normal.MulM(poly1.m_R);

		//var normalLocal2 = b2Math.b2MulTMV(poly2.m_R, normal);
		var normalLocal2X = normalX;
		var normalLocal2Y = normalY;
		tMat = poly2.m_R;
		tX = normalLocal2X * tMat.col1.x + normalLocal2Y * tMat.col1.y;
		normalLocal2Y = normalLocal2X * tMat.col2.x + normalLocal2Y * tMat.col2.y;
		normalLocal2X = tX;
		// ^^^^^ normalLocal2.MulTM(poly2.m_R);

		// Find support vertex on poly2 for -normal.
		var vertexIndex2 = 0;
		var minDot = Number.MAX_VALUE;
		for (var i = 0; i < count2; ++i)
		{
			//var dot = b2Math.b2Dot(vert2s[i], normalLocal2);
			var tVec = vert2s[i];
			var dot = tVec.x * normalLocal2X + tVec.y * normalLocal2Y;
			if (dot < minDot)
			{
				minDot = dot;
				vertexIndex2 = i;
			}
		}

		//b2Vec2 v1 = poly1->m_position + b2Mul(poly1->m_R, vert1s[edge1]);
		tMat = poly1.m_R;
		var v1X = poly1.m_position.x + (tMat.col1.x * vert1s[edge1].x + tMat.col2.x * vert1s[edge1].y)
		var v1Y = poly1.m_position.y + (tMat.col1.y * vert1s[edge1].x + tMat.col2.y * vert1s[edge1].y)

		//b2Vec2 v2 = poly2->m_position + b2Mul(poly2->m_R, vert2s[vertexIndex2]);
		tMat = poly2.m_R;
		var v2X = poly2.m_position.x + (tMat.col1.x * vert2s[vertexIndex2].x + tMat.col2.x * vert2s[vertexIndex2].y)
		var v2Y = poly2.m_position.y + (tMat.col1.y * vert2s[vertexIndex2].x + tMat.col2.y * vert2s[vertexIndex2].y)

		//var separation = b2Math.b2Dot( b2Math.SubtractVV( v2, v1 ) , normal);
		v2X -= v1X;
		v2Y -= v1Y;
		//var separation = b2Math.b2Dot( v2 , normal);
		var separation = v2X * normalX + v2Y * normalY;
		return separation;
	};
b2Collision.FindMaxSeparation = function(edgeIndex /*int ptr*/, poly1, poly2, conservative)
	{
		var count1 = poly1.m_vertexCount;

		// Vector pointing from the origin of poly1 to the origin of poly2.
		//var d = b2Math.SubtractVV( poly2.m_position, poly1.m_position );
		var dX = poly2.m_position.x - poly1.m_position.x;
		var dY = poly2.m_position.y - poly1.m_position.y;

		//var dLocal1 = b2Math.b2MulTMV(poly1.m_R, d);
		var dLocal1X = (dX * poly1.m_R.col1.x + dY * poly1.m_R.col1.y);
		var dLocal1Y = (dX * poly1.m_R.col2.x + dY * poly1.m_R.col2.y);

		// Get support vertex hint for our search
		var edge = 0;
		var maxDot = -Number.MAX_VALUE;
		for (var i = 0; i < count1; ++i)
		{
			//var dot = b2Math.b2Dot(poly.m_normals[i], dLocal1);
			var dot = (poly1.m_normals[i].x * dLocal1X + poly1.m_normals[i].y * dLocal1Y);
			if (dot > maxDot)
			{
				maxDot = dot;
				edge = i;
			}
		}

		// Get the separation for the edge normal.
		var s = b2Collision.EdgeSeparation(poly1, edge, poly2);
		if (s > 0.0 && conservative == false)
		{
			return s;
		}

		// Check the separation for the neighboring edges.
		var prevEdge = edge - 1 >= 0 ? edge - 1 : count1 - 1;
		var sPrev = b2Collision.EdgeSeparation(poly1, prevEdge, poly2);
		if (sPrev > 0.0 && conservative == false)
		{
			return sPrev;
		}

		var nextEdge = edge + 1 < count1 ? edge + 1 : 0;
		var sNext = b2Collision.EdgeSeparation(poly1, nextEdge, poly2);
		if (sNext > 0.0 && conservative == false)
		{
			return sNext;
		}

		// Find the best edge and the search direction.
		var bestEdge = 0;
		var bestSeparation;
		var increment = 0;
		if (sPrev > s && sPrev > sNext)
		{
			increment = -1;
			bestEdge = prevEdge;
			bestSeparation = sPrev;
		}
		else if (sNext > s)
		{
			increment = 1;
			bestEdge = nextEdge;
			bestSeparation = sNext;
		}
		else
		{
			// pointer out
			edgeIndex[0] = edge;
			return s;
		}

		while (true)
		{

			if (increment == -1)
				edge = bestEdge - 1 >= 0 ? bestEdge - 1 : count1 - 1;
			else
				edge = bestEdge + 1 < count1 ? bestEdge + 1 : 0;

			s = b2Collision.EdgeSeparation(poly1, edge, poly2);
			if (s > 0.0 && conservative == false)
			{
				return s;
			}

			if (s > bestSeparation)
			{
				bestEdge = edge;
				bestSeparation = s;
			}
			else
			{
				break;
			}
		}

		// pointer out
		edgeIndex[0] = bestEdge;
		return bestSeparation;
	};
b2Collision.FindIncidentEdge = function(c, poly1, edge1, poly2)
	{
		var count1 = poly1.m_vertexCount;
		var vert1s = poly1.m_vertices;
		var count2 = poly2.m_vertexCount;
		var vert2s = poly2.m_vertices;

		// Get the vertices associated with edge1.
		var vertex11 = edge1;
		var vertex12 = edge1 + 1 == count1 ? 0 : edge1 + 1;

		// Get the normal of edge1.
		var tVec = vert1s[vertex12];
		//var normal1Local1 = b2Math.b2CrossVF( b2Math.SubtractVV( vert1s[vertex12], vert1s[vertex11] ), 1.0);
		var normal1Local1X = tVec.x;
		var normal1Local1Y = tVec.y;
		tVec = vert1s[vertex11];
		normal1Local1X -= tVec.x;
		normal1Local1Y -= tVec.y;
		var tX = normal1Local1X;
		normal1Local1X = normal1Local1Y;
		normal1Local1Y = -tX;
		// ^^^^ normal1Local1.CrossVF(1.0);

		var invLength = 1.0 / Math.sqrt(normal1Local1X*normal1Local1X + normal1Local1Y*normal1Local1Y);
		normal1Local1X *= invLength;
		normal1Local1Y *= invLength;
		// ^^^^normal1Local1.Normalize();
		//var normal1 = b2Math.b2MulMV(poly1.m_R, normal1Local1);
		var normal1X = normal1Local1X;
		var normal1Y = normal1Local1Y;

		tX = normal1X;
		var tMat = poly1.m_R;
		normal1X = tMat.col1.x * tX + tMat.col2.x * normal1Y;
		normal1Y = tMat.col1.y * tX + tMat.col2.y * normal1Y;
		// ^^^^ normal1.MulM(poly1.m_R);

		//var normal1Local2 = b2Math.b2MulTMV(poly2.m_R, normal1);
		var normal1Local2X = normal1X;
		var normal1Local2Y = normal1Y;
		tMat = poly2.m_R;
		tX = normal1Local2X * tMat.col1.x + normal1Local2Y * tMat.col1.y;
		normal1Local2Y = normal1Local2X * tMat.col2.x + normal1Local2Y * tMat.col2.y;
		normal1Local2X = tX;
		// ^^^^ normal1Local2.MulTM(poly2.m_R);

		// Find the incident edge on poly2.
		var vertex21 = 0;
		var vertex22 = 0;
		var minDot = Number.MAX_VALUE;
		for (var i = 0; i < count2; ++i)
		{
			var i1 = i;
			var i2 = i + 1 < count2 ? i + 1 : 0;

			//var normal2Local2 = b2Math.b2CrossVF( b2Math.SubtractVV( vert2s[i2], vert2s[i1] ), 1.0);
			tVec = vert2s[i2];
			var normal2Local2X = tVec.x;
			var normal2Local2Y = tVec.y;
			tVec = vert2s[i1];
			normal2Local2X -= tVec.x;
			normal2Local2Y -= tVec.y;
			tX = normal2Local2X;
			normal2Local2X = normal2Local2Y;
			normal2Local2Y = -tX;
			// ^^^^ normal2Local2.CrossVF(1.0);

			invLength = 1.0 / Math.sqrt(normal2Local2X*normal2Local2X + normal2Local2Y*normal2Local2Y);
			normal2Local2X *= invLength;
			normal2Local2Y *= invLength;
			// ^^^^ normal2Local2.Normalize();

			//var dot = b2Math.b2Dot(normal2Local2, normal1Local2);
			var dot = normal2Local2X * normal1Local2X + normal2Local2Y * normal1Local2Y;
			if (dot < minDot)
			{
				minDot = dot;
				vertex21 = i1;
				vertex22 = i2;
			}
		}

		var tClip;
		// Build the clip vertices for the incident edge.
		tClip = c[0];
		//tClip.v = b2Math.AddVV(poly2.m_position, b2Math.b2MulMV(poly2.m_R, vert2s[vertex21]));
		tVec = tClip.v;
		tVec.SetV(vert2s[vertex21]);
		tVec.MulM(poly2.m_R);
		tVec.Add(poly2.m_position);

		tClip.id.features.referenceFace = edge1;
		tClip.id.features.incidentEdge = vertex21;
		tClip.id.features.incidentVertex = vertex21;

		tClip = c[1];
		//tClip.v = b2Math.AddVV(poly2.m_position, b2Math.b2MulMV(poly2.m_R, vert2s[vertex22]));
		tVec = tClip.v;
		tVec.SetV(vert2s[vertex22]);
		tVec.MulM(poly2.m_R);
		tVec.Add(poly2.m_position);
		tClip.id.features.referenceFace = edge1;
		tClip.id.features.incidentEdge = vertex21;
		tClip.id.features.incidentVertex = vertex22;
	};
b2Collision.b2CollidePolyTempVec = new b2Vec2();
b2Collision.b2CollidePoly = function(manifold, polyA, polyB, conservative)
	{
		manifold.pointCount = 0;

		var edgeA = 0;
		var edgeAOut = [edgeA];
		var separationA = b2Collision.FindMaxSeparation(edgeAOut, polyA, polyB, conservative);
		edgeA = edgeAOut[0];
		if (separationA > 0.0 && conservative == false)
			return;

		var edgeB = 0;
		var edgeBOut = [edgeB];
		var separationB = b2Collision.FindMaxSeparation(edgeBOut, polyB, polyA, conservative);
		edgeB = edgeBOut[0];
		if (separationB > 0.0 && conservative == false)
			return;

		var poly1;
		var poly2;
		var edge1 = 0;
		var flip = 0;
		var k_relativeTol = 0.98;
		var k_absoluteTol = 0.001;

		// TODO_ERIN use "radius" of poly for absolute tolerance.
		if (separationB > k_relativeTol * separationA + k_absoluteTol)
		{
			poly1 = polyB;
			poly2 = polyA;
			edge1 = edgeB;
			flip = 1;
		}
		else
		{
			poly1 = polyA;
			poly2 = polyB;
			edge1 = edgeA;
			flip = 0;
		}

		var incidentEdge = [new ClipVertex(), new ClipVertex()];
		b2Collision.FindIncidentEdge(incidentEdge, poly1, edge1, poly2);

		var count1 = poly1.m_vertexCount;
		var vert1s = poly1.m_vertices;

		var v11 = vert1s[edge1];
		var v12 = edge1 + 1 < count1 ? vert1s[edge1+1] : vert1s[0];

		//var dv = b2Math.SubtractVV(v12, v11);
		var dvX = v12.x - v11.x;
		var dvY = v12.y - v11.y;

		//var sideNormal = b2Math.b2MulMV(poly1.m_R, b2Math.SubtractVV(v12, v11));
		var sideNormalX = v12.x - v11.x;
		var sideNormalY = v12.y - v11.y;

		var tX = sideNormalX;
		var tMat = poly1.m_R;
		sideNormalX = tMat.col1.x * tX + tMat.col2.x * sideNormalY;
		sideNormalY = tMat.col1.y * tX + tMat.col2.y * sideNormalY;
		// ^^^^ sideNormal.MulM(poly1.m_R);

		var invLength = 1.0 / Math.sqrt(sideNormalX*sideNormalX + sideNormalY*sideNormalY);
		sideNormalX *= invLength;
		sideNormalY *= invLength;
		// ^^^^ sideNormal.Normalize();

		//var frontNormal = b2Math.b2CrossVF(sideNormal, 1.0);
		var frontNormalX = sideNormalX;
		var frontNormalY = sideNormalY;
		tX = frontNormalX;
		frontNormalX = frontNormalY;
		frontNormalY = -tX;
		// ^^^^ frontNormal.CrossVF(1.0);

		// Expanded for performance
		//v11 = b2Math.AddVV(poly1.m_position, b2Math.b2MulMV(poly1.m_R, v11));
		var v11X = v11.x;
		var v11Y = v11.y;
		tX = v11X;
		tMat = poly1.m_R;
		v11X = tMat.col1.x * tX + tMat.col2.x * v11Y;
		v11Y = tMat.col1.y * tX + tMat.col2.y * v11Y;
		// ^^^^ v11.MulM(poly1.m_R);
		v11X += poly1.m_position.x;
		v11Y += poly1.m_position.y;
		//v12 = b2Math.AddVV(poly1.m_position, b2Math.b2MulMV(poly1.m_R, v12));
		var v12X = v12.x;
		var v12Y = v12.y;
		tX = v12X;
		tMat = poly1.m_R;
		v12X = tMat.col1.x * tX + tMat.col2.x * v12Y;
		v12Y = tMat.col1.y * tX + tMat.col2.y * v12Y;
		// ^^^^ v12.MulM(poly1.m_R);
		v12X += poly1.m_position.x;
		v12Y += poly1.m_position.y;

		//var frontOffset = b2Math.b2Dot(frontNormal, v11);
		var frontOffset = frontNormalX * v11X + frontNormalY * v11Y;
		//var sideOffset1 = -b2Math.b2Dot(sideNormal, v11);
		var sideOffset1 = -(sideNormalX * v11X + sideNormalY * v11Y);
		//var sideOffset2 = b2Math.b2Dot(sideNormal, v12);
		var sideOffset2 = sideNormalX * v12X + sideNormalY * v12Y;

		// Clip incident edge against extruded edge1 side edges.
		var clipPoints1 = [new ClipVertex(), new ClipVertex()];
		var clipPoints2 = [new ClipVertex(), new ClipVertex()];

		var np = 0;

		// Clip to box side 1
		b2Collision.b2CollidePolyTempVec.Set(-sideNormalX, -sideNormalY);
		np = b2Collision.ClipSegmentToLine(clipPoints1, incidentEdge, b2Collision.b2CollidePolyTempVec, sideOffset1);

		if (np < 2)
			return;

		// Clip to negative box side 1
		b2Collision.b2CollidePolyTempVec.Set(sideNormalX, sideNormalY);
		np = b2Collision.ClipSegmentToLine(clipPoints2, clipPoints1,  b2Collision.b2CollidePolyTempVec, sideOffset2);

		if (np < 2)
			return;

		// Now clipPoints2 contains the clipped points.
		if (flip){
			manifold.normal.Set(-frontNormalX, -frontNormalY);
		}
		else{
			manifold.normal.Set(frontNormalX, frontNormalY);
		}
		// ^^^^ manifold.normal = flip ? frontNormal.Negative() : frontNormal;

		var pointCount = 0;
		for (var i = 0; i < b2Settings.b2_maxManifoldPoints; ++i)
		{
			//var separation = b2Math.b2Dot(frontNormal, clipPoints2[i].v) - frontOffset;
			var tVec = clipPoints2[i].v;
			var separation = (frontNormalX * tVec.x + frontNormalY * tVec.y) - frontOffset;

			if (separation <= 0.0 || conservative == true)
			{
				var cp = manifold.points[ pointCount ];
				cp.separation = separation;
				cp.position.SetV( clipPoints2[i].v );
				cp.id.Set( clipPoints2[i].id );
				cp.id.features.flip = flip;
				++pointCount;
			}
		}

		manifold.pointCount = pointCount;
	};
b2Collision.b2CollideCircle = function(manifold, circle1, circle2, conservative)
	{
		manifold.pointCount = 0;

		//var d = b2Math.SubtractVV(circle2.m_position, circle1.m_position);
		var dX = circle2.m_position.x - circle1.m_position.x;
		var dY = circle2.m_position.y - circle1.m_position.y;
		//var distSqr = b2Math.b2Dot(d, d);
		var distSqr = dX * dX + dY * dY;
		var radiusSum = circle1.m_radius + circle2.m_radius;
		if (distSqr > radiusSum * radiusSum && conservative == false)
		{
			return;
		}

		var separation;
		if (distSqr < Number.MIN_VALUE)
		{
			separation = -radiusSum;
			manifold.normal.Set(0.0, 1.0);
		}
		else
		{
			var dist = Math.sqrt(distSqr);
			separation = dist - radiusSum;
			var a = 1.0 / dist;
			manifold.normal.x = a * dX;
			manifold.normal.y = a * dY;
		}

		manifold.pointCount = 1;
		var tPoint = manifold.points[0];
		tPoint.id.set_key(0);
		tPoint.separation = separation;
		//tPoint.position = b2Math.SubtractVV(circle2.m_position, b2Math.MulFV(circle2.m_radius, manifold.normal));
		tPoint.position.x = circle2.m_position.x - (circle2.m_radius * manifold.normal.x);
		tPoint.position.y = circle2.m_position.y - (circle2.m_radius * manifold.normal.y);
	};
b2Collision.b2CollidePolyAndCircle = function(manifold, poly, circle, conservative)
	{
		manifold.pointCount = 0;
		var tPoint;

		var dX;
		var dY;

		// Compute circle position in the frame of the polygon.
		//var xLocal = b2Math.b2MulTMV(poly.m_R, b2Math.SubtractVV(circle.m_position, poly.m_position));
		var xLocalX = circle.m_position.x - poly.m_position.x;
		var xLocalY = circle.m_position.y - poly.m_position.y;
		var tMat = poly.m_R;
		var tX = xLocalX * tMat.col1.x + xLocalY * tMat.col1.y;
		xLocalY = xLocalX * tMat.col2.x + xLocalY * tMat.col2.y;
		xLocalX = tX;

		var dist;

		// Find the min separating edge.
		var normalIndex = 0;
		var separation = -Number.MAX_VALUE;
		var radius = circle.m_radius;
		for (var i = 0; i < poly.m_vertexCount; ++i)
		{
			//var s = b2Math.b2Dot(poly.m_normals[i], b2Math.SubtractVV(xLocal, poly.m_vertices[i]));
			var s = poly.m_normals[i].x * (xLocalX-poly.m_vertices[i].x) + poly.m_normals[i].y * (xLocalY-poly.m_vertices[i].y);
			if (s > radius)
			{
				// Early out.
				return;
			}

			if (s > separation)
			{
				separation = s;
				normalIndex = i;
			}
		}

		// If the center is inside the polygon ...
		if (separation < Number.MIN_VALUE)
		{
			manifold.pointCount = 1;
			//manifold.normal = b2Math.b2MulMV(poly.m_R, poly.m_normals[normalIndex]);
			var tVec = poly.m_normals[normalIndex];
			manifold.normal.x = tMat.col1.x * tVec.x + tMat.col2.x * tVec.y;
			manifold.normal.y = tMat.col1.y * tVec.x + tMat.col2.y * tVec.y;

			tPoint = manifold.points[0];
			tPoint.id.features.incidentEdge = normalIndex;
			tPoint.id.features.incidentVertex = b2Collision.b2_nullFeature;
			tPoint.id.features.referenceFace = b2Collision.b2_nullFeature;
			tPoint.id.features.flip = 0;
			tPoint.position.x = circle.m_position.x - radius * manifold.normal.x;
			tPoint.position.y = circle.m_position.y - radius * manifold.normal.y;
			//tPoint.position = b2Math.SubtractVV(circle.m_position , b2Math.MulFV(radius , manifold.normal));
			tPoint.separation = separation - radius;
			return;
		}

		// Project the circle center onto the edge segment.
		var vertIndex1 = normalIndex;
		var vertIndex2 = vertIndex1 + 1 < poly.m_vertexCount ? vertIndex1 + 1 : 0;
		//var e = b2Math.SubtractVV(poly.m_vertices[vertIndex2] , poly.m_vertices[vertIndex1]);
		var eX = poly.m_vertices[vertIndex2].x - poly.m_vertices[vertIndex1].x;
		var eY = poly.m_vertices[vertIndex2].y - poly.m_vertices[vertIndex1].y;
		//var length = e.Normalize();
		var length = Math.sqrt(eX*eX + eY*eY);
		eX /= length;
		eY /= length;

		// If the edge length is zero ...
		if (length < Number.MIN_VALUE)
		{
			//d = b2Math.SubtractVV(xLocal , poly.m_vertices[vertIndex1]);
			dX = xLocalX - poly.m_vertices[vertIndex1].x;
			dY = xLocalY - poly.m_vertices[vertIndex1].y;
			//dist = d.Normalize();
			dist = Math.sqrt(dX*dX + dY*dY);
			dX /= dist;
			dY /= dist;
			if (dist > radius)
			{
				return;
			}

			manifold.pointCount = 1;
			//manifold.normal = b2Math.b2MulMV(poly.m_R, d);
			manifold.normal.Set(tMat.col1.x * dX + tMat.col2.x * dY, tMat.col1.y * dX + tMat.col2.y * dY);
			tPoint = manifold.points[0];
			tPoint.id.features.incidentEdge = b2Collision.b2_nullFeature;
			tPoint.id.features.incidentVertex = vertIndex1;
			tPoint.id.features.referenceFace = b2Collision.b2_nullFeature;
			tPoint.id.features.flip = 0;
			//tPoint.position = b2Math.SubtractVV(circle.m_position , b2Math.MulFV(radius , manifold.normal));
			tPoint.position.x = circle.m_position.x - radius * manifold.normal.x;
			tPoint.position.y = circle.m_position.y - radius * manifold.normal.y;
			tPoint.separation = dist - radius;
			return;
		}

		// Project the center onto the edge.
		//var u = b2Math.b2Dot(b2Math.SubtractVV(xLocal , poly.m_vertices[vertIndex1]) , e);
		var u = (xLocalX-poly.m_vertices[vertIndex1].x) * eX + (xLocalY-poly.m_vertices[vertIndex1].y) * eY;

		tPoint = manifold.points[0];
		tPoint.id.features.incidentEdge = b2Collision.b2_nullFeature;
		tPoint.id.features.incidentVertex = b2Collision.b2_nullFeature;
		tPoint.id.features.referenceFace = b2Collision.b2_nullFeature;
		tPoint.id.features.flip = 0;

		var pX, pY;
		if (u <= 0.0)
		{
			pX = poly.m_vertices[vertIndex1].x;
			pY = poly.m_vertices[vertIndex1].y;
			tPoint.id.features.incidentVertex = vertIndex1;
		}
		else if (u >= length)
		{
			pX = poly.m_vertices[vertIndex2].x;
			pY = poly.m_vertices[vertIndex2].y;
			tPoint.id.features.incidentVertex = vertIndex2;
		}
		else
		{
			//p = b2Math.AddVV(poly.m_vertices[vertIndex1] , b2Math.MulFV(u, e));
			pX = eX * u + poly.m_vertices[vertIndex1].x;
			pY = eY * u + poly.m_vertices[vertIndex1].y;
			tPoint.id.features.incidentEdge = vertIndex1;
		}

		//d = b2Math.SubtractVV(xLocal , p);
		dX = xLocalX - pX;
		dY = xLocalY - pY;
		//dist = d.Normalize();
		dist = Math.sqrt(dX*dX + dY*dY);
		dX /= dist;
		dY /= dist;
		if (dist > radius)
		{
			return;
		}

		manifold.pointCount = 1;
		//manifold.normal = b2Math.b2MulMV(poly.m_R, d);
		manifold.normal.Set(tMat.col1.x * dX + tMat.col2.x * dY, tMat.col1.y * dX + tMat.col2.y * dY);
		//tPoint.position = b2Math.SubtractVV(circle.m_position , b2Math.MulFV(radius , manifold.normal));
		tPoint.position.x = circle.m_position.x - radius * manifold.normal.x;
		tPoint.position.y = circle.m_position.y - radius * manifold.normal.y;
		tPoint.separation = dist - radius;
	};
b2Collision.b2TestOverlap = function(a, b)
	{
		var t1 = b.minVertex;
		var t2 = a.maxVertex;
		//d1 = b2Math.SubtractVV(b.minVertex, a.maxVertex);
		var d1X = t1.x - t2.x;
		var d1Y = t1.y - t2.y;
		//d2 = b2Math.SubtractVV(a.minVertex, b.maxVertex);
		t1 = a.minVertex;
		t2 = b.maxVertex;
		var d2X = t1.x - t2.x;
		var d2Y = t1.y - t2.y;

		if (d1X > 0.0 || d1Y > 0.0)
			return false;

		if (d2X > 0.0 || d2Y > 0.0)
			return false;

		return true;
	};
/*
* Copyright (c) 2006-2007 Erin Catto http:
*
* This software is provided 'as-is', without any express or implied
* warranty.  In no event will the authors be held liable for any damages
* arising from the use of this software.
* Permission is granted to anyone to use this software for any purpose,
* including commercial applications, and to alter it and redistribute it
* freely, subject to the following restrictions:
* 1. The origin of this software must not be misrepresented; you must not
* claim that you wrote the original software. If you use this software
* in a product, an acknowledgment in the product documentation would be
* appreciated but is not required.
* 2. Altered source versions must be plainly marked, and must not be
* misrepresented the original software.
* 3. This notice may not be removed or altered from any source distribution.
*/


// We use contact ids to facilitate warm starting.
var Features = Class.create();
Features.prototype = 
{
	//
	set_referenceFace: function(value){
		this._referenceFace = value;
		this._m_id._key = (this._m_id._key & 0xffffff00) | (this._referenceFace & 0x000000ff)
	},
	get_referenceFace: function(){
		return this._referenceFace;
	},
	_referenceFace: 0,
	//
	set_incidentEdge: function(value){
		this._incidentEdge = value;
		this._m_id._key = (this._m_id._key & 0xffff00ff) | ((this._incidentEdge << 8) & 0x0000ff00)
	},
	get_incidentEdge: function(){
		return this._incidentEdge;
	},
	_incidentEdge: 0,
	//
	set_incidentVertex: function(value){
		this._incidentVertex = value;
		this._m_id._key = (this._m_id._key & 0xff00ffff) | ((this._incidentVertex << 16) & 0x00ff0000)
	},
	get_incidentVertex: function(){
		return this._incidentVertex;
	},
	_incidentVertex: 0,
	//
	set_flip: function(value){
		this._flip = value;
		this._m_id._key = (this._m_id._key & 0x00ffffff) | ((this._flip << 24) & 0xff000000)
	},
	get_flip: function(){
		return this._flip;
	},
	_flip: 0,
	_m_id: null,
	initialize: function() {}};
/*
* Copyright (c) 2006-2007 Erin Catto http:
*
* This software is provided 'as-is', without any express or implied
* warranty.  In no event will the authors be held liable for any damages
* arising from the use of this software.
* Permission is granted to anyone to use this software for any purpose,
* including commercial applications, and to alter it and redistribute it
* freely, subject to the following restrictions:
* 1. The origin of this software must not be misrepresented; you must not
* claim that you wrote the original software. If you use this software
* in a product, an acknowledgment in the product documentation would be
* appreciated but is not required.
* 2. Altered source versions must be plainly marked, and must not be
* misrepresented the original software.
* 3. This notice may not be removed or altered from any source distribution.
*/



// We use contact ids to facilitate warm starting.
var b2ContactID = Class.create();
b2ContactID.prototype = 
{
	initialize: function(){
		// initialize instance variables for references
		this.features = new Features();
		//

		this.features._m_id = this;

	},
	Set: function(id){
		this.set_key(id._key);
	},
	Copy: function(){
		var id = new b2ContactID();
		id.set_key(this._key);
		return id;
	},
	get_key: function(){
		return this._key;
	},
	set_key: function(value) {
		this._key = value;
		this.features._referenceFace = this._key & 0x000000ff;
		this.features._incidentEdge = ((this._key & 0x0000ff00) >> 8) & 0x000000ff;
		this.features._incidentVertex = ((this._key & 0x00ff0000) >> 16) & 0x000000ff;
		this.features._flip = ((this._key & 0xff000000) >> 24) & 0x000000ff;
	},
	features: new Features(),
	_key: 0};
/*
* Copyright (c) 2006-2007 Erin Catto http:
*
* This software is provided 'as-is', without any express or implied
* warranty.  In no event will the authors be held liable for any damages
* arising from the use of this software.
* Permission is granted to anyone to use this software for any purpose,
* including commercial applications, and to alter it and redistribute it
* freely, subject to the following restrictions:
* 1. The origin of this software must not be misrepresented; you must not
* claim that you wrote the original software. If you use this software
* in a product, an acknowledgment in the product documentation would be
* appreciated but is not required.
* 2. Altered source versions must be plainly marked, and must not be
* misrepresented the original software.
* 3. This notice may not be removed or altered from any source distribution.
*/



// We use contact ids to facilitate warm starting.
var b2ContactPoint = Class.create();
b2ContactPoint.prototype = 
{
	position: new b2Vec2(),
	separation: null,
	normalImpulse: null,
	tangentImpulse: null,
	id: new b2ContactID(),
	initialize: function() {
		// initialize instance variables for references
		this.position = new b2Vec2();
		this.id = new b2ContactID();
		//
}};
/*
* Copyright (c) 2006-2007 Erin Catto http:
*
* This software is provided 'as-is', without any express or implied
* warranty.  In no event will the authors be held liable for any damages
* arising from the use of this software.
* Permission is granted to anyone to use this software for any purpose,
* including commercial applications, and to alter it and redistribute it
* freely, subject to the following restrictions:
* 1. The origin of this software must not be misrepresented; you must not
* claim that you wrote the original software. If you use this software
* in a product, an acknowledgment in the product documentation would be
* appreciated but is not required.
* 2. Altered source versions must be plainly marked, and must not be
* misrepresented the original software.
* 3. This notice may not be removed or altered from any source distribution.
*/



var b2Distance = Class.create();
b2Distance.prototype = 
{

	// GJK using Voronoi regions (Christer Ericson) and region selection
	// optimizations (Casey Muratori).

	// The origin is either in the region of points[1] or in the edge region. The origin is
	// not in region of points[0] because that is the old point.

	// Possible regions:
	// - points[2]
	// - edge points[0]-points[2]
	// - edge points[1]-points[2]
	// - inside the triangle






	initialize: function() {}};
b2Distance.ProcessTwo = function(p1Out, p2Out, p1s, p2s, points)
	{
		// If in point[1] region
		//b2Vec2 r = -points[1];
		var rX = -points[1].x;
		var rY = -points[1].y;
		//b2Vec2 d = points[1] - points[0];
		var dX = points[0].x - points[1].x;
		var dY = points[0].y - points[1].y;
		//float32 length = d.Normalize();
		var length = Math.sqrt(dX*dX + dY*dY);
		dX /= length;
		dY /= length;

		//float32 lambda = b2Dot(r, d);
		var lambda = rX * dX + rY * dY;
		if (lambda <= 0.0 || length < Number.MIN_VALUE)
		{
			// The simplex is reduced to a point.
			//*p1Out = p1s[1];
			p1Out.SetV(p1s[1]);
			//*p2Out = p2s[1];
			p2Out.SetV(p2s[1]);
			//p1s[0] = p1s[1];
			p1s[0].SetV(p1s[1]);
			//p2s[0] = p2s[1];
			p2s[0].SetV(p2s[1]);
			points[0].SetV(points[1]);
			return 1;
		}

		// Else in edge region
		lambda /= length;
		//*p1Out = p1s[1] + lambda * (p1s[0] - p1s[1]);
		p1Out.x = p1s[1].x + lambda * (p1s[0].x - p1s[1].x);
		p1Out.y = p1s[1].y + lambda * (p1s[0].y - p1s[1].y);
		//*p2Out = p2s[1] + lambda * (p2s[0] - p2s[1]);
		p2Out.x = p2s[1].x + lambda * (p2s[0].x - p2s[1].x);
		p2Out.y = p2s[1].y + lambda * (p2s[0].y - p2s[1].y);
		return 2;
	};
b2Distance.ProcessThree = function(p1Out, p2Out, p1s, p2s, points)
	{
		//b2Vec2 a = points[0];
		var aX = points[0].x;
		var aY = points[0].y;
		//b2Vec2 b = points[1];
		var bX = points[1].x;
		var bY = points[1].y;
		//b2Vec2 c = points[2];
		var cX = points[2].x;
		var cY = points[2].y;

		//b2Vec2 ab = b - a;
		var abX = bX - aX;
		var abY = bY - aY;
		//b2Vec2 ac = c - a;
		var acX = cX - aX;
		var acY = cY - aY;
		//b2Vec2 bc = c - b;
		var bcX = cX - bX;
		var bcY = cY - bY;

		//float32 sn = -b2Dot(a, ab), sd = b2Dot(b, ab);
		var sn = -(aX * abX + aY * abY);
		var sd = (bX * abX + bY * abY);
		//float32 tn = -b2Dot(a, ac), td = b2Dot(c, ac);
		var tn = -(aX * acX + aY * acY);
		var td = (cX * acX + cY * acY);
		//float32 un = -b2Dot(b, bc), ud = b2Dot(c, bc);
		var un = -(bX * bcX + bY * bcY);
		var ud = (cX * bcX + cY * bcY);

		// In vertex c region?
		if (td <= 0.0 && ud <= 0.0)
		{
			// Single point
			//*p1Out = p1s[2];
			p1Out.SetV(p1s[2]);
			//*p2Out = p2s[2];
			p2Out.SetV(p2s[2]);
			//p1s[0] = p1s[2];
			p1s[0].SetV(p1s[2]);
			//p2s[0] = p2s[2];
			p2s[0].SetV(p2s[2]);
			points[0].SetV(points[2]);
			return 1;
		}

		// Should not be in vertex a or b region.
		//b2Settings.b2Assert(sn > 0.0 || tn > 0.0);
		//b2Settings.b2Assert(sd > 0.0 || un > 0.0);

		//float32 n = b2Cross(ab, ac);
		var n = abX * acY - abY * acX;

		// Should not be in edge ab region.
		//float32 vc = n * b2Cross(a, b);
		var vc = n * (aX * bY - aY * bX);
		//b2Settings.b2Assert(vc > 0.0 || sn > 0.0 || sd > 0.0);

		// In edge bc region?
		//float32 va = n * b2Cross(b, c);
		var va = n * (bX * cY - bY * cX);
		if (va <= 0.0 && un >= 0.0 && ud >= 0.0)
		{
			//b2Settings.b2Assert(un + ud > 0.0);

			//float32 lambda = un / (un + ud);
			var lambda = un / (un + ud);
			//*p1Out = p1s[1] + lambda * (p1s[2] - p1s[1]);
			p1Out.x = p1s[1].x + lambda * (p1s[2].x - p1s[1].x);
			p1Out.y = p1s[1].y + lambda * (p1s[2].y - p1s[1].y);
			//*p2Out = p2s[1] + lambda * (p2s[2] - p2s[1]);
			p2Out.x = p2s[1].x + lambda * (p2s[2].x - p2s[1].x);
			p2Out.y = p2s[1].y + lambda * (p2s[2].y - p2s[1].y);
			//p1s[0] = p1s[2];
			p1s[0].SetV(p1s[2]);
			//p2s[0] = p2s[2];
			p2s[0].SetV(p2s[2]);
			//points[0] = points[2];
			points[0].SetV(points[2]);
			return 2;
		}

		// In edge ac region?
		//float32 vb = n * b2Cross(c, a);
		var vb = n * (cX * aY - cY * aX);
		if (vb <= 0.0 && tn >= 0.0 && td >= 0.0)
		{
			//b2Settings.b2Assert(tn + td > 0.0);

			//float32 lambda = tn / (tn + td);
			var lambda = tn / (tn + td);
			//*p1Out = p1s[0] + lambda * (p1s[2] - p1s[0]);
			p1Out.x = p1s[0].x + lambda * (p1s[2].x - p1s[0].x);
			p1Out.y = p1s[0].y + lambda * (p1s[2].y - p1s[0].y);
			//*p2Out = p2s[0] + lambda * (p2s[2] - p2s[0]);
			p2Out.x = p2s[0].x + lambda * (p2s[2].x - p2s[0].x);
			p2Out.y = p2s[0].y + lambda * (p2s[2].y - p2s[0].y);
			//p1s[1] = p1s[2];
			p1s[1].SetV(p1s[2]);
			//p2s[1] = p2s[2];
			p2s[1].SetV(p2s[2]);
			//points[1] = points[2];
			points[1].SetV(points[2]);
			return 2;
		}

		// Inside the triangle, compute barycentric coordinates
		//float32 denom = va + vb + vc;
		var denom = va + vb + vc;
		//b2Settings.b2Assert(denom > 0.0);
		denom = 1.0 / denom;
		//float32 u = va * denom;
		var u = va * denom;
		//float32 v = vb * denom;
		var v = vb * denom;
		//float32 w = 1.0f - u - v;
		var w = 1.0 - u - v;
		//*p1Out = u * p1s[0] + v * p1s[1] + w * p1s[2];
		p1Out.x = u * p1s[0].x + v * p1s[1].x + w * p1s[2].x;
		p1Out.y = u * p1s[0].y + v * p1s[1].y + w * p1s[2].y;
		//*p2Out = u * p2s[0] + v * p2s[1] + w * p2s[2];
		p2Out.x = u * p2s[0].x + v * p2s[1].x + w * p2s[2].x;
		p2Out.y = u * p2s[0].y + v * p2s[1].y + w * p2s[2].y;
		return 3;
	};
b2Distance.InPoinsts = function(w, points, pointCount)
	{
		for (var i = 0; i < pointCount; ++i)
		{
			if (w.x == points[i].x && w.y == points[i].y)
			{
				return true;
			}
		}

		return false;
	};
b2Distance.Distance = function(p1Out, p2Out, shape1, shape2)
	{
		//b2Vec2 p1s[3], p2s[3];
		var p1s = new Array(3);
		var p2s = new Array(3);
		//b2Vec2 points[3];
		var points = new Array(3);
		//int32 pointCount = 0;
		var pointCount = 0;

		//*p1Out = shape1->m_position;
		p1Out.SetV(shape1.m_position);
		//*p2Out = shape2->m_position;
		p2Out.SetV(shape2.m_position);

		var vSqr = 0.0;
		var maxIterations = 20;
		for (var iter = 0; iter < maxIterations; ++iter)
		{
			//b2Vec2 v = *p2Out - *p1Out;
			var vX = p2Out.x - p1Out.x;
			var vY = p2Out.y - p1Out.y;
			//b2Vec2 w1 = shape1->Support(v);
			var w1 = shape1.Support(vX, vY);
			//b2Vec2 w2 = shape2->Support(-v);
			var w2 = shape2.Support(-vX, -vY);
			//float32 vSqr = b2Dot(v, v);
			vSqr = (vX*vX + vY*vY);
			//b2Vec2 w = w2 - w1;
			var wX = w2.x - w1.x;
			var wY = w2.y - w1.y;
			//float32 vw = b2Dot(v, w);
			var vw = (vX*wX + vY*wY);
			//if (vSqr - b2Dot(v, w) <= 0.01f * vSqr)
			if (vSqr - b2Dot(vX * wX + vY * wY) <= 0.01 * vSqr)
			{
				if (pointCount == 0)
				{
					//*p1Out = w1;
					p1Out.SetV(w1);
					//*p2Out = w2;
					p2Out.SetV(w2);
				}
				b2Distance.g_GJK_Iterations = iter;
				return Math.sqrt(vSqr);
			}

			switch (pointCount)
			{
			case 0:
				//p1s[0] = w1;
				p1s[0].SetV(w1);
				//p2s[0] = w2;
				p2s[0].SetV(w2);
				points[0] = w;
				//*p1Out = p1s[0];
				p1Out.SetV(p1s[0]);
				//*p2Out = p2s[0];
				p2Out.SetV(p2s[0]);
				++pointCount;
				break;

			case 1:
				//p1s[1] = w1;
				p1s[1].SetV(w1);
				//p2s[1] = w2;
				p2s[1].SetV(w2);
				//points[1] = w;
				points[1].x = wX;
				points[1].y = wY;
				pointCount = b2Distance.ProcessTwo(p1Out, p2Out, p1s, p2s, points);
				break;

			case 2:
				//p1s[2] = w1;
				p1s[2].SetV(w1);
				//p2s[2] = w2;
				p2s[2].SetV(w2);
				//points[2] = w;
				points[2].x = wX;
				points[2].y = wY;
				pointCount = b2Distance.ProcessThree(p1Out, p2Out, p1s, p2s, points);
				break;
			}

			// If we have three points, then the origin is in the corresponding triangle.
			if (pointCount == 3)
			{
				b2Distance.g_GJK_Iterations = iter;
				return 0.0;
			}

			//float32 maxSqr = -FLT_MAX;
			var maxSqr = -Number.MAX_VALUE;
			for (var i = 0; i < pointCount; ++i)
			{
				//maxSqr = b2Math.b2Max(maxSqr, b2Dot(points[i], points[i]));
				maxSqr = b2Math.b2Max(maxSqr, (points[i].x*points[i].x + points[i].y*points[i].y));
			}

			if (pointCount == 3 || vSqr <= 100.0 * Number.MIN_VALUE * maxSqr)
			{
				b2Distance.g_GJK_Iterations = iter;
				return Math.sqrt(vSqr);
			}
		}

		b2Distance.g_GJK_Iterations = maxIterations;
		return Math.sqrt(vSqr);
	};
b2Distance.g_GJK_Iterations = 0;
/*
* Copyright (c) 2006-2007 Erin Catto http:
*
* This software is provided 'as-is', without any express or implied
* warranty.  In no event will the authors be held liable for any damages
* arising from the use of this software.
* Permission is granted to anyone to use this software for any purpose,
* including commercial applications, and to alter it and redistribute it
* freely, subject to the following restrictions:
* 1. The origin of this software must not be misrepresented; you must not
* claim that you wrote the original software. If you use this software
* in a product, an acknowledgment in the product documentation would be
* appreciated but is not required.
* 2. Altered source versions must be plainly marked, and must not be
* misrepresented the original software.
* 3. This notice may not be removed or altered from any source distribution.
*/



// A manifold for two touching convex shapes.
var b2Manifold = Class.create();
b2Manifold.prototype = 
{
	initialize: function(){
		this.points = new Array(b2Settings.b2_maxManifoldPoints);
		for (var i = 0; i < b2Settings.b2_maxManifoldPoints; i++){
			this.points[i] = new b2ContactPoint();
		}
		this.normal = new b2Vec2();
	},
	points: null,
	normal: null,
	pointCount: 0};
/*
* Copyright (c) 2006-2007 Erin Catto http:
*
* This software is provided 'as-is', without any express or implied
* warranty.  In no event will the authors be held liable for any damages
* arising from the use of this software.
* Permission is granted to anyone to use this software for any purpose,
* including commercial applications, and to alter it and redistribute it
* freely, subject to the following restrictions:
* 1. The origin of this software must not be misrepresented; you must not
* claim that you wrote the original software. If you use this software
* in a product, an acknowledgment in the product documentation would be
* appreciated but is not required.
* 2. Altered source versions must be plainly marked, and must not be
* misrepresented the original software.
* 3. This notice may not be removed or altered from any source distribution.
*/



// A manifold for two touching convex shapes.
var b2OBB = Class.create();
b2OBB.prototype = 
{
	R: new b2Mat22(),
	center: new b2Vec2(),
	extents: new b2Vec2(),
	initialize: function() {
		// initialize instance variables for references
		this.R = new b2Mat22();
		this.center = new b2Vec2();
		this.extents = new b2Vec2();
		//
}};
/*
* Copyright (c) 2006-2007 Erin Catto http:
*
* This software is provided 'as-is', without any express or implied
* warranty.  In no event will the authors be held liable for any damages
* arising from the use of this software.
* Permission is granted to anyone to use this software for any purpose,
* including commercial applications, and to alter it and redistribute it
* freely, subject to the following restrictions:
* 1. The origin of this software must not be misrepresented; you must not
* claim that you wrote the original software. If you use this software
* in a product, an acknowledgment in the product documentation would be
* appreciated but is not required.
* 2. Altered source versions must be plainly marked, and must not be
* misrepresented the original software.
* 3. This notice may not be removed or altered from any source distribution.
*/



var b2Proxy = Class.create();
b2Proxy.prototype = {
	GetNext: function(){ return this.lowerBounds[0]; },
	SetNext: function(next) { this.lowerBounds[0] = next /*& 0x0000ffff*/; },

	IsValid: function(){ return this.overlapCount != b2BroadPhase.b2_invalid; },

	lowerBounds: [/*uint*/(0), /*uint*/(0)],
	upperBounds: [/*uint*/(0), /*uint*/(0)],
	overlapCount: 0,
	timeStamp: 0,

	userData: null,

	initialize: function() {
		// initialize instance variables for references
		this.lowerBounds = [/*uint*/(0), /*uint*/(0)];
		this.upperBounds = [/*uint*/(0), /*uint*/(0)];
		//
}}
/*
* Copyright (c) 2006-2007 Erin Catto http:
*
* This software is provided 'as-is', without any express or implied
* warranty.  In no event will the authors be held liable for any damages
* arising from the use of this software.
* Permission is granted to anyone to use this software for any purpose,
* including commercial applications, and to alter it and redistribute it
* freely, subject to the following restrictions:
* 1. The origin of this software must not be misrepresented; you must not
* claim that you wrote the original software. If you use this software
* in a product, an acknowledgment in the product documentation would be
* appreciated but is not required.
* 2. Altered source versions must be plainly marked, and must not be
* misrepresented the original software.
* 3. This notice may not be removed or altered from any source distribution.
*/





var ClipVertex = Class.create();
ClipVertex.prototype = 
{
	v: new b2Vec2(),
	id: new b2ContactID(),
	initialize: function() {
		// initialize instance variables for references
		this.v = new b2Vec2();
		this.id = new b2ContactID();
		//
}};


/*
* Copyright (c) 2006-2007 Erin Catto http:
*
* This software is provided 'as-is', without any express or implied
* warranty.  In no event will the authors be held liable for any damages
* arising from the use of this software.
* Permission is granted to anyone to use this software for any purpose,
* including commercial applications, and to alter it and redistribute it
* freely, subject to the following restrictions:
* 1. The origin of this software must not be misrepresented; you must not
* claim that you wrote the original software. If you use this software
* in a product, an acknowledgment in the product documentation would be
* appreciated but is not required.
* 2. Altered source versions must be plainly marked, and must not be
* misrepresented the original software.
* 3. This notice may not be removed or altered from any source distribution.
*/








// Shapes are created automatically when a body is created.
// Client code does not normally interact with shapes.
var b2Shape = Class.create();
b2Shape.prototype = 
{
	TestPoint: function(p){return false},

	GetUserData: function(){return this.m_userData;},

	GetType: function(){
		return this.m_type;
	},

	// Get the parent body of this shape.
	GetBody: function(){
		return this.m_body;
	},

	GetPosition: function(){
		return this.m_position;
	},
	GetRotationMatrix: function(){
		return this.m_R;
	},

	// Remove and then add proxy from the broad-phase.
	// This is used to refresh the collision filters.
	ResetProxy: function(broadPhase){},

	// Get the next shape in the parent body's shape list.
	GetNext: function(){
		return this.m_next;
	},

	//--------------- Internals Below -------------------




	initialize: function(def, body){
		// initialize instance variables for references
		this.m_R = new b2Mat22();
		this.m_position = new b2Vec2();
		//

		this.m_userData = def.userData;

		this.m_friction = def.friction;
		this.m_restitution = def.restitution;
		this.m_body = body;

		this.m_proxyId = b2Pair.b2_nullProxy;

		this.m_maxRadius = 0.0;

		this.m_categoryBits = def.categoryBits;
		this.m_maskBits = def.maskBits;
		this.m_groupIndex = def.groupIndex;
	},

	// Internal use only. Do not call.
	//b2Shape::~b2Shape()
	//{
	//	this.m_body->m_world->m_broadPhase->this.DestroyProxy(this.m_proxyId);
	//}


	DestroyProxy: function()
	{
		if (this.m_proxyId != b2Pair.b2_nullProxy)
		{
			this.m_body.m_world.m_broadPhase.DestroyProxy(this.m_proxyId);
			this.m_proxyId = b2Pair.b2_nullProxy;
		}
	},


	// Internal use only. Do not call.
	Synchronize: function(position1, R1, position2, R2){},
	QuickSync: function(position, R){},
	Support: function(dX, dY, out){},
	GetMaxRadius: function(){
		return this.m_maxRadius;
	},

	m_next: null,

	m_R: new b2Mat22(),
	m_position: new b2Vec2(),

	m_type: 0,

	m_userData: null,

	m_body: null,

	m_friction: null,
	m_restitution: null,

	m_maxRadius: null,

	m_proxyId: 0,
	m_categoryBits: 0,
	m_maskBits: 0,
	m_groupIndex: 0



	// b2ShapeType












};


b2Shape.Create = function(def, body, center){
		switch (def.type)
		{
		case b2Shape.e_circleShape:
			{
				//void* mem = body->m_world->m_blockAllocator.Allocate(sizeof(b2CircleShape));
				return new b2CircleShape(def, body, center);
			}

		case b2Shape.e_boxShape:
		case b2Shape.e_polyShape:
			{
				//void* mem = body->m_world->m_blockAllocator.Allocate(sizeof(b2PolyShape));
				return new b2PolyShape(def, body, center);
			}
		}

		//b2Settings.b2Assert(false);
		return null;
	};
b2Shape.Destroy = function(shape)
	{
		/*b2BlockAllocator& allocator = shape->m_body->m_world->m_blockAllocator;

		switch (shape.m_type)
		{
		case b2Shape.e_circleShape:
			shape->~b2Shape();
			allocator.Free(shape, sizeof(b2CircleShape));
			break;

		case b2Shape.e_polyShape:
			shape->~b2Shape();
			allocator.Free(shape, sizeof(b2PolyShape));
			break;

		default:
			b2Assert(false);
		}

		shape = NULL;*/

		// FROM DESTRUCTOR
		if (shape.m_proxyId != b2Pair.b2_nullProxy)
			shape.m_body.m_world.m_broadPhase.DestroyProxy(shape.m_proxyId);
	};
b2Shape.e_unknownShape = -1;
b2Shape.e_circleShape = 0;
b2Shape.e_boxShape = 1;
b2Shape.e_polyShape = 2;
b2Shape.e_meshShape = 3;
b2Shape.e_shapeTypeCount = 4;
b2Shape.PolyMass = function(massData, vs, count, rho)
	{
		//b2Settings.b2Assert(count >= 3);

		//var center = new b2Vec2(0.0, 0.0);
		var center = new b2Vec2();
		center.SetZero();

		var area = 0.0;
		var I = 0.0;

		// pRef is the reference point for forming triangles.
		// It's location doesn't change the result (except for rounding error).
		var pRef = new b2Vec2(0.0, 0.0);

		var inv3 = 1.0 / 3.0;

		for (var i = 0; i < count; ++i)
		{
			// Triangle vertices.
			var p1 = pRef;
			var p2 = vs[i];
			var p3 = i + 1 < count ? vs[i+1] : vs[0];

			var e1 = b2Math.SubtractVV(p2, p1);
			var e2 = b2Math.SubtractVV(p3, p1);

			var D = b2Math.b2CrossVV(e1, e2);

			var triangleArea = 0.5 * D;
			area += triangleArea;

			// Area weighted centroid
			// center += triangleArea * inv3 * (p1 + p2 + p3);
			var tVec = new b2Vec2();
			tVec.SetV(p1);
			tVec.Add(p2);
			tVec.Add(p3);
			tVec.Multiply(inv3*triangleArea);
			center.Add(tVec);

			var px = p1.x;
			var py = p1.y;
			var ex1 = e1.x;
			var ey1 = e1.y;
			var ex2 = e2.x;
			var ey2 = e2.y;

			var intx2 = inv3 * (0.25 * (ex1*ex1 + ex2*ex1 + ex2*ex2) + (px*ex1 + px*ex2)) + 0.5*px*px;
			var inty2 = inv3 * (0.25 * (ey1*ey1 + ey2*ey1 + ey2*ey2) + (py*ey1 + py*ey2)) + 0.5*py*py;

			I += D * (intx2 + inty2);
		}

		// Total mass
		massData.mass = rho * area;

		// Center of mass
		//b2Settings.b2Assert(area > Number.MIN_VALUE);
		center.Multiply( 1.0 / area );
		massData.center = center;

		// Inertia tensor relative to the center.
		I = rho * (I - area * b2Math.b2Dot(center, center));
		massData.I = I;
	};
b2Shape.PolyCentroid = function(vs, count, out)
	{
		//b2Settings.b2Assert(count >= 3);

		//b2Vec2 c; c.Set(0.0f, 0.0f);
		var cX = 0.0;
		var cY = 0.0;
		//float32 area = 0.0f;
		var area = 0.0;

		// pRef is the reference point for forming triangles.
		// It's location doesn't change the result (except for rounding error).
		//b2Vec2 pRef(0.0f, 0.0f);
		var pRefX = 0.0;
		var pRefY = 0.0;
	/*
		// This code would put the reference point inside the polygon.
		for (var i = 0; i < count; ++i)
		{
			//pRef += vs[i];
			pRef.x += vs[i].x;
			pRef.y += vs[i].y;
		}
		pRef.x *= 1.0 / count;
		pRef.y *= 1.0 / count;
	*/

		//const float32 inv3 = 1.0f / 3.0f;
		var inv3 = 1.0 / 3.0;

		for (var i = 0; i < count; ++i)
		{
			// Triangle vertices.
			//b2Vec2 p1 = pRef;
			var p1X = pRefX;
			var p1Y = pRefY;
			//b2Vec2 p2 = vs[i];
			var p2X = vs[i].x;
			var p2Y = vs[i].y;
			//b2Vec2 p3 = i + 1 < count ? vs[i+1] : vs[0];
			var p3X = i + 1 < count ? vs[i+1].x : vs[0].x;
			var p3Y = i + 1 < count ? vs[i+1].y : vs[0].y;

			//b2Vec2 e1 = p2 - p1;
			var e1X = p2X - p1X;
			var e1Y = p2Y - p1Y;
			//b2Vec2 e2 = p3 - p1;
			var e2X = p3X - p1X;
			var e2Y = p3Y - p1Y;

			//float32 D = b2Cross(e1, e2);
			var D = (e1X * e2Y - e1Y * e2X);

			//float32 triangleArea = 0.5f * D;
			var triangleArea = 0.5 * D;
			area += triangleArea;

			// Area weighted centroid
			//c += triangleArea * inv3 * (p1 + p2 + p3);
			cX += triangleArea * inv3 * (p1X + p2X + p3X);
			cY += triangleArea * inv3 * (p1Y + p2Y + p3Y);
		}

		// Centroid
		//b2Settings.b2Assert(area > Number.MIN_VALUE);
		cX *= 1.0 / area;
		cY *= 1.0 / area;

		// Replace return with 'out' vector
		//return c;
		out.Set(cX, cY);
	};
/*
* Copyright (c) 2006-2007 Erin Catto http:
*
* This software is provided 'as-is', without any express or implied
* warranty.  In no event will the authors be held liable for any damages
* arising from the use of this software.
* Permission is granted to anyone to use this software for any purpose,
* including commercial applications, and to alter it and redistribute it
* freely, subject to the following restrictions:
* 1. The origin of this software must not be misrepresented; you must not
* claim that you wrote the original software. If you use this software
* in a product, an acknowledgment in the product documentation would be
* appreciated but is not required.
* 2. Altered source versions must be plainly marked, and must not be
* misrepresented the original software.
* 3. This notice may not be removed or altered from any source distribution.
*/







var b2ShapeDef = Class.create();
b2ShapeDef.prototype = 
{
	initialize: function()
	{
		this.type = b2Shape.e_unknownShape;
		this.userData = null;
		this.localPosition = new b2Vec2(0.0, 0.0);
		this.localRotation = 0.0;
		this.friction = 0.2;
		this.restitution = 0.0;
		this.density = 0.0;
		this.categoryBits = 0x0001;
		this.maskBits = 0xFFFF;
		this.groupIndex = 0;
	},

	//virtual ~b2ShapeDef() {}

	ComputeMass: function(massData)
	{

		massData.center = new b2Vec2(0.0, 0.0)

		if (this.density == 0.0)
		{
			massData.mass = 0.0;
			massData.center.Set(0.0, 0.0);
			massData.I = 0.0;
		};

		switch (this.type)
		{
		case b2Shape.e_circleShape:
			{
				var circle = this;
				massData.mass = this.density * b2Settings.b2_pi * circle.radius * circle.radius;
				massData.center.Set(0.0, 0.0);
				massData.I = 0.5 * (massData.mass) * circle.radius * circle.radius;
			}
			break;

		case b2Shape.e_boxShape:
			{
				var box = this;
				massData.mass = 4.0 * this.density * box.extents.x * box.extents.y;
				massData.center.Set(0.0, 0.0);
				massData.I = massData.mass / 3.0 * b2Math.b2Dot(box.extents, box.extents);
			}
			break;

		case b2Shape.e_polyShape:
			{
				var poly = this;
				b2Shape.PolyMass(massData, poly.vertices, poly.vertexCount, this.density);
			}
			break;

		default:
			massData.mass = 0.0;
			massData.center.Set(0.0, 0.0);
			massData.I = 0.0;
			break;
		}
	},

	type: 0,
	userData: null,
	localPosition: null,
	localRotation: null,
	friction: null,
	restitution: null,
	density: null,

	// The collision category bits. Normally you would just set one bit.
	categoryBits: 0,

	// The collision mask bits. This states the categories that this
	// shape would accept for collision.
	maskBits: 0,

	// Collision groups allow a certain group of objects to never collide (negative)
	// or always collide (positive). Zero means no collision group. Non-zero group
	// filtering always wins against the mask bits.
	groupIndex: 0};
/*
* Copyright (c) 2006-2007 Erin Catto http:
*
* This software is provided 'as-is', without any express or implied
* warranty.  In no event will the authors be held liable for any damages
* arising from the use of this software.
* Permission is granted to anyone to use this software for any purpose,
* including commercial applications, and to alter it and redistribute it
* freely, subject to the following restrictions:
* 1. The origin of this software must not be misrepresented; you must not
* claim that you wrote the original software. If you use this software
* in a product, an acknowledgment in the product documentation would be
* appreciated but is not required.
* 2. Altered source versions must be plainly marked, and must not be
* misrepresented the original software.
* 3. This notice may not be removed or altered from any source distribution.
*/







var b2BoxDef = Class.create();
Object.extend(b2BoxDef.prototype, b2ShapeDef.prototype);
Object.extend(b2BoxDef.prototype, 
{
	initialize: function()
	{
		// The constructor for b2ShapeDef
		this.type = b2Shape.e_unknownShape;
		this.userData = null;
		this.localPosition = new b2Vec2(0.0, 0.0);
		this.localRotation = 0.0;
		this.friction = 0.2;
		this.restitution = 0.0;
		this.density = 0.0;
		this.categoryBits = 0x0001;
		this.maskBits = 0xFFFF;
		this.groupIndex = 0;	
		//

		this.type = b2Shape.e_boxShape;
		this.extents = new b2Vec2(1.0, 1.0);
	},

	extents: null});

/*
* Copyright (c) 2006-2007 Erin Catto http:
*
* This software is provided 'as-is', without any express or implied
* warranty.  In no event will the authors be held liable for any damages
* arising from the use of this software.
* Permission is granted to anyone to use this software for any purpose,
* including commercial applications, and to alter it and redistribute it
* freely, subject to the following restrictions:
* 1. The origin of this software must not be misrepresented; you must not
* claim that you wrote the original software. If you use this software
* in a product, an acknowledgment in the product documentation would be
* appreciated but is not required.
* 2. Altered source versions must be plainly marked, and must not be
* misrepresented the original software.
* 3. This notice may not be removed or altered from any source distribution.
*/







var b2CircleDef = Class.create();
Object.extend(b2CircleDef.prototype, b2ShapeDef.prototype);
Object.extend(b2CircleDef.prototype, 
{
	initialize: function()
	{
		// The constructor for b2ShapeDef
		this.type = b2Shape.e_unknownShape;
		this.userData = null;
		this.localPosition = new b2Vec2(0.0, 0.0);
		this.localRotation = 0.0;
		this.friction = 0.2;
		this.restitution = 0.0;
		this.density = 0.0;
		this.categoryBits = 0x0001;
		this.maskBits = 0xFFFF;
		this.groupIndex = 0;	
		//

		this.type = b2Shape.e_circleShape;
		this.radius = 1.0;
	},

	radius: null});

/*
* Copyright (c) 2006-2007 Erin Catto http:
*
* This software is provided 'as-is', without any express or implied
* warranty.  In no event will the authors be held liable for any damages
* arising from the use of this software.
* Permission is granted to anyone to use this software for any purpose,
* including commercial applications, and to alter it and redistribute it
* freely, subject to the following restrictions:
* 1. The origin of this software must not be misrepresented; you must not
* claim that you wrote the original software. If you use this software
* in a product, an acknowledgment in the product documentation would be
* appreciated but is not required.
* 2. Altered source versions must be plainly marked, and must not be
* misrepresented the original software.
* 3. This notice may not be removed or altered from any source distribution.
*/







var b2CircleShape = Class.create();
Object.extend(b2CircleShape.prototype, b2Shape.prototype);
Object.extend(b2CircleShape.prototype, 
{
	TestPoint: function(p){
		//var d = b2Math.SubtractVV(p, this.m_position);
		var d = new b2Vec2();
		d.SetV(p);
		d.Subtract(this.m_position);
		return b2Math.b2Dot(d, d) <= this.m_radius * this.m_radius;
	},

	//--------------- Internals Below -------------------

	initialize: function(def, body, localCenter){
		// initialize instance variables for references
		this.m_R = new b2Mat22();
		this.m_position = new b2Vec2();
		//

		// The constructor for b2Shape
		this.m_userData = def.userData;

		this.m_friction = def.friction;
		this.m_restitution = def.restitution;
		this.m_body = body;

		this.m_proxyId = b2Pair.b2_nullProxy;

		this.m_maxRadius = 0.0;

		this.m_categoryBits = def.categoryBits;
		this.m_maskBits = def.maskBits;
		this.m_groupIndex = def.groupIndex;
		//

		// initialize instance variables for references
		this.m_localPosition = new b2Vec2();
		//

		//super(def, body);

		//b2Settings.b2Assert(def.type == b2Shape.e_circleShape);
		var circle = def;

		//this.m_localPosition = def.localPosition - localCenter;
		this.m_localPosition.Set(def.localPosition.x - localCenter.x, def.localPosition.y - localCenter.y);
		this.m_type = b2Shape.e_circleShape;
		this.m_radius = circle.radius;

		this.m_R.SetM(this.m_body.m_R);
		//b2Vec2 r = b2Mul(this.m_body->this.m_R, this.m_localPosition);
		var rX = this.m_R.col1.x * this.m_localPosition.x + this.m_R.col2.x * this.m_localPosition.y;
		var rY = this.m_R.col1.y * this.m_localPosition.x + this.m_R.col2.y * this.m_localPosition.y;
		//this.m_position = this.m_body->this.m_position + r;
		this.m_position.x = this.m_body.m_position.x + rX;
		this.m_position.y = this.m_body.m_position.y + rY;
		//this.m_maxRadius = r.Length() + this.m_radius;
		this.m_maxRadius = Math.sqrt(rX*rX+rY*rY) + this.m_radius;

		var aabb = new b2AABB();
		aabb.minVertex.Set(this.m_position.x - this.m_radius, this.m_position.y - this.m_radius);
		aabb.maxVertex.Set(this.m_position.x + this.m_radius, this.m_position.y + this.m_radius);

		var broadPhase = this.m_body.m_world.m_broadPhase;
		if (broadPhase.InRange(aabb))
		{
			this.m_proxyId = broadPhase.CreateProxy(aabb, this);
		}
		else
		{
			this.m_proxyId = b2Pair.b2_nullProxy;
		}

		if (this.m_proxyId == b2Pair.b2_nullProxy)
		{
			this.m_body.Freeze();
		}
	},

	Synchronize: function(position1, R1, position2, R2){
		this.m_R.SetM(R2);
		//this.m_position = position2 + b2Mul(R2, this.m_localPosition);
		this.m_position.x = (R2.col1.x * this.m_localPosition.x + R2.col2.x * this.m_localPosition.y) + position2.x;
		this.m_position.y = (R2.col1.y * this.m_localPosition.x + R2.col2.y * this.m_localPosition.y) + position2.y;

		if (this.m_proxyId == b2Pair.b2_nullProxy)
		{
			return;
		}

		// Compute an AABB that covers the swept shape (may miss some rotation effect).
		//b2Vec2 p1 = position1 + b2Mul(R1, this.m_localPosition);
		var p1X = position1.x + (R1.col1.x * this.m_localPosition.x + R1.col2.x * this.m_localPosition.y);
		var p1Y = position1.y + (R1.col1.y * this.m_localPosition.x + R1.col2.y * this.m_localPosition.y);
		//b2Vec2 lower = b2Min(p1, this.m_position);
		var lowerX = Math.min(p1X, this.m_position.x);
		var lowerY = Math.min(p1Y, this.m_position.y);
		//b2Vec2 upper = b2Max(p1, this.m_position);
		var upperX = Math.max(p1X, this.m_position.x);
		var upperY = Math.max(p1Y, this.m_position.y);

		var aabb = new b2AABB();
		aabb.minVertex.Set(lowerX - this.m_radius, lowerY - this.m_radius);
		aabb.maxVertex.Set(upperX + this.m_radius, upperY + this.m_radius);

		var broadPhase = this.m_body.m_world.m_broadPhase;
		if (broadPhase.InRange(aabb))
		{
			broadPhase.MoveProxy(this.m_proxyId, aabb);
		}
		else
		{
			this.m_body.Freeze();
		}
	},

	QuickSync: function(position, R){
		this.m_R.SetM(R);
		//this.m_position = position + b2Mul(R, this.m_localPosition);
		this.m_position.x = (R.col1.x * this.m_localPosition.x + R.col2.x * this.m_localPosition.y) + position.x;
		this.m_position.y = (R.col1.y * this.m_localPosition.x + R.col2.y * this.m_localPosition.y) + position.y;
	},


	ResetProxy: function(broadPhase)
	{
		if (this.m_proxyId == b2Pair.b2_nullProxy)
		{
			return;
		}

		var proxy = broadPhase.GetProxy(this.m_proxyId);

		broadPhase.DestroyProxy(this.m_proxyId);
		proxy = null;

		var aabb = new b2AABB();
		aabb.minVertex.Set(this.m_position.x - this.m_radius, this.m_position.y - this.m_radius);
		aabb.maxVertex.Set(this.m_position.x + this.m_radius, this.m_position.y + this.m_radius);

		if (broadPhase.InRange(aabb))
		{
			this.m_proxyId = broadPhase.CreateProxy(aabb, this);
		}
		else
		{
			this.m_proxyId = b2Pair.b2_nullProxy;
		}

		if (this.m_proxyId == b2Pair.b2_nullProxy)
		{
			this.m_body.Freeze();
		}
	},


	Support: function(dX, dY, out)
	{
		//b2Vec2 u = d;
		//u.Normalize();
		var len = Math.sqrt(dX*dX + dY*dY);
		dX /= len;
		dY /= len;
		//return this.m_position + this.m_radius * u;
		out.Set(	this.m_position.x + this.m_radius*dX,
					this.m_position.y + this.m_radius*dY);
	},


	// Local position in parent body
	m_localPosition: new b2Vec2(),
	m_radius: null});

/*
* Copyright (c) 2006-2007 Erin Catto http:
*
* This software is provided 'as-is', without any express or implied
* warranty.  In no event will the authors be held liable for any damages
* arising from the use of this software.
* Permission is granted to anyone to use this software for any purpose,
* including commercial applications, and to alter it and redistribute it
* freely, subject to the following restrictions:
* 1. The origin of this software must not be misrepresented; you must not
* claim that you wrote the original software. If you use this software
* in a product, an acknowledgment in the product documentation would be
* appreciated but is not required.
* 2. Altered source versions must be plainly marked, and must not be
* misrepresented the original software.
* 3. This notice may not be removed or altered from any source distribution.
*/







var b2MassData = Class.create();
b2MassData.prototype = 
{
	mass: 0.0,
	center: new b2Vec2(0,0),
	I: 0.0,

	initialize: function() {
		// initialize instance variables for references
		this.center = new b2Vec2(0,0);
		//
}}
/*
* Copyright (c) 2006-2007 Erin Catto http:
*
* This software is provided 'as-is', without any express or implied
* warranty.  In no event will the authors be held liable for any damages
* arising from the use of this software.
* Permission is granted to anyone to use this software for any purpose,
* including commercial applications, and to alter it and redistribute it
* freely, subject to the following restrictions:
* 1. The origin of this software must not be misrepresented; you must not
* claim that you wrote the original software. If you use this software
* in a product, an acknowledgment in the product documentation would be
* appreciated but is not required.
* 2. Altered source versions must be plainly marked, and must not be
* misrepresented the original software.
* 3. This notice may not be removed or altered from any source distribution.
*/







var b2PolyDef = Class.create();
Object.extend(b2PolyDef.prototype, b2ShapeDef.prototype);
Object.extend(b2PolyDef.prototype, 
{
	initialize: function()
	{
		// The constructor for b2ShapeDef
		this.type = b2Shape.e_unknownShape;
		this.userData = null;
		this.localPosition = new b2Vec2(0.0, 0.0);
		this.localRotation = 0.0;
		this.friction = 0.2;
		this.restitution = 0.0;
		this.density = 0.0;
		this.categoryBits = 0x0001;
		this.maskBits = 0xFFFF;
		this.groupIndex = 0;	
		//

		// initialize instance variables for references
		this.vertices = new Array(b2Settings.b2_maxPolyVertices);
		//

		this.type = b2Shape.e_polyShape;
		this.vertexCount = 0;

		for (var i = 0; i < b2Settings.b2_maxPolyVertices; i++){
			this.vertices[i] = new b2Vec2();
		}
	},

	vertices: new Array(b2Settings.b2_maxPolyVertices),
	vertexCount: 0});

/*
* Copyright (c) 2006-2007 Erin Catto http:
*
* This software is provided 'as-is', without any express or implied
* warranty.  In no event will the authors be held liable for any damages
* arising from the use of this software.
* Permission is granted to anyone to use this software for any purpose,
* including commercial applications, and to alter it and redistribute it
* freely, subject to the following restrictions:
* 1. The origin of this software must not be misrepresented; you must not
* claim that you wrote the original software. If you use this software
* in a product, an acknowledgment in the product documentation would be
* appreciated but is not required.
* 2. Altered source versions must be plainly marked, and must not be
* misrepresented the original software.
* 3. This notice may not be removed or altered from any source distribution.
*/





// A convex polygon. The position of the polygon (m_position) is the
// position of the centroid. The vertices of the incoming polygon are pre-rotated
// according to the local rotation. The vertices are also shifted to be centered
// on the centroid. Since the local rotation is absorbed into the vertex
// coordinates, the polygon rotation is equal to the body rotation. However,
// the polygon position is centered on the polygon centroid. This simplifies
// some collision algorithms.

var b2PolyShape = Class.create();
Object.extend(b2PolyShape.prototype, b2Shape.prototype);
Object.extend(b2PolyShape.prototype, 
{
	TestPoint: function(p){

		//var pLocal = b2Math.b2MulTMV(this.m_R, b2Math.SubtractVV(p, this.m_position));
		var pLocal = new b2Vec2();
		pLocal.SetV(p);
		pLocal.Subtract(this.m_position);
		pLocal.MulTM(this.m_R);

		for (var i = 0; i < this.m_vertexCount; ++i)
		{
			//var dot = b2Math.b2Dot(this.m_normals[i], b2Math.SubtractVV(pLocal, this.m_vertices[i]));
			var tVec = new b2Vec2();
			tVec.SetV(pLocal);
			tVec.Subtract(this.m_vertices[i]);

			var dot = b2Math.b2Dot(this.m_normals[i], tVec);
			if (dot > 0.0)
			{
				return false;
			}
		}

		return true;
	},

	//--------------- Internals Below -------------------
	// Temp vec for b2Shape.PolyCentroid

	initialize: function(def, body, newOrigin){
		// initialize instance variables for references
		this.m_R = new b2Mat22();
		this.m_position = new b2Vec2();
		//

		// The constructor for b2Shape
		this.m_userData = def.userData;

		this.m_friction = def.friction;
		this.m_restitution = def.restitution;
		this.m_body = body;

		this.m_proxyId = b2Pair.b2_nullProxy;

		this.m_maxRadius = 0.0;

		this.m_categoryBits = def.categoryBits;
		this.m_maskBits = def.maskBits;
		this.m_groupIndex = def.groupIndex;
		//

		// initialize instance variables for references
		this.syncAABB = new b2AABB();
		this.syncMat = new b2Mat22();
		this.m_localCentroid = new b2Vec2();
		this.m_localOBB = new b2OBB();
		//


		//super(def, body);

		var i = 0;


		var hX;
		var hY;

		var tVec;

		var aabb = new b2AABB();

		// Vertices
		this.m_vertices = new Array(b2Settings.b2_maxPolyVertices);
		this.m_coreVertices = new Array(b2Settings.b2_maxPolyVertices);
		//for (i = 0; i < b2Settings.b2_maxPolyVertices; i++)
		//	this.m_vertices[i] = new b2Vec2();

		// Normals
		this.m_normals = new Array(b2Settings.b2_maxPolyVertices);
		//for (i = 0; i < b2Settings.b2_maxPolyVertices; i++)
		//	this.m_normals[i] = new b2Vec2();

		//b2Settings.b2Assert(def.type == b2Shape.e_boxShape || def.type == b2Shape.e_polyShape);
		this.m_type = b2Shape.e_polyShape;

		var localR = new b2Mat22(def.localRotation);

		// Get the vertices transformed into the body frame.
		if (def.type == b2Shape.e_boxShape)
		{
			//this.m_localCentroid = def.localPosition - newOrigin;
			this.m_localCentroid.x = def.localPosition.x - newOrigin.x;
			this.m_localCentroid.y = def.localPosition.y - newOrigin.y;

			var box = def;
			this.m_vertexCount = 4;
			hX = box.extents.x;
			hY = box.extents.y;

			//hc.x = b2Max(0.0f, h.x - 2.0f * b2_linearSlop);
			var hcX = Math.max(0.0, hX - 2.0 * b2Settings.b2_linearSlop);
			//hc.y = b2Max(0.0f, h.y - 2.0f * b2_linearSlop);
			var hcY = Math.max(0.0, hY - 2.0 * b2Settings.b2_linearSlop);

			//this.m_vertices[0] = b2Mul(localR, b2Vec2(h.x, h.y));
			tVec = this.m_vertices[0] = new b2Vec2();
			tVec.x = localR.col1.x * hX + localR.col2.x * hY;
			tVec.y = localR.col1.y * hX + localR.col2.y * hY;
			//this.m_vertices[1] = b2Mul(localR, b2Vec2(-h.x, h.y));
			tVec = this.m_vertices[1] = new b2Vec2();
			tVec.x = localR.col1.x * -hX + localR.col2.x * hY;
			tVec.y = localR.col1.y * -hX + localR.col2.y * hY;
			//this.m_vertices[2] = b2Mul(localR, b2Vec2(-h.x, -h.y));
			tVec = this.m_vertices[2] = new b2Vec2();
			tVec.x = localR.col1.x * -hX + localR.col2.x * -hY;
			tVec.y = localR.col1.y * -hX + localR.col2.y * -hY;
			//this.m_vertices[3] = b2Mul(localR, b2Vec2(h.x, -h.y));
			tVec = this.m_vertices[3] = new b2Vec2();
			tVec.x = localR.col1.x * hX + localR.col2.x * -hY;
			tVec.y = localR.col1.y * hX + localR.col2.y * -hY;

			//this.m_coreVertices[0] = b2Mul(localR, b2Vec2(hc.x, hc.y));
			tVec = this.m_coreVertices[0] = new b2Vec2();
			tVec.x = localR.col1.x * hcX + localR.col2.x * hcY;
			tVec.y = localR.col1.y * hcX + localR.col2.y * hcY;
			//this.m_coreVertices[1] = b2Mul(localR, b2Vec2(-hc.x, hc.y));
			tVec = this.m_coreVertices[1] = new b2Vec2();
			tVec.x = localR.col1.x * -hcX + localR.col2.x * hcY;
			tVec.y = localR.col1.y * -hcX + localR.col2.y * hcY;
			//this.m_coreVertices[2] = b2Mul(localR, b2Vec2(-hc.x, -hc.y));
			tVec = this.m_coreVertices[2] = new b2Vec2();
			tVec.x = localR.col1.x * -hcX + localR.col2.x * -hcY;
			tVec.y = localR.col1.y * -hcX + localR.col2.y * -hcY;
			//this.m_coreVertices[3] = b2Mul(localR, b2Vec2(hc.x, -hc.y));
			tVec = this.m_coreVertices[3] = new b2Vec2();
			tVec.x = localR.col1.x * hcX + localR.col2.x * -hcY;
			tVec.y = localR.col1.y * hcX + localR.col2.y * -hcY;
		}
		else
		{
			var poly = def;

			this.m_vertexCount = poly.vertexCount;
			//b2Settings.b2Assert(3 <= this.m_vertexCount && this.m_vertexCount <= b2Settings.b2_maxPolyVertices);
			//b2Vec2 centroid = b2Shape.PolyCentroid(poly->vertices, poly->vertexCount);
			b2Shape.PolyCentroid(poly.vertices, poly.vertexCount, b2PolyShape.tempVec);
			var centroidX = b2PolyShape.tempVec.x;
			var centroidY = b2PolyShape.tempVec.y;
			//this.m_localCentroid = def->localPosition + b2Mul(localR, centroid) - newOrigin;
			this.m_localCentroid.x = def.localPosition.x + (localR.col1.x * centroidX + localR.col2.x * centroidY) - newOrigin.x;
			this.m_localCentroid.y = def.localPosition.y + (localR.col1.y * centroidX + localR.col2.y * centroidY) - newOrigin.y;

			for (i = 0; i < this.m_vertexCount; ++i)
			{
				this.m_vertices[i] = new b2Vec2();
				this.m_coreVertices[i] = new b2Vec2();

				//this.m_vertices[i] = b2Mul(localR, poly->vertices[i] - centroid);
				hX = poly.vertices[i].x - centroidX;
				hY = poly.vertices[i].y - centroidY;
				this.m_vertices[i].x = localR.col1.x * hX + localR.col2.x * hY;
				this.m_vertices[i].y = localR.col1.y * hX + localR.col2.y * hY;

				//b2Vec2 u = this.m_vertices[i];
				var uX = this.m_vertices[i].x;
				var uY = this.m_vertices[i].y;
				//float32 length = u.Length();
				var length = Math.sqrt(uX*uX + uY*uY);
				if (length > Number.MIN_VALUE)
				{
					uX *= 1.0 / length;
					uY *= 1.0 / length;
				}

				//this.m_coreVertices[i] = this.m_vertices[i] - 2.0f * b2_linearSlop * u;
				this.m_coreVertices[i].x = this.m_vertices[i].x - 2.0 * b2Settings.b2_linearSlop * uX;
				this.m_coreVertices[i].y = this.m_vertices[i].y - 2.0 * b2Settings.b2_linearSlop * uY;
			}

		}

		// Compute bounding box. TODO_ERIN optimize OBB
		//var minVertex = new b2Vec2(Number.MAX_VALUE, Number.MAX_VALUE);
		var minVertexX = Number.MAX_VALUE;
		var minVertexY = Number.MAX_VALUE;
		var maxVertexX = -Number.MAX_VALUE;
		var maxVertexY = -Number.MAX_VALUE;
		this.m_maxRadius = 0.0;
		for (i = 0; i < this.m_vertexCount; ++i)
		{
			var v = this.m_vertices[i];
			//minVertex = b2Math.b2MinV(minVertex, this.m_vertices[i]);
			minVertexX = Math.min(minVertexX, v.x);
			minVertexY = Math.min(minVertexY, v.y);
			//maxVertex = b2Math.b2MaxV(maxVertex, this.m_vertices[i]);
			maxVertexX = Math.max(maxVertexX, v.x);
			maxVertexY = Math.max(maxVertexY, v.y);
			//this.m_maxRadius = b2Max(this.m_maxRadius, v.Length());
			this.m_maxRadius = Math.max(this.m_maxRadius, v.Length());
		}

		this.m_localOBB.R.SetIdentity();
		//this.m_localOBB.center = 0.5 * (minVertex + maxVertex);
		this.m_localOBB.center.Set((minVertexX + maxVertexX) * 0.5, (minVertexY + maxVertexY) * 0.5);
		//this.m_localOBB.extents = 0.5 * (maxVertex - minVertex);
		this.m_localOBB.extents.Set((maxVertexX - minVertexX) * 0.5, (maxVertexY - minVertexY) * 0.5);

		// Compute the edge normals and next index map.
		var i1 = 0;
		var i2 = 0;
		for (i = 0; i < this.m_vertexCount; ++i)
		{
			this.m_normals[i] =  new b2Vec2();
			i1 = i;
			i2 = i + 1 < this.m_vertexCount ? i + 1 : 0;
			//b2Vec2 edge = this.m_vertices[i2] - this.m_vertices[i1];
			//var edgeX = this.m_vertices[i2].x - this.m_vertices[i1].x;
			//var edgeY = this.m_vertices[i2].y - this.m_vertices[i1].y;
			//this.m_normals[i] = b2Cross(edge, 1.0f);
			this.m_normals[i].x = this.m_vertices[i2].y - this.m_vertices[i1].y;
			this.m_normals[i].y = -(this.m_vertices[i2].x - this.m_vertices[i1].x);
			this.m_normals[i].Normalize();
		}

		// Ensure the polygon in convex. TODO_ERIN compute convex hull.
		for (i = 0; i < this.m_vertexCount; ++i)
		{
			i1 = i;
			i2 = i + 1 < this.m_vertexCount ? i + 1 : 0;

			//b2Settings.b2Assert(b2Math.b2CrossVV(this.m_normals[i1], this.m_normals[i2]) > Number.MIN_VALUE);
		}

		this.m_R.SetM(this.m_body.m_R);
		//this.m_position.SetV( this.m_body.m_position  + b2Mul(this.m_body->this.m_R, this.m_localCentroid) );
		this.m_position.x = this.m_body.m_position.x + (this.m_R.col1.x * this.m_localCentroid.x + this.m_R.col2.x * this.m_localCentroid.y);
		this.m_position.y = this.m_body.m_position.y + (this.m_R.col1.y * this.m_localCentroid.x + this.m_R.col2.y * this.m_localCentroid.y);

		//var R = b2Math.b2MulMM(this.m_R, this.m_localOBB.R);
			//R.col1 = b2MulMV(this.m_R, this.m_localOBB.R.col1);
			b2PolyShape.tAbsR.col1.x = this.m_R.col1.x * this.m_localOBB.R.col1.x + this.m_R.col2.x * this.m_localOBB.R.col1.y;
			b2PolyShape.tAbsR.col1.y = this.m_R.col1.y * this.m_localOBB.R.col1.x + this.m_R.col2.y * this.m_localOBB.R.col1.y;
			//R.col2 = b2MulMV(this.m_R, this.m_localOBB.R.col2)
			b2PolyShape.tAbsR.col2.x = this.m_R.col1.x * this.m_localOBB.R.col2.x + this.m_R.col2.x * this.m_localOBB.R.col2.y;
			b2PolyShape.tAbsR.col2.y = this.m_R.col1.y * this.m_localOBB.R.col2.x + this.m_R.col2.y * this.m_localOBB.R.col2.y;
		//var absR = b2Math.b2AbsM(R);
		b2PolyShape.tAbsR.Abs()

		//h = b2Math.b2MulMV(b2PolyShape.tAbsR, this.m_localOBB.extents);
		hX = b2PolyShape.tAbsR.col1.x * this.m_localOBB.extents.x + b2PolyShape.tAbsR.col2.x * this.m_localOBB.extents.y;
		hY = b2PolyShape.tAbsR.col1.y * this.m_localOBB.extents.x + b2PolyShape.tAbsR.col2.y * this.m_localOBB.extents.y;

		//var position = this.m_position + b2Mul(this.m_R, this.m_localOBB.center);
		var positionX = this.m_position.x + (this.m_R.col1.x * this.m_localOBB.center.x + this.m_R.col2.x * this.m_localOBB.center.y);
		var positionY = this.m_position.y + (this.m_R.col1.y * this.m_localOBB.center.x + this.m_R.col2.y * this.m_localOBB.center.y);

		//aabb.minVertex = b2Math.SubtractVV(this.m_position, h);
		aabb.minVertex.x = positionX - hX;
		aabb.minVertex.y = positionY - hY;
		//aabb.maxVertex = b2Math.AddVV(this.m_position, h);
		aabb.maxVertex.x = positionX + hX;
		aabb.maxVertex.y = positionY + hY;

		var broadPhase = this.m_body.m_world.m_broadPhase;
		if (broadPhase.InRange(aabb))
		{
			this.m_proxyId = broadPhase.CreateProxy(aabb, this);
		}
		else
		{
			this.m_proxyId = b2Pair.b2_nullProxy;
		}

		if (this.m_proxyId == b2Pair.b2_nullProxy)
		{
			this.m_body.Freeze();
		}
	},

	// Temp AABB for Synch function
	syncAABB: new b2AABB(),
	syncMat: new b2Mat22(),
	Synchronize: function(position1, R1, position2, R2){
		// The body transform is copied for convenience.
		this.m_R.SetM(R2);
		//this.m_position = this.m_body->this.m_position + b2Mul(this.m_body->this.m_R, this.m_localCentroid)
		this.m_position.x = this.m_body.m_position.x + (R2.col1.x * this.m_localCentroid.x + R2.col2.x * this.m_localCentroid.y);
		this.m_position.y = this.m_body.m_position.y + (R2.col1.y * this.m_localCentroid.x + R2.col2.y * this.m_localCentroid.y);

		if (this.m_proxyId == b2Pair.b2_nullProxy)
		{
			return;
		}

		//b2AABB aabb1, aabb2;
		var hX;
		var hY;

		//b2Mat22 obbR = b2Mul(R1, this.m_localOBB.R);
			var v1 = R1.col1;
			var v2 = R1.col2;
			var v3 = this.m_localOBB.R.col1;
			var v4 = this.m_localOBB.R.col2;
			//this.syncMat.col1 = b2MulMV(R1, this.m_localOBB.R.col1);
			this.syncMat.col1.x = v1.x * v3.x + v2.x * v3.y;
			this.syncMat.col1.y = v1.y * v3.x + v2.y * v3.y;
			//this.syncMat.col2 = b2MulMV(R1, this.m_localOBB.R.col2);
			this.syncMat.col2.x = v1.x * v4.x + v2.x * v4.y;
			this.syncMat.col2.y = v1.y * v4.x + v2.y * v4.y;
		//b2Mat22 absR = b2Abs(obbR);
		this.syncMat.Abs();
		//b2Vec2 center = position1 + b2Mul(R1, this.m_localCentroid + this.m_localOBB.center);
		hX = this.m_localCentroid.x + this.m_localOBB.center.x;
		hY = this.m_localCentroid.y + this.m_localOBB.center.y;
		var centerX = position1.x + (R1.col1.x * hX + R1.col2.x * hY);
		var centerY = position1.y + (R1.col1.y * hX + R1.col2.y * hY);
		//b2Vec2 h = b2Mul(this.syncMat, this.m_localOBB.extents);
		hX = this.syncMat.col1.x * this.m_localOBB.extents.x + this.syncMat.col2.x * this.m_localOBB.extents.y;
		hY = this.syncMat.col1.y * this.m_localOBB.extents.x + this.syncMat.col2.y * this.m_localOBB.extents.y;
		//aabb1.minVertex = center - h;
		this.syncAABB.minVertex.x = centerX - hX;
		this.syncAABB.minVertex.y = centerY - hY;
		//aabb1.maxVertex = center + h;
		this.syncAABB.maxVertex.x = centerX + hX;
		this.syncAABB.maxVertex.y = centerY + hY;

		//b2Mat22 obbR = b2Mul(R2, this.m_localOBB.R);
			v1 = R2.col1;
			v2 = R2.col2;
			v3 = this.m_localOBB.R.col1;
			v4 = this.m_localOBB.R.col2;
			//this.syncMat.col1 = b2MulMV(R1, this.m_localOBB.R.col1);
			this.syncMat.col1.x = v1.x * v3.x + v2.x * v3.y;
			this.syncMat.col1.y = v1.y * v3.x + v2.y * v3.y;
			//this.syncMat.col2 = b2MulMV(R1, this.m_localOBB.R.col2);
			this.syncMat.col2.x = v1.x * v4.x + v2.x * v4.y;
			this.syncMat.col2.y = v1.y * v4.x + v2.y * v4.y;
		//b2Mat22 absR = b2Abs(obbR);
		this.syncMat.Abs();
		//b2Vec2 center = position2 + b2Mul(R2, this.m_localCentroid + this.m_localOBB.center);
		hX = this.m_localCentroid.x + this.m_localOBB.center.x;
		hY = this.m_localCentroid.y + this.m_localOBB.center.y;
		centerX = position2.x + (R2.col1.x * hX + R2.col2.x * hY);
		centerY = position2.y + (R2.col1.y * hX + R2.col2.y * hY);
		//b2Vec2 h = b2Mul(absR, this.m_localOBB.extents);
		hX = this.syncMat.col1.x * this.m_localOBB.extents.x + this.syncMat.col2.x * this.m_localOBB.extents.y;
		hY = this.syncMat.col1.y * this.m_localOBB.extents.x + this.syncMat.col2.y * this.m_localOBB.extents.y;
		//aabb2.minVertex = center - h;
		//aabb2.maxVertex = center + h;

		//aabb.minVertex = b2Min(aabb1.minVertex, aabb2.minVertex);
		this.syncAABB.minVertex.x = Math.min(this.syncAABB.minVertex.x, centerX - hX);
		this.syncAABB.minVertex.y = Math.min(this.syncAABB.minVertex.y, centerY - hY);
		//aabb.maxVertex = b2Max(aabb1.maxVertex, aabb2.maxVertex);
		this.syncAABB.maxVertex.x = Math.max(this.syncAABB.maxVertex.x, centerX + hX);
		this.syncAABB.maxVertex.y = Math.max(this.syncAABB.maxVertex.y, centerY + hY);

		var broadPhase = this.m_body.m_world.m_broadPhase;
		if (broadPhase.InRange(this.syncAABB))
		{
			broadPhase.MoveProxy(this.m_proxyId, this.syncAABB);
		}
		else
		{
			this.m_body.Freeze();
		}
	},

	QuickSync: function(position, R){
		//this.m_R = R;
		this.m_R.SetM(R);
		//this.m_position = position + b2Mul(R, this.m_localCentroid);
		this.m_position.x = position.x + (R.col1.x * this.m_localCentroid.x + R.col2.x * this.m_localCentroid.y);
		this.m_position.y = position.y + (R.col1.y * this.m_localCentroid.x + R.col2.y * this.m_localCentroid.y);
	},

	ResetProxy: function(broadPhase){

		if (this.m_proxyId == b2Pair.b2_nullProxy)
		{
			return;
		}

		var proxy = broadPhase.GetProxy(this.m_proxyId);

		broadPhase.DestroyProxy(this.m_proxyId);
		proxy = null;

		var R = b2Math.b2MulMM(this.m_R, this.m_localOBB.R);
		var absR = b2Math.b2AbsM(R);
		var h = b2Math.b2MulMV(absR, this.m_localOBB.extents);
		//var position = this.m_position + b2Mul(this.m_R, this.m_localOBB.center);
		var position = b2Math.b2MulMV(this.m_R, this.m_localOBB.center);
		position.Add(this.m_position);

		var aabb = new b2AABB();
		//aabb.minVertex = position - h;
		aabb.minVertex.SetV(position);
		aabb.minVertex.Subtract(h);
		//aabb.maxVertex = position + h;
		aabb.maxVertex.SetV(position);
		aabb.maxVertex.Add(h);

		if (broadPhase.InRange(aabb))
		{
			this.m_proxyId = broadPhase.CreateProxy(aabb, this);
		}
		else
		{
			this.m_proxyId = b2Pair.b2_nullProxy;
		}

		if (this.m_proxyId == b2Pair.b2_nullProxy)
		{
			this.m_body.Freeze();
		}
	},


	Support: function(dX, dY, out)
	{
		//b2Vec2 dLocal = b2MulT(this.m_R, d);
		var dLocalX = (dX*this.m_R.col1.x + dY*this.m_R.col1.y);
		var dLocalY = (dX*this.m_R.col2.x + dY*this.m_R.col2.y);

		var bestIndex = 0;
		//float32 bestValue = b2Dot(this.m_vertices[0], dLocal);
		var bestValue = (this.m_coreVertices[0].x * dLocalX + this.m_coreVertices[0].y * dLocalY);
		for (var i = 1; i < this.m_vertexCount; ++i)
		{
			//float32 value = b2Dot(this.m_vertices[i], dLocal);
			var value = (this.m_coreVertices[i].x * dLocalX + this.m_coreVertices[i].y * dLocalY);
			if (value > bestValue)
			{
				bestIndex = i;
				bestValue = value;
			}
		}

		//return this.m_position + b2Mul(this.m_R, this.m_vertices[bestIndex]);
		out.Set(	this.m_position.x + (this.m_R.col1.x * this.m_coreVertices[bestIndex].x + this.m_R.col2.x * this.m_coreVertices[bestIndex].y),
					this.m_position.y + (this.m_R.col1.y * this.m_coreVertices[bestIndex].x + this.m_R.col2.y * this.m_coreVertices[bestIndex].y));

	},


	// Local position of the shape centroid in parent body frame.
	m_localCentroid: new b2Vec2(),

	// Local position oriented bounding box. The OBB center is relative to
	// shape centroid.
	m_localOBB: new b2OBB(),
	m_vertices: null,
	m_coreVertices: null,
	m_vertexCount: 0,
	m_normals: null});

b2PolyShape.tempVec = new b2Vec2();
b2PolyShape.tAbsR = new b2Mat22();
/*
* Copyright (c) 2006-2007 Erin Catto http:
*
* This software is provided 'as-is', without any express or implied
* warranty.  In no event will the authors be held liable for any damages
* arising from the use of this software.
* Permission is granted to anyone to use this software for any purpose,
* including commercial applications, and to alter it and redistribute it
* freely, subject to the following restrictions:
* 1. The origin of this software must not be misrepresented; you must not
* claim that you wrote the original software. If you use this software
* in a product, an acknowledgment in the product documentation would be
* appreciated but is not required.
* 2. Altered source versions must be plainly marked, and must not be
* misrepresented the original software.
* 3. This notice may not be removed or altered from any source distribution.
*/






// A rigid body. Internal computation are done in terms
// of the center of mass position. The center of mass may
// be offset from the body's origin.
var b2Body = Class.create();
b2Body.prototype = 
{
	// Set the position of the body's origin and rotation (radians).
	// This breaks any contacts and wakes the other bodies.
	SetOriginPosition: function(position, rotation){
		if (this.IsFrozen())
		{
			return;
		}

		this.m_rotation = rotation;
		this.m_R.Set(this.m_rotation);
		this.m_position = b2Math.AddVV(position , b2Math.b2MulMV(this.m_R, this.m_center));

		this.m_position0.SetV(this.m_position);
		this.m_rotation0 = this.m_rotation;

		for (var s = this.m_shapeList; s != null; s = s.m_next)
		{
			s.Synchronize(this.m_position, this.m_R, this.m_position, this.m_R);
		}

		this.m_world.m_broadPhase.Commit();
	},

	// Get the position of the body's origin. The body's origin does not
	// necessarily coincide with the center of mass. It depends on how the
	// shapes are created.
	GetOriginPosition: function(){
		return b2Math.SubtractVV(this.m_position, b2Math.b2MulMV(this.m_R, this.m_center));
	},

	// Set the position of the body's center of mass and rotation (radians).
	// This breaks any contacts and wakes the other bodies.
	SetCenterPosition: function(position, rotation){
		if (this.IsFrozen())
		{
			return;
		}

		this.m_rotation = rotation;
		this.m_R.Set(this.m_rotation);
		this.m_position.SetV( position );

		this.m_position0.SetV(this.m_position);
		this.m_rotation0 = this.m_rotation;

		for (var s = this.m_shapeList; s != null; s = s.m_next)
		{
			s.Synchronize(this.m_position, this.m_R, this.m_position, this.m_R);
		}

		this.m_world.m_broadPhase.Commit();
	},

	// Get the position of the body's center of mass. The body's center of mass
	// does not necessarily coincide with the body's origin. It depends on how the
	// shapes are created.
	GetCenterPosition: function(){
		return this.m_position;
	},

	// Get the rotation in radians.
	GetRotation: function(){
		return this.m_rotation;
	},

	GetRotationMatrix: function(){
		return this.m_R;
	},

	// Set/Get the linear velocity of the center of mass.
	SetLinearVelocity: function(v){
		this.m_linearVelocity.SetV(v);
	},
	GetLinearVelocity: function(){
		return this.m_linearVelocity;
	},

	// Set/Get the angular velocity.
	SetAngularVelocity: function(w){
		this.m_angularVelocity = w;
	},
	GetAngularVelocity: function(){
		return this.m_angularVelocity;
	},

	// Apply a force at a world point. Additive.
	ApplyForce: function(force, point)
	{
		if (this.IsSleeping() == false)
		{
			this.m_force.Add( force );
			this.m_torque += b2Math.b2CrossVV(b2Math.SubtractVV(point, this.m_position), force);
		}
	},

	// Apply a torque. Additive.
	ApplyTorque: function(torque)
	{
		if (this.IsSleeping() == false)
		{
			this.m_torque += torque;
		}
	},

	// Apply an impulse at a point. This immediately modifies the velocity.
	ApplyImpulse: function(impulse, point)
	{
		if (this.IsSleeping() == false)
		{
			this.m_linearVelocity.Add( b2Math.MulFV(this.m_invMass, impulse) );
			this.m_angularVelocity += ( this.m_invI * b2Math.b2CrossVV( b2Math.SubtractVV(point, this.m_position), impulse)  );
		}
	},

	GetMass: function(){
		return this.m_mass;
	},

	GetInertia: function(){
		return this.m_I;
	},

	// Get the world coordinates of a point give the local coordinates
	// relative to the body's center of mass.
	GetWorldPoint: function(localPoint){
		return b2Math.AddVV(this.m_position , b2Math.b2MulMV(this.m_R, localPoint));
	},

	// Get the world coordinates of a vector given the local coordinates.
	GetWorldVector: function(localVector){
		return b2Math.b2MulMV(this.m_R, localVector);
	},

	// Returns a local point relative to the center of mass given a world point.
	GetLocalPoint: function(worldPoint){
		return b2Math.b2MulTMV(this.m_R, b2Math.SubtractVV(worldPoint, this.m_position));
	},

	// Returns a local vector given a world vector.
	GetLocalVector: function(worldVector){
		return b2Math.b2MulTMV(this.m_R, worldVector);
	},

	// Is this body static (immovable)?
	IsStatic: function(){
		return (this.m_flags & b2Body.e_staticFlag) == b2Body.e_staticFlag;
	},

	IsFrozen: function()
	{
		return (this.m_flags & b2Body.e_frozenFlag) == b2Body.e_frozenFlag;
	},

	// Is this body sleeping (not simulating).
	IsSleeping: function(){
		return (this.m_flags & b2Body.e_sleepFlag) == b2Body.e_sleepFlag;
	},

	// You can disable sleeping on this particular body.
	AllowSleeping: function(flag)
	{
		if (flag)
		{
			this.m_flags |= b2Body.e_allowSleepFlag;
		}
		else
		{
			this.m_flags &= ~b2Body.e_allowSleepFlag;
			this.WakeUp();
		}
	},

	// Wake up this body so it will begin simulating.
	WakeUp: function(){
		this.m_flags &= ~b2Body.e_sleepFlag;
		this.m_sleepTime = 0.0;
	},

	// Get the list of all shapes attached to this body.
	GetShapeList: function(){
		return this.m_shapeList;
	},

	GetContactList: function()
	{
		return this.m_contactList;
	},

	GetJointList: function()
	{
		return this.m_jointList;
	},

	// Get the next body in the world's body list.
	GetNext: function(){
		return this.m_next;
	},

	GetUserData: function(){
		return this.m_userData;
	},

	//--------------- Internals Below -------------------

	initialize: function(bd, world){
		// initialize instance variables for references
		this.sMat0 = new b2Mat22();
		this.m_position = new b2Vec2();
		this.m_R = new b2Mat22(0);
		this.m_position0 = new b2Vec2();
		//

		var i = 0;
		var sd;
		var massData;

		this.m_flags = 0;
		this.m_position.SetV( bd.position );
		this.m_rotation = bd.rotation;
		this.m_R.Set(this.m_rotation);
		this.m_position0.SetV(this.m_position);
		this.m_rotation0 = this.m_rotation;
		this.m_world = world;

		this.m_linearDamping = b2Math.b2Clamp(1.0 - bd.linearDamping, 0.0, 1.0);
		this.m_angularDamping = b2Math.b2Clamp(1.0 - bd.angularDamping, 0.0, 1.0);

		this.m_force = new b2Vec2(0.0, 0.0);
		this.m_torque = 0.0;

		this.m_mass = 0.0;

		var massDatas = new Array(b2Settings.b2_maxShapesPerBody);
		for (i = 0; i < b2Settings.b2_maxShapesPerBody; i++){
			massDatas[i] = new b2MassData();
		}

		// Compute the shape mass properties, the bodies total mass and COM.
		this.m_shapeCount = 0;
		this.m_center = new b2Vec2(0.0, 0.0);
		for (i = 0; i < b2Settings.b2_maxShapesPerBody; ++i)
		{
			sd = bd.shapes[i];
			if (sd == null) break;
			massData = massDatas[ i ];
			sd.ComputeMass(massData);
			this.m_mass += massData.mass;
			//this.m_center += massData->mass * (sd->localPosition + massData->center);
			this.m_center.x += massData.mass * (sd.localPosition.x + massData.center.x);
			this.m_center.y += massData.mass * (sd.localPosition.y + massData.center.y);
			++this.m_shapeCount;
		}

		// Compute center of mass, and shift the origin to the COM.
		if (this.m_mass > 0.0)
		{
			this.m_center.Multiply( 1.0 / this.m_mass );
			this.m_position.Add( b2Math.b2MulMV(this.m_R, this.m_center) );
		}
		else
		{
			this.m_flags |= b2Body.e_staticFlag;
		}

		// Compute the moment of inertia.
		this.m_I = 0.0;
		for (i = 0; i < this.m_shapeCount; ++i)
		{
			sd = bd.shapes[i];
			massData = massDatas[ i ];
			this.m_I += massData.I;
			var r = b2Math.SubtractVV( b2Math.AddVV(sd.localPosition, massData.center), this.m_center );
			this.m_I += massData.mass * b2Math.b2Dot(r, r);
		}

		if (this.m_mass > 0.0)
		{
			this.m_invMass = 1.0 / this.m_mass;
		}
		else
		{
			this.m_invMass = 0.0;
		}

		if (this.m_I > 0.0 && bd.preventRotation == false)
		{
			this.m_invI = 1.0 / this.m_I;
		}
		else
		{
			this.m_I = 0.0;
			this.m_invI = 0.0;
		}

		// Compute the center of mass velocity.
		this.m_linearVelocity = b2Math.AddVV(bd.linearVelocity, b2Math.b2CrossFV(bd.angularVelocity, this.m_center));
		this.m_angularVelocity = bd.angularVelocity;

		this.m_jointList = null;
		this.m_contactList = null;
		this.m_prev = null;
		this.m_next = null;

		// Create the shapes.
		this.m_shapeList = null;
		for (i = 0; i < this.m_shapeCount; ++i)
		{
			sd = bd.shapes[i];
			var shape = b2Shape.Create(sd, this, this.m_center);
			shape.m_next = this.m_shapeList;
			this.m_shapeList = shape;
		}

		this.m_sleepTime = 0.0;
		if (bd.allowSleep)
		{
			this.m_flags |= b2Body.e_allowSleepFlag;
		}
		if (bd.isSleeping)
		{
			this.m_flags |= b2Body.e_sleepFlag;
		}

		if ((this.m_flags & b2Body.e_sleepFlag)  || this.m_invMass == 0.0)
		{
			this.m_linearVelocity.Set(0.0, 0.0);
			this.m_angularVelocity = 0.0;
		}

		this.m_userData = bd.userData;
	},
	// does not support destructors
	/*~b2Body(){
		b2Shape* s = this.m_shapeList;
		while (s)
		{
			b2Shape* s0 = s;
			s = s->this.m_next;

			b2Shape::this.Destroy(s0);
		}
	}*/

	Destroy: function(){
		var s = this.m_shapeList;
		while (s)
		{
			var s0 = s;
			s = s.m_next;

			b2Shape.Destroy(s0);
		}
	},

	// Temp mat
	sMat0: new b2Mat22(),
	SynchronizeShapes: function(){
		//b2Mat22 R0(this.m_rotation0);
		this.sMat0.Set(this.m_rotation0);
		for (var s = this.m_shapeList; s != null; s = s.m_next)
		{
			s.Synchronize(this.m_position0, this.sMat0, this.m_position, this.m_R);
		}
	},

	QuickSyncShapes: function(){
		for (var s = this.m_shapeList; s != null; s = s.m_next)
		{
			s.QuickSync(this.m_position, this.m_R);
		}
	},

	// This is used to prevent connected bodies from colliding.
	// It may lie, depending on the collideConnected flag.
	IsConnected: function(other){
		for (var jn = this.m_jointList; jn != null; jn = jn.next)
		{
			if (jn.other == other)
				return jn.joint.m_collideConnected == false;
		}

		return false;
	},

	Freeze: function(){
		this.m_flags |= b2Body.e_frozenFlag;
		this.m_linearVelocity.SetZero();
		this.m_angularVelocity = 0.0;

		for (var s = this.m_shapeList; s != null; s = s.m_next)
		{
			s.DestroyProxy();
		}
	},

	m_flags: 0,

	m_position: new b2Vec2(),
	m_rotation: null,
	m_R: new b2Mat22(0),

	// Conservative advancement data.
	m_position0: new b2Vec2(),
	m_rotation0: null,

	m_linearVelocity: null,
	m_angularVelocity: null,

	m_force: null,
	m_torque: null,

	m_center: null,

	m_world: null,
	m_prev: null,
	m_next: null,

	m_shapeList: null,
	m_shapeCount: 0,

	m_jointList: null,
	m_contactList: null,

	m_mass: null,
	m_invMass: null,
	m_I: null,
	m_invI: null,

	m_linearDamping: null,
	m_angularDamping: null,

	m_sleepTime: null,

	m_userData: null};
b2Body.e_staticFlag = 0x0001;
b2Body.e_frozenFlag = 0x0002;
b2Body.e_islandFlag = 0x0004;
b2Body.e_sleepFlag = 0x0008;
b2Body.e_allowSleepFlag = 0x0010;
b2Body.e_destroyFlag = 0x0020;
/*
* Copyright (c) 2006-2007 Erin Catto http:
*
* This software is provided 'as-is', without any express or implied
* warranty.  In no event will the authors be held liable for any damages
* arising from the use of this software.
* Permission is granted to anyone to use this software for any purpose,
* including commercial applications, and to alter it and redistribute it
* freely, subject to the following restrictions:
* 1. The origin of this software must not be misrepresented; you must not
* claim that you wrote the original software. If you use this software
* in a product, an acknowledgment in the product documentation would be
* appreciated but is not required.
* 2. Altered source versions must be plainly marked, and must not be
* misrepresented the original software.
* 3. This notice may not be removed or altered from any source distribution.
*/





var b2BodyDef = Class.create();
b2BodyDef.prototype = 
{
	initialize: function()
	{
		// initialize instance variables for references
		this.shapes = new Array();
		//

		this.userData = null;
		for (var i = 0; i < b2Settings.b2_maxShapesPerBody; i++){
			this.shapes[i] = null;
		}
		this.position = new b2Vec2(0.0, 0.0);
		this.rotation = 0.0;
		this.linearVelocity = new b2Vec2(0.0, 0.0);
		this.angularVelocity = 0.0;
		this.linearDamping = 0.0;
		this.angularDamping = 0.0;
		this.allowSleep = true;
		this.isSleeping = false;
		this.preventRotation = false;
	},

	userData: null,
	shapes: new Array(),
	position: null,
	rotation: null,
	linearVelocity: null,
	angularVelocity: null,
	linearDamping: null,
	angularDamping: null,
	allowSleep: null,
	isSleeping: null,
	preventRotation: null,

	AddShape: function(shape)
	{
		for (var i = 0; i < b2Settings.b2_maxShapesPerBody; ++i)
		{
			if (this.shapes[i] == null)
			{
				this.shapes[i] = shape;
				break;
			}
		}
	}};
/*
* Copyright (c) 2006-2007 Erin Catto http:
*
* This software is provided 'as-is', without any express or implied
* warranty.  In no event will the authors be held liable for any damages
* arising from the use of this software.
* Permission is granted to anyone to use this software for any purpose,
* including commercial applications, and to alter it and redistribute it
* freely, subject to the following restrictions:
* 1. The origin of this software must not be misrepresented; you must not
* claim that you wrote the original software. If you use this software
* in a product, an acknowledgment in the product documentation would be
* appreciated but is not required.
* 2. Altered source versions must be plainly marked, and must not be
* misrepresented the original software.
* 3. This notice may not be removed or altered from any source distribution.
*/







var b2CollisionFilter = Class.create();
b2CollisionFilter.prototype = 
{

	// Return true if contact calculations should be performed between these two shapes.
	ShouldCollide: function(shape1, shape2){
		if (shape1.m_groupIndex == shape2.m_groupIndex && shape1.m_groupIndex != 0)
		{
			return shape1.m_groupIndex > 0;
		}

		var collide = (shape1.m_maskBits & shape2.m_categoryBits) != 0 && (shape1.m_categoryBits & shape2.m_maskBits) != 0;
		return collide;
	},


	initialize: function() {}};
b2CollisionFilter.b2_defaultFilter = new b2CollisionFilter;
/*
* Copyright (c) 2006-2007 Erin Catto http:
*
* This software is provided 'as-is', without any express or implied
* warranty.  In no event will the authors be held liable for any damages
* arising from the use of this software.
* Permission is granted to anyone to use this software for any purpose,
* including commercial applications, and to alter it and redistribute it
* freely, subject to the following restrictions:
* 1. The origin of this software must not be misrepresented; you must not
* claim that you wrote the original software. If you use this software
* in a product, an acknowledgment in the product documentation would be
* appreciated but is not required.
* 2. Altered source versions must be plainly marked, and must not be
* misrepresented the original software.
* 3. This notice may not be removed or altered from any source distribution.
*/





/*
Position Correction Notes
=========================
I tried the several algorithms for position correction of the 2D revolute joint.
I looked at these systems:
- simple pendulum (1m diameter sphere on massless 5m stick) with initial angular velocity of 100 rad/s.
- suspension bridge with 30 1m long planks of length 1m.
- multi-link chain with 30 1m long links.

Here are the algorithms:

Baumgarte - A fraction of the position error is added to the velocity error. There is no
separate position solver.

Pseudo Velocities - After the velocity solver and position integration,
the position error, Jacobian, and effective mass are recomputed. Then
the velocity constraints are solved with pseudo velocities and a fraction
of the position error is added to the pseudo velocity error. The pseudo
velocities are initialized to zero and there is no warm-starting. After
the position solver, the pseudo velocities are added to the positions.
This is also called the First Order World method or the Position LCP method.

Modified Nonlinear Gauss-Seidel (NGS) - Like Pseudo Velocities except the
position error is re-computed for each constraint and the positions are updated
after the constraint is solved. The radius vectors (aka Jacobians) are
re-computed too (otherwise the algorithm has horrible instability). The pseudo
velocity states are not needed because they are effectively zero at the beginning
of each iteration. Since we have the current position error, we allow the
iterations to terminate early if the error becomes smaller than b2_linearSlop.

Full NGS or just NGS - Like Modified NGS except the effective mass are re-computed
each time a constraint is solved.

Here are the results:
Baumgarte - this is the cheapest algorithm but it has some stability problems,
especially with the bridge. The chain links separate easily close to the root
and they jitter struggle to pull together. This is one of the most common
methods in the field. The big drawback is that the position correction artificially
affects the momentum, thus leading to instabilities and false bounce. I used a
bias factor of 0.2. A larger bias factor makes the bridge less stable, a smaller
factor makes joints and contacts more spongy.

Pseudo Velocities - the is more stable than the Baumgarte method. The bridge is
stable. However, joints still separate with large angular velocities. Drag the
simple pendulum in a circle quickly and the joint will separate. The chain separates
easily and does not recover. I used a bias factor of 0.2. A larger value lead to
the bridge collapsing when a heavy cube drops on it.

Modified NGS - this algorithm is better in some ways than Baumgarte and Pseudo
Velocities, but in other ways it is worse. The bridge and chain are much more
stable, but the simple pendulum goes unstable at high angular velocities.

Full NGS - stable in all tests. The joints display good stiffness. The bridge
still sags, but this is better than infinite forces.

Recommendations
Pseudo Velocities are not really worthwhile because the bridge and chain cannot
recover from joint separation. In other cases the benefit over Baumgarte is small.

Modified NGS is not a robust method for the revolute joint due to the violent
instability seen in the simple pendulum. Perhaps it is viable with other constraint
types, especially scalar constraints where the effective mass is a scalar.

This leaves Baumgarte and Full NGS. Baumgarte has small, but manageable instabilities
and is very fast. I don't think we can escape Baumgarte, especially in highly
demanding cases where high constraint fidelity is not needed.

Full NGS is robust and easy on the eyes. I recommend this option for
higher fidelity simulation and certainly for suspension bridges and long chains.
Full NGS might be a good choice for ragdolls, especially motorized ragdolls where
joint separation can be problematic. The number of NGS iterations can be reduced
for better performance without harming robustness much.

Each joint in a can be handled differently in the position solver. So I recommend
a system where the user can select the algorithm on a per joint basis. I would
probably default to the slower Full NGS and let the user select the faster
Baumgarte method in performance critical scenarios.
*/


var b2Island = Class.create();
b2Island.prototype = 
{
	initialize: function(bodyCapacity, contactCapacity, jointCapacity, allocator)
	{
		var i = 0;

		this.m_bodyCapacity = bodyCapacity;
		this.m_contactCapacity = contactCapacity;
		this.m_jointCapacity	 = jointCapacity;
		this.m_bodyCount = 0;
		this.m_contactCount = 0;
		this.m_jointCount = 0;


		//this.m_bodies = (b2Body**)allocator->Allocate(bodyCapacity * sizeof(b2Body*));
		this.m_bodies = new Array(bodyCapacity);
		for (i = 0; i < bodyCapacity; i++)
			this.m_bodies[i] = null;

		//this.m_contacts = (b2Contact**)allocator->Allocate(contactCapacity	 * sizeof(b2Contact*));
		this.m_contacts = new Array(contactCapacity);
		for (i = 0; i < contactCapacity; i++)
			this.m_contacts[i] = null;

		//this.m_joints = (b2Joint**)allocator->Allocate(jointCapacity * sizeof(b2Joint*));
		this.m_joints = new Array(jointCapacity);
		for (i = 0; i < jointCapacity; i++)
			this.m_joints[i] = null;

		this.m_allocator = allocator;
	},
	//~b2Island();

	Clear: function()
	{
		this.m_bodyCount = 0;
		this.m_contactCount = 0;
		this.m_jointCount = 0;
	},

	Solve: function(step, gravity)
	{
		var i = 0;
		var b;

		for (i = 0; i < this.m_bodyCount; ++i)
		{
			b = this.m_bodies[i];

			if (b.m_invMass == 0.0)
				continue;

			b.m_linearVelocity.Add( b2Math.MulFV (step.dt, b2Math.AddVV(gravity, b2Math.MulFV( b.m_invMass, b.m_force ) ) ) );
			b.m_angularVelocity += step.dt * b.m_invI * b.m_torque;

			//b.m_linearVelocity *= b.m_linearDamping;
			b.m_linearVelocity.Multiply(b.m_linearDamping);
			b.m_angularVelocity *= b.m_angularDamping;

			// Store positions for conservative advancement.
			b.m_position0.SetV(b.m_position);
			b.m_rotation0 = b.m_rotation;
		}

		var contactSolver = new b2ContactSolver(this.m_contacts, this.m_contactCount, this.m_allocator);

		// Pre-solve
		contactSolver.PreSolve();

		for (i = 0; i < this.m_jointCount; ++i)
		{
			this.m_joints[i].PrepareVelocitySolver();
		}

		// this.Solve velocity constraints.
		for (i = 0; i < step.iterations; ++i)
		{
			contactSolver.SolveVelocityConstraints();

			for (var j = 0; j < this.m_jointCount; ++j)
			{
				this.m_joints[j].SolveVelocityConstraints(step);
			}
		}

		// Integrate positions.
		for (i = 0; i < this.m_bodyCount; ++i)
		{
			b = this.m_bodies[i];

			if (b.m_invMass == 0.0)
				continue;

			//b.m_position.Add( b2Math.MulFV (step.dt, b.m_linearVelocity) );
			b.m_position.x += step.dt * b.m_linearVelocity.x;
			b.m_position.y += step.dt * b.m_linearVelocity.y;
			b.m_rotation += step.dt * b.m_angularVelocity;

			b.m_R.Set(b.m_rotation);
		}

		for (i = 0; i < this.m_jointCount; ++i)
		{
			this.m_joints[i].PreparePositionSolver();
		}

		// this.Solve position constraints.
		if (b2World.s_enablePositionCorrection)
		{
			for (b2Island.m_positionIterationCount = 0; b2Island.m_positionIterationCount < step.iterations; ++b2Island.m_positionIterationCount)
			{
				var contactsOkay = contactSolver.SolvePositionConstraints(b2Settings.b2_contactBaumgarte);

				var jointsOkay = true;
				for (i = 0; i < this.m_jointCount; ++i)
				{
					var jointOkay = this.m_joints[i].SolvePositionConstraints();
					jointsOkay = jointsOkay && jointOkay;
				}

				if (contactsOkay && jointsOkay)
				{
					break;
				}
			}
		}

		// Post-solve.
		contactSolver.PostSolve();

		// Synchronize shapes and reset forces.
		for (i = 0; i < this.m_bodyCount; ++i)
		{
			b = this.m_bodies[i];

			if (b.m_invMass == 0.0)
				continue;

			b.m_R.Set(b.m_rotation);

			b.SynchronizeShapes();
			b.m_force.Set(0.0, 0.0);
			b.m_torque = 0.0;
		}
	},

	UpdateSleep: function(dt)
	{
		var i = 0;
		var b;

		var minSleepTime = Number.MAX_VALUE;

		var linTolSqr = b2Settings.b2_linearSleepTolerance * b2Settings.b2_linearSleepTolerance;
		var angTolSqr = b2Settings.b2_angularSleepTolerance * b2Settings.b2_angularSleepTolerance;

		for (i = 0; i < this.m_bodyCount; ++i)
		{
			b = this.m_bodies[i];
			if (b.m_invMass == 0.0)
			{
				continue;
			}

			if ((b.m_flags & b2Body.e_allowSleepFlag) == 0)
			{
				b.m_sleepTime = 0.0;
				minSleepTime = 0.0;
			}

			if ((b.m_flags & b2Body.e_allowSleepFlag) == 0 ||
				b.m_angularVelocity * b.m_angularVelocity > angTolSqr ||
				b2Math.b2Dot(b.m_linearVelocity, b.m_linearVelocity) > linTolSqr)
			{
				b.m_sleepTime = 0.0;
				minSleepTime = 0.0;
			}
			else
			{
				b.m_sleepTime += dt;
				minSleepTime = b2Math.b2Min(minSleepTime, b.m_sleepTime);
			}
		}

		if (minSleepTime >= b2Settings.b2_timeToSleep)
		{
			for (i = 0; i < this.m_bodyCount; ++i)
			{
				b = this.m_bodies[i];
				b.m_flags |= b2Body.e_sleepFlag;
			}
		}
	},

	AddBody: function(body)
	{
		//b2Settings.b2Assert(this.m_bodyCount < this.m_bodyCapacity);
		this.m_bodies[this.m_bodyCount++] = body;
	},

	AddContact: function(contact)
	{
		//b2Settings.b2Assert(this.m_contactCount < this.m_contactCapacity);
		this.m_contacts[this.m_contactCount++] = contact;
	},

	AddJoint: function(joint)
	{
		//b2Settings.b2Assert(this.m_jointCount < this.m_jointCapacity);
		this.m_joints[this.m_jointCount++] = joint;
	},

	m_allocator: null,

	m_bodies: null,
	m_contacts: null,
	m_joints: null,

	m_bodyCount: 0,
	m_jointCount: 0,
	m_contactCount: 0,

	m_bodyCapacity: 0,
	m_contactCapacity: 0,
	m_jointCapacity: 0,

	m_positionError: null};
b2Island.m_positionIterationCount = 0;
/*
* Copyright (c) 2006-2007 Erin Catto http:
*
* This software is provided 'as-is', without any express or implied
* warranty.  In no event will the authors be held liable for any damages
* arising from the use of this software.
* Permission is granted to anyone to use this software for any purpose,
* including commercial applications, and to alter it and redistribute it
* freely, subject to the following restrictions:
* 1. The origin of this software must not be misrepresented; you must not
* claim that you wrote the original software. If you use this software
* in a product, an acknowledgment in the product documentation would be
* appreciated but is not required.
* 2. Altered source versions must be plainly marked, and must not be
* misrepresented the original software.
* 3. This notice may not be removed or altered from any source distribution.
*/



var b2TimeStep = Class.create();
b2TimeStep.prototype = 
{
	dt: null,
	inv_dt: null,
	iterations: 0,
	initialize: function() {}};
/*
* Copyright (c) 2006-2007 Erin Catto http:
*
* This software is provided 'as-is', without any express or implied
* warranty.  In no event will the authors be held liable for any damages
* arising from the use of this software.
* Permission is granted to anyone to use this software for any purpose,
* including commercial applications, and to alter it and redistribute it
* freely, subject to the following restrictions:
* 1. The origin of this software must not be misrepresented; you must not
* claim that you wrote the original software. If you use this software
* in a product, an acknowledgment in the product documentation would be
* appreciated but is not required.
* 2. Altered source versions must be plainly marked, and must not be
* misrepresented the original software.
* 3. This notice may not be removed or altered from any source distribution.
*/





var b2ContactNode = Class.create();
b2ContactNode.prototype = 
{
	other: null,
	contact: null,
	prev: null,
	next: null,
	initialize: function() {}};



/*
* Copyright (c) 2006-2007 Erin Catto http:
*
* This software is provided 'as-is', without any express or implied
* warranty.  In no event will the authors be held liable for any damages
* arising from the use of this software.
* Permission is granted to anyone to use this software for any purpose,
* including commercial applications, and to alter it and redistribute it
* freely, subject to the following restrictions:
* 1. The origin of this software must not be misrepresented; you must not
* claim that you wrote the original software. If you use this software
* in a product, an acknowledgment in the product documentation would be
* appreciated but is not required.
* 2. Altered source versions must be plainly marked, and must not be
* misrepresented the original software.
* 3. This notice may not be removed or altered from any source distribution.
*/





//typedef b2Contact* b2ContactCreateFcn(b2Shape* shape1, b2Shape* shape2, b2BlockAllocator* allocator);
//typedef void b2ContactDestroyFcn(b2Contact* contact, b2BlockAllocator* allocator);



var b2Contact = Class.create();
b2Contact.prototype = 
{
	GetManifolds: function(){return null},
	GetManifoldCount: function()
	{
		return this.m_manifoldCount;
	},

	GetNext: function(){
		return this.m_next;
	},

	GetShape1: function(){
		return this.m_shape1;
	},

	GetShape2: function(){
		return this.m_shape2;
	},

	//--------------- Internals Below -------------------

	// this.m_flags
	// enum


	initialize: function(s1, s2)
	{
		// initialize instance variables for references
		this.m_node1 = new b2ContactNode();
		this.m_node2 = new b2ContactNode();
		//

		this.m_flags = 0;

		if (!s1 || !s2){
			this.m_shape1 = null;
			this.m_shape2 = null;
			return;
		}

		this.m_shape1 = s1;
		this.m_shape2 = s2;

		this.m_manifoldCount = 0;

		this.m_friction = Math.sqrt(this.m_shape1.m_friction * this.m_shape2.m_friction);
		this.m_restitution = b2Math.b2Max(this.m_shape1.m_restitution, this.m_shape2.m_restitution);

		this.m_prev = null;
		this.m_next = null;

		this.m_node1.contact = null;
		this.m_node1.prev = null;
		this.m_node1.next = null;
		this.m_node1.other = null;

		this.m_node2.contact = null;
		this.m_node2.prev = null;
		this.m_node2.next = null;
		this.m_node2.other = null;
	},

	//virtual ~b2Contact() {}

	Evaluate: function(){},

	m_flags: 0,

	// World pool and list pointers.
	m_prev: null,
	m_next: null,

	// Nodes for connecting bodies.
	m_node1: new b2ContactNode(),
	m_node2: new b2ContactNode(),

	m_shape1: null,
	m_shape2: null,

	m_manifoldCount: 0,

	// Combined friction
	m_friction: null,
	m_restitution: null};
b2Contact.e_islandFlag = 0x0001;
b2Contact.e_destroyFlag = 0x0002;
b2Contact.AddType = function(createFcn, destroyFcn, type1, type2)
	{
		//b2Settings.b2Assert(b2Shape.e_unknownShape < type1 && type1 < b2Shape.e_shapeTypeCount);
		//b2Settings.b2Assert(b2Shape.e_unknownShape < type2 && type2 < b2Shape.e_shapeTypeCount);

		b2Contact.s_registers[type1][type2].createFcn = createFcn;
		b2Contact.s_registers[type1][type2].destroyFcn = destroyFcn;
		b2Contact.s_registers[type1][type2].primary = true;

		if (type1 != type2)
		{
			b2Contact.s_registers[type2][type1].createFcn = createFcn;
			b2Contact.s_registers[type2][type1].destroyFcn = destroyFcn;
			b2Contact.s_registers[type2][type1].primary = false;
		}
	};
b2Contact.InitializeRegisters = function(){
		b2Contact.s_registers = new Array(b2Shape.e_shapeTypeCount);
		for (var i = 0; i < b2Shape.e_shapeTypeCount; i++){
			b2Contact.s_registers[i] = new Array(b2Shape.e_shapeTypeCount);
			for (var j = 0; j < b2Shape.e_shapeTypeCount; j++){
				b2Contact.s_registers[i][j] = new b2ContactRegister();
			}
		}

		b2Contact.AddType(b2CircleContact.Create, b2CircleContact.Destroy, b2Shape.e_circleShape, b2Shape.e_circleShape);
		b2Contact.AddType(b2PolyAndCircleContact.Create, b2PolyAndCircleContact.Destroy, b2Shape.e_polyShape, b2Shape.e_circleShape);
		b2Contact.AddType(b2PolyContact.Create, b2PolyContact.Destroy, b2Shape.e_polyShape, b2Shape.e_polyShape);

	};
b2Contact.Create = function(shape1, shape2, allocator){
		if (b2Contact.s_initialized == false)
		{
			b2Contact.InitializeRegisters();
			b2Contact.s_initialized = true;
		}

		var type1 = shape1.m_type;
		var type2 = shape2.m_type;

		//b2Settings.b2Assert(b2Shape.e_unknownShape < type1 && type1 < b2Shape.e_shapeTypeCount);
		//b2Settings.b2Assert(b2Shape.e_unknownShape < type2 && type2 < b2Shape.e_shapeTypeCount);

		var createFcn = b2Contact.s_registers[type1][type2].createFcn;
		if (createFcn)
		{
			if (b2Contact.s_registers[type1][type2].primary)
			{
				return createFcn(shape1, shape2, allocator);
			}
			else
			{
				var c = createFcn(shape2, shape1, allocator);
				for (var i = 0; i < c.GetManifoldCount(); ++i)
				{
					var m = c.GetManifolds()[ i ];
					m.normal = m.normal.Negative();
				}
				return c;
			}
		}
		else
		{
			return null;
		}
	};
b2Contact.Destroy = function(contact, allocator){
		//b2Settings.b2Assert(b2Contact.s_initialized == true);

		if (contact.GetManifoldCount() > 0)
		{
			contact.m_shape1.m_body.WakeUp();
			contact.m_shape2.m_body.WakeUp();
		}

		var type1 = contact.m_shape1.m_type;
		var type2 = contact.m_shape2.m_type;

		//b2Settings.b2Assert(b2Shape.e_unknownShape < type1 && type1 < b2Shape.e_shapeTypeCount);
		//b2Settings.b2Assert(b2Shape.e_unknownShape < type2 && type2 < b2Shape.e_shapeTypeCount);

		var destroyFcn = b2Contact.s_registers[type1][type2].destroyFcn;
		destroyFcn(contact, allocator);
	};
b2Contact.s_registers = null;
b2Contact.s_initialized = false;
/*
* Copyright (c) 2006-2007 Erin Catto http:
*
* This software is provided 'as-is', without any express or implied
* warranty.  In no event will the authors be held liable for any damages
* arising from the use of this software.
* Permission is granted to anyone to use this software for any purpose,
* including commercial applications, and to alter it and redistribute it
* freely, subject to the following restrictions:
* 1. The origin of this software must not be misrepresented; you must not
* claim that you wrote the original software. If you use this software
* in a product, an acknowledgment in the product documentation would be
* appreciated but is not required.
* 2. Altered source versions must be plainly marked, and must not be
* misrepresented the original software.
* 3. This notice may not be removed or altered from any source distribution.
*/





var b2ContactConstraint = Class.create();
b2ContactConstraint.prototype = 
{
	initialize: function(){
		// initialize instance variables for references
		this.normal = new b2Vec2();
		//

		this.points = new Array(b2Settings.b2_maxManifoldPoints);
		for (var i = 0; i < b2Settings.b2_maxManifoldPoints; i++){
			this.points[i] = new b2ContactConstraintPoint();
		}


	},
	points: null,
	normal: new b2Vec2(),
	manifold: null,
	body1: null,
	body2: null,
	friction: null,
	restitution: null,
	pointCount: 0};
/*
* Copyright (c) 2006-2007 Erin Catto http:
*
* This software is provided 'as-is', without any express or implied
* warranty.  In no event will the authors be held liable for any damages
* arising from the use of this software.
* Permission is granted to anyone to use this software for any purpose,
* including commercial applications, and to alter it and redistribute it
* freely, subject to the following restrictions:
* 1. The origin of this software must not be misrepresented; you must not
* claim that you wrote the original software. If you use this software
* in a product, an acknowledgment in the product documentation would be
* appreciated but is not required.
* 2. Altered source versions must be plainly marked, and must not be
* misrepresented the original software.
* 3. This notice may not be removed or altered from any source distribution.
*/





var b2ContactConstraintPoint = Class.create();
b2ContactConstraintPoint.prototype = 
{
	localAnchor1: new b2Vec2(),
	localAnchor2: new b2Vec2(),
	normalImpulse: null,
	tangentImpulse: null,
	positionImpulse: null,
	normalMass: null,
	tangentMass: null,
	separation: null,
	velocityBias: null,
	initialize: function() {
		// initialize instance variables for references
		this.localAnchor1 = new b2Vec2();
		this.localAnchor2 = new b2Vec2();
		//
}};
/*
* Copyright (c) 2006-2007 Erin Catto http:
*
* This software is provided 'as-is', without any express or implied
* warranty.  In no event will the authors be held liable for any damages
* arising from the use of this software.
* Permission is granted to anyone to use this software for any purpose,
* including commercial applications, and to alter it and redistribute it
* freely, subject to the following restrictions:
* 1. The origin of this software must not be misrepresented; you must not
* claim that you wrote the original software. If you use this software
* in a product, an acknowledgment in the product documentation would be
* appreciated but is not required.
* 2. Altered source versions must be plainly marked, and must not be
* misrepresented the original software.
* 3. This notice may not be removed or altered from any source distribution.
*/



var b2ContactRegister = Class.create();
b2ContactRegister.prototype = 
{
	createFcn: null,
	destroyFcn: null,
	primary: null,
	initialize: function() {}};



/*
* Copyright (c) 2006-2007 Erin Catto http:
*
* This software is provided 'as-is', without any express or implied
* warranty.  In no event will the authors be held liable for any damages
* arising from the use of this software.
* Permission is granted to anyone to use this software for any purpose,
* including commercial applications, and to alter it and redistribute it
* freely, subject to the following restrictions:
* 1. The origin of this software must not be misrepresented; you must not
* claim that you wrote the original software. If you use this software
* in a product, an acknowledgment in the product documentation would be
* appreciated but is not required.
* 2. Altered source versions must be plainly marked, and must not be
* misrepresented the original software.
* 3. This notice may not be removed or altered from any source distribution.
*/





var b2ContactSolver = Class.create();
b2ContactSolver.prototype = 
{
	initialize: function(contacts, contactCount, allocator){
		// initialize instance variables for references
		this.m_constraints = new Array();
		//

		this.m_allocator = allocator;

		var i = 0;
		var tVec;
		var tMat;

		this.m_constraintCount = 0;
		for (i = 0; i < contactCount; ++i)
		{
			this.m_constraintCount += contacts[i].GetManifoldCount();
		}

		// fill array
		for (i = 0; i < this.m_constraintCount; i++){
			this.m_constraints[i] = new b2ContactConstraint();
		}

		var count = 0;
		for (i = 0; i < contactCount; ++i)
		{
			var contact = contacts[i];
			var b1 = contact.m_shape1.m_body;
			var b2 = contact.m_shape2.m_body;
			var manifoldCount = contact.GetManifoldCount();
			var manifolds = contact.GetManifolds();
			var friction = contact.m_friction;
			var restitution = contact.m_restitution;

			//var v1 = b1.m_linearVelocity.Copy();
			var v1X = b1.m_linearVelocity.x;
			var v1Y = b1.m_linearVelocity.y;
			//var v2 = b2.m_linearVelocity.Copy();
			var v2X = b2.m_linearVelocity.x;
			var v2Y = b2.m_linearVelocity.y;
			var w1 = b1.m_angularVelocity;
			var w2 = b2.m_angularVelocity;

			for (var j = 0; j < manifoldCount; ++j)
			{
				var manifold = manifolds[ j ];

				//b2Settings.b2Assert(manifold.pointCount > 0);

				//var normal = manifold.normal.Copy();
				var normalX = manifold.normal.x;
				var normalY = manifold.normal.y;

				//b2Settings.b2Assert(count < this.m_constraintCount);
				var c = this.m_constraints[ count ];
				c.body1 = b1;
				c.body2 = b2;
				c.manifold = manifold;
				//c.normal = normal;
				c.normal.x = normalX;
				c.normal.y = normalY;
				c.pointCount = manifold.pointCount;
				c.friction = friction;
				c.restitution = restitution;

				for (var k = 0; k < c.pointCount; ++k)
				{
					var cp = manifold.points[ k ];
					var ccp = c.points[ k ];

					ccp.normalImpulse = cp.normalImpulse;
					ccp.tangentImpulse = cp.tangentImpulse;
					ccp.separation = cp.separation;

					//var r1 = b2Math.SubtractVV( cp.position, b1.m_position );
					var r1X = cp.position.x - b1.m_position.x;
					var r1Y = cp.position.y - b1.m_position.y;
					//var r2 = b2Math.SubtractVV( cp.position, b2.m_position );
					var r2X = cp.position.x - b2.m_position.x;
					var r2Y = cp.position.y - b2.m_position.y;

					//ccp.localAnchor1 = b2Math.b2MulTMV(b1.m_R, r1);
					tVec = ccp.localAnchor1;
					tMat = b1.m_R;
					tVec.x = r1X * tMat.col1.x + r1Y * tMat.col1.y;
					tVec.y = r1X * tMat.col2.x + r1Y * tMat.col2.y;

					//ccp.localAnchor2 = b2Math.b2MulTMV(b2.m_R, r2);
					tVec = ccp.localAnchor2;
					tMat = b2.m_R;
					tVec.x = r2X * tMat.col1.x + r2Y * tMat.col1.y;
					tVec.y = r2X * tMat.col2.x + r2Y * tMat.col2.y;

					var r1Sqr = r1X * r1X + r1Y * r1Y;
					var r2Sqr = r2X * r2X + r2Y * r2Y;

					//var rn1 = b2Math.b2Dot(r1, normal);
					var rn1 = r1X*normalX + r1Y*normalY;
					//var rn2 = b2Math.b2Dot(r2, normal);
					var rn2 = r2X*normalX + r2Y*normalY;
					var kNormal = b1.m_invMass + b2.m_invMass;
					kNormal += b1.m_invI * (r1Sqr - rn1 * rn1) + b2.m_invI * (r2Sqr - rn2 * rn2);
					//b2Settings.b2Assert(kNormal > Number.MIN_VALUE);
					ccp.normalMass = 1.0 / kNormal;

					//var tangent = b2Math.b2CrossVF(normal, 1.0);
					var tangentX = normalY
					var tangentY = -normalX;

					//var rt1 = b2Math.b2Dot(r1, tangent);
					var rt1 = r1X*tangentX + r1Y*tangentY;
					//var rt2 = b2Math.b2Dot(r2, tangent);
					var rt2 = r2X*tangentX + r2Y*tangentY;
					var kTangent = b1.m_invMass + b2.m_invMass;
					kTangent += b1.m_invI * (r1Sqr - rt1 * rt1) + b2.m_invI * (r2Sqr - rt2 * rt2);
					//b2Settings.b2Assert(kTangent > Number.MIN_VALUE);
					ccp.tangentMass = 1.0 /  kTangent;

					// Setup a velocity bias for restitution.
					ccp.velocityBias = 0.0;
					if (ccp.separation > 0.0)
					{
						ccp.velocityBias = -60.0 * ccp.separation;
					}
					//var vRel = b2Math.b2Dot(c.normal, b2Math.SubtractVV( b2Math.SubtractVV( b2Math.AddVV( v2, b2Math.b2CrossFV(w2, r2)), v1 ), b2Math.b2CrossFV(w1, r1)));
					var tX = v2X + (-w2*r2Y) - v1X - (-w1*r1Y);
					var tY = v2Y + (w2*r2X) - v1Y - (w1*r1X);
					//var vRel = b2Dot(c.normal, tX/Y);
					var vRel = c.normal.x*tX + c.normal.y*tY;
					if (vRel < -b2Settings.b2_velocityThreshold)
					{
						ccp.velocityBias += -c.restitution * vRel;
					}
				}

				++count;
			}
		}

		//b2Settings.b2Assert(count == this.m_constraintCount);
	},
	//~b2ContactSolver();

	PreSolve: function(){
		var tVec;
		var tVec2;
		var tMat;

		// Warm start.
		for (var i = 0; i < this.m_constraintCount; ++i)
		{
			var c = this.m_constraints[ i ];

			var b1 = c.body1;
			var b2 = c.body2;
			var invMass1 = b1.m_invMass;
			var invI1 = b1.m_invI;
			var invMass2 = b2.m_invMass;
			var invI2 = b2.m_invI;
			//var normal = new b2Vec2(c.normal.x, c.normal.y);
			var normalX = c.normal.x;
			var normalY = c.normal.y;
			//var tangent = b2Math.b2CrossVF(normal, 1.0);
			var tangentX = normalY;
			var tangentY = -normalX;

			var j = 0;
			var tCount = 0;
			if (b2World.s_enableWarmStarting)
			{
				tCount = c.pointCount;
				for (j = 0; j < tCount; ++j)
				{
					var ccp = c.points[ j ];
					//var P = b2Math.AddVV( b2Math.MulFV(ccp.normalImpulse, normal), b2Math.MulFV(ccp.tangentImpulse, tangent));
					var PX = ccp.normalImpulse*normalX + ccp.tangentImpulse*tangentX;
					var PY = ccp.normalImpulse*normalY + ccp.tangentImpulse*tangentY;

					//var r1 = b2Math.b2MulMV(b1.m_R, ccp.localAnchor1);
					tMat = b1.m_R;
					tVec = ccp.localAnchor1;
					var r1X = tMat.col1.x * tVec.x + tMat.col2.x * tVec.y;
					var r1Y = tMat.col1.y * tVec.x + tMat.col2.y * tVec.y;

					//var r2 = b2Math.b2MulMV(b2.m_R, ccp.localAnchor2);
					tMat = b2.m_R;
					tVec = ccp.localAnchor2;
					var r2X = tMat.col1.x * tVec.x + tMat.col2.x * tVec.y;
					var r2Y = tMat.col1.y * tVec.x + tMat.col2.y * tVec.y;

					//b1.m_angularVelocity -= invI1 * b2Math.b2CrossVV(r1, P);
					b1.m_angularVelocity -= invI1 * (r1X * PY - r1Y * PX);
					//b1.m_linearVelocity.Subtract( b2Math.MulFV(invMass1, P) );
					b1.m_linearVelocity.x -= invMass1 * PX;
					b1.m_linearVelocity.y -= invMass1 * PY;
					//b2.m_angularVelocity += invI2 * b2Math.b2CrossVV(r2, P);
					b2.m_angularVelocity += invI2 * (r2X * PY - r2Y * PX);
					//b2.m_linearVelocity.Add( b2Math.MulFV(invMass2, P) );
					b2.m_linearVelocity.x += invMass2 * PX;
					b2.m_linearVelocity.y += invMass2 * PY;

					ccp.positionImpulse = 0.0;
				}
			}
			else{
				tCount = c.pointCount;
				for (j = 0; j < tCount; ++j)
				{
					var ccp2 = c.points[ j ];
					ccp2.normalImpulse = 0.0;
					ccp2.tangentImpulse = 0.0;

					ccp2.positionImpulse = 0.0;
				}
			}
		}
	},
	SolveVelocityConstraints: function(){
		var j = 0;
		var ccp;
		var r1X;
		var r1Y;
		var r2X;
		var r2Y;
		var dvX;
		var dvY;
		var lambda;
		var newImpulse;
		var PX;
		var PY;

		var tMat;
		var tVec;

		for (var i = 0; i < this.m_constraintCount; ++i)
		{
			var c = this.m_constraints[ i ];
			var b1 = c.body1;
			var b2 = c.body2;
			var b1_angularVelocity = b1.m_angularVelocity;
			var b1_linearVelocity = b1.m_linearVelocity;
			var b2_angularVelocity = b2.m_angularVelocity;
			var b2_linearVelocity = b2.m_linearVelocity;

			var invMass1 = b1.m_invMass;
			var invI1 = b1.m_invI;
			var invMass2 = b2.m_invMass;
			var invI2 = b2.m_invI;
			//var normal = new b2Vec2(c.normal.x, c.normal.y);
			var normalX = c.normal.x;
			var normalY = c.normal.y;
			//var tangent = b2Math.b2CrossVF(normal, 1.0);
			var tangentX = normalY;
			var tangentY = -normalX;

			// Solver normal constraints
			var tCount = c.pointCount;
			for (j = 0; j < tCount; ++j)
			{
				ccp = c.points[ j ];

				//r1 = b2Math.b2MulMV(b1.m_R, ccp.localAnchor1);
				tMat = b1.m_R;
				tVec = ccp.localAnchor1;
				r1X = tMat.col1.x * tVec.x + tMat.col2.x * tVec.y
				r1Y = tMat.col1.y * tVec.x + tMat.col2.y * tVec.y
				//r2 = b2Math.b2MulMV(b2.m_R, ccp.localAnchor2);
				tMat = b2.m_R;
				tVec = ccp.localAnchor2;
				r2X = tMat.col1.x * tVec.x + tMat.col2.x * tVec.y
				r2Y = tMat.col1.y * tVec.x + tMat.col2.y * tVec.y

				// Relative velocity at contact
				//var dv = b2Math.SubtractVV( b2Math.AddVV( b2.m_linearVelocity, b2Math.b2CrossFV(b2.m_angularVelocity, r2)), b2Math.SubtractVV(b1.m_linearVelocity, b2Math.b2CrossFV(b1.m_angularVelocity, r1)));
				//dv = b2Math.SubtractVV(b2Math.SubtractVV( b2Math.AddVV( b2.m_linearVelocity, b2Math.b2CrossFV(b2.m_angularVelocity, r2)), b1.m_linearVelocity), b2Math.b2CrossFV(b1.m_angularVelocity, r1));
				dvX = b2_linearVelocity.x + (-b2_angularVelocity * r2Y) - b1_linearVelocity.x - (-b1_angularVelocity * r1Y);
				dvY = b2_linearVelocity.y + (b2_angularVelocity * r2X) - b1_linearVelocity.y - (b1_angularVelocity * r1X);

				// Compute normal impulse
				//var vn = b2Math.b2Dot(dv, normal);
				var vn = dvX * normalX + dvY * normalY;
				lambda = -ccp.normalMass * (vn - ccp.velocityBias);

				// b2Clamp the accumulated impulse
				newImpulse = b2Math.b2Max(ccp.normalImpulse + lambda, 0.0);
				lambda = newImpulse - ccp.normalImpulse;

				// Apply contact impulse
				//P = b2Math.MulFV(lambda, normal);
				PX = lambda * normalX;
				PY = lambda * normalY;

				//b1.m_linearVelocity.Subtract( b2Math.MulFV( invMass1, P ) );
				b1_linearVelocity.x -= invMass1 * PX;
				b1_linearVelocity.y -= invMass1 * PY;
				b1_angularVelocity -= invI1 * (r1X * PY - r1Y * PX);

				//b2.m_linearVelocity.Add( b2Math.MulFV( invMass2, P ) );
				b2_linearVelocity.x += invMass2 * PX;
				b2_linearVelocity.y += invMass2 * PY;
				b2_angularVelocity += invI2 * (r2X * PY - r2Y * PX);

				ccp.normalImpulse = newImpulse;



				// MOVED FROM BELOW
				// Relative velocity at contact
				//var dv = b2.m_linearVelocity + b2Cross(b2.m_angularVelocity, r2) - b1.m_linearVelocity - b2Cross(b1.m_angularVelocity, r1);
				//dv =  b2Math.SubtractVV(b2Math.SubtractVV(b2Math.AddVV(b2.m_linearVelocity, b2Math.b2CrossFV(b2.m_angularVelocity, r2)), b1.m_linearVelocity), b2Math.b2CrossFV(b1.m_angularVelocity, r1));
				dvX = b2_linearVelocity.x + (-b2_angularVelocity * r2Y) - b1_linearVelocity.x - (-b1_angularVelocity * r1Y);
				dvY = b2_linearVelocity.y + (b2_angularVelocity * r2X) - b1_linearVelocity.y - (b1_angularVelocity * r1X);

				// Compute tangent impulse
				var vt = dvX*tangentX + dvY*tangentY;
				lambda = ccp.tangentMass * (-vt);

				// b2Clamp the accumulated impulse
				var maxFriction = c.friction * ccp.normalImpulse;
				newImpulse = b2Math.b2Clamp(ccp.tangentImpulse + lambda, -maxFriction, maxFriction);
				lambda = newImpulse - ccp.tangentImpulse;

				// Apply contact impulse
				//P = b2Math.MulFV(lambda, tangent);
				PX = lambda * tangentX;
				PY = lambda * tangentY;

				//b1.m_linearVelocity.Subtract( b2Math.MulFV( invMass1, P ) );
				b1_linearVelocity.x -= invMass1 * PX;
				b1_linearVelocity.y -= invMass1 * PY;
				b1_angularVelocity -= invI1 * (r1X * PY - r1Y * PX);

				//b2.m_linearVelocity.Add( b2Math.MulFV( invMass2, P ) );
				b2_linearVelocity.x += invMass2 * PX;
				b2_linearVelocity.y += invMass2 * PY;
				b2_angularVelocity += invI2 * (r2X * PY - r2Y * PX);

				ccp.tangentImpulse = newImpulse;
			}



			// Solver tangent constraints
			// MOVED ABOVE FOR EFFICIENCY
			/*for (j = 0; j < tCount; ++j)
			{
				ccp = c.points[ j ];

				//r1 = b2Math.b2MulMV(b1.m_R, ccp.localAnchor1);
				tMat = b1.m_R;
				tVec = ccp.localAnchor1;
				r1X = tMat.col1.x * tVec.x + tMat.col2.x * tVec.y
				r1Y = tMat.col1.y * tVec.x + tMat.col2.y * tVec.y
				//r2 = b2Math.b2MulMV(b2.m_R, ccp.localAnchor2);
				tMat = b2.m_R;
				tVec = ccp.localAnchor2;
				r2X = tMat.col1.x * tVec.x + tMat.col2.x * tVec.y
				r2Y = tMat.col1.y * tVec.x + tMat.col2.y * tVec.y

				// Relative velocity at contact
				//var dv = b2.m_linearVelocity + b2Cross(b2.m_angularVelocity, r2) - b1.m_linearVelocity - b2Cross(b1.m_angularVelocity, r1);
				//dv =  b2Math.SubtractVV(b2Math.SubtractVV(b2Math.AddVV(b2.m_linearVelocity, b2Math.b2CrossFV(b2.m_angularVelocity, r2)), b1.m_linearVelocity), b2Math.b2CrossFV(b1.m_angularVelocity, r1));
				dvX = b2_linearVelocity.x + (-b2_angularVelocity * r2Y) - b1_linearVelocity.x - (-b1_angularVelocity * r1Y);
				dvY = b2_linearVelocity.y + (b2_angularVelocity * r2X) - b1_linearVelocity.y - (b1_angularVelocity * r1X);

				// Compute tangent impulse
				var vt = dvX*tangentX + dvY*tangentY;
				lambda = ccp.tangentMass * (-vt);

				// b2Clamp the accumulated impulse
				var maxFriction = c.friction * ccp.normalImpulse;
				newImpulse = b2Math.b2Clamp(ccp.tangentImpulse + lambda, -maxFriction, maxFriction);
				lambda = newImpulse - ccp.tangentImpulse;

				// Apply contact impulse
				//P = b2Math.MulFV(lambda, tangent);
				PX = lambda * tangentX;
				PY = lambda * tangentY;

				//b1.m_linearVelocity.Subtract( b2Math.MulFV( invMass1, P ) );
				b1_linearVelocity.x -= invMass1 * PX;
				b1_linearVelocity.y -= invMass1 * PY;
				b1_angularVelocity -= invI1 * (r1X * PY - r1Y * PX);

				//b2.m_linearVelocity.Add( b2Math.MulFV( invMass2, P ) );
				b2_linearVelocity.x += invMass2 * PX;
				b2_linearVelocity.y += invMass2 * PY;
				b2_angularVelocity += invI2 * (r2X * PY - r2Y * PX);

				ccp.tangentImpulse = newImpulse;
			}*/

			// Update angular velocity
			b1.m_angularVelocity = b1_angularVelocity;
			b2.m_angularVelocity = b2_angularVelocity;
		}
	},
	SolvePositionConstraints: function(beta){
		var minSeparation = 0.0;

		var tMat;
		var tVec;

		for (var i = 0; i < this.m_constraintCount; ++i)
		{
			var c = this.m_constraints[ i ];
			var b1 = c.body1;
			var b2 = c.body2;
			var b1_position = b1.m_position;
			var b1_rotation = b1.m_rotation;
			var b2_position = b2.m_position;
			var b2_rotation = b2.m_rotation;

			var invMass1 = b1.m_invMass;
			var invI1 = b1.m_invI;
			var invMass2 = b2.m_invMass;
			var invI2 = b2.m_invI;
			//var normal = new b2Vec2(c.normal.x, c.normal.y);
			var normalX = c.normal.x;
			var normalY = c.normal.y;
			//var tangent = b2Math.b2CrossVF(normal, 1.0);
			var tangentX = normalY;
			var tangentY = -normalX;

			// Solver normal constraints
			var tCount = c.pointCount;
			for (var j = 0; j < tCount; ++j)
			{
				var ccp = c.points[ j ];

				//r1 = b2Math.b2MulMV(b1.m_R, ccp.localAnchor1);
				tMat = b1.m_R;
				tVec = ccp.localAnchor1;
				var r1X = tMat.col1.x * tVec.x + tMat.col2.x * tVec.y
				var r1Y = tMat.col1.y * tVec.x + tMat.col2.y * tVec.y
				//r2 = b2Math.b2MulMV(b2.m_R, ccp.localAnchor2);
				tMat = b2.m_R;
				tVec = ccp.localAnchor2;
				var r2X = tMat.col1.x * tVec.x + tMat.col2.x * tVec.y
				var r2Y = tMat.col1.y * tVec.x + tMat.col2.y * tVec.y

				//var p1 = b2Math.AddVV(b1.m_position, r1);
				var p1X = b1_position.x + r1X;
				var p1Y = b1_position.y + r1Y;

				//var p2 = b2Math.AddVV(b2.m_position, r2);
				var p2X = b2_position.x + r2X;
				var p2Y = b2_position.y + r2Y;

				//var dp = b2Math.SubtractVV(p2, p1);
				var dpX = p2X - p1X;
				var dpY = p2Y - p1Y;

				// Approximate the current separation.
				//var separation = b2Math.b2Dot(dp, normal) + ccp.separation;
				var separation = (dpX*normalX + dpY*normalY) + ccp.separation;

				// Track max constraint error.
				minSeparation = b2Math.b2Min(minSeparation, separation);

				// Prevent large corrections and allow slop.
				var C = beta * b2Math.b2Clamp(separation + b2Settings.b2_linearSlop, -b2Settings.b2_maxLinearCorrection, 0.0);

				// Compute normal impulse
				var dImpulse = -ccp.normalMass * C;

				// b2Clamp the accumulated impulse
				var impulse0 = ccp.positionImpulse;
				ccp.positionImpulse = b2Math.b2Max(impulse0 + dImpulse, 0.0);
				dImpulse = ccp.positionImpulse - impulse0;

				//var impulse = b2Math.MulFV( dImpulse, normal );
				var impulseX = dImpulse * normalX;
				var impulseY = dImpulse * normalY;

				//b1.m_position.Subtract( b2Math.MulFV( invMass1, impulse ) );
				b1_position.x -= invMass1 * impulseX;
				b1_position.y -= invMass1 * impulseY;
				b1_rotation -= invI1 * (r1X * impulseY - r1Y * impulseX);
				b1.m_R.Set(b1_rotation);

				//b2.m_position.Add( b2Math.MulFV( invMass2, impulse ) );
				b2_position.x += invMass2 * impulseX;
				b2_position.y += invMass2 * impulseY;
				b2_rotation += invI2 * (r2X * impulseY - r2Y * impulseX);
				b2.m_R.Set(b2_rotation);
			}
			// Update body rotations
			b1.m_rotation = b1_rotation;
			b2.m_rotation = b2_rotation;
		}

		return minSeparation >= -b2Settings.b2_linearSlop;
	},
	PostSolve: function(){
		for (var i = 0; i < this.m_constraintCount; ++i)
		{
			var c = this.m_constraints[ i ];
			var m = c.manifold;

			for (var j = 0; j < c.pointCount; ++j)
			{
				var mPoint = m.points[j];
				var cPoint = c.points[j];
				mPoint.normalImpulse = cPoint.normalImpulse;
				mPoint.tangentImpulse = cPoint.tangentImpulse;
			}
		}
	},

	m_allocator: null,
	m_constraints: new Array(),
	m_constraintCount: 0};
/*
* Copyright (c) 2006-2007 Erin Catto http:
*
* This software is provided 'as-is', without any express or implied
* warranty.  In no event will the authors be held liable for any damages
* arising from the use of this software.
* Permission is granted to anyone to use this software for any purpose,
* including commercial applications, and to alter it and redistribute it
* freely, subject to the following restrictions:
* 1. The origin of this software must not be misrepresented; you must not
* claim that you wrote the original software. If you use this software
* in a product, an acknowledgment in the product documentation would be
* appreciated but is not required.
* 2. Altered source versions must be plainly marked, and must not be
* misrepresented the original software.
* 3. This notice may not be removed or altered from any source distribution.
*/




var b2CircleContact = Class.create();
Object.extend(b2CircleContact.prototype, b2Contact.prototype);
Object.extend(b2CircleContact.prototype, 
{

		initialize: function(s1, s2) {
		// The constructor for b2Contact
		// initialize instance variables for references
		this.m_node1 = new b2ContactNode();
		this.m_node2 = new b2ContactNode();
		//
		this.m_flags = 0;

		if (!s1 || !s2){
			this.m_shape1 = null;
			this.m_shape2 = null;
			return;
		}

		this.m_shape1 = s1;
		this.m_shape2 = s2;

		this.m_manifoldCount = 0;

		this.m_friction = Math.sqrt(this.m_shape1.m_friction * this.m_shape2.m_friction);
		this.m_restitution = b2Math.b2Max(this.m_shape1.m_restitution, this.m_shape2.m_restitution);

		this.m_prev = null;
		this.m_next = null;

		this.m_node1.contact = null;
		this.m_node1.prev = null;
		this.m_node1.next = null;
		this.m_node1.other = null;

		this.m_node2.contact = null;
		this.m_node2.prev = null;
		this.m_node2.next = null;
		this.m_node2.other = null;
		//

		// initialize instance variables for references
		this.m_manifold = [new b2Manifold()];
		//

		//super(shape1, shape2);

		//b2Settings.b2Assert(this.m_shape1.m_type == b2Shape.e_circleShape);
		//b2Settings.b2Assert(this.m_shape2.m_type == b2Shape.e_circleShape);
		this.m_manifold[0].pointCount = 0;
		this.m_manifold[0].points[0].normalImpulse = 0.0;
		this.m_manifold[0].points[0].tangentImpulse = 0.0;
	},
	//~b2CircleContact() {}

	Evaluate: function(){
		b2Collision.b2CollideCircle(this.m_manifold[0], this.m_shape1, this.m_shape2, false);

		if (this.m_manifold[0].pointCount > 0)
		{
			this.m_manifoldCount = 1;
		}
		else
		{
			this.m_manifoldCount = 0;
		}
	},

	GetManifolds: function()
	{
		return this.m_manifold;
	},

	m_manifold: [new b2Manifold()]});

b2CircleContact.Create = function(shape1, shape2, allocator){
		return new b2CircleContact(shape1, shape2);
	};
b2CircleContact.Destroy = function(contact, allocator){
		//
	};
/*
* Copyright (c) 2006-2007 Erin Catto http:
*
* This software is provided 'as-is', without any express or implied
* warranty.  In no event will the authors be held liable for any damages
* arising from the use of this software.
* Permission is granted to anyone to use this software for any purpose,
* including commercial applications, and to alter it and redistribute it
* freely, subject to the following restrictions:
* 1. The origin of this software must not be misrepresented; you must not
* claim that you wrote the original software. If you use this software
* in a product, an acknowledgment in the product documentation would be
* appreciated but is not required.
* 2. Altered source versions must be plainly marked, and must not be
* misrepresented the original software.
* 3. This notice may not be removed or altered from any source distribution.
*/





var b2Conservative = Class.create();
b2Conservative.prototype = {

	// Temp vars



	initialize: function() {}}
b2Conservative.R1 = new b2Mat22();
b2Conservative.R2 = new b2Mat22();
b2Conservative.x1 = new b2Vec2();
b2Conservative.x2 = new b2Vec2();
b2Conservative.Conservative = function(shape1, shape2){
		var body1 = shape1.GetBody();
		var body2 = shape2.GetBody();

		//b2Vec2 v1 = body1->m_position - body1->m_position0;
		var v1X = body1.m_position.x - body1.m_position0.x;
		var v1Y = body1.m_position.y - body1.m_position0.y;
		//float32 omega1 = body1->m_rotation - body1->m_rotation0;
		var omega1 = body1.m_rotation - body1.m_rotation0;
		//b2Vec2 v2 = body2->m_position - body2->m_position0;
		var v2X = body2.m_position.x - body2.m_position0.x;
		var v2Y = body2.m_position.y - body2.m_position0.y;
		//float32 omega2 = body2->m_rotation - body2->m_rotation0;
		var omega2 = body2.m_rotation - body2.m_rotation0;

		//float32 r1 = shape1->GetMaxRadius();
		var r1 = shape1.GetMaxRadius();
		//float32 r2 = shape2->GetMaxRadius();
		var r2 = shape2.GetMaxRadius();

		//b2Vec2 p1Start = body1->m_position0;
		var p1StartX = body1.m_position0.x;
		var p1StartY = body1.m_position0.y;
		//float32 a1Start = body1->m_rotation0;
		var a1Start = body1.m_rotation0;

		//b2Vec2 p2Start = body2->m_position0;
		var p2StartX = body2.m_position0.x;
		var p2StartY = body2.m_position0.y;
		//float32 a2Start = body2->m_rotation0;
		var a2Start = body2.m_rotation0;

		//b2Vec2 p1 = p1Start;
		var p1X = p1StartX;
		var p1Y = p1StartY;
		//float32 a1 = a1Start;
		var a1 = a1Start;
		//b2Vec2 p2 = p2Start;
		var p2X = p2StartX;
		var p2Y = p2StartY;
		//float32 a2 = a2Start;
		var a2 = a2Start;

		//b2Mat22 b2Conservative.R1(a1), b2Conservative.R2(a2);
		b2Conservative.R1.Set(a1);
		b2Conservative.R2.Set(a2);

		//shape1->QuickSync(p1, b2Conservative.R1);
		shape1.QuickSync(p1, b2Conservative.R1);
		//shape2->QuickSync(p2, b2Conservative.R2);
		shape2.QuickSync(p2, b2Conservative.R2);

		//float32 s1 = 0.0f;
		var s1 = 0.0;
		//const int32 maxIterations = 10;
		var maxIterations = 10;
		//b2Vec2 d;
		var dX;
		var dY;
		//float32 invRelativeVelocity = 0.0f;
		var invRelativeVelocity = 0.0;
		//bool hit = true;
		var hit = true;
		//b2Vec2 b2Conservative.x1, b2Conservative.x2; moved to static var
		for (var iter = 0; iter < maxIterations; ++iter)
		{
			// Get the accurate distance between shapes.
			//float32 distance = b2Distance.Distance(&b2Conservative.x1, &b2Conservative.x2, shape1, shape2);
			var distance = b2Distance.Distance(b2Conservative.x1, b2Conservative.x2, shape1, shape2);
			if (distance < b2Settings.b2_linearSlop)
			{
				if (iter == 0)
				{
					hit = false;
				}
				else
				{
					hit = true;
				}
				break;
			}

			if (iter == 0)
			{
				//b2Vec2 d = b2Conservative.x2 - b2Conservative.x1;
				dX = b2Conservative.x2.x - b2Conservative.x1.x;
				dY = b2Conservative.x2.y - b2Conservative.x1.y;
				//d.Normalize();
				var dLen = Math.sqrt(dX*dX + dY*dY);
				//float32 relativeVelocity = b2Dot(d, v1 - v2) + b2Abs(omega1) * r1 + b2Abs(omega2) * r2;
				var relativeVelocity = (dX*(v1X-v2X) + dY*(v1Y - v2Y)) + Math.abs(omega1) * r1 + Math.abs(omega2) * r2;
				if (Math.abs(relativeVelocity) < Number.MIN_VALUE)
				{
					hit = false;
					break;
				}

				invRelativeVelocity = 1.0 / relativeVelocity;
			}

			// Get the conservative movement.
			//float32 ds = distance * invRelativeVelocity;
			var ds = distance * invRelativeVelocity;
			//float32 s2 = s1 + ds;
			var s2 = s1 + ds;

			if (s2 < 0.0 || 1.0 < s2)
			{
				hit = false;
				break;
			}

			if (s2 < (1.0 + 100.0 * Number.MIN_VALUE) * s1)
			{
				hit = true;
				break;
			}

			s1 = s2;

			// Move forward conservatively.
			//p1 = p1Start + s1 * v1;
			p1X = p1StartX + s1 * v1.x;
			p1Y = p1StartY + s1 * v1.y;
			//a1 = a1Start + s1 * omega1;
			a1 = a1Start + s1 * omega1;
			//p2 = p2Start + s1 * v2;
			p2X = p2StartX + s1 * v2.x;
			p2Y = p2StartY + s1 * v2.y;
			//a2 = a2Start + s1 * omega2;
			a2 = a2Start + s1 * omega2;

			b2Conservative.R1.Set(a1);
			b2Conservative.R2.Set(a2);
			shape1.QuickSync(p1, b2Conservative.R1);
			shape2.QuickSync(p2, b2Conservative.R2);
		}

		if (hit)
		{
			// Hit, move bodies to safe position and re-sync shapes.
			//b2Vec2 d = b2Conservative.x2 - b2Conservative.x1;
			dX = b2Conservative.x2.x - b2Conservative.x1.x;
			dY = b2Conservative.x2.y - b2Conservative.x1.y;
			//float32 length = d.Length();
			var length = Math.sqrt(dX*dX + dY*dY);
			if (length > FLT_EPSILON)
			{
				d *= b2_linearSlop / length;
			}

			if (body1.IsStatic())
			{
				//body1.m_position = p1;
				body1.m_position.x = p1X;
				body1.m_position.y = p1Y;
			}
			else
			{
				//body1.m_position = p1 - d;
				body1.m_position.x = p1X - dX;
				body1.m_position.y = p1Y - dY;
			}
			body1.m_rotation = a1;
			body1.m_R.Set(a1);
			body1.QuickSyncShapes();

			if (body2.IsStatic())
			{
				//body2->m_position = p2;
				body2.m_position.x = p2X;
				body2.m_position.y = p2Y;
			}
			else
			{
				//body2->m_position = p2 + d;
				body2.m_position.x = p2X + dX;
				body2.m_position.y = p2Y + dY;
			}
			//body2.m_position = p2 + d;
			body2.m_position.x = p2X + dX;
			body2.m_position.y = p2Y + dY;
			body2.m_rotation = a2;
			body2.m_R.Set(a2);
			body2.QuickSyncShapes();

			return true;
		}

		// No hit, restore shapes.
		shape1.QuickSync(body1.m_position, body1.m_R);
		shape2.QuickSync(body2.m_position, body2.m_R);
		return false;
	};
/*
* Copyright (c) 2006-2007 Erin Catto http:
*
* This software is provided 'as-is', without any express or implied
* warranty.  In no event will the authors be held liable for any damages
* arising from the use of this software.
* Permission is granted to anyone to use this software for any purpose,
* including commercial applications, and to alter it and redistribute it
* freely, subject to the following restrictions:
* 1. The origin of this software must not be misrepresented; you must not
* claim that you wrote the original software. If you use this software
* in a product, an acknowledgment in the product documentation would be
* appreciated but is not required.
* 2. Altered source versions must be plainly marked, and must not be
* misrepresented the original software.
* 3. This notice may not be removed or altered from any source distribution.
*/





var b2NullContact = Class.create();
Object.extend(b2NullContact.prototype, b2Contact.prototype);
Object.extend(b2NullContact.prototype, 
{
		initialize: function(s1, s2) {
		// The constructor for b2Contact
		// initialize instance variables for references
		this.m_node1 = new b2ContactNode();
		this.m_node2 = new b2ContactNode();
		//
		this.m_flags = 0;

		if (!s1 || !s2){
			this.m_shape1 = null;
			this.m_shape2 = null;
			return;
		}

		this.m_shape1 = s1;
		this.m_shape2 = s2;

		this.m_manifoldCount = 0;

		this.m_friction = Math.sqrt(this.m_shape1.m_friction * this.m_shape2.m_friction);
		this.m_restitution = b2Math.b2Max(this.m_shape1.m_restitution, this.m_shape2.m_restitution);

		this.m_prev = null;
		this.m_next = null;

		this.m_node1.contact = null;
		this.m_node1.prev = null;
		this.m_node1.next = null;
		this.m_node1.other = null;

		this.m_node2.contact = null;
		this.m_node2.prev = null;
		this.m_node2.next = null;
		this.m_node2.other = null;
		//
},
	Evaluate: function() {},
	GetManifolds: function(){ return null; }});

/*
* Copyright (c) 2006-2007 Erin Catto http:
*
* This software is provided 'as-is', without any express or implied
* warranty.  In no event will the authors be held liable for any damages
* arising from the use of this software.
* Permission is granted to anyone to use this software for any purpose,
* including commercial applications, and to alter it and redistribute it
* freely, subject to the following restrictions:
* 1. The origin of this software must not be misrepresented; you must not
* claim that you wrote the original software. If you use this software
* in a product, an acknowledgment in the product documentation would be
* appreciated but is not required.
* 2. Altered source versions must be plainly marked, and must not be
* misrepresented the original software.
* 3. This notice may not be removed or altered from any source distribution.
*/





var b2PolyAndCircleContact = Class.create();
Object.extend(b2PolyAndCircleContact.prototype, b2Contact.prototype);
Object.extend(b2PolyAndCircleContact.prototype, {


		initialize: function(s1, s2) {
		// The constructor for b2Contact
		// initialize instance variables for references
		this.m_node1 = new b2ContactNode();
		this.m_node2 = new b2ContactNode();
		//
		this.m_flags = 0;

		if (!s1 || !s2){
			this.m_shape1 = null;
			this.m_shape2 = null;
			return;
		}

		this.m_shape1 = s1;
		this.m_shape2 = s2;

		this.m_manifoldCount = 0;

		this.m_friction = Math.sqrt(this.m_shape1.m_friction * this.m_shape2.m_friction);
		this.m_restitution = b2Math.b2Max(this.m_shape1.m_restitution, this.m_shape2.m_restitution);

		this.m_prev = null;
		this.m_next = null;

		this.m_node1.contact = null;
		this.m_node1.prev = null;
		this.m_node1.next = null;
		this.m_node1.other = null;

		this.m_node2.contact = null;
		this.m_node2.prev = null;
		this.m_node2.next = null;
		this.m_node2.other = null;
		//

		// initialize instance variables for references
		this.m_manifold = [new b2Manifold()];
		//

		//super(shape1, shape2);

		b2Settings.b2Assert(this.m_shape1.m_type == b2Shape.e_polyShape);
		b2Settings.b2Assert(this.m_shape2.m_type == b2Shape.e_circleShape);
		this.m_manifold[0].pointCount = 0;
		this.m_manifold[0].points[0].normalImpulse = 0.0;
		this.m_manifold[0].points[0].tangentImpulse = 0.0;
	},
	//~b2PolyAndCircleContact() {}

	Evaluate: function(){
		b2Collision.b2CollidePolyAndCircle(this.m_manifold[0], this.m_shape1, this.m_shape2, false);

		if (this.m_manifold[0].pointCount > 0)
		{
			this.m_manifoldCount = 1;
		}
		else
		{
			this.m_manifoldCount = 0;
		}
	},

	GetManifolds: function()
	{
		return this.m_manifold;
	},

	m_manifold: [new b2Manifold()]})

b2PolyAndCircleContact.Create = function(shape1, shape2, allocator){
		return new b2PolyAndCircleContact(shape1, shape2);
	};
b2PolyAndCircleContact.Destroy = function(contact, allocator){
		//
	};
/*
* Copyright (c) 2006-2007 Erin Catto http:
*
* This software is provided 'as-is', without any express or implied
* warranty.  In no event will the authors be held liable for any damages
* arising from the use of this software.
* Permission is granted to anyone to use this software for any purpose,
* including commercial applications, and to alter it and redistribute it
* freely, subject to the following restrictions:
* 1. The origin of this software must not be misrepresented; you must not
* claim that you wrote the original software. If you use this software
* in a product, an acknowledgment in the product documentation would be
* appreciated but is not required.
* 2. Altered source versions must be plainly marked, and must not be
* misrepresented the original software.
* 3. This notice may not be removed or altered from any source distribution.
*/





var b2PolyContact = Class.create();
Object.extend(b2PolyContact.prototype, b2Contact.prototype);
Object.extend(b2PolyContact.prototype, 
{

		initialize: function(s1, s2) {
		// The constructor for b2Contact
		// initialize instance variables for references
		this.m_node1 = new b2ContactNode();
		this.m_node2 = new b2ContactNode();
		//
		this.m_flags = 0;

		if (!s1 || !s2){
			this.m_shape1 = null;
			this.m_shape2 = null;
			return;
		}

		this.m_shape1 = s1;
		this.m_shape2 = s2;

		this.m_manifoldCount = 0;

		this.m_friction = Math.sqrt(this.m_shape1.m_friction * this.m_shape2.m_friction);
		this.m_restitution = b2Math.b2Max(this.m_shape1.m_restitution, this.m_shape2.m_restitution);

		this.m_prev = null;
		this.m_next = null;

		this.m_node1.contact = null;
		this.m_node1.prev = null;
		this.m_node1.next = null;
		this.m_node1.other = null;

		this.m_node2.contact = null;
		this.m_node2.prev = null;
		this.m_node2.next = null;
		this.m_node2.other = null;
		//

		// initialize instance variables for references
		this.m0 = new b2Manifold();
		this.m_manifold = [new b2Manifold()];
		//

		//super(shape1, shape2);
		//b2Settings.b2Assert(this.m_shape1.m_type == b2Shape.e_polyShape);
		//b2Settings.b2Assert(this.m_shape2.m_type == b2Shape.e_polyShape);
		this.m_manifold[0].pointCount = 0;
	},
	//~b2PolyContact() {}

	// store temp manifold to reduce calls to new
	m0: new b2Manifold(),

	Evaluate: function(){
		var tMani = this.m_manifold[0];
		// replace memcpy
		// memcpy(&this.m0, &this.m_manifold, sizeof(b2Manifold));
		//this.m0.points = new Array(tMani.pointCount);
		var tPoints = this.m0.points;

		for (var k = 0; k < tMani.pointCount; k++){
			var tPoint = tPoints[k];
			var tPoint0 = tMani.points[k];
			//tPoint.separation = tPoint0.separation;
			tPoint.normalImpulse = tPoint0.normalImpulse;
			tPoint.tangentImpulse = tPoint0.tangentImpulse;
			//tPoint.position.SetV( tPoint0.position );

			tPoint.id = tPoint0.id.Copy();

			/*this.m0.points[k].id.features = new Features();
			this.m0.points[k].id.features.referenceFace = this.m_manifold[0].points[k].id.features.referenceFace;
			this.m0.points[k].id.features.incidentEdge = this.m_manifold[0].points[k].id.features.incidentEdge;
			this.m0.points[k].id.features.incidentVertex = this.m_manifold[0].points[k].id.features.incidentVertex;
			this.m0.points[k].id.features.flip = this.m_manifold[0].points[k].id.features.flip;*/
		}
		//this.m0.normal.SetV( tMani.normal );
		this.m0.pointCount = tMani.pointCount;

		b2Collision.b2CollidePoly(tMani, this.m_shape1, this.m_shape2, false);

		// Match contact ids to facilitate warm starting.
		if (tMani.pointCount > 0)
		{
			var match = [false, false];

			// Match old contact ids to new contact ids and copy the
			// stored impulses to warm start the solver.
			for (var i = 0; i < tMani.pointCount; ++i)
			{
				var cp = tMani.points[ i ];

				cp.normalImpulse = 0.0;
				cp.tangentImpulse = 0.0;
				var idKey = cp.id.key;

				for (var j = 0; j < this.m0.pointCount; ++j)
				{

					if (match[j] == true)
						continue;

					var cp0 = this.m0.points[j];
					var id0 = cp0.id;

					if (id0.key == idKey)
					{
						match[j] = true;
						cp.normalImpulse = cp0.normalImpulse;
						cp.tangentImpulse = cp0.tangentImpulse;
						break;
					}
				}
			}

			this.m_manifoldCount = 1;
		}
		else
		{
			this.m_manifoldCount = 0;
		}
	},

	GetManifolds: function()
	{
		return this.m_manifold;
	},

	m_manifold: [new b2Manifold()]});

b2PolyContact.Create = function(shape1, shape2, allocator){
		//void* mem = allocator->Allocate(sizeof(b2PolyContact));
		return new b2PolyContact(shape1, shape2);
	};
b2PolyContact.Destroy = function(contact, allocator){
		//((b2PolyContact*)contact)->~b2PolyContact();
		//allocator->Free(contact, sizeof(b2PolyContact));
	};
/*
* Copyright (c) 2006-2007 Erin Catto http:
*
* This software is provided 'as-is', without any express or implied
* warranty.  In no event will the authors be held liable for any damages
* arising from the use of this software.
* Permission is granted to anyone to use this software for any purpose,
* including commercial applications, and to alter it and redistribute it
* freely, subject to the following restrictions:
* 1. The origin of this software must not be misrepresented; you must not
* claim that you wrote the original software. If you use this software
* in a product, an acknowledgment in the product documentation would be
* appreciated but is not required.
* 2. Altered source versions must be plainly marked, and must not be
* misrepresented the original software.
* 3. This notice may not be removed or altered from any source distribution.
*/





var b2ContactManager = Class.create();
Object.extend(b2ContactManager.prototype, b2PairCallback.prototype);
Object.extend(b2ContactManager.prototype, 
{
	initialize: function(){
		// The constructor for b2PairCallback
		//

		// initialize instance variables for references
		this.m_nullContact = new b2NullContact();
		//

		this.m_world = null;
		this.m_destroyImmediate = false;
	},

	// This is a callback from the broadphase when two AABB proxies begin
	// to overlap. We create a b2Contact to manage the narrow phase.
	PairAdded: function(proxyUserData1, proxyUserData2){
		var shape1 = proxyUserData1;
		var shape2 = proxyUserData2;

		var body1 = shape1.m_body;
		var body2 = shape2.m_body;

		if (body1.IsStatic() && body2.IsStatic())
		{
			return this.m_nullContact;
		}

		if (shape1.m_body == shape2.m_body)
		{
			return this.m_nullContact;
		}

		if (body2.IsConnected(body1))
		{
			return this.m_nullContact;
		}

		if (this.m_world.m_filter != null && this.m_world.m_filter.ShouldCollide(shape1, shape2) == false)
		{
			return this.m_nullContact;
		}

		// Ensure that body2 is dynamic (body1 is static or dynamic).
		if (body2.m_invMass == 0.0)
		{
			var tempShape = shape1;
			shape1 = shape2;
			shape2 = tempShape;
			//b2Math.b2Swap(shape1, shape2);
			var tempBody = body1;
			body1 = body2;
			body2 = tempBody;
			//b2Math.b2Swap(body1, body2);
		}

		// Call the factory.
		var contact = b2Contact.Create(shape1, shape2, this.m_world.m_blockAllocator);

		if (contact == null)
		{
			return this.m_nullContact;
		}
		else
		{
			// Insert into the world.
			contact.m_prev = null;
			contact.m_next = this.m_world.m_contactList;
			if (this.m_world.m_contactList != null)
			{
				this.m_world.m_contactList.m_prev = contact;
			}
			this.m_world.m_contactList = contact;
			this.m_world.m_contactCount++;
		}

		return contact;
	},

	// This is a callback from the broadphase when two AABB proxies cease
	// to overlap. We destroy the b2Contact.
	PairRemoved: function(proxyUserData1, proxyUserData2, pairUserData){

		if (pairUserData == null)
		{
			return;
		}

		var c = pairUserData;
		if (c != this.m_nullContact)
		{
			//b2Settings.b2Assert(this.m_world.m_contactCount > 0);
			if (this.m_destroyImmediate == true)
			{
				this.DestroyContact(c);
				c = null;
			}
			else
			{
				c.m_flags |= b2Contact.e_destroyFlag;
			}
		}
	},

	DestroyContact: function(c)
	{

		//b2Settings.b2Assert(this.m_world.m_contactCount > 0);

		// Remove from the world.
		if (c.m_prev)
		{
			c.m_prev.m_next = c.m_next;
		}

		if (c.m_next)
		{
			c.m_next.m_prev = c.m_prev;
		}

		if (c == this.m_world.m_contactList)
		{
			this.m_world.m_contactList = c.m_next;
		}

		// If there are contact points, then disconnect from the island graph.
		if (c.GetManifoldCount() > 0)
		{
			var body1 = c.m_shape1.m_body;
			var body2 = c.m_shape2.m_body;
			var node1 = c.m_node1;
			var node2 = c.m_node2;

			// Wake up touching bodies.
			body1.WakeUp();
			body2.WakeUp();

			// Remove from body 1
			if (node1.prev)
			{
				node1.prev.next = node1.next;
			}

			if (node1.next)
			{
				node1.next.prev = node1.prev;
			}

			if (node1 == body1.m_contactList)
			{
				body1.m_contactList = node1.next;
			}

			node1.prev = null;
			node1.next = null;

			// Remove from body 2
			if (node2.prev)
			{
				node2.prev.next = node2.next;
			}

			if (node2.next)
			{
				node2.next.prev = node2.prev;
			}

			if (node2 == body2.m_contactList)
			{
				body2.m_contactList = node2.next;
			}

			node2.prev = null;
			node2.next = null;
		}

		// Call the factory.
		b2Contact.Destroy(c, this.m_world.m_blockAllocator);
		--this.m_world.m_contactCount;
	},


	// Destroy any contacts marked for deferred destruction.
	CleanContactList: function()
	{
		var c = this.m_world.m_contactList;
		while (c != null)
		{
			var c0 = c;
			c = c.m_next;

			if (c0.m_flags & b2Contact.e_destroyFlag)
			{
				this.DestroyContact(c0);
				c0 = null;
			}
		}
	},


	// This is the top level collision call for the time step. Here
	// all the narrow phase collision is processed for the world
	// contact list.
	Collide: function()
	{
		var body1;
		var body2;
		var node1;
		var node2;

		for (var c = this.m_world.m_contactList; c != null; c = c.m_next)
		{
			if (c.m_shape1.m_body.IsSleeping() &&
				c.m_shape2.m_body.IsSleeping())
			{
				continue;
			}

			var oldCount = c.GetManifoldCount();
			c.Evaluate();

			var newCount = c.GetManifoldCount();

			if (oldCount == 0 && newCount > 0)
			{
				//b2Settings.b2Assert(c.GetManifolds().pointCount > 0);

				// Connect to island graph.
				body1 = c.m_shape1.m_body;
				body2 = c.m_shape2.m_body;
				node1 = c.m_node1;
				node2 = c.m_node2;

				// Connect to body 1
				node1.contact = c;
				node1.other = body2;

				node1.prev = null;
				node1.next = body1.m_contactList;
				if (node1.next != null)
				{
					node1.next.prev = c.m_node1;
				}
				body1.m_contactList = c.m_node1;

				// Connect to body 2
				node2.contact = c;
				node2.other = body1;

				node2.prev = null;
				node2.next = body2.m_contactList;
				if (node2.next != null)
				{
					node2.next.prev = node2;
				}
				body2.m_contactList = node2;
			}
			else if (oldCount > 0 && newCount == 0)
			{
				// Disconnect from island graph.
				body1 = c.m_shape1.m_body;
				body2 = c.m_shape2.m_body;
				node1 = c.m_node1;
				node2 = c.m_node2;

				// Remove from body 1
				if (node1.prev)
				{
					node1.prev.next = node1.next;
				}

				if (node1.next)
				{
					node1.next.prev = node1.prev;
				}

				if (node1 == body1.m_contactList)
				{
					body1.m_contactList = node1.next;
				}

				node1.prev = null;
				node1.next = null;

				// Remove from body 2
				if (node2.prev)
				{
					node2.prev.next = node2.next;
				}

				if (node2.next)
				{
					node2.next.prev = node2.prev;
				}

				if (node2 == body2.m_contactList)
				{
					body2.m_contactList = node2.next;
				}

				node2.prev = null;
				node2.next = null;
			}
		}
	},

	m_world: null,

	// This lets us provide broadphase proxy pair user data for
	// contacts that shouldn't exist.
	m_nullContact: new b2NullContact(),
	m_destroyImmediate: null});

/*
* Copyright (c) 2006-2007 Erin Catto http:
*
* This software is provided 'as-is', without any express or implied
* warranty.  In no event will the authors be held liable for any damages
* arising from the use of this software.
* Permission is granted to anyone to use this software for any purpose,
* including commercial applications, and to alter it and redistribute it
* freely, subject to the following restrictions:
* 1. The origin of this software must not be misrepresented; you must not
* claim that you wrote the original software. If you use this software
* in a product, an acknowledgment in the product documentation would be
* appreciated but is not required.
* 2. Altered source versions must be plainly marked, and must not be
* misrepresented the original software.
* 3. This notice may not be removed or altered from any source distribution.
*/




var b2World = Class.create();
b2World.prototype = 
{
	initialize: function(worldAABB, gravity, doSleep){
		// initialize instance variables for references
		this.step = new b2TimeStep();
		this.m_contactManager = new b2ContactManager();
		//


		this.m_listener = null;
		this.m_filter = b2CollisionFilter.b2_defaultFilter;

		this.m_bodyList = null;
		this.m_contactList = null;
		this.m_jointList = null;

		this.m_bodyCount = 0;
		this.m_contactCount = 0;
		this.m_jointCount = 0;

		this.m_bodyDestroyList = null;

		this.m_allowSleep = doSleep;

		this.m_gravity = gravity;

		this.m_contactManager.m_world = this;
		this.m_broadPhase = new b2BroadPhase(worldAABB, this.m_contactManager);

		var bd = new b2BodyDef();
		this.m_groundBody = this.CreateBody(bd);
	},
	//~b2World(){
	//	this.DestroyBody(this.m_groundBody);
	//	delete this.m_broadPhase;
	//}

	// Set a callback to notify you when a joint is implicitly destroyed
	// when an attached body is destroyed.
	SetListener: function(listener){
		this.m_listener = listener;
	},

	// Register a collision filter to provide specific control over collision.
	// Otherwise the default filter is used (b2CollisionFilter).
	SetFilter: function(filter){
		this.m_filter = filter;
	},

	// Create and destroy rigid bodies. Destruction is deferred until the
	// the next call to this.Step. This is done so that bodies may be destroyed
	// while you iterate through the contact list.
	CreateBody: function(def){
		//void* mem = this.m_blockAllocator.Allocate(sizeof(b2Body));
		var b = new b2Body(def, this);
		b.m_prev = null;

		b.m_next = this.m_bodyList;
		if (this.m_bodyList)
		{
			this.m_bodyList.m_prev = b;
		}
		this.m_bodyList = b;
		++this.m_bodyCount;

		return b;
	},
	// Body destruction is deferred to make contact processing more robust.
	DestroyBody: function(b)
	{

		if (b.m_flags & b2Body.e_destroyFlag)
		{
			return;
		}

		// Remove from normal body list.
		if (b.m_prev)
		{
			b.m_prev.m_next = b.m_next;
		}

		if (b.m_next)
		{
			b.m_next.m_prev = b.m_prev;
		}

		if (b == this.m_bodyList)
		{
			this.m_bodyList = b.m_next;
		}

		b.m_flags |= b2Body.e_destroyFlag;
		//b2Settings.b2Assert(this.m_bodyCount > 0);
		--this.m_bodyCount;

		//b->~b2Body();
		//b.Destroy();
		// Add to the deferred destruction list.
		b.m_prev = null;
		b.m_next = this.m_bodyDestroyList;
		this.m_bodyDestroyList = b;
	},

	CleanBodyList: function()
	{
		this.m_contactManager.m_destroyImmediate = true;

		var b = this.m_bodyDestroyList;
		while (b)
		{
			//b2Settings.b2Assert((b.m_flags & b2Body.e_destroyFlag) != 0);

			// Preserve the next pointer.
			var b0 = b;
			b = b.m_next;

			// Delete the attached joints
			var jn = b0.m_jointList;
			while (jn)
			{
				var jn0 = jn;
				jn = jn.next;

				if (this.m_listener)
				{
					this.m_listener.NotifyJointDestroyed(jn0.joint);
				}

				this.DestroyJoint(jn0.joint);
			}

			b0.Destroy();
			//this.m_blockAllocator.Free(b0, sizeof(b2Body));
		}

		// Reset the list.
		this.m_bodyDestroyList = null;

		this.m_contactManager.m_destroyImmediate = false;
	},

	CreateJoint: function(def){
		var j = b2Joint.Create(def, this.m_blockAllocator);

		// Connect to the world list.
		j.m_prev = null;
		j.m_next = this.m_jointList;
		if (this.m_jointList)
		{
			this.m_jointList.m_prev = j;
		}
		this.m_jointList = j;
		++this.m_jointCount;

		// Connect to the bodies
		j.m_node1.joint = j;
		j.m_node1.other = j.m_body2;
		j.m_node1.prev = null;
		j.m_node1.next = j.m_body1.m_jointList;
		if (j.m_body1.m_jointList) j.m_body1.m_jointList.prev = j.m_node1;
		j.m_body1.m_jointList = j.m_node1;

		j.m_node2.joint = j;
		j.m_node2.other = j.m_body1;
		j.m_node2.prev = null;
		j.m_node2.next = j.m_body2.m_jointList;
		if (j.m_body2.m_jointList) j.m_body2.m_jointList.prev = j.m_node2;
		j.m_body2.m_jointList = j.m_node2;

		// If the joint prevents collisions, then reset collision filtering.
		if (def.collideConnected == false)
		{
			// Reset the proxies on the body with the minimum number of shapes.
			var b = def.body1.m_shapeCount < def.body2.m_shapeCount ? def.body1 : def.body2;
			for (var s = b.m_shapeList; s; s = s.m_next)
			{
				s.ResetProxy(this.m_broadPhase);
			}
		}

		return j;
	},
	DestroyJoint: function(j)
	{

		var collideConnected = j.m_collideConnected;

		// Remove from the world.
		if (j.m_prev)
		{
			j.m_prev.m_next = j.m_next;
		}

		if (j.m_next)
		{
			j.m_next.m_prev = j.m_prev;
		}

		if (j == this.m_jointList)
		{
			this.m_jointList = j.m_next;
		}

		// Disconnect from island graph.
		var body1 = j.m_body1;
		var body2 = j.m_body2;

		// Wake up touching bodies.
		body1.WakeUp();
		body2.WakeUp();

		// Remove from body 1
		if (j.m_node1.prev)
		{
			j.m_node1.prev.next = j.m_node1.next;
		}

		if (j.m_node1.next)
		{
			j.m_node1.next.prev = j.m_node1.prev;
		}

		if (j.m_node1 == body1.m_jointList)
		{
			body1.m_jointList = j.m_node1.next;
		}

		j.m_node1.prev = null;
		j.m_node1.next = null;

		// Remove from body 2
		if (j.m_node2.prev)
		{
			j.m_node2.prev.next = j.m_node2.next;
		}

		if (j.m_node2.next)
		{
			j.m_node2.next.prev = j.m_node2.prev;
		}

		if (j.m_node2 == body2.m_jointList)
		{
			body2.m_jointList = j.m_node2.next;
		}

		j.m_node2.prev = null;
		j.m_node2.next = null;

		b2Joint.Destroy(j, this.m_blockAllocator);

		//b2Settings.b2Assert(this.m_jointCount > 0);
		--this.m_jointCount;

		// If the joint prevents collisions, then reset collision filtering.
		if (collideConnected == false)
		{
			// Reset the proxies on the body with the minimum number of shapes.
			var b = body1.m_shapeCount < body2.m_shapeCount ? body1 : body2;
			for (var s = b.m_shapeList; s; s = s.m_next)
			{
				s.ResetProxy(this.m_broadPhase);
			}
		}
	},

	// The world provides a single ground body with no collision shapes. You
	// can use this to simplify the creation of joints.
	GetGroundBody: function(){
		return this.m_groundBody;
	},


	step: new b2TimeStep(),
	// this.Step
	Step: function(dt, iterations){

		var b;
		var other;


		this.step.dt = dt;
		this.step.iterations	= iterations;
		if (dt > 0.0)
		{
			this.step.inv_dt = 1.0 / dt;
		}
		else
		{
			this.step.inv_dt = 0.0;
		}

		this.m_positionIterationCount = 0;

		// Handle deferred contact destruction.
		this.m_contactManager.CleanContactList();

		// Handle deferred body destruction.
		this.CleanBodyList();

		// Update contacts.
		this.m_contactManager.Collide();

		// Size the island for the worst case.
		var island = new b2Island(this.m_bodyCount, this.m_contactCount, this.m_jointCount, this.m_stackAllocator);

		// Clear all the island flags.
		for (b = this.m_bodyList; b != null; b = b.m_next)
		{
			b.m_flags &= ~b2Body.e_islandFlag;
		}
		for (var c = this.m_contactList; c != null; c = c.m_next)
		{
			c.m_flags &= ~b2Contact.e_islandFlag;
		}
		for (var j = this.m_jointList; j != null; j = j.m_next)
		{
			j.m_islandFlag = false;
		}

		// Build and simulate all awake islands.
		var stackSize = this.m_bodyCount;
		//var stack = (b2Body**)this.m_stackAllocator.Allocate(stackSize * sizeof(b2Body*));
		var stack = new Array(this.m_bodyCount);
		for (var k = 0; k < this.m_bodyCount; k++)
			stack[k] = null;

		for (var seed = this.m_bodyList; seed != null; seed = seed.m_next)
		{
			if (seed.m_flags & (b2Body.e_staticFlag | b2Body.e_islandFlag | b2Body.e_sleepFlag | b2Body.e_frozenFlag))
			{
				continue;
			}

			// Reset island and stack.
			island.Clear();
			var stackCount = 0;
			stack[stackCount++] = seed;
			seed.m_flags |= b2Body.e_islandFlag;;

			// Perform a depth first search (DFS) on the constraint graph.
			while (stackCount > 0)
			{
				// Grab the next body off the stack and add it to the island.
				b = stack[--stackCount];
				island.AddBody(b);

				// Make sure the body is awake.
				b.m_flags &= ~b2Body.e_sleepFlag;

				// To keep islands, we don't
				// propagate islands across static bodies.
				if (b.m_flags & b2Body.e_staticFlag)
				{
					continue;
				}

				// Search all contacts connected to this body.
				for (var cn = b.m_contactList; cn != null; cn = cn.next)
				{
					if (cn.contact.m_flags & b2Contact.e_islandFlag)
					{
						continue;
					}

					island.AddContact(cn.contact);
					cn.contact.m_flags |= b2Contact.e_islandFlag;

					other = cn.other;
					if (other.m_flags & b2Body.e_islandFlag)
					{
						continue;
					}

					//b2Settings.b2Assert(stackCount < stackSize);
					stack[stackCount++] = other;
					other.m_flags |= b2Body.e_islandFlag;
				}

				// Search all joints connect to this body.
				for (var jn = b.m_jointList; jn != null; jn = jn.next)
				{
					if (jn.joint.m_islandFlag == true)
					{
						continue;
					}

					island.AddJoint(jn.joint);
					jn.joint.m_islandFlag = true;

					other = jn.other;
					if (other.m_flags & b2Body.e_islandFlag)
					{
						continue;
					}

					//b2Settings.b2Assert(stackCount < stackSize);
					stack[stackCount++] = other;
					other.m_flags |= b2Body.e_islandFlag;
				}
			}

			island.Solve(this.step, this.m_gravity);

			this.m_positionIterationCount = b2Math.b2Max(this.m_positionIterationCount, b2Island.m_positionIterationCount);

			if (this.m_allowSleep)
			{
				island.UpdateSleep(dt);
			}

			// Post solve cleanup.
			for (var i = 0; i < island.m_bodyCount; ++i)
			{
				// Allow static bodies to participate in other islands.
				b = island.m_bodies[i];
				if (b.m_flags & b2Body.e_staticFlag)
				{
					b.m_flags &= ~b2Body.e_islandFlag;
				}

				// Handle newly frozen bodies.
				if (b.IsFrozen() && this.m_listener)
				{
					var response = this.m_listener.NotifyBoundaryViolated(b);
					if (response == b2WorldListener.b2_destroyBody)
					{
						this.DestroyBody(b);
						b = null;
						island.m_bodies[i] = null;
					}
				}
			}
		}

		this.m_broadPhase.Commit();

		//this.m_stackAllocator.Free(stack);
	},

	// this.Query the world for all shapes that potentially overlap the
	// provided AABB. You provide a shape pointer buffer of specified
	// size. The number of shapes found is returned.
	Query: function(aabb, shapes, maxCount){

		//void** results = (void**)this.m_stackAllocator.Allocate(maxCount * sizeof(void*));
		var results = new Array();
		var count = this.m_broadPhase.QueryAABB(aabb, results, maxCount);

		for (var i = 0; i < count; ++i)
		{
			shapes[i] = results[i];
		}

		//this.m_stackAllocator.Free(results);
		return count;
	},

	// You can use these to iterate over all the bodies, joints, and contacts.
	GetBodyList: function(){
		return this.m_bodyList;
	},
	GetJointList: function(){
		return this.m_jointList;
	},
	GetContactList: function(){
		return this.m_contactList;
	},

	//--------------- Internals Below -------------------

	m_blockAllocator: null,
	m_stackAllocator: null,

	m_broadPhase: null,
	m_contactManager: new b2ContactManager(),

	m_bodyList: null,
	m_contactList: null,
	m_jointList: null,

	m_bodyCount: 0,
	m_contactCount: 0,
	m_jointCount: 0,

	// These bodies will be destroyed at the next time this.step.
	m_bodyDestroyList: null,

	m_gravity: null,
	m_allowSleep: null,

	m_groundBody: null,

	m_listener: null,
	m_filter: null,

	m_positionIterationCount: 0};
b2World.s_enablePositionCorrection = 1;
b2World.s_enableWarmStarting = 1;
/*
* Copyright (c) 2006-2007 Erin Catto http:
*
* This software is provided 'as-is', without any express or implied
* warranty.  In no event will the authors be held liable for any damages
* arising from the use of this software.
* Permission is granted to anyone to use this software for any purpose,
* including commercial applications, and to alter it and redistribute it
* freely, subject to the following restrictions:
* 1. The origin of this software must not be misrepresented; you must not
* claim that you wrote the original software. If you use this software
* in a product, an acknowledgment in the product documentation would be
* appreciated but is not required.
* 2. Altered source versions must be plainly marked, and must not be
* misrepresented the original software.
* 3. This notice may not be removed or altered from any source distribution.
*/







var b2WorldListener = Class.create();
b2WorldListener.prototype = 
{

	// If a body is destroyed, then any joints attached to it are also destroyed.
	// This prevents memory leaks, but you may unexpectedly be left with an
	// orphaned joint pointer.
	// Box2D will notify you when a joint is implicitly destroyed.
	// It is NOT called if you directly destroy a joint.
	// Implement this abstract class and provide it to b2World via
	// b2World::SetListener().
	// DO NOT modify the Box2D world inside this callback.
	NotifyJointDestroyed: function(joint){},

	// This is called when a body's shape passes outside of the world boundary. If you
	// override this and pass back e_destroyBody, you must nullify your copies of the
	// body pointer.
	NotifyBoundaryViolated: function(body)
	{
		//NOT_USED(body);
		return b2WorldListener.b2_freezeBody;
	},



	initialize: function() {}};
b2WorldListener.b2_freezeBody = 0;
b2WorldListener.b2_destroyBody = 1;
/*
* Copyright (c) 2006-2007 Erin Catto http:
*
* This software is provided 'as-is', without any express or implied
* warranty.  In no event will the authors be held liable for any damages
* arising from the use of this software.
* Permission is granted to anyone to use this software for any purpose,
* including commercial applications, and to alter it and redistribute it
* freely, subject to the following restrictions:
* 1. The origin of this software must not be misrepresented; you must not
* claim that you wrote the original software. If you use this software
* in a product, an acknowledgment in the product documentation would be
* appreciated but is not required.
* 2. Altered source versions must be plainly marked, and must not be
* misrepresented the original software.
* 3. This notice may not be removed or altered from any source distribution.
*/





var b2JointNode = Class.create();
b2JointNode.prototype = 
{

	other: null,
	joint: null,
	prev: null,
	next: null,


	initialize: function() {}}
/*
* Copyright (c) 2006-2007 Erin Catto http:
*
* This software is provided 'as-is', without any express or implied
* warranty.  In no event will the authors be held liable for any damages
* arising from the use of this software.
* Permission is granted to anyone to use this software for any purpose,
* including commercial applications, and to alter it and redistribute it
* freely, subject to the following restrictions:
* 1. The origin of this software must not be misrepresented; you must not
* claim that you wrote the original software. If you use this software
* in a product, an acknowledgment in the product documentation would be
* appreciated but is not required.
* 2. Altered source versions must be plainly marked, and must not be
* misrepresented the original software.
* 3. This notice may not be removed or altered from any source distribution.
*/





var b2Joint = Class.create();
b2Joint.prototype = 
{
	GetType: function(){
		return this.m_type;
	},

	GetAnchor1: function(){return null},
	GetAnchor2: function(){return null},

	GetReactionForce: function(invTimeStep){return null},
	GetReactionTorque: function(invTimeStep){return 0.0},

	GetBody1: function()
	{
		return this.m_body1;
	},

	GetBody2: function()
	{
		return this.m_body2;
	},

	GetNext: function(){
		return this.m_next;
	},

	GetUserData: function(){
		return this.m_userData;
	},

	//--------------- Internals Below -------------------



	initialize: function(def){
		// initialize instance variables for references
		this.m_node1 = new b2JointNode();
		this.m_node2 = new b2JointNode();
		//

		this.m_type = def.type;
		this.m_prev = null;
		this.m_next = null;
		this.m_body1 = def.body1;
		this.m_body2 = def.body2;
		this.m_collideConnected = def.collideConnected;
		this.m_islandFlag = false;
		this.m_userData = def.userData;
	},
	//virtual ~b2Joint() {}

	PrepareVelocitySolver: function(){},
	SolveVelocityConstraints: function(step){},

	// This returns true if the position errors are within tolerance.
	PreparePositionSolver: function(){},
	SolvePositionConstraints: function(){return false},

	m_type: 0,
	m_prev: null,
	m_next: null,
	m_node1: new b2JointNode(),
	m_node2: new b2JointNode(),
	m_body1: null,
	m_body2: null,

	m_islandFlag: null,
	m_collideConnected: null,

	m_userData: null


	// ENUMS

	// enum b2JointType

	// enum b2LimitState

};
b2Joint.Create = function(def, allocator){
		var joint = null;

		switch (def.type)
		{
		case b2Joint.e_distanceJoint:
			{
				//void* mem = allocator->Allocate(sizeof(b2DistanceJoint));
				joint = new b2DistanceJoint(def);
			}
			break;

		case b2Joint.e_mouseJoint:
			{
				//void* mem = allocator->Allocate(sizeof(b2MouseJoint));
				joint = new b2MouseJoint(def);
			}
			break;

		case b2Joint.e_prismaticJoint:
			{
				//void* mem = allocator->Allocate(sizeof(b2PrismaticJoint));
				joint = new b2PrismaticJoint(def);
			}
			break;

		case b2Joint.e_revoluteJoint:
			{
				//void* mem = allocator->Allocate(sizeof(b2RevoluteJoint));
				joint = new b2RevoluteJoint(def);
			}
			break;

		case b2Joint.e_pulleyJoint:
			{
				//void* mem = allocator->Allocate(sizeof(b2PulleyJoint));
				joint = new b2PulleyJoint(def);
			}
			break;

		case b2Joint.e_gearJoint:
			{
				//void* mem = allocator->Allocate(sizeof(b2GearJoint));
				joint = new b2GearJoint(def);
			}
			break;

		default:
			//b2Settings.b2Assert(false);
			break;
		}

		return joint;
	};
b2Joint.Destroy = function(joint, allocator){
		/*joint->~b2Joint();
		switch (joint.m_type)
		{
		case b2Joint.e_distanceJoint:
			allocator->Free(joint, sizeof(b2DistanceJoint));
			break;

		case b2Joint.e_mouseJoint:
			allocator->Free(joint, sizeof(b2MouseJoint));
			break;

		case b2Joint.e_prismaticJoint:
			allocator->Free(joint, sizeof(b2PrismaticJoint));
			break;

		case b2Joint.e_revoluteJoint:
			allocator->Free(joint, sizeof(b2RevoluteJoint));
			break;

		case b2Joint.e_pulleyJoint:
			allocator->Free(joint, sizeof(b2PulleyJoint));
			break;

		case b2Joint.e_gearJoint:
			allocator->Free(joint, sizeof(b2GearJoint));
			break;

		default:
			b2Assert(false);
			break;
		}*/
	};
b2Joint.e_unknownJoint = 0;
b2Joint.e_revoluteJoint = 1;
b2Joint.e_prismaticJoint = 2;
b2Joint.e_distanceJoint = 3;
b2Joint.e_pulleyJoint = 4;
b2Joint.e_mouseJoint = 5;
b2Joint.e_gearJoint = 6;
b2Joint.e_inactiveLimit = 0;
b2Joint.e_atLowerLimit = 1;
b2Joint.e_atUpperLimit = 2;
b2Joint.e_equalLimits = 3;
/*
* Copyright (c) 2006-2007 Erin Catto http:
*
* This software is provided 'as-is', without any express or implied
* warranty.  In no event will the authors be held liable for any damages
* arising from the use of this software.
* Permission is granted to anyone to use this software for any purpose,
* including commercial applications, and to alter it and redistribute it
* freely, subject to the following restrictions:
* 1. The origin of this software must not be misrepresented; you must not
* claim that you wrote the original software. If you use this software
* in a product, an acknowledgment in the product documentation would be
* appreciated but is not required.
* 2. Altered source versions must be plainly marked, and must not be
* misrepresented the original software.
* 3. This notice may not be removed or altered from any source distribution.
*/





var b2JointDef = Class.create();
b2JointDef.prototype = 
{

	initialize: function()
	{
		this.type = b2Joint.e_unknownJoint;
		this.userData = null;
		this.body1 = null;
		this.body2 = null;
		this.collideConnected = false;
	},

	type: 0,
	userData: null,
	body1: null,
	body2: null,
	collideConnected: null}
/*
* Copyright (c) 2006-2007 Erin Catto http:
*
* This software is provided 'as-is', without any express or implied
* warranty.  In no event will the authors be held liable for any damages
* arising from the use of this software.
* Permission is granted to anyone to use this software for any purpose,
* including commercial applications, and to alter it and redistribute it
* freely, subject to the following restrictions:
* 1. The origin of this software must not be misrepresented; you must not
* claim that you wrote the original software. If you use this software
* in a product, an acknowledgment in the product documentation would be
* appreciated but is not required.
* 2. Altered source versions must be plainly marked, and must not be
* misrepresented the original software.
* 3. This notice may not be removed or altered from any source distribution.
*/



// C = norm(p2 - p1) - L
// u = (p2 - p1) / norm(p2 - p1)
// Cdot = dot(u, v2 + cross(w2, r2) - v1 - cross(w1, r1))
// J = [-u -cross(r1, u) u cross(r2, u)]
// K = J * invM * JT
//   = invMass1 + invI1 * cross(r1, u)^2 + invMass2 + invI2 * cross(r2, u)^2

var b2DistanceJoint = Class.create();
Object.extend(b2DistanceJoint.prototype, b2Joint.prototype);
Object.extend(b2DistanceJoint.prototype, 
{
	//--------------- Internals Below -------------------

	initialize: function(def){
		// The constructor for b2Joint
		// initialize instance variables for references
		this.m_node1 = new b2JointNode();
		this.m_node2 = new b2JointNode();
		//
		this.m_type = def.type;
		this.m_prev = null;
		this.m_next = null;
		this.m_body1 = def.body1;
		this.m_body2 = def.body2;
		this.m_collideConnected = def.collideConnected;
		this.m_islandFlag = false;
		this.m_userData = def.userData;
		//

		// initialize instance variables for references
		this.m_localAnchor1 = new b2Vec2();
		this.m_localAnchor2 = new b2Vec2();
		this.m_u = new b2Vec2();
		//

		//super(def);

		var tMat;
		var tX;
		var tY;
		//this.m_localAnchor1 = b2MulT(this.m_body1->m_R, def->anchorPoint1 - this.m_body1->m_position);
		tMat = this.m_body1.m_R;
		tX = def.anchorPoint1.x - this.m_body1.m_position.x;
		tY = def.anchorPoint1.y - this.m_body1.m_position.y;
		this.m_localAnchor1.x = tX*tMat.col1.x + tY*tMat.col1.y;
		this.m_localAnchor1.y = tX*tMat.col2.x + tY*tMat.col2.y;
		//this.m_localAnchor2 = b2MulT(this.m_body2->m_R, def->anchorPoint2 - this.m_body2->m_position);
		tMat = this.m_body2.m_R;
		tX = def.anchorPoint2.x - this.m_body2.m_position.x;
		tY = def.anchorPoint2.y - this.m_body2.m_position.y;
		this.m_localAnchor2.x = tX*tMat.col1.x + tY*tMat.col1.y;
		this.m_localAnchor2.y = tX*tMat.col2.x + tY*tMat.col2.y;

		//b2Vec2 d = def->anchorPoint2 - def->anchorPoint1;
		tX = def.anchorPoint2.x - def.anchorPoint1.x;
		tY = def.anchorPoint2.y - def.anchorPoint1.y;
		//this.m_length = d.Length();
		this.m_length = Math.sqrt(tX*tX + tY*tY);
		this.m_impulse = 0.0;
	},

	PrepareVelocitySolver: function(){

		var tMat;

		// Compute the effective mass matrix.
		//b2Vec2 r1 = b2Mul(this.m_body1->m_R, this.m_localAnchor1);
		tMat = this.m_body1.m_R;
		var r1X = tMat.col1.x * this.m_localAnchor1.x + tMat.col2.x * this.m_localAnchor1.y;
		var r1Y = tMat.col1.y * this.m_localAnchor1.x + tMat.col2.y * this.m_localAnchor1.y;
		//b2Vec2 r2 = b2Mul(this.m_body2->m_R, this.m_localAnchor2);
		tMat = this.m_body2.m_R;
		var r2X = tMat.col1.x * this.m_localAnchor2.x + tMat.col2.x * this.m_localAnchor2.y;
		var r2Y = tMat.col1.y * this.m_localAnchor2.x + tMat.col2.y * this.m_localAnchor2.y;
		//this.m_u = this.m_body2->m_position + r2 - this.m_body1->m_position - r1;
		this.m_u.x = this.m_body2.m_position.x + r2X - this.m_body1.m_position.x - r1X;
		this.m_u.y = this.m_body2.m_position.y + r2Y - this.m_body1.m_position.y - r1Y;

		// Handle singularity.
		//float32 length = this.m_u.Length();
		var length = Math.sqrt(this.m_u.x*this.m_u.x + this.m_u.y*this.m_u.y);
		if (length > b2Settings.b2_linearSlop)
		{
			//this.m_u *= 1.0 / length;
			this.m_u.Multiply( 1.0 / length );
		}
		else
		{
			this.m_u.SetZero();
		}

		//float32 cr1u = b2Cross(r1, this.m_u);
		var cr1u = (r1X * this.m_u.y - r1Y * this.m_u.x);
		//float32 cr2u = b2Cross(r2, this.m_u);
		var cr2u = (r2X * this.m_u.y - r2Y * this.m_u.x);
		//this.m_mass = this.m_body1->m_invMass + this.m_body1->m_invI * cr1u * cr1u + this.m_body2->m_invMass + this.m_body2->m_invI * cr2u * cr2u;
		this.m_mass = this.m_body1.m_invMass + this.m_body1.m_invI * cr1u * cr1u + this.m_body2.m_invMass + this.m_body2.m_invI * cr2u * cr2u;
		//b2Settings.b2Assert(this.m_mass > Number.MIN_VALUE);
		this.m_mass = 1.0 / this.m_mass;

		if (b2World.s_enableWarmStarting)
		{
			//b2Vec2 P = this.m_impulse * this.m_u;
			var PX = this.m_impulse * this.m_u.x;
			var PY = this.m_impulse * this.m_u.y;
			//this.m_body1.m_linearVelocity -= this.m_body1.m_invMass * P;
			this.m_body1.m_linearVelocity.x -= this.m_body1.m_invMass * PX;
			this.m_body1.m_linearVelocity.y -= this.m_body1.m_invMass * PY;
			//this.m_body1.m_angularVelocity -= this.m_body1.m_invI * b2Cross(r1, P);
			this.m_body1.m_angularVelocity -= this.m_body1.m_invI * (r1X * PY - r1Y * PX);
			//this.m_body2.m_linearVelocity += this.m_body2.m_invMass * P;
			this.m_body2.m_linearVelocity.x += this.m_body2.m_invMass * PX;
			this.m_body2.m_linearVelocity.y += this.m_body2.m_invMass * PY;
			//this.m_body2.m_angularVelocity += this.m_body2.m_invI * b2Cross(r2, P);
			this.m_body2.m_angularVelocity += this.m_body2.m_invI * (r2X * PY - r2Y * PX);
		}
		else
		{
			this.m_impulse = 0.0;
		}

	},



	SolveVelocityConstraints: function(step){

		var tMat;

		//b2Vec2 r1 = b2Mul(this.m_body1->m_R, this.m_localAnchor1);
		tMat = this.m_body1.m_R;
		var r1X = tMat.col1.x * this.m_localAnchor1.x + tMat.col2.x * this.m_localAnchor1.y;
		var r1Y = tMat.col1.y * this.m_localAnchor1.x + tMat.col2.y * this.m_localAnchor1.y;
		//b2Vec2 r2 = b2Mul(this.m_body2->m_R, this.m_localAnchor2);
		tMat = this.m_body2.m_R;
		var r2X = tMat.col1.x * this.m_localAnchor2.x + tMat.col2.x * this.m_localAnchor2.y;
		var r2Y = tMat.col1.y * this.m_localAnchor2.x + tMat.col2.y * this.m_localAnchor2.y;

		// Cdot = dot(u, v + cross(w, r))
		//b2Vec2 v1 = this.m_body1->m_linearVelocity + b2Cross(this.m_body1->m_angularVelocity, r1);
		var v1X = this.m_body1.m_linearVelocity.x + (-this.m_body1.m_angularVelocity * r1Y);
		var v1Y = this.m_body1.m_linearVelocity.y + (this.m_body1.m_angularVelocity * r1X);
		//b2Vec2 v2 = this.m_body2->m_linearVelocity + b2Cross(this.m_body2->m_angularVelocity, r2);
		var v2X = this.m_body2.m_linearVelocity.x + (-this.m_body2.m_angularVelocity * r2Y);
		var v2Y = this.m_body2.m_linearVelocity.y + (this.m_body2.m_angularVelocity * r2X);
		//float32 Cdot = b2Dot(this.m_u, v2 - v1);
		var Cdot = (this.m_u.x * (v2X - v1X) + this.m_u.y * (v2Y - v1Y));
		//float32 impulse = -this.m_mass * Cdot;
		var impulse = -this.m_mass * Cdot;
		this.m_impulse += impulse;

		//b2Vec2 P = impulse * this.m_u;
		var PX = impulse * this.m_u.x;
		var PY = impulse * this.m_u.y;
		//this.m_body1->m_linearVelocity -= this.m_body1->m_invMass * P;
		this.m_body1.m_linearVelocity.x -= this.m_body1.m_invMass * PX;
		this.m_body1.m_linearVelocity.y -= this.m_body1.m_invMass * PY;
		//this.m_body1->m_angularVelocity -= this.m_body1->m_invI * b2Cross(r1, P);
		this.m_body1.m_angularVelocity -= this.m_body1.m_invI * (r1X * PY - r1Y * PX);
		//this.m_body2->m_linearVelocity += this.m_body2->m_invMass * P;
		this.m_body2.m_linearVelocity.x += this.m_body2.m_invMass * PX;
		this.m_body2.m_linearVelocity.y += this.m_body2.m_invMass * PY;
		//this.m_body2->m_angularVelocity += this.m_body2->m_invI * b2Cross(r2, P);
		this.m_body2.m_angularVelocity += this.m_body2.m_invI * (r2X * PY - r2Y * PX);
	},

	SolvePositionConstraints: function(){

		var tMat;

		//b2Vec2 r1 = b2Mul(this.m_body1->m_R, this.m_localAnchor1);
		tMat = this.m_body1.m_R;
		var r1X = tMat.col1.x * this.m_localAnchor1.x + tMat.col2.x * this.m_localAnchor1.y;
		var r1Y = tMat.col1.y * this.m_localAnchor1.x + tMat.col2.y * this.m_localAnchor1.y;
		//b2Vec2 r2 = b2Mul(this.m_body2->m_R, this.m_localAnchor2);
		tMat = this.m_body2.m_R;
		var r2X = tMat.col1.x * this.m_localAnchor2.x + tMat.col2.x * this.m_localAnchor2.y;
		var r2Y = tMat.col1.y * this.m_localAnchor2.x + tMat.col2.y * this.m_localAnchor2.y;
		//b2Vec2 d = this.m_body2->m_position + r2 - this.m_body1->m_position - r1;
		var dX = this.m_body2.m_position.x + r2X - this.m_body1.m_position.x - r1X;
		var dY = this.m_body2.m_position.y + r2Y - this.m_body1.m_position.y - r1Y;

		//float32 length = d.Normalize();
		var length = Math.sqrt(dX*dX + dY*dY);
		dX /= length;
		dY /= length;
		//float32 C = length - this.m_length;
		var C = length - this.m_length;
		C = b2Math.b2Clamp(C, -b2Settings.b2_maxLinearCorrection, b2Settings.b2_maxLinearCorrection);

		var impulse = -this.m_mass * C;
		//this.m_u = d;
		this.m_u.Set(dX, dY);
		//b2Vec2 P = impulse * this.m_u;
		var PX = impulse * this.m_u.x;
		var PY = impulse * this.m_u.y;

		//this.m_body1->m_position -= this.m_body1->m_invMass * P;
		this.m_body1.m_position.x -= this.m_body1.m_invMass * PX;
		this.m_body1.m_position.y -= this.m_body1.m_invMass * PY;
		//this.m_body1->m_rotation -= this.m_body1->m_invI * b2Cross(r1, P);
		this.m_body1.m_rotation -= this.m_body1.m_invI * (r1X * PY - r1Y * PX);
		//this.m_body2->m_position += this.m_body2->m_invMass * P;
		this.m_body2.m_position.x += this.m_body2.m_invMass * PX;
		this.m_body2.m_position.y += this.m_body2.m_invMass * PY;
		//this.m_body2->m_rotation -= this.m_body2->m_invI * b2Cross(r2, P);
		this.m_body2.m_rotation += this.m_body2.m_invI * (r2X * PY - r2Y * PX);

		this.m_body1.m_R.Set(this.m_body1.m_rotation);
		this.m_body2.m_R.Set(this.m_body2.m_rotation);

		return b2Math.b2Abs(C) < b2Settings.b2_linearSlop;

	},

	GetAnchor1: function(){
		return b2Math.AddVV(this.m_body1.m_position , b2Math.b2MulMV(this.m_body1.m_R, this.m_localAnchor1));
	},
	GetAnchor2: function(){
		return b2Math.AddVV(this.m_body2.m_position , b2Math.b2MulMV(this.m_body2.m_R, this.m_localAnchor2));
	},

	GetReactionForce: function(invTimeStep)
	{
		//var F = (this.m_impulse * invTimeStep) * this.m_u;
		var F = new b2Vec2();
		F.SetV(this.m_u);
		F.Multiply(this.m_impulse * invTimeStep);
		return F;
	},

	GetReactionTorque: function(invTimeStep)
	{
		//NOT_USED(invTimeStep);
		return 0.0;
	},

	m_localAnchor1: new b2Vec2(),
	m_localAnchor2: new b2Vec2(),
	m_u: new b2Vec2(),
	m_impulse: null,
	m_mass: null,
	m_length: null});

/*
* Copyright (c) 2006-2007 Erin Catto http:
*
* This software is provided 'as-is', without any express or implied
* warranty.  In no event will the authors be held liable for any damages
* arising from the use of this software.
* Permission is granted to anyone to use this software for any purpose,
* including commercial applications, and to alter it and redistribute it
* freely, subject to the following restrictions:
* 1. The origin of this software must not be misrepresented; you must not
* claim that you wrote the original software. If you use this software
* in a product, an acknowledgment in the product documentation would be
* appreciated but is not required.
* 2. Altered source versions must be plainly marked, and must not be
* misrepresented the original software.
* 3. This notice may not be removed or altered from any source distribution.
*/





var b2DistanceJointDef = Class.create();
Object.extend(b2DistanceJointDef.prototype, b2JointDef.prototype);
Object.extend(b2DistanceJointDef.prototype, 
{
	initialize: function()
	{
		// The constructor for b2JointDef
		this.type = b2Joint.e_unknownJoint;
		this.userData = null;
		this.body1 = null;
		this.body2 = null;
		this.collideConnected = false;
		//

		// initialize instance variables for references
		this.anchorPoint1 = new b2Vec2();
		this.anchorPoint2 = new b2Vec2();
		//

		this.type = b2Joint.e_distanceJoint;
		//this.anchorPoint1.Set(0.0, 0.0);
		//this.anchorPoint2.Set(0.0, 0.0);
	},

	anchorPoint1: new b2Vec2(),
	anchorPoint2: new b2Vec2()});

/*
* Copyright (c) 2006-2007 Erin Catto http:
*
* This software is provided 'as-is', without any express or implied
* warranty.  In no event will the authors be held liable for any damages
* arising from the use of this software.
* Permission is granted to anyone to use this software for any purpose,
* including commercial applications, and to alter it and redistribute it
* freely, subject to the following restrictions:
* 1. The origin of this software must not be misrepresented; you must not
* claim that you wrote the original software. If you use this software
* in a product, an acknowledgment in the product documentation would be
* appreciated but is not required.
* 2. Altered source versions must be plainly marked, and must not be
* misrepresented the original software.
* 3. This notice may not be removed or altered from any source distribution.
*/





var b2Jacobian = Class.create();
b2Jacobian.prototype = 
{
	linear1: new b2Vec2(),
	angular1: null,
	linear2: new b2Vec2(),
	angular2: null,

	SetZero: function(){
		this.linear1.SetZero(); this.angular1 = 0.0;
		this.linear2.SetZero(); this.angular2 = 0.0;
	},
	Set: function(x1, a1, x2, a2){
		this.linear1.SetV(x1); this.angular1 = a1;
		this.linear2.SetV(x2); this.angular2 = a2;
	},
	Compute: function(x1, a1, x2, a2){

		//return b2Math.b2Dot(this.linear1, x1) + this.angular1 * a1 + b2Math.b2Dot(this.linear2, x2) + this.angular2 * a2;
		return (this.linear1.x*x1.x + this.linear1.y*x1.y) + this.angular1 * a1 + (this.linear2.x*x2.x + this.linear2.y*x2.y) + this.angular2 * a2;
	},
	initialize: function() {
		// initialize instance variables for references
		this.linear1 = new b2Vec2();
		this.linear2 = new b2Vec2();
		//
}};
/*
* Copyright (c) 2006-2007 Erin Catto http:
*
* This software is provided 'as-is', without any express or implied
* warranty.  In no event will the authors be held liable for any damages
* arising from the use of this software.
* Permission is granted to anyone to use this software for any purpose,
* including commercial applications, and to alter it and redistribute it
* freely, subject to the following restrictions:
* 1. The origin of this software must not be misrepresented; you must not
* claim that you wrote the original software. If you use this software
* in a product, an acknowledgment in the product documentation would be
* appreciated but is not required.
* 2. Altered source versions must be plainly marked, and must not be
* misrepresented the original software.
* 3. This notice may not be removed or altered from any source distribution.
*/






var b2GearJoint = Class.create();
Object.extend(b2GearJoint.prototype, b2Joint.prototype);
Object.extend(b2GearJoint.prototype, 
{
	GetAnchor1: function(){
		//return this.m_body1.m_position + b2MulMV(this.m_body1.m_R, this.m_localAnchor1);
		var tMat = this.m_body1.m_R;
		return new b2Vec2(	this.m_body1.m_position.x + (tMat.col1.x * this.m_localAnchor1.x + tMat.col2.x * this.m_localAnchor1.y),
							this.m_body1.m_position.y + (tMat.col1.y * this.m_localAnchor1.x + tMat.col2.y * this.m_localAnchor1.y));
	},
	GetAnchor2: function(){
		//return this.m_body2->m_position + b2Mul(this.m_body2->m_R, this.m_localAnchor2);
		var tMat = this.m_body2.m_R;
		return new b2Vec2(	this.m_body2.m_position.x + (tMat.col1.x * this.m_localAnchor2.x + tMat.col2.x * this.m_localAnchor2.y),
							this.m_body2.m_position.y + (tMat.col1.y * this.m_localAnchor2.x + tMat.col2.y * this.m_localAnchor2.y));
	},

	GetReactionForce: function(invTimeStep){
		//b2Vec2 F(0.0f, 0.0f);
		return new b2Vec2();
	},
	GetReactionTorque: function(invTimeStep){
		return 0.0;
	},

	GetRatio: function(){
		return this.m_ratio;
	},

	//--------------- Internals Below -------------------

	initialize: function(def){
		// The constructor for b2Joint
		// initialize instance variables for references
		this.m_node1 = new b2JointNode();
		this.m_node2 = new b2JointNode();
		//
		this.m_type = def.type;
		this.m_prev = null;
		this.m_next = null;
		this.m_body1 = def.body1;
		this.m_body2 = def.body2;
		this.m_collideConnected = def.collideConnected;
		this.m_islandFlag = false;
		this.m_userData = def.userData;
		//

		// initialize instance variables for references
		this.m_groundAnchor1 = new b2Vec2();
		this.m_groundAnchor2 = new b2Vec2();
		this.m_localAnchor1 = new b2Vec2();
		this.m_localAnchor2 = new b2Vec2();
		this.m_J = new b2Jacobian();
		//

		// parent constructor
		//super(def);

		//b2Settings.b2Assert(def.joint1.m_type == b2Joint.e_revoluteJoint || def.joint1.m_type == b2Joint.e_prismaticJoint);
		//b2Settings.b2Assert(def.joint2.m_type == b2Joint.e_revoluteJoint || def.joint2.m_type == b2Joint.e_prismaticJoint);
		//b2Settings.b2Assert(def.joint1.m_body1.IsStatic());
		//b2Settings.b2Assert(def.joint2.m_body1.IsStatic());

		this.m_revolute1 = null;
		this.m_prismatic1 = null;
		this.m_revolute2 = null;
		this.m_prismatic2 = null;

		var coordinate1;
		var coordinate2;

		this.m_ground1 = def.joint1.m_body1;
		this.m_body1 = def.joint1.m_body2;
		if (def.joint1.m_type == b2Joint.e_revoluteJoint)
		{
			this.m_revolute1 = def.joint1;
			this.m_groundAnchor1.SetV( this.m_revolute1.m_localAnchor1 );
			this.m_localAnchor1.SetV( this.m_revolute1.m_localAnchor2 );
			coordinate1 = this.m_revolute1.GetJointAngle();
		}
		else
		{
			this.m_prismatic1 = def.joint1;
			this.m_groundAnchor1.SetV( this.m_prismatic1.m_localAnchor1 );
			this.m_localAnchor1.SetV( this.m_prismatic1.m_localAnchor2 );
			coordinate1 = this.m_prismatic1.GetJointTranslation();
		}

		this.m_ground2 = def.joint2.m_body1;
		this.m_body2 = def.joint2.m_body2;
		if (def.joint2.m_type == b2Joint.e_revoluteJoint)
		{
			this.m_revolute2 = def.joint2;
			this.m_groundAnchor2.SetV( this.m_revolute2.m_localAnchor1 );
			this.m_localAnchor2.SetV( this.m_revolute2.m_localAnchor2 );
			coordinate2 = this.m_revolute2.GetJointAngle();
		}
		else
		{
			this.m_prismatic2 = def.joint2;
			this.m_groundAnchor2.SetV( this.m_prismatic2.m_localAnchor1 );
			this.m_localAnchor2.SetV( this.m_prismatic2.m_localAnchor2 );
			coordinate2 = this.m_prismatic2.GetJointTranslation();
		}

		this.m_ratio = def.ratio;

		this.m_constant = coordinate1 + this.m_ratio * coordinate2;

		this.m_impulse = 0.0;

	},

	PrepareVelocitySolver: function(){
		var g1 = this.m_ground1;
		var g2 = this.m_ground2;
		var b1 = this.m_body1;
		var b2 = this.m_body2;

		// temp vars
		var ugX;
		var ugY;
		var rX;
		var rY;
		var tMat;
		var tVec;
		var crug;

		var K = 0.0;
		this.m_J.SetZero();

		if (this.m_revolute1)
		{
			this.m_J.angular1 = -1.0;
			K += b1.m_invI;
		}
		else
		{
			//b2Vec2 ug = b2MulMV(g1->m_R, this.m_prismatic1->m_localXAxis1);
			tMat = g1.m_R;
			tVec = this.m_prismatic1.m_localXAxis1;
			ugX = tMat.col1.x * tVec.x + tMat.col2.x * tVec.y;
			ugY = tMat.col1.y * tVec.x + tMat.col2.y * tVec.y;
			//b2Vec2 r = b2MulMV(b1->m_R, this.m_localAnchor1);
			tMat = b1.m_R;
			rX = tMat.col1.x * this.m_localAnchor1.x + tMat.col2.x * this.m_localAnchor1.y;
			rY = tMat.col1.y * this.m_localAnchor1.x + tMat.col2.y * this.m_localAnchor1.y;

			//var crug = b2Cross(r, ug);
			crug = rX * ugY - rY * ugX;
			//this.m_J.linear1 = -ug;
			this.m_J.linear1.Set(-ugX, -ugY);
			this.m_J.angular1 = -crug;
			K += b1.m_invMass + b1.m_invI * crug * crug;
		}

		if (this.m_revolute2)
		{
			this.m_J.angular2 = -this.m_ratio;
			K += this.m_ratio * this.m_ratio * b2.m_invI;
		}
		else
		{
			//b2Vec2 ug = b2Mul(g2->m_R, this.m_prismatic2->m_localXAxis1);
			tMat = g2.m_R;
			tVec = this.m_prismatic2.m_localXAxis1;
			ugX = tMat.col1.x * tVec.x + tMat.col2.x * tVec.y;
			ugY = tMat.col1.y * tVec.x + tMat.col2.y * tVec.y;
			//b2Vec2 r = b2Mul(b2->m_R, this.m_localAnchor2);
			tMat = b2.m_R;
			rX = tMat.col1.x * this.m_localAnchor2.x + tMat.col2.x * this.m_localAnchor2.y;
			rY = tMat.col1.y * this.m_localAnchor2.x + tMat.col2.y * this.m_localAnchor2.y;
			//float32 crug = b2Cross(r, ug);
			crug = rX * ugY - rY * ugX;
			//this.m_J.linear2 = -this.m_ratio * ug;
			this.m_J.linear2.Set(-this.m_ratio*ugX, -this.m_ratio*ugY);
			this.m_J.angular2 = -this.m_ratio * crug;
			K += this.m_ratio * this.m_ratio * (b2.m_invMass + b2.m_invI * crug * crug);
		}

		// Compute effective mass.
		//b2Settings.b2Assert(K > 0.0);
		this.m_mass = 1.0 / K;

		// Warm starting.
		//b1.m_linearVelocity += b1.m_invMass * this.m_impulse * this.m_J.linear1;
		b1.m_linearVelocity.x += b1.m_invMass * this.m_impulse * this.m_J.linear1.x;
		b1.m_linearVelocity.y += b1.m_invMass * this.m_impulse * this.m_J.linear1.y;
		b1.m_angularVelocity += b1.m_invI * this.m_impulse * this.m_J.angular1;
		//b2.m_linearVelocity += b2.m_invMass * this.m_impulse * this.m_J.linear2;
		b2.m_linearVelocity.x += b2.m_invMass * this.m_impulse * this.m_J.linear2.x;
		b2.m_linearVelocity.y += b2.m_invMass * this.m_impulse * this.m_J.linear2.y;
		b2.m_angularVelocity += b2.m_invI * this.m_impulse * this.m_J.angular2;
	},


	SolveVelocityConstraints: function(step){
		var b1 = this.m_body1;
		var b2 = this.m_body2;

		var Cdot = this.m_J.Compute(	b1.m_linearVelocity, b1.m_angularVelocity,
										b2.m_linearVelocity, b2.m_angularVelocity);

		var impulse = -this.m_mass * Cdot;
		this.m_impulse += impulse;

		b1.m_linearVelocity.x += b1.m_invMass * impulse * this.m_J.linear1.x;
		b1.m_linearVelocity.y += b1.m_invMass * impulse * this.m_J.linear1.y;
		b1.m_angularVelocity  += b1.m_invI * impulse * this.m_J.angular1;
		b2.m_linearVelocity.x += b2.m_invMass * impulse * this.m_J.linear2.x;
		b2.m_linearVelocity.y += b2.m_invMass * impulse * this.m_J.linear2.y;
		b2.m_angularVelocity  += b2.m_invI * impulse * this.m_J.angular2;
	},

	SolvePositionConstraints: function(){
		var linearError = 0.0;

		var b1 = this.m_body1;
		var b2 = this.m_body2;

		var coordinate1;
		var coordinate2;
		if (this.m_revolute1)
		{
			coordinate1 = this.m_revolute1.GetJointAngle();
		}
		else
		{
			coordinate1 = this.m_prismatic1.GetJointTranslation();
		}

		if (this.m_revolute2)
		{
			coordinate2 = this.m_revolute2.GetJointAngle();
		}
		else
		{
			coordinate2 = this.m_prismatic2.GetJointTranslation();
		}

		var C = this.m_constant - (coordinate1 + this.m_ratio * coordinate2);

		var impulse = -this.m_mass * C;

		b1.m_position.x += b1.m_invMass * impulse * this.m_J.linear1.x;
		b1.m_position.y += b1.m_invMass * impulse * this.m_J.linear1.y;
		b1.m_rotation += b1.m_invI * impulse * this.m_J.angular1;
		b2.m_position.x += b2.m_invMass * impulse * this.m_J.linear2.x;
		b2.m_position.y += b2.m_invMass * impulse * this.m_J.linear2.y;
		b2.m_rotation += b2.m_invI * impulse * this.m_J.angular2;
		b1.m_R.Set(b1.m_rotation);
		b2.m_R.Set(b2.m_rotation);

		return linearError < b2Settings.b2_linearSlop;
	},

	m_ground1: null,
	m_ground2: null,

	// One of these is NULL.
	m_revolute1: null,
	m_prismatic1: null,

	// One of these is NULL.
	m_revolute2: null,
	m_prismatic2: null,

	m_groundAnchor1: new b2Vec2(),
	m_groundAnchor2: new b2Vec2(),

	m_localAnchor1: new b2Vec2(),
	m_localAnchor2: new b2Vec2(),

	m_J: new b2Jacobian(),

	m_constant: null,
	m_ratio: null,

	// Effective mass
	m_mass: null,

	// Impulse for accumulation/warm starting.
	m_impulse: null});

/*
* Copyright (c) 2006-2007 Erin Catto http:
*
* This software is provided 'as-is', without any express or implied
* warranty.  In no event will the authors be held liable for any damages
* arising from the use of this software.
* Permission is granted to anyone to use this software for any purpose,
* including commercial applications, and to alter it and redistribute it
* freely, subject to the following restrictions:
* 1. The origin of this software must not be misrepresented; you must not
* claim that you wrote the original software. If you use this software
* in a product, an acknowledgment in the product documentation would be
* appreciated but is not required.
* 2. Altered source versions must be plainly marked, and must not be
* misrepresented the original software.
* 3. This notice may not be removed or altered from any source distribution.
*/






// A gear joint is used to connect two joints together. Either joint
// can be a revolute or prismatic joint. You specify a gear ratio
// to bind the motions together:
// coordinate1 + ratio * coordinate2 = constant
// The ratio can be negative or positive. If one joint is a revolute joint
// and the other joint is a prismatic joint, then the ratio will have units
// of length or units of 1/length.
//
// RESTRICITON: The revolute and prismatic joints must be attached to
// a fixed body (which must be body1 on those joints).

var b2GearJointDef = Class.create();
Object.extend(b2GearJointDef.prototype, b2JointDef.prototype);
Object.extend(b2GearJointDef.prototype, 
{
	initialize: function()
	{
		this.type = b2Joint.e_gearJoint;
		this.joint1 = null;
		this.joint2 = null;
		this.ratio = 1.0;
	},

	joint1: null,
	joint2: null,
	ratio: null});

/*
* Copyright (c) 2006-2007 Erin Catto http:
*
* This software is provided 'as-is', without any express or implied
* warranty.  In no event will the authors be held liable for any damages
* arising from the use of this software.
* Permission is granted to anyone to use this software for any purpose,
* including commercial applications, and to alter it and redistribute it
* freely, subject to the following restrictions:
* 1. The origin of this software must not be misrepresented; you must not
* claim that you wrote the original software. If you use this software
* in a product, an acknowledgment in the product documentation would be
* appreciated but is not required.
* 2. Altered source versions must be plainly marked, and must not be
* misrepresented the original software.
* 3. This notice may not be removed or altered from any source distribution.
*/





// p = attached point, m = mouse point
// C = p - m
// Cdot = v
//      = v + cross(w, r)
// J = [I r_skew]
// Identity used:
// w k % (rx i + ry j) = w * (-ry i + rx j)

var b2MouseJoint = Class.create();
Object.extend(b2MouseJoint.prototype, b2Joint.prototype);
Object.extend(b2MouseJoint.prototype, 
{
	GetAnchor1: function(){
		return this.m_target;
	},
	GetAnchor2: function(){
		var tVec = b2Math.b2MulMV(this.m_body2.m_R, this.m_localAnchor);
		tVec.Add(this.m_body2.m_position);
		return tVec;
	},

	GetReactionForce: function(invTimeStep)
	{
		//b2Vec2 F = invTimeStep * this.m_impulse;
		var F = new b2Vec2();
		F.SetV(this.m_impulse);
		F.Multiply(invTimeStep);
		return F;
	},

	GetReactionTorque: function(invTimeStep)
	{
		//NOT_USED(invTimeStep);
		return 0.0;
	},

	SetTarget: function(target){
		this.m_body2.WakeUp();
		this.m_target = target;
	},

	//--------------- Internals Below -------------------

	initialize: function(def){
		// The constructor for b2Joint
		// initialize instance variables for references
		this.m_node1 = new b2JointNode();
		this.m_node2 = new b2JointNode();
		//
		this.m_type = def.type;
		this.m_prev = null;
		this.m_next = null;
		this.m_body1 = def.body1;
		this.m_body2 = def.body2;
		this.m_collideConnected = def.collideConnected;
		this.m_islandFlag = false;
		this.m_userData = def.userData;
		//

		// initialize instance variables for references
		this.K = new b2Mat22();
		this.K1 = new b2Mat22();
		this.K2 = new b2Mat22();
		this.m_localAnchor = new b2Vec2();
		this.m_target = new b2Vec2();
		this.m_impulse = new b2Vec2();
		this.m_ptpMass = new b2Mat22();
		this.m_C = new b2Vec2();
		//

		//super(def);

		this.m_target.SetV(def.target);
		//this.m_localAnchor = b2Math.b2MulTMV(this.m_body2.m_R, b2Math.SubtractVV( this.m_target, this.m_body2.m_position ) );
		var tX = this.m_target.x - this.m_body2.m_position.x;
		var tY = this.m_target.y - this.m_body2.m_position.y;
		this.m_localAnchor.x = (tX * this.m_body2.m_R.col1.x + tY * this.m_body2.m_R.col1.y);
		this.m_localAnchor.y = (tX * this.m_body2.m_R.col2.x + tY * this.m_body2.m_R.col2.y);

		this.m_maxForce = def.maxForce;
		this.m_impulse.SetZero();

		var mass = this.m_body2.m_mass;

		// Frequency
		var omega = 2.0 * b2Settings.b2_pi * def.frequencyHz;

		// Damping coefficient
		var d = 2.0 * mass * def.dampingRatio * omega;

		// Spring stiffness
		var k = mass * omega * omega;

		// magic formulas
		this.m_gamma = 1.0 / (d + def.timeStep * k);
		this.m_beta = def.timeStep * k / (d + def.timeStep * k);
	},

	// Presolve vars
	K: new b2Mat22(),
	K1: new b2Mat22(),
	K2: new b2Mat22(),
	PrepareVelocitySolver: function(){
		var b = this.m_body2;

		var tMat;

		// Compute the effective mass matrix.
		//b2Vec2 r = b2Mul(b.m_R, this.m_localAnchor);
		tMat = b.m_R;
		var rX = tMat.col1.x * this.m_localAnchor.x + tMat.col2.x * this.m_localAnchor.y;
		var rY = tMat.col1.y * this.m_localAnchor.x + tMat.col2.y * this.m_localAnchor.y;

		// this.K    = [(1/m1 + 1/m2) * eye(2) - skew(r1) * invI1 * skew(r1) - skew(r2) * invI2 * skew(r2)]
		//      = [1/m1+1/m2     0    ] + invI1 * [r1.y*r1.y -r1.x*r1.y] + invI2 * [r1.y*r1.y -r1.x*r1.y]
		//        [    0     1/m1+1/m2]           [-r1.x*r1.y r1.x*r1.x]           [-r1.x*r1.y r1.x*r1.x]
		var invMass = b.m_invMass;
		var invI = b.m_invI;

		//b2Mat22 this.K1;
		this.K1.col1.x = invMass;	this.K1.col2.x = 0.0;
		this.K1.col1.y = 0.0;		this.K1.col2.y = invMass;

		//b2Mat22 this.K2;
		this.K2.col1.x =  invI * rY * rY;	this.K2.col2.x = -invI * rX * rY;
		this.K2.col1.y = -invI * rX * rY;	this.K2.col2.y =  invI * rX * rX;

		//b2Mat22 this.K = this.K1 + this.K2;
		this.K.SetM(this.K1);
		this.K.AddM(this.K2);
		this.K.col1.x += this.m_gamma;
		this.K.col2.y += this.m_gamma;

		//this.m_ptpMass = this.K.Invert();
		this.K.Invert(this.m_ptpMass);

		//this.m_C = b.m_position + r - this.m_target;
		this.m_C.x = b.m_position.x + rX - this.m_target.x;
		this.m_C.y = b.m_position.y + rY - this.m_target.y;

		// Cheat with some damping
		b.m_angularVelocity *= 0.98;

		// Warm starting.
		//b2Vec2 P = this.m_impulse;
		var PX = this.m_impulse.x;
		var PY = this.m_impulse.y;
		//b.m_linearVelocity += invMass * P;
		b.m_linearVelocity.x += invMass * PX;
		b.m_linearVelocity.y += invMass * PY;
		//b.m_angularVelocity += invI * b2Cross(r, P);
		b.m_angularVelocity += invI * (rX * PY - rY * PX);
	},


	SolveVelocityConstraints: function(step){
		var body = this.m_body2;

		var tMat;

		// Compute the effective mass matrix.
		//b2Vec2 r = b2Mul(body.m_R, this.m_localAnchor);
		tMat = body.m_R;
		var rX = tMat.col1.x * this.m_localAnchor.x + tMat.col2.x * this.m_localAnchor.y;
		var rY = tMat.col1.y * this.m_localAnchor.x + tMat.col2.y * this.m_localAnchor.y;

		// Cdot = v + cross(w, r)
		//b2Vec2 Cdot = body->m_linearVelocity + b2Cross(body->m_angularVelocity, r);
		var CdotX = body.m_linearVelocity.x + (-body.m_angularVelocity * rY);
		var CdotY = body.m_linearVelocity.y + (body.m_angularVelocity * rX);
		//b2Vec2 impulse = -b2Mul(this.m_ptpMass, Cdot + (this.m_beta * step->inv_dt) * this.m_C + this.m_gamma * this.m_impulse);
		tMat = this.m_ptpMass;
		var tX = CdotX + (this.m_beta * step.inv_dt) * this.m_C.x + this.m_gamma * this.m_impulse.x;
		var tY = CdotY + (this.m_beta * step.inv_dt) * this.m_C.y + this.m_gamma * this.m_impulse.y;
		var impulseX = -(tMat.col1.x * tX + tMat.col2.x * tY);
		var impulseY = -(tMat.col1.y * tX + tMat.col2.y * tY);

		var oldImpulseX = this.m_impulse.x;
		var oldImpulseY = this.m_impulse.y;
		//this.m_impulse += impulse;
		this.m_impulse.x += impulseX;
		this.m_impulse.y += impulseY;
		var length = this.m_impulse.Length();
		if (length > step.dt * this.m_maxForce)
		{
			//this.m_impulse *= step.dt * this.m_maxForce / length;
			this.m_impulse.Multiply(step.dt * this.m_maxForce / length);
		}
		//impulse = this.m_impulse - oldImpulse;
		impulseX = this.m_impulse.x - oldImpulseX;
		impulseY = this.m_impulse.y - oldImpulseY;

		//body.m_linearVelocity += body->m_invMass * impulse;
		body.m_linearVelocity.x += body.m_invMass * impulseX;
		body.m_linearVelocity.y += body.m_invMass * impulseY;
		//body.m_angularVelocity += body->m_invI * b2Cross(r, impulse);
		body.m_angularVelocity += body.m_invI * (rX * impulseY - rY * impulseX);
	},
	SolvePositionConstraints: function(){
		return true;
	},

	m_localAnchor: new b2Vec2(),
	m_target: new b2Vec2(),
	m_impulse: new b2Vec2(),

	m_ptpMass: new b2Mat22(),
	m_C: new b2Vec2(),
	m_maxForce: null,
	m_beta: null,
	m_gamma: null});

/*
* Copyright (c) 2006-2007 Erin Catto http:
*
* This software is provided 'as-is', without any express or implied
* warranty.  In no event will the authors be held liable for any damages
* arising from the use of this software.
* Permission is granted to anyone to use this software for any purpose,
* including commercial applications, and to alter it and redistribute it
* freely, subject to the following restrictions:
* 1. The origin of this software must not be misrepresented; you must not
* claim that you wrote the original software. If you use this software
* in a product, an acknowledgment in the product documentation would be
* appreciated but is not required.
* 2. Altered source versions must be plainly marked, and must not be
* misrepresented the original software.
* 3. This notice may not be removed or altered from any source distribution.
*/





var b2MouseJointDef = Class.create();
Object.extend(b2MouseJointDef.prototype, b2JointDef.prototype);
Object.extend(b2MouseJointDef.prototype, 
{
	initialize: function()
	{
		// The constructor for b2JointDef
		this.type = b2Joint.e_unknownJoint;
		this.userData = null;
		this.body1 = null;
		this.body2 = null;
		this.collideConnected = false;
		//

		// initialize instance variables for references
		this.target = new b2Vec2();
		//

		this.type = b2Joint.e_mouseJoint;
		this.maxForce = 0.0;
		this.frequencyHz = 5.0;
		this.dampingRatio = 0.7;
		this.timeStep = 1.0 / 60.0;
	},

	target: new b2Vec2(),
	maxForce: null,
	frequencyHz: null,
	dampingRatio: null,
	timeStep: null});

/*
* Copyright (c) 2006-2007 Erin Catto http:
*
* This software is provided 'as-is', without any express or implied
* warranty.  In no event will the authors be held liable for any damages
* arising from the use of this software.
* Permission is granted to anyone to use this software for any purpose,
* including commercial applications, and to alter it and redistribute it
* freely, subject to the following restrictions:
* 1. The origin of this software must not be misrepresented; you must not
* claim that you wrote the original software. If you use this software
* in a product, an acknowledgment in the product documentation would be
* appreciated but is not required.
* 2. Altered source versions must be plainly marked, and must not be
* misrepresented the original software.
* 3. This notice may not be removed or altered from any source distribution.
*/





// Linear constraint (point-to-line)
// d = p2 - p1 = x2 + r2 - x1 - r1
// C = dot(ay1, d)
// Cdot = dot(d, cross(w1, ay1)) + dot(ay1, v2 + cross(w2, r2) - v1 - cross(w1, r1))
//      = -dot(ay1, v1) - dot(cross(d + r1, ay1), w1) + dot(ay1, v2) + dot(cross(r2, ay1), v2)
// J = [-ay1 -cross(d+r1,ay1) ay1 cross(r2,ay1)]
//
// Angular constraint
// C = a2 - a1 + a_initial
// Cdot = w2 - w1
// J = [0 0 -1 0 0 1]

// Motor/Limit linear constraint
// C = dot(ax1, d)
// Cdot = = -dot(ax1, v1) - dot(cross(d + r1, ax1), w1) + dot(ax1, v2) + dot(cross(r2, ax1), v2)
// J = [-ax1 -cross(d+r1,ax1) ax1 cross(r2,ax1)]


var b2PrismaticJoint = Class.create();
Object.extend(b2PrismaticJoint.prototype, b2Joint.prototype);
Object.extend(b2PrismaticJoint.prototype, 
{
	GetAnchor1: function(){
		var b1 = this.m_body1;
		//return b2Math.AddVV(b1.m_position, b2Math.b2MulMV(b1.m_R, this.m_localAnchor1));
		var tVec = new b2Vec2();
		tVec.SetV(this.m_localAnchor1);
		tVec.MulM(b1.m_R);
		tVec.Add(b1.m_position);
		return tVec;
	},
	GetAnchor2: function(){
		var b2 = this.m_body2;
		//return b2Math.AddVV(b2.m_position, b2Math.b2MulMV(b2.m_R, this.m_localAnchor2));
		var tVec = new b2Vec2();
		tVec.SetV(this.m_localAnchor2);
		tVec.MulM(b2.m_R);
		tVec.Add(b2.m_position);
		return tVec;
	},
	GetJointTranslation: function(){
		var b1 = this.m_body1;
		var b2 = this.m_body2;

		var tMat;

		//var r1 = b2Math.b2MulMV(b1.m_R, this.m_localAnchor1);
		tMat = b1.m_R;
		var r1X = tMat.col1.x * this.m_localAnchor1.x + tMat.col2.x * this.m_localAnchor1.y;
		var r1Y = tMat.col1.y * this.m_localAnchor1.x + tMat.col2.y * this.m_localAnchor1.y;
		//var r2 = b2Math.b2MulMV(b2.m_R, this.m_localAnchor2);
		tMat = b2.m_R;
		var r2X = tMat.col1.x * this.m_localAnchor2.x + tMat.col2.x * this.m_localAnchor2.y;
		var r2Y = tMat.col1.y * this.m_localAnchor2.x + tMat.col2.y * this.m_localAnchor2.y;
		//var p1 = b2Math.AddVV(b1.m_position , r1);
		var p1X = b1.m_position.x + r1X;
		var p1Y = b1.m_position.y + r1Y;
		//var p2 = b2Math.AddVV(b2.m_position , r2);
		var p2X = b2.m_position.x + r2X;
		var p2Y = b2.m_position.y + r2Y;
		//var d = b2Math.SubtractVV(p2, p1);
		var dX = p2X - p1X;
		var dY = p2Y - p1Y;
		//var ax1 = b2Math.b2MulMV(b1.m_R, this.m_localXAxis1);
		tMat = b1.m_R;
		var ax1X = tMat.col1.x * this.m_localXAxis1.x + tMat.col2.x * this.m_localXAxis1.y;
		var ax1Y = tMat.col1.y * this.m_localXAxis1.x + tMat.col2.y * this.m_localXAxis1.y;

		//var translation = b2Math.b2Dot(ax1, d);
		var translation = ax1X*dX + ax1Y*dY;
		return translation;
	},
	GetJointSpeed: function(){
		var b1 = this.m_body1;
		var b2 = this.m_body2;

		var tMat;

		//var r1 = b2Math.b2MulMV(b1.m_R, this.m_localAnchor1);
		tMat = b1.m_R;
		var r1X = tMat.col1.x * this.m_localAnchor1.x + tMat.col2.x * this.m_localAnchor1.y;
		var r1Y = tMat.col1.y * this.m_localAnchor1.x + tMat.col2.y * this.m_localAnchor1.y;
		//var r2 = b2Math.b2MulMV(b2.m_R, this.m_localAnchor2);
		tMat = b2.m_R;
		var r2X = tMat.col1.x * this.m_localAnchor2.x + tMat.col2.x * this.m_localAnchor2.y;
		var r2Y = tMat.col1.y * this.m_localAnchor2.x + tMat.col2.y * this.m_localAnchor2.y;
		//var p1 = b2Math.AddVV(b1.m_position , r1);
		var p1X = b1.m_position.x + r1X;
		var p1Y = b1.m_position.y + r1Y;
		//var p2 = b2Math.AddVV(b2.m_position , r2);
		var p2X = b2.m_position.x + r2X;
		var p2Y = b2.m_position.y + r2Y;
		//var d = b2Math.SubtractVV(p2, p1);
		var dX = p2X - p1X;
		var dY = p2Y - p1Y;
		//var ax1 = b2Math.b2MulMV(b1.m_R, this.m_localXAxis1);
		tMat = b1.m_R;
		var ax1X = tMat.col1.x * this.m_localXAxis1.x + tMat.col2.x * this.m_localXAxis1.y;
		var ax1Y = tMat.col1.y * this.m_localXAxis1.x + tMat.col2.y * this.m_localXAxis1.y;

		var v1 = b1.m_linearVelocity;
		var v2 = b2.m_linearVelocity;
		var w1 = b1.m_angularVelocity;
		var w2 = b2.m_angularVelocity;

		//var speed = b2Math.b2Dot(d, b2Math.b2CrossFV(w1, ax1)) + b2Math.b2Dot(ax1, b2Math.SubtractVV( b2Math.SubtractVV( b2Math.AddVV( v2 , b2Math.b2CrossFV(w2, r2)) , v1) , b2Math.b2CrossFV(w1, r1)));
		//var b2D = (dX*(-w1 * ax1Y) + dY*(w1 * ax1X));
		//var b2D2 = (ax1X * ((( v2.x + (-w2 * r2Y)) - v1.x) - (-w1 * r1Y)) + ax1Y * ((( v2.y + (w2 * r2X)) - v1.y) - (w1 * r1X)));
		var speed = (dX*(-w1 * ax1Y) + dY*(w1 * ax1X)) + (ax1X * ((( v2.x + (-w2 * r2Y)) - v1.x) - (-w1 * r1Y)) + ax1Y * ((( v2.y + (w2 * r2X)) - v1.y) - (w1 * r1X)));

		return speed;
	},
	GetMotorForce: function(invTimeStep){
		return invTimeStep * this.m_motorImpulse;
	},

	SetMotorSpeed: function(speed)
	{
		this.m_motorSpeed = speed;
	},

	SetMotorForce: function(force)
	{
		this.m_maxMotorForce = force;
	},

	GetReactionForce: function(invTimeStep)
	{
		var tImp = invTimeStep * this.m_limitImpulse;
		var tMat;

		//var ax1 = b2Math.b2MulMV(this.m_body1.m_R, this.m_localXAxis1);
		tMat = this.m_body1.m_R;
		var ax1X = tImp * (tMat.col1.x * this.m_localXAxis1.x + tMat.col2.x * this.m_localXAxis1.y);
		var ax1Y = tImp * (tMat.col1.y * this.m_localXAxis1.x + tMat.col2.y * this.m_localXAxis1.y);
		//var ay1 = b2Math.b2MulMV(this.m_body1.m_R, this.m_localYAxis1);
		var ay1X = tImp * (tMat.col1.x * this.m_localYAxis1.x + tMat.col2.x * this.m_localYAxis1.y);
		var ay1Y = tImp * (tMat.col1.y * this.m_localYAxis1.x + tMat.col2.y * this.m_localYAxis1.y);

		//return (invTimeStep * this.m_limitImpulse) * ax1 + (invTimeStep * this.m_linearImpulse) * ay1;

		return new b2Vec2(ax1X+ay1X, ax1Y+ay1Y);
	},

	GetReactionTorque: function(invTimeStep)
	{
		return invTimeStep * this.m_angularImpulse;
	},


	//--------------- Internals Below -------------------

	initialize: function(def){
		// The constructor for b2Joint
		// initialize instance variables for references
		this.m_node1 = new b2JointNode();
		this.m_node2 = new b2JointNode();
		//
		this.m_type = def.type;
		this.m_prev = null;
		this.m_next = null;
		this.m_body1 = def.body1;
		this.m_body2 = def.body2;
		this.m_collideConnected = def.collideConnected;
		this.m_islandFlag = false;
		this.m_userData = def.userData;
		//

		// initialize instance variables for references
		this.m_localAnchor1 = new b2Vec2();
		this.m_localAnchor2 = new b2Vec2();
		this.m_localXAxis1 = new b2Vec2();
		this.m_localYAxis1 = new b2Vec2();
		this.m_linearJacobian = new b2Jacobian();
		this.m_motorJacobian = new b2Jacobian();
		//

		//super(def);

		var tMat;
		var tX;
		var tY;

		//this.m_localAnchor1 = b2Math.b2MulTMV(this.m_body1.m_R, b2Math.SubtractVV(def.anchorPoint , this.m_body1.m_position));
		tMat = this.m_body1.m_R;
		tX = (def.anchorPoint.x - this.m_body1.m_position.x);
		tY = (def.anchorPoint.y - this.m_body1.m_position.y);
		this.m_localAnchor1.Set((tX*tMat.col1.x + tY*tMat.col1.y), (tX*tMat.col2.x + tY*tMat.col2.y));

		//this.m_localAnchor2 = b2Math.b2MulTMV(this.m_body2.m_R, b2Math.SubtractVV(def.anchorPoint , this.m_body2.m_position));
		tMat = this.m_body2.m_R;
		tX = (def.anchorPoint.x - this.m_body2.m_position.x);
		tY = (def.anchorPoint.y - this.m_body2.m_position.y);
		this.m_localAnchor2.Set((tX*tMat.col1.x + tY*tMat.col1.y), (tX*tMat.col2.x + tY*tMat.col2.y));

		//this.m_localXAxis1 = b2Math.b2MulTMV(this.m_body1.m_R, def.axis);
		tMat = this.m_body1.m_R;
		tX = def.axis.x;
		tY = def.axis.y;
		this.m_localXAxis1.Set((tX*tMat.col1.x + tY*tMat.col1.y), (tX*tMat.col2.x + tY*tMat.col2.y));

		//this.m_localYAxis1 = b2Math.b2CrossFV(1.0, this.m_localXAxis1);
		this.m_localYAxis1.x = -this.m_localXAxis1.y;
		this.m_localYAxis1.y = this.m_localXAxis1.x;

		this.m_initialAngle = this.m_body2.m_rotation - this.m_body1.m_rotation;

		this.m_linearJacobian.SetZero();
		this.m_linearMass = 0.0;
		this.m_linearImpulse = 0.0;

		this.m_angularMass = 0.0;
		this.m_angularImpulse = 0.0;

		this.m_motorJacobian.SetZero();
		this.m_motorMass = 0.0;
		this.m_motorImpulse = 0.0;
		this.m_limitImpulse = 0.0;
		this.m_limitPositionImpulse = 0.0;

		this.m_lowerTranslation = def.lowerTranslation;
		this.m_upperTranslation = def.upperTranslation;
		this.m_maxMotorForce = def.motorForce;
		this.m_motorSpeed = def.motorSpeed;
		this.m_enableLimit = def.enableLimit;
		this.m_enableMotor = def.enableMotor;
	},

	PrepareVelocitySolver: function(){
		var b1 = this.m_body1;
		var b2 = this.m_body2;

		var tMat;

		// Compute the effective masses.
		//b2Vec2 r1 = b2Mul(b1->m_R, this.m_localAnchor1);
		tMat = b1.m_R;
		var r1X = tMat.col1.x * this.m_localAnchor1.x + tMat.col2.x * this.m_localAnchor1.y;
		var r1Y = tMat.col1.y * this.m_localAnchor1.x + tMat.col2.y * this.m_localAnchor1.y;
		//b2Vec2 r2 = b2Mul(b2->m_R, this.m_localAnchor2);
		tMat = b2.m_R;
		var r2X = tMat.col1.x * this.m_localAnchor2.x + tMat.col2.x * this.m_localAnchor2.y;
		var r2Y = tMat.col1.y * this.m_localAnchor2.x + tMat.col2.y * this.m_localAnchor2.y;

		//float32 invMass1 = b1->m_invMass, invMass2 = b2->m_invMass;
		var invMass1 = b1.m_invMass;
		var invMass2 = b2.m_invMass;
		//float32 invI1 = b1->m_invI, invI2 = b2->m_invI;
		var invI1 = b1.m_invI;
		var invI2 = b2.m_invI;

		// Compute point to line constraint effective mass.
		// J = [-ay1 -cross(d+r1,ay1) ay1 cross(r2,ay1)]
		//b2Vec2 ay1 = b2Mul(b1->m_R, this.m_localYAxis1);
		tMat = b1.m_R;
		var ay1X = tMat.col1.x * this.m_localYAxis1.x + tMat.col2.x * this.m_localYAxis1.y;
		var ay1Y = tMat.col1.y * this.m_localYAxis1.x + tMat.col2.y * this.m_localYAxis1.y;
		//b2Vec2 e = b2->m_position + r2 - b1->m_position;
		var eX = b2.m_position.x + r2X - b1.m_position.x;
		var eY = b2.m_position.y + r2Y - b1.m_position.y;

		//this.m_linearJacobian.Set(-ay1, -b2Math.b2Cross(e, ay1), ay1, b2Math.b2Cross(r2, ay1));
		this.m_linearJacobian.linear1.x = -ay1X;
		this.m_linearJacobian.linear1.y = -ay1Y;
		this.m_linearJacobian.linear2.x = ay1X;
		this.m_linearJacobian.linear2.y = ay1Y;
		this.m_linearJacobian.angular1 = -(eX * ay1Y - eY * ay1X);
		this.m_linearJacobian.angular2 = r2X * ay1Y - r2Y * ay1X;

		this.m_linearMass =	invMass1 + invI1 * this.m_linearJacobian.angular1 * this.m_linearJacobian.angular1 +
						invMass2 + invI2 * this.m_linearJacobian.angular2 * this.m_linearJacobian.angular2;
		//b2Settings.b2Assert(this.m_linearMass > Number.MIN_VALUE);
		this.m_linearMass = 1.0 / this.m_linearMass;

		// Compute angular constraint effective mass.
		this.m_angularMass = 1.0 / (invI1 + invI2);

		// Compute motor and limit terms.
		if (this.m_enableLimit || this.m_enableMotor)
		{
			// The motor and limit share a Jacobian and effective mass.
			//b2Vec2 ax1 = b2Mul(b1->m_R, this.m_localXAxis1);
			tMat = b1.m_R;
			var ax1X = tMat.col1.x * this.m_localXAxis1.x + tMat.col2.x * this.m_localXAxis1.y;
			var ax1Y = tMat.col1.y * this.m_localXAxis1.x + tMat.col2.y * this.m_localXAxis1.y;
			//this.m_motorJacobian.Set(-ax1, -b2Cross(e, ax1), ax1, b2Cross(r2, ax1));
			this.m_motorJacobian.linear1.x = -ax1X; this.m_motorJacobian.linear1.y = -ax1Y;
			this.m_motorJacobian.linear2.x = ax1X; this.m_motorJacobian.linear2.y = ax1Y;
			this.m_motorJacobian.angular1 = -(eX * ax1Y - eY * ax1X);
			this.m_motorJacobian.angular2 = r2X * ax1Y - r2Y * ax1X;

			this.m_motorMass =	invMass1 + invI1 * this.m_motorJacobian.angular1 * this.m_motorJacobian.angular1 +
							invMass2 + invI2 * this.m_motorJacobian.angular2 * this.m_motorJacobian.angular2;
			//b2Settings.b2Assert(this.m_motorMass > Number.MIN_VALUE);
			this.m_motorMass = 1.0 / this.m_motorMass;

			if (this.m_enableLimit)
			{
				//b2Vec2 d = e - r1;
				var dX = eX - r1X;
				var dY = eY - r1Y;
				//float32 jointTranslation = b2Dot(ax1, d);
				var jointTranslation = ax1X * dX + ax1Y * dY;
				if (b2Math.b2Abs(this.m_upperTranslation - this.m_lowerTranslation) < 2.0 * b2Settings.b2_linearSlop)
				{
					this.m_limitState = b2Joint.e_equalLimits;
				}
				else if (jointTranslation <= this.m_lowerTranslation)
				{
					if (this.m_limitState != b2Joint.e_atLowerLimit)
					{
						this.m_limitImpulse = 0.0;
					}
					this.m_limitState = b2Joint.e_atLowerLimit;
				}
				else if (jointTranslation >= this.m_upperTranslation)
				{
					if (this.m_limitState != b2Joint.e_atUpperLimit)
					{
						this.m_limitImpulse = 0.0;
					}
					this.m_limitState = b2Joint.e_atUpperLimit;
				}
				else
				{
					this.m_limitState = b2Joint.e_inactiveLimit;
					this.m_limitImpulse = 0.0;
				}
			}
		}

		if (this.m_enableMotor == false)
		{
			this.m_motorImpulse = 0.0;
		}

		if (this.m_enableLimit == false)
		{
			this.m_limitImpulse = 0.0;
		}

		if (b2World.s_enableWarmStarting)
		{
			//b2Vec2 P1 = this.m_linearImpulse * this.m_linearJacobian.linear1 + (this.m_motorImpulse + this.m_limitImpulse) * this.m_motorJacobian.linear1;
			var P1X = this.m_linearImpulse * this.m_linearJacobian.linear1.x + (this.m_motorImpulse + this.m_limitImpulse) * this.m_motorJacobian.linear1.x;
			var P1Y = this.m_linearImpulse * this.m_linearJacobian.linear1.y + (this.m_motorImpulse + this.m_limitImpulse) * this.m_motorJacobian.linear1.y;
			//b2Vec2 P2 = this.m_linearImpulse * this.m_linearJacobian.linear2 + (this.m_motorImpulse + this.m_limitImpulse) * this.m_motorJacobian.linear2;
			var P2X = this.m_linearImpulse * this.m_linearJacobian.linear2.x + (this.m_motorImpulse + this.m_limitImpulse) * this.m_motorJacobian.linear2.x;
			var P2Y = this.m_linearImpulse * this.m_linearJacobian.linear2.y + (this.m_motorImpulse + this.m_limitImpulse) * this.m_motorJacobian.linear2.y;
			//float32 L1 = this.m_linearImpulse * this.m_linearJacobian.angular1 - this.m_angularImpulse + (this.m_motorImpulse + this.m_limitImpulse) * this.m_motorJacobian.angular1;
			var L1 = this.m_linearImpulse * this.m_linearJacobian.angular1 - this.m_angularImpulse + (this.m_motorImpulse + this.m_limitImpulse) * this.m_motorJacobian.angular1;
			//float32 L2 = this.m_linearImpulse * this.m_linearJacobian.angular2 + this.m_angularImpulse + (this.m_motorImpulse + this.m_limitImpulse) * this.m_motorJacobian.angular2;
			var L2 = this.m_linearImpulse * this.m_linearJacobian.angular2 + this.m_angularImpulse + (this.m_motorImpulse + this.m_limitImpulse) * this.m_motorJacobian.angular2;

			//b1->m_linearVelocity += invMass1 * P1;
			b1.m_linearVelocity.x += invMass1 * P1X;
			b1.m_linearVelocity.y += invMass1 * P1Y;
			//b1->m_angularVelocity += invI1 * L1;
			b1.m_angularVelocity += invI1 * L1;

			//b2->m_linearVelocity += invMass2 * P2;
			b2.m_linearVelocity.x += invMass2 * P2X;
			b2.m_linearVelocity.y += invMass2 * P2Y;
			//b2->m_angularVelocity += invI2 * L2;
			b2.m_angularVelocity += invI2 * L2;
		}
		else
		{
			this.m_linearImpulse = 0.0;
			this.m_angularImpulse = 0.0;
			this.m_limitImpulse = 0.0;
			this.m_motorImpulse = 0.0;
		}

		this.m_limitPositionImpulse = 0.0;

	},

	SolveVelocityConstraints: function(step){
		var b1 = this.m_body1;
		var b2 = this.m_body2;

		var invMass1 = b1.m_invMass;
		var invMass2 = b2.m_invMass;
		var invI1 = b1.m_invI;
		var invI2 = b2.m_invI;

		var oldLimitImpulse;

		// Solve linear constraint.
		var linearCdot = this.m_linearJacobian.Compute(b1.m_linearVelocity, b1.m_angularVelocity, b2.m_linearVelocity, b2.m_angularVelocity);
		var linearImpulse = -this.m_linearMass * linearCdot;
		this.m_linearImpulse += linearImpulse;

		//b1->m_linearVelocity += (invMass1 * linearImpulse) * this.m_linearJacobian.linear1;
		b1.m_linearVelocity.x += (invMass1 * linearImpulse) * this.m_linearJacobian.linear1.x;
		b1.m_linearVelocity.y += (invMass1 * linearImpulse) * this.m_linearJacobian.linear1.y;
		//b1->m_angularVelocity += invI1 * linearImpulse * this.m_linearJacobian.angular1;
		b1.m_angularVelocity += invI1 * linearImpulse * this.m_linearJacobian.angular1;

		//b2->m_linearVelocity += (invMass2 * linearImpulse) * this.m_linearJacobian.linear2;
		b2.m_linearVelocity.x += (invMass2 * linearImpulse) * this.m_linearJacobian.linear2.x;
		b2.m_linearVelocity.y += (invMass2 * linearImpulse) * this.m_linearJacobian.linear2.y;
		//b2.m_angularVelocity += invI2 * linearImpulse * this.m_linearJacobian.angular2;
		b2.m_angularVelocity += invI2 * linearImpulse * this.m_linearJacobian.angular2;

		// Solve angular constraint.
		var angularCdot = b2.m_angularVelocity - b1.m_angularVelocity;
		var angularImpulse = -this.m_angularMass * angularCdot;
		this.m_angularImpulse += angularImpulse;

		b1.m_angularVelocity -= invI1 * angularImpulse;
		b2.m_angularVelocity += invI2 * angularImpulse;

		// Solve linear motor constraint.
		if (this.m_enableMotor && this.m_limitState != b2Joint.e_equalLimits)
		{
			var motorCdot = this.m_motorJacobian.Compute(b1.m_linearVelocity, b1.m_angularVelocity, b2.m_linearVelocity, b2.m_angularVelocity) - this.m_motorSpeed;
			var motorImpulse = -this.m_motorMass * motorCdot;
			var oldMotorImpulse = this.m_motorImpulse;
			this.m_motorImpulse = b2Math.b2Clamp(this.m_motorImpulse + motorImpulse, -step.dt * this.m_maxMotorForce, step.dt * this.m_maxMotorForce);
			motorImpulse = this.m_motorImpulse - oldMotorImpulse;

			//b1.m_linearVelocity += (invMass1 * motorImpulse) * this.m_motorJacobian.linear1;
			b1.m_linearVelocity.x += (invMass1 * motorImpulse) * this.m_motorJacobian.linear1.x;
			b1.m_linearVelocity.y += (invMass1 * motorImpulse) * this.m_motorJacobian.linear1.y;
			//b1.m_angularVelocity += invI1 * motorImpulse * this.m_motorJacobian.angular1;
			b1.m_angularVelocity += invI1 * motorImpulse * this.m_motorJacobian.angular1;

			//b2->m_linearVelocity += (invMass2 * motorImpulse) * this.m_motorJacobian.linear2;
			b2.m_linearVelocity.x += (invMass2 * motorImpulse) * this.m_motorJacobian.linear2.x;
			b2.m_linearVelocity.y += (invMass2 * motorImpulse) * this.m_motorJacobian.linear2.y;
			//b2->m_angularVelocity += invI2 * motorImpulse * this.m_motorJacobian.angular2;
			b2.m_angularVelocity += invI2 * motorImpulse * this.m_motorJacobian.angular2;
		}

		// Solve linear limit constraint.
		if (this.m_enableLimit && this.m_limitState != b2Joint.e_inactiveLimit)
		{
			var limitCdot = this.m_motorJacobian.Compute(b1.m_linearVelocity, b1.m_angularVelocity, b2.m_linearVelocity, b2.m_angularVelocity);
			var limitImpulse = -this.m_motorMass * limitCdot;

			if (this.m_limitState == b2Joint.e_equalLimits)
			{
				this.m_limitImpulse += limitImpulse;
			}
			else if (this.m_limitState == b2Joint.e_atLowerLimit)
			{
				oldLimitImpulse = this.m_limitImpulse;
				this.m_limitImpulse = b2Math.b2Max(this.m_limitImpulse + limitImpulse, 0.0);
				limitImpulse = this.m_limitImpulse - oldLimitImpulse;
			}
			else if (this.m_limitState == b2Joint.e_atUpperLimit)
			{
				oldLimitImpulse = this.m_limitImpulse;
				this.m_limitImpulse = b2Math.b2Min(this.m_limitImpulse + limitImpulse, 0.0);
				limitImpulse = this.m_limitImpulse - oldLimitImpulse;
			}

			//b1->m_linearVelocity += (invMass1 * limitImpulse) * this.m_motorJacobian.linear1;
			b1.m_linearVelocity.x += (invMass1 * limitImpulse) * this.m_motorJacobian.linear1.x;
			b1.m_linearVelocity.y += (invMass1 * limitImpulse) * this.m_motorJacobian.linear1.y;
			//b1->m_angularVelocity += invI1 * limitImpulse * this.m_motorJacobian.angular1;
			b1.m_angularVelocity += invI1 * limitImpulse * this.m_motorJacobian.angular1;

			//b2->m_linearVelocity += (invMass2 * limitImpulse) * this.m_motorJacobian.linear2;
			b2.m_linearVelocity.x += (invMass2 * limitImpulse) * this.m_motorJacobian.linear2.x;
			b2.m_linearVelocity.y += (invMass2 * limitImpulse) * this.m_motorJacobian.linear2.y;
			//b2->m_angularVelocity += invI2 * limitImpulse * this.m_motorJacobian.angular2;
			b2.m_angularVelocity += invI2 * limitImpulse * this.m_motorJacobian.angular2;
		}
	},



	SolvePositionConstraints: function(){

		var limitC;
		var oldLimitImpulse;

		var b1 = this.m_body1;
		var b2 = this.m_body2;

		var invMass1 = b1.m_invMass;
		var invMass2 = b2.m_invMass;
		var invI1 = b1.m_invI;
		var invI2 = b2.m_invI;

		var tMat;

		//b2Vec2 r1 = b2Mul(b1->m_R, this.m_localAnchor1);
		tMat = b1.m_R;
		var r1X = tMat.col1.x * this.m_localAnchor1.x + tMat.col2.x * this.m_localAnchor1.y;
		var r1Y = tMat.col1.y * this.m_localAnchor1.x + tMat.col2.y * this.m_localAnchor1.y;
		//b2Vec2 r2 = b2Mul(b2->m_R, this.m_localAnchor2);
		tMat = b2.m_R;
		var r2X = tMat.col1.x * this.m_localAnchor2.x + tMat.col2.x * this.m_localAnchor2.y;
		var r2Y = tMat.col1.y * this.m_localAnchor2.x + tMat.col2.y * this.m_localAnchor2.y;
		//b2Vec2 p1 = b1->m_position + r1;
		var p1X = b1.m_position.x + r1X;
		var p1Y = b1.m_position.y + r1Y;
		//b2Vec2 p2 = b2->m_position + r2;
		var p2X = b2.m_position.x + r2X;
		var p2Y = b2.m_position.y + r2Y;
		//b2Vec2 d = p2 - p1;
		var dX = p2X - p1X;
		var dY = p2Y - p1Y;
		//b2Vec2 ay1 = b2Mul(b1->m_R, this.m_localYAxis1);
		tMat = b1.m_R;
		var ay1X = tMat.col1.x * this.m_localYAxis1.x + tMat.col2.x * this.m_localYAxis1.y;
		var ay1Y = tMat.col1.y * this.m_localYAxis1.x + tMat.col2.y * this.m_localYAxis1.y;

		// Solve linear (point-to-line) constraint.
		//float32 linearC = b2Dot(ay1, d);
		var linearC = ay1X*dX + ay1Y*dY;
		// Prevent overly large corrections.
		linearC = b2Math.b2Clamp(linearC, -b2Settings.b2_maxLinearCorrection, b2Settings.b2_maxLinearCorrection);
		var linearImpulse = -this.m_linearMass * linearC;

		//b1->m_position += (invMass1 * linearImpulse) * this.m_linearJacobian.linear1;
		b1.m_position.x += (invMass1 * linearImpulse) * this.m_linearJacobian.linear1.x;
		b1.m_position.y += (invMass1 * linearImpulse) * this.m_linearJacobian.linear1.y;
		//b1->m_rotation += invI1 * linearImpulse * this.m_linearJacobian.angular1;
		b1.m_rotation += invI1 * linearImpulse * this.m_linearJacobian.angular1;
		//b1->m_R.Set(b1->m_rotation);
		//b2->m_position += (invMass2 * linearImpulse) * this.m_linearJacobian.linear2;
		b2.m_position.x += (invMass2 * linearImpulse) * this.m_linearJacobian.linear2.x;
		b2.m_position.y += (invMass2 * linearImpulse) * this.m_linearJacobian.linear2.y;
		b2.m_rotation += invI2 * linearImpulse * this.m_linearJacobian.angular2;
		//b2->m_R.Set(b2->m_rotation);

		var positionError = b2Math.b2Abs(linearC);

		// Solve angular constraint.
		var angularC = b2.m_rotation - b1.m_rotation - this.m_initialAngle;
		// Prevent overly large corrections.
		angularC = b2Math.b2Clamp(angularC, -b2Settings.b2_maxAngularCorrection, b2Settings.b2_maxAngularCorrection);
		var angularImpulse = -this.m_angularMass * angularC;

		b1.m_rotation -= b1.m_invI * angularImpulse;
		b1.m_R.Set(b1.m_rotation);
		b2.m_rotation += b2.m_invI * angularImpulse;
		b2.m_R.Set(b2.m_rotation);

		var angularError = b2Math.b2Abs(angularC);

		// Solve linear limit constraint.
		if (this.m_enableLimit && this.m_limitState != b2Joint.e_inactiveLimit)
		{

			//b2Vec2 r1 = b2Mul(b1->m_R, this.m_localAnchor1);
			tMat = b1.m_R;
			r1X = tMat.col1.x * this.m_localAnchor1.x + tMat.col2.x * this.m_localAnchor1.y;
			r1Y = tMat.col1.y * this.m_localAnchor1.x + tMat.col2.y * this.m_localAnchor1.y;
			//b2Vec2 r2 = b2Mul(b2->m_R, this.m_localAnchor2);
			tMat = b2.m_R;
			r2X = tMat.col1.x * this.m_localAnchor2.x + tMat.col2.x * this.m_localAnchor2.y;
			r2Y = tMat.col1.y * this.m_localAnchor2.x + tMat.col2.y * this.m_localAnchor2.y;
			//b2Vec2 p1 = b1->m_position + r1;
			p1X = b1.m_position.x + r1X;
			p1Y = b1.m_position.y + r1Y;
			//b2Vec2 p2 = b2->m_position + r2;
			p2X = b2.m_position.x + r2X;
			p2Y = b2.m_position.y + r2Y;
			//b2Vec2 d = p2 - p1;
			dX = p2X - p1X;
			dY = p2Y - p1Y;
			//b2Vec2 ax1 = b2Mul(b1->m_R, this.m_localXAxis1);
			tMat = b1.m_R;
			var ax1X = tMat.col1.x * this.m_localXAxis1.x + tMat.col2.x * this.m_localXAxis1.y;
			var ax1Y = tMat.col1.y * this.m_localXAxis1.x + tMat.col2.y * this.m_localXAxis1.y;

			//float32 translation = b2Dot(ax1, d);
			var translation = (ax1X*dX + ax1Y*dY);
			var limitImpulse = 0.0;

			if (this.m_limitState == b2Joint.e_equalLimits)
			{
				// Prevent large angular corrections
				limitC = b2Math.b2Clamp(translation, -b2Settings.b2_maxLinearCorrection, b2Settings.b2_maxLinearCorrection);
				limitImpulse = -this.m_motorMass * limitC;
				positionError = b2Math.b2Max(positionError, b2Math.b2Abs(angularC));
			}
			else if (this.m_limitState == b2Joint.e_atLowerLimit)
			{
				limitC = translation - this.m_lowerTranslation;
				positionError = b2Math.b2Max(positionError, -limitC);

				// Prevent large linear corrections and allow some slop.
				limitC = b2Math.b2Clamp(limitC + b2Settings.b2_linearSlop, -b2Settings.b2_maxLinearCorrection, 0.0);
				limitImpulse = -this.m_motorMass * limitC;
				oldLimitImpulse = this.m_limitPositionImpulse;
				this.m_limitPositionImpulse = b2Math.b2Max(this.m_limitPositionImpulse + limitImpulse, 0.0);
				limitImpulse = this.m_limitPositionImpulse - oldLimitImpulse;
			}
			else if (this.m_limitState == b2Joint.e_atUpperLimit)
			{
				limitC = translation - this.m_upperTranslation;
				positionError = b2Math.b2Max(positionError, limitC);

				// Prevent large linear corrections and allow some slop.
				limitC = b2Math.b2Clamp(limitC - b2Settings.b2_linearSlop, 0.0, b2Settings.b2_maxLinearCorrection);
				limitImpulse = -this.m_motorMass * limitC;
				oldLimitImpulse = this.m_limitPositionImpulse;
				this.m_limitPositionImpulse = b2Math.b2Min(this.m_limitPositionImpulse + limitImpulse, 0.0);
				limitImpulse = this.m_limitPositionImpulse - oldLimitImpulse;
			}

			//b1->m_position += (invMass1 * limitImpulse) * this.m_motorJacobian.linear1;
			b1.m_position.x += (invMass1 * limitImpulse) * this.m_motorJacobian.linear1.x;
			b1.m_position.y += (invMass1 * limitImpulse) * this.m_motorJacobian.linear1.y;
			//b1->m_rotation += invI1 * limitImpulse * this.m_motorJacobian.angular1;
			b1.m_rotation += invI1 * limitImpulse * this.m_motorJacobian.angular1;
			b1.m_R.Set(b1.m_rotation);
			//b2->m_position += (invMass2 * limitImpulse) * this.m_motorJacobian.linear2;
			b2.m_position.x += (invMass2 * limitImpulse) * this.m_motorJacobian.linear2.x;
			b2.m_position.y += (invMass2 * limitImpulse) * this.m_motorJacobian.linear2.y;
			//b2->m_rotation += invI2 * limitImpulse * this.m_motorJacobian.angular2;
			b2.m_rotation += invI2 * limitImpulse * this.m_motorJacobian.angular2;
			b2.m_R.Set(b2.m_rotation);
		}

		return positionError <= b2Settings.b2_linearSlop && angularError <= b2Settings.b2_angularSlop;

	},

	m_localAnchor1: new b2Vec2(),
	m_localAnchor2: new b2Vec2(),
	m_localXAxis1: new b2Vec2(),
	m_localYAxis1: new b2Vec2(),
	m_initialAngle: null,

	m_linearJacobian: new b2Jacobian(),
	m_linearMass: null,
	m_linearImpulse: null,

	m_angularMass: null,
	m_angularImpulse: null,

	m_motorJacobian: new b2Jacobian(),
	m_motorMass: null,
	m_motorImpulse: null,
	m_limitImpulse: null,
	m_limitPositionImpulse: null,

	m_lowerTranslation: null,
	m_upperTranslation: null,
	m_maxMotorForce: null,
	m_motorSpeed: null,

	m_enableLimit: null,
	m_enableMotor: null,
	m_limitState: 0});

/*
* Copyright (c) 2006-2007 Erin Catto http:
*
* This software is provided 'as-is', without any express or implied
* warranty.  In no event will the authors be held liable for any damages
* arising from the use of this software.
* Permission is granted to anyone to use this software for any purpose,
* including commercial applications, and to alter it and redistribute it
* freely, subject to the following restrictions:
* 1. The origin of this software must not be misrepresented; you must not
* claim that you wrote the original software. If you use this software
* in a product, an acknowledgment in the product documentation would be
* appreciated but is not required.
* 2. Altered source versions must be plainly marked, and must not be
* misrepresented the original software.
* 3. This notice may not be removed or altered from any source distribution.
*/





var b2PrismaticJointDef = Class.create();
Object.extend(b2PrismaticJointDef.prototype, b2JointDef.prototype);
Object.extend(b2PrismaticJointDef.prototype, 
{
	initialize: function()
	{
		// The constructor for b2JointDef
		this.type = b2Joint.e_unknownJoint;
		this.userData = null;
		this.body1 = null;
		this.body2 = null;
		this.collideConnected = false;
		//

		this.type = b2Joint.e_prismaticJoint;
		this.anchorPoint = new b2Vec2(0.0, 0.0);
		this.axis = new b2Vec2(0.0, 0.0);
		this.lowerTranslation = 0.0;
		this.upperTranslation = 0.0;
		this.motorForce = 0.0;
		this.motorSpeed = 0.0;
		this.enableLimit = false;
		this.enableMotor = false;
	},

	anchorPoint: null,
	axis: null,
	lowerTranslation: null,
	upperTranslation: null,
	motorForce: null,
	motorSpeed: null,
	enableLimit: null,
	enableMotor: null});

/*
* Copyright (c) 2006-2007 Erin Catto http:
*
* This software is provided 'as-is', without any express or implied
* warranty.  In no event will the authors be held liable for any damages
* arising from the use of this software.
* Permission is granted to anyone to use this software for any purpose,
* including commercial applications, and to alter it and redistribute it
* freely, subject to the following restrictions:
* 1. The origin of this software must not be misrepresented; you must not
* claim that you wrote the original software. If you use this software
* in a product, an acknowledgment in the product documentation would be
* appreciated but is not required.
* 2. Altered source versions must be plainly marked, and must not be
* misrepresented the original software.
* 3. This notice may not be removed or altered from any source distribution.
*/







var b2PulleyJoint = Class.create();
Object.extend(b2PulleyJoint.prototype, b2Joint.prototype);
Object.extend(b2PulleyJoint.prototype, 
{
	GetAnchor1: function(){
		//return this.m_body1->m_position + b2Mul(this.m_body1->m_R, this.m_localAnchor1);
		var tMat = this.m_body1.m_R;
		return new b2Vec2(	this.m_body1.m_position.x + (tMat.col1.x * this.m_localAnchor1.x + tMat.col2.x * this.m_localAnchor1.y),
							this.m_body1.m_position.y + (tMat.col1.y * this.m_localAnchor1.x + tMat.col2.y * this.m_localAnchor1.y));
	},
	GetAnchor2: function(){
		//return this.m_body2->m_position + b2Mul(this.m_body2->m_R, this.m_localAnchor2);
		var tMat = this.m_body2.m_R;
		return new b2Vec2(	this.m_body2.m_position.x + (tMat.col1.x * this.m_localAnchor2.x + tMat.col2.x * this.m_localAnchor2.y),
							this.m_body2.m_position.y + (tMat.col1.y * this.m_localAnchor2.x + tMat.col2.y * this.m_localAnchor2.y));
	},

	GetGroundPoint1: function(){
		//return this.m_ground->m_position + this.m_groundAnchor1;
		return new b2Vec2(this.m_ground.m_position.x + this.m_groundAnchor1.x, this.m_ground.m_position.y + this.m_groundAnchor1.y);
	},
	GetGroundPoint2: function(){
		return new b2Vec2(this.m_ground.m_position.x + this.m_groundAnchor2.x, this.m_ground.m_position.y + this.m_groundAnchor2.y);
	},

	GetReactionForce: function(invTimeStep){
		//b2Vec2 F(0.0f, 0.0f);
		return new b2Vec2();
	},
	GetReactionTorque: function(invTimeStep){
		return 0.0;
	},

	GetLength1: function(){
		var tMat;
		//b2Vec2 p = this.m_body1->m_position + b2Mul(this.m_body1->m_R, this.m_localAnchor1);
		tMat = this.m_body1.m_R;
		var pX = this.m_body1.m_position.x + (tMat.col1.x * this.m_localAnchor1.x + tMat.col2.x * this.m_localAnchor1.y);
		var pY = this.m_body1.m_position.y + (tMat.col1.y * this.m_localAnchor1.x + tMat.col2.y * this.m_localAnchor1.y);
		//b2Vec2 s = this.m_ground->m_position + this.m_groundAnchor1;
		//b2Vec2 d = p - s;
		var dX = pX - (this.m_ground.m_position.x + this.m_groundAnchor1.x);
		var dY = pY - (this.m_ground.m_position.y + this.m_groundAnchor1.y);
		return Math.sqrt(dX*dX + dY*dY);
	},
	GetLength2: function(){
		var tMat;
		//b2Vec2 p = this.m_body2->m_position + b2Mul(this.m_body2->m_R, this.m_localAnchor2);
		tMat = this.m_body2.m_R;
		var pX = this.m_body2.m_position.x + (tMat.col1.x * this.m_localAnchor2.x + tMat.col2.x * this.m_localAnchor2.y);
		var pY = this.m_body2.m_position.y + (tMat.col1.y * this.m_localAnchor2.x + tMat.col2.y * this.m_localAnchor2.y);
		//b2Vec2 s = this.m_ground->m_position + this.m_groundAnchor2;
		//b2Vec2 d = p - s;
		var dX = pX - (this.m_ground.m_position.x + this.m_groundAnchor2.x);
		var dY = pY - (this.m_ground.m_position.y + this.m_groundAnchor2.y);
		return Math.sqrt(dX*dX + dY*dY);
	},

	GetRatio: function(){
		return this.m_ratio;
	},

	//--------------- Internals Below -------------------

	initialize: function(def){
		// The constructor for b2Joint
		// initialize instance variables for references
		this.m_node1 = new b2JointNode();
		this.m_node2 = new b2JointNode();
		//
		this.m_type = def.type;
		this.m_prev = null;
		this.m_next = null;
		this.m_body1 = def.body1;
		this.m_body2 = def.body2;
		this.m_collideConnected = def.collideConnected;
		this.m_islandFlag = false;
		this.m_userData = def.userData;
		//

		// initialize instance variables for references
		this.m_groundAnchor1 = new b2Vec2();
		this.m_groundAnchor2 = new b2Vec2();
		this.m_localAnchor1 = new b2Vec2();
		this.m_localAnchor2 = new b2Vec2();
		this.m_u1 = new b2Vec2();
		this.m_u2 = new b2Vec2();
		//


		// parent
		//super(def);

		var tMat;
		var tX;
		var tY;

		this.m_ground = this.m_body1.m_world.m_groundBody;
		//this.m_groundAnchor1 = def.groundPoint1 - this.m_ground.m_position;
		this.m_groundAnchor1.x = def.groundPoint1.x - this.m_ground.m_position.x;
		this.m_groundAnchor1.y = def.groundPoint1.y - this.m_ground.m_position.y;
		//this.m_groundAnchor2 = def.groundPoint2 - this.m_ground.m_position;
		this.m_groundAnchor2.x = def.groundPoint2.x - this.m_ground.m_position.x;
		this.m_groundAnchor2.y = def.groundPoint2.y - this.m_ground.m_position.y;
		//this.m_localAnchor1 = b2MulT(this.m_body1.m_R, def.anchorPoint1 - this.m_body1.m_position);
		tMat = this.m_body1.m_R;
		tX = def.anchorPoint1.x - this.m_body1.m_position.x;
		tY = def.anchorPoint1.y - this.m_body1.m_position.y;
		this.m_localAnchor1.x = tX*tMat.col1.x + tY*tMat.col1.y;
		this.m_localAnchor1.y = tX*tMat.col2.x + tY*tMat.col2.y;
		//this.m_localAnchor2 = b2MulT(this.m_body2.m_R, def.anchorPoint2 - this.m_body2.m_position);
		tMat = this.m_body2.m_R;
		tX = def.anchorPoint2.x - this.m_body2.m_position.x;
		tY = def.anchorPoint2.y - this.m_body2.m_position.y;
		this.m_localAnchor2.x = tX*tMat.col1.x + tY*tMat.col1.y;
		this.m_localAnchor2.y = tX*tMat.col2.x + tY*tMat.col2.y;

		this.m_ratio = def.ratio;

		//var d1 = def.groundPoint1 - def.anchorPoint1;
		tX = def.groundPoint1.x - def.anchorPoint1.x;
		tY = def.groundPoint1.y - def.anchorPoint1.y;
		var d1Len = Math.sqrt(tX*tX + tY*tY);
		//var d2 = def.groundPoint2 - def.anchorPoint2;
		tX = def.groundPoint2.x - def.anchorPoint2.x;
		tY = def.groundPoint2.y - def.anchorPoint2.y;
		var d2Len = Math.sqrt(tX*tX + tY*tY);

		var length1 = b2Math.b2Max(0.5 * b2PulleyJoint.b2_minPulleyLength, d1Len);
		var length2 = b2Math.b2Max(0.5 * b2PulleyJoint.b2_minPulleyLength, d2Len);

		this.m_constant = length1 + this.m_ratio * length2;

		this.m_maxLength1 = b2Math.b2Clamp(def.maxLength1, length1, this.m_constant - this.m_ratio * b2PulleyJoint.b2_minPulleyLength);
		this.m_maxLength2 = b2Math.b2Clamp(def.maxLength2, length2, (this.m_constant - b2PulleyJoint.b2_minPulleyLength) / this.m_ratio);

		this.m_pulleyImpulse = 0.0;
		this.m_limitImpulse1 = 0.0;
		this.m_limitImpulse2 = 0.0;

	},

	PrepareVelocitySolver: function(){
		var b1 = this.m_body1;
		var b2 = this.m_body2;

		var tMat;

		//b2Vec2 r1 = b2Mul(b1->m_R, this.m_localAnchor1);
		tMat = b1.m_R;
		var r1X = tMat.col1.x * this.m_localAnchor1.x + tMat.col2.x * this.m_localAnchor1.y;
		var r1Y = tMat.col1.y * this.m_localAnchor1.x + tMat.col2.y * this.m_localAnchor1.y;
		//b2Vec2 r2 = b2Mul(b2->m_R, this.m_localAnchor2);
		tMat = b2.m_R;
		var r2X = tMat.col1.x * this.m_localAnchor2.x + tMat.col2.x * this.m_localAnchor2.y;
		var r2Y = tMat.col1.y * this.m_localAnchor2.x + tMat.col2.y * this.m_localAnchor2.y;

		//b2Vec2 p1 = b1->m_position + r1;
		var p1X = b1.m_position.x + r1X;
		var p1Y = b1.m_position.y + r1Y;
		//b2Vec2 p2 = b2->m_position + r2;
		var p2X = b2.m_position.x + r2X;
		var p2Y = b2.m_position.y + r2Y;

		//b2Vec2 s1 = this.m_ground->m_position + this.m_groundAnchor1;
		var s1X = this.m_ground.m_position.x + this.m_groundAnchor1.x;
		var s1Y = this.m_ground.m_position.y + this.m_groundAnchor1.y;
		//b2Vec2 s2 = this.m_ground->m_position + this.m_groundAnchor2;
		var s2X = this.m_ground.m_position.x + this.m_groundAnchor2.x;
		var s2Y = this.m_ground.m_position.y + this.m_groundAnchor2.y;

		// Get the pulley axes.
		//this.m_u1 = p1 - s1;
		this.m_u1.Set(p1X - s1X, p1Y - s1Y);
		//this.m_u2 = p2 - s2;
		this.m_u2.Set(p2X - s2X, p2Y - s2Y);

		var length1 = this.m_u1.Length();
		var length2 = this.m_u2.Length();

		if (length1 > b2Settings.b2_linearSlop)
		{
			//this.m_u1 *= 1.0f / length1;
			this.m_u1.Multiply(1.0 / length1);
		}
		else
		{
			this.m_u1.SetZero();
		}

		if (length2 > b2Settings.b2_linearSlop)
		{
			//this.m_u2 *= 1.0f / length2;
			this.m_u2.Multiply(1.0 / length2);
		}
		else
		{
			this.m_u2.SetZero();
		}

		if (length1 < this.m_maxLength1)
		{
			this.m_limitState1 = b2Joint.e_inactiveLimit;
			this.m_limitImpulse1 = 0.0;
		}
		else
		{
			this.m_limitState1 = b2Joint.e_atUpperLimit;
			this.m_limitPositionImpulse1 = 0.0;
		}

		if (length2 < this.m_maxLength2)
		{
			this.m_limitState2 = b2Joint.e_inactiveLimit;
			this.m_limitImpulse2 = 0.0;
		}
		else
		{
			this.m_limitState2 = b2Joint.e_atUpperLimit;
			this.m_limitPositionImpulse2 = 0.0;
		}

		// Compute effective mass.
		//var cr1u1 = b2Cross(r1, this.m_u1);
		var cr1u1 = r1X * this.m_u1.y - r1Y * this.m_u1.x;
		//var cr2u2 = b2Cross(r2, this.m_u2);
		var cr2u2 = r2X * this.m_u2.y - r2Y * this.m_u2.x;

		this.m_limitMass1 = b1.m_invMass + b1.m_invI * cr1u1 * cr1u1;
		this.m_limitMass2 = b2.m_invMass + b2.m_invI * cr2u2 * cr2u2;
		this.m_pulleyMass = this.m_limitMass1 + this.m_ratio * this.m_ratio * this.m_limitMass2;
		//b2Settings.b2Assert(this.m_limitMass1 > Number.MIN_VALUE);
		//b2Settings.b2Assert(this.m_limitMass2 > Number.MIN_VALUE);
		//b2Settings.b2Assert(this.m_pulleyMass > Number.MIN_VALUE);
		this.m_limitMass1 = 1.0 / this.m_limitMass1;
		this.m_limitMass2 = 1.0 / this.m_limitMass2;
		this.m_pulleyMass = 1.0 / this.m_pulleyMass;

		// Warm starting.
		//b2Vec2 P1 = (-this.m_pulleyImpulse - this.m_limitImpulse1) * this.m_u1;
		var P1X = (-this.m_pulleyImpulse - this.m_limitImpulse1) * this.m_u1.x;
		var P1Y = (-this.m_pulleyImpulse - this.m_limitImpulse1) * this.m_u1.y;
		//b2Vec2 P2 = (-this.m_ratio * this.m_pulleyImpulse - this.m_limitImpulse2) * this.m_u2;
		var P2X = (-this.m_ratio * this.m_pulleyImpulse - this.m_limitImpulse2) * this.m_u2.x;
		var P2Y = (-this.m_ratio * this.m_pulleyImpulse - this.m_limitImpulse2) * this.m_u2.y;
		//b1.m_linearVelocity += b1.m_invMass * P1;
		b1.m_linearVelocity.x += b1.m_invMass * P1X;
		b1.m_linearVelocity.y += b1.m_invMass * P1Y;
		//b1.m_angularVelocity += b1.m_invI * b2Cross(r1, P1);
		b1.m_angularVelocity += b1.m_invI * (r1X * P1Y - r1Y * P1X);
		//b2.m_linearVelocity += b2.m_invMass * P2;
		b2.m_linearVelocity.x += b2.m_invMass * P2X;
		b2.m_linearVelocity.y += b2.m_invMass * P2Y;
		//b2.m_angularVelocity += b2.m_invI * b2Cross(r2, P2);
		b2.m_angularVelocity += b2.m_invI * (r2X * P2Y - r2Y * P2X);
	},

	SolveVelocityConstraints: function(step){
		var b1 = this.m_body1;
		var b2 = this.m_body2;

		var tMat;

		//var r1 = b2Mul(b1.m_R, this.m_localAnchor1);
		tMat = b1.m_R;
		var r1X = tMat.col1.x * this.m_localAnchor1.x + tMat.col2.x * this.m_localAnchor1.y;
		var r1Y = tMat.col1.y * this.m_localAnchor1.x + tMat.col2.y * this.m_localAnchor1.y;
		//var r2 = b2Mul(b2.m_R, this.m_localAnchor2);
		tMat = b2.m_R;
		var r2X = tMat.col1.x * this.m_localAnchor2.x + tMat.col2.x * this.m_localAnchor2.y;
		var r2Y = tMat.col1.y * this.m_localAnchor2.x + tMat.col2.y * this.m_localAnchor2.y;

		// temp vars
		var v1X;
		var v1Y;
		var v2X;
		var v2Y;
		var P1X;
		var P1Y;
		var P2X;
		var P2Y;
		var Cdot;
		var impulse;
		var oldLimitImpulse;

		//{
			//b2Vec2 v1 = b1->m_linearVelocity + b2Cross(b1->m_angularVelocity, r1);
			v1X = b1.m_linearVelocity.x + (-b1.m_angularVelocity * r1Y);
			v1Y = b1.m_linearVelocity.y + (b1.m_angularVelocity * r1X);
			//b2Vec2 v2 = b2->m_linearVelocity + b2Cross(b2->m_angularVelocity, r2);
			v2X = b2.m_linearVelocity.x + (-b2.m_angularVelocity * r2Y);
			v2Y = b2.m_linearVelocity.y + (b2.m_angularVelocity * r2X);

			//Cdot = -b2Dot(this.m_u1, v1) - this.m_ratio * b2Dot(this.m_u2, v2);
			Cdot = -(this.m_u1.x * v1X + this.m_u1.y * v1Y) - this.m_ratio * (this.m_u2.x * v2X + this.m_u2.y * v2Y);
			impulse = -this.m_pulleyMass * Cdot;
			this.m_pulleyImpulse += impulse;

			//b2Vec2 P1 = -impulse * this.m_u1;
			P1X = -impulse * this.m_u1.x;
			P1Y = -impulse * this.m_u1.y;
			//b2Vec2 P2 = -this.m_ratio * impulse * this.m_u2;
			P2X = -this.m_ratio * impulse * this.m_u2.x;
			P2Y = -this.m_ratio * impulse * this.m_u2.y;
			//b1.m_linearVelocity += b1.m_invMass * P1;
			b1.m_linearVelocity.x += b1.m_invMass * P1X;
			b1.m_linearVelocity.y += b1.m_invMass * P1Y;
			//b1.m_angularVelocity += b1.m_invI * b2Cross(r1, P1);
			b1.m_angularVelocity += b1.m_invI * (r1X * P1Y - r1Y * P1X);
			//b2.m_linearVelocity += b2.m_invMass * P2;
			b2.m_linearVelocity.x += b2.m_invMass * P2X;
			b2.m_linearVelocity.y += b2.m_invMass * P2Y;
			//b2.m_angularVelocity += b2.m_invI * b2Cross(r2, P2);
			b2.m_angularVelocity += b2.m_invI * (r2X * P2Y - r2Y * P2X);
		//}

		if (this.m_limitState1 == b2Joint.e_atUpperLimit)
		{
			//b2Vec2 v1 = b1->m_linearVelocity + b2Cross(b1->m_angularVelocity, r1);
			v1X = b1.m_linearVelocity.x + (-b1.m_angularVelocity * r1Y);
			v1Y = b1.m_linearVelocity.y + (b1.m_angularVelocity * r1X);

			//float32 Cdot = -b2Dot(this.m_u1, v1);
			Cdot = -(this.m_u1.x * v1X + this.m_u1.y * v1Y);
			impulse = -this.m_limitMass1 * Cdot;
			oldLimitImpulse = this.m_limitImpulse1;
			this.m_limitImpulse1 = b2Math.b2Max(0.0, this.m_limitImpulse1 + impulse);
			impulse = this.m_limitImpulse1 - oldLimitImpulse;
			//b2Vec2 P1 = -impulse * this.m_u1;
			P1X = -impulse * this.m_u1.x;
			P1Y = -impulse * this.m_u1.y;
			//b1.m_linearVelocity += b1->m_invMass * P1;
			b1.m_linearVelocity.x += b1.m_invMass * P1X;
			b1.m_linearVelocity.y += b1.m_invMass * P1Y;
			//b1.m_angularVelocity += b1->m_invI * b2Cross(r1, P1);
			b1.m_angularVelocity += b1.m_invI * (r1X * P1Y - r1Y * P1X);
		}

		if (this.m_limitState2 == b2Joint.e_atUpperLimit)
		{
			//b2Vec2 v2 = b2->m_linearVelocity + b2Cross(b2->m_angularVelocity, r2);
			v2X = b2.m_linearVelocity.x + (-b2.m_angularVelocity * r2Y);
			v2Y = b2.m_linearVelocity.y + (b2.m_angularVelocity * r2X);

			//float32 Cdot = -b2Dot(this.m_u2, v2);
			Cdot = -(this.m_u2.x * v2X + this.m_u2.y * v2Y);
			impulse = -this.m_limitMass2 * Cdot;
			oldLimitImpulse = this.m_limitImpulse2;
			this.m_limitImpulse2 = b2Math.b2Max(0.0, this.m_limitImpulse2 + impulse);
			impulse = this.m_limitImpulse2 - oldLimitImpulse;
			//b2Vec2 P2 = -impulse * this.m_u2;
			P2X = -impulse * this.m_u2.x;
			P2Y = -impulse * this.m_u2.y;
			//b2->m_linearVelocity += b2->m_invMass * P2;
			b2.m_linearVelocity.x += b2.m_invMass * P2X;
			b2.m_linearVelocity.y += b2.m_invMass * P2Y;
			//b2->m_angularVelocity += b2->m_invI * b2Cross(r2, P2);
			b2.m_angularVelocity += b2.m_invI * (r2X * P2Y - r2Y * P2X);
		}
	},



	SolvePositionConstraints: function(){
		var b1 = this.m_body1;
		var b2 = this.m_body2;

		var tMat;

		//b2Vec2 s1 = this.m_ground->m_position + this.m_groundAnchor1;
		var s1X = this.m_ground.m_position.x + this.m_groundAnchor1.x;
		var s1Y = this.m_ground.m_position.y + this.m_groundAnchor1.y;
		//b2Vec2 s2 = this.m_ground->m_position + this.m_groundAnchor2;
		var s2X = this.m_ground.m_position.x + this.m_groundAnchor2.x;
		var s2Y = this.m_ground.m_position.y + this.m_groundAnchor2.y;

		// temp vars
		var r1X;
		var r1Y;
		var r2X;
		var r2Y;
		var p1X;
		var p1Y;
		var p2X;
		var p2Y;
		var length1;
		var length2;
		var C;
		var impulse;
		var oldLimitPositionImpulse;

		var linearError = 0.0;

		{
			//var r1 = b2Mul(b1.m_R, this.m_localAnchor1);
			tMat = b1.m_R;
			r1X = tMat.col1.x * this.m_localAnchor1.x + tMat.col2.x * this.m_localAnchor1.y;
			r1Y = tMat.col1.y * this.m_localAnchor1.x + tMat.col2.y * this.m_localAnchor1.y;
			//var r2 = b2Mul(b2.m_R, this.m_localAnchor2);
			tMat = b2.m_R;
			r2X = tMat.col1.x * this.m_localAnchor2.x + tMat.col2.x * this.m_localAnchor2.y;
			r2Y = tMat.col1.y * this.m_localAnchor2.x + tMat.col2.y * this.m_localAnchor2.y;

			//b2Vec2 p1 = b1->m_position + r1;
			p1X = b1.m_position.x + r1X;
			p1Y = b1.m_position.y + r1Y;
			//b2Vec2 p2 = b2->m_position + r2;
			p2X = b2.m_position.x + r2X;
			p2Y = b2.m_position.y + r2Y;

			// Get the pulley axes.
			//this.m_u1 = p1 - s1;
			this.m_u1.Set(p1X - s1X, p1Y - s1Y);
			//this.m_u2 = p2 - s2;
			this.m_u2.Set(p2X - s2X, p2Y - s2Y);

			length1 = this.m_u1.Length();
			length2 = this.m_u2.Length();

			if (length1 > b2Settings.b2_linearSlop)
			{
				//this.m_u1 *= 1.0f / length1;
				this.m_u1.Multiply( 1.0 / length1 );
			}
			else
			{
				this.m_u1.SetZero();
			}

			if (length2 > b2Settings.b2_linearSlop)
			{
				//this.m_u2 *= 1.0f / length2;
				this.m_u2.Multiply( 1.0 / length2 );
			}
			else
			{
				this.m_u2.SetZero();
			}

			C = this.m_constant - length1 - this.m_ratio * length2;
			linearError = b2Math.b2Max(linearError, Math.abs(C));
			C = b2Math.b2Clamp(C, -b2Settings.b2_maxLinearCorrection, b2Settings.b2_maxLinearCorrection);
			impulse = -this.m_pulleyMass * C;

			p1X = -impulse * this.m_u1.x;
			p1Y = -impulse * this.m_u1.y;
			p2X = -this.m_ratio * impulse * this.m_u2.x;
			p2Y = -this.m_ratio * impulse * this.m_u2.y;

			b1.m_position.x += b1.m_invMass * p1X;
			b1.m_position.y += b1.m_invMass * p1Y;
			b1.m_rotation += b1.m_invI * (r1X * p1Y - r1Y * p1X);
			b2.m_position.x += b2.m_invMass * p2X;
			b2.m_position.y += b2.m_invMass * p2Y;
			b2.m_rotation += b2.m_invI * (r2X * p2Y - r2Y * p2X);

			b1.m_R.Set(b1.m_rotation);
			b2.m_R.Set(b2.m_rotation);
		}

		if (this.m_limitState1 == b2Joint.e_atUpperLimit)
		{
			//b2Vec2 r1 = b2Mul(b1->m_R, this.m_localAnchor1);
			tMat = b1.m_R;
			r1X = tMat.col1.x * this.m_localAnchor1.x + tMat.col2.x * this.m_localAnchor1.y;
			r1Y = tMat.col1.y * this.m_localAnchor1.x + tMat.col2.y * this.m_localAnchor1.y;
			//b2Vec2 p1 = b1->m_position + r1;
			p1X = b1.m_position.x + r1X;
			p1Y = b1.m_position.y + r1Y;

			//this.m_u1 = p1 - s1;
			this.m_u1.Set(p1X - s1X, p1Y - s1Y);

			length1 = this.m_u1.Length();

			if (length1 > b2Settings.b2_linearSlop)
			{
				//this.m_u1 *= 1.0 / length1;
				this.m_u1.x *= 1.0 / length1;
				this.m_u1.y *= 1.0 / length1;
			}
			else
			{
				this.m_u1.SetZero();
			}

			C = this.m_maxLength1 - length1;
			linearError = b2Math.b2Max(linearError, -C);
			C = b2Math.b2Clamp(C + b2Settings.b2_linearSlop, -b2Settings.b2_maxLinearCorrection, 0.0);
			impulse = -this.m_limitMass1 * C;
			oldLimitPositionImpulse = this.m_limitPositionImpulse1;
			this.m_limitPositionImpulse1 = b2Math.b2Max(0.0, this.m_limitPositionImpulse1 + impulse);
			impulse = this.m_limitPositionImpulse1 - oldLimitPositionImpulse;

			//P1 = -impulse * this.m_u1;
			p1X = -impulse * this.m_u1.x;
			p1Y = -impulse * this.m_u1.y;

			b1.m_position.x += b1.m_invMass * p1X;
			b1.m_position.y += b1.m_invMass * p1Y;
			//b1.m_rotation += b1.m_invI * b2Cross(r1, P1);
			b1.m_rotation += b1.m_invI * (r1X * p1Y - r1Y * p1X);
			b1.m_R.Set(b1.m_rotation);
		}

		if (this.m_limitState2 == b2Joint.e_atUpperLimit)
		{
			//b2Vec2 r2 = b2Mul(b2->m_R, this.m_localAnchor2);
			tMat = b2.m_R;
			r2X = tMat.col1.x * this.m_localAnchor2.x + tMat.col2.x * this.m_localAnchor2.y;
			r2Y = tMat.col1.y * this.m_localAnchor2.x + tMat.col2.y * this.m_localAnchor2.y;
			//b2Vec2 p2 = b2->m_position + r2;
			p2X = b2.m_position.x + r2X;
			p2Y = b2.m_position.y + r2Y;

			//this.m_u2 = p2 - s2;
			this.m_u2.Set(p2X - s2X, p2Y - s2Y);

			length2 = this.m_u2.Length();

			if (length2 > b2Settings.b2_linearSlop)
			{
				//this.m_u2 *= 1.0 / length2;
				this.m_u2.x *= 1.0 / length2;
				this.m_u2.y *= 1.0 / length2;
			}
			else
			{
				this.m_u2.SetZero();
			}

			C = this.m_maxLength2 - length2;
			linearError = b2Math.b2Max(linearError, -C);
			C = b2Math.b2Clamp(C + b2Settings.b2_linearSlop, -b2Settings.b2_maxLinearCorrection, 0.0);
			impulse = -this.m_limitMass2 * C;
			oldLimitPositionImpulse = this.m_limitPositionImpulse2;
			this.m_limitPositionImpulse2 = b2Math.b2Max(0.0, this.m_limitPositionImpulse2 + impulse);
			impulse = this.m_limitPositionImpulse2 - oldLimitPositionImpulse;

			//P2 = -impulse * this.m_u2;
			p2X = -impulse * this.m_u2.x;
			p2Y = -impulse * this.m_u2.y;

			//b2.m_position += b2.m_invMass * P2;
			b2.m_position.x += b2.m_invMass * p2X;
			b2.m_position.y += b2.m_invMass * p2Y;
			//b2.m_rotation += b2.m_invI * b2Cross(r2, P2);
			b2.m_rotation += b2.m_invI * (r2X * p2Y - r2Y * p2X);
			b2.m_R.Set(b2.m_rotation);
		}

		return linearError < b2Settings.b2_linearSlop;
	},



	m_ground: null,
	m_groundAnchor1: new b2Vec2(),
	m_groundAnchor2: new b2Vec2(),
	m_localAnchor1: new b2Vec2(),
	m_localAnchor2: new b2Vec2(),

	m_u1: new b2Vec2(),
	m_u2: new b2Vec2(),

	m_constant: null,
	m_ratio: null,

	m_maxLength1: null,
	m_maxLength2: null,

	// Effective masses
	m_pulleyMass: null,
	m_limitMass1: null,
	m_limitMass2: null,

	// Impulses for accumulation/warm starting.
	m_pulleyImpulse: null,
	m_limitImpulse1: null,
	m_limitImpulse2: null,

	// Position impulses for accumulation.
	m_limitPositionImpulse1: null,
	m_limitPositionImpulse2: null,

	m_limitState1: 0,
	m_limitState2: 0

	// static
});



b2PulleyJoint.b2_minPulleyLength = b2Settings.b2_lengthUnitsPerMeter;
/*
* Copyright (c) 2006-2007 Erin Catto http:
*
* This software is provided 'as-is', without any express or implied
* warranty.  In no event will the authors be held liable for any damages
* arising from the use of this software.
* Permission is granted to anyone to use this software for any purpose,
* including commercial applications, and to alter it and redistribute it
* freely, subject to the following restrictions:
* 1. The origin of this software must not be misrepresented; you must not
* claim that you wrote the original software. If you use this software
* in a product, an acknowledgment in the product documentation would be
* appreciated but is not required.
* 2. Altered source versions must be plainly marked, and must not be
* misrepresented the original software.
* 3. This notice may not be removed or altered from any source distribution.
*/






// The pulley joint is connected to two bodies and two fixed ground points.
// The pulley supports a ratio such that:
// length1 + ratio * length2 = constant
// Yes, the force transmitted is scaled by the ratio.
// The pulley also enforces a maximum length limit on both sides. This is
// useful to prevent one side of the pulley hitting the top.

var b2PulleyJointDef = Class.create();
Object.extend(b2PulleyJointDef.prototype, b2JointDef.prototype);
Object.extend(b2PulleyJointDef.prototype, 
{
	initialize: function()
	{
		// The constructor for b2JointDef
		this.type = b2Joint.e_unknownJoint;
		this.userData = null;
		this.body1 = null;
		this.body2 = null;
		this.collideConnected = false;
		//

		// initialize instance variables for references
		this.groundPoint1 = new b2Vec2();
		this.groundPoint2 = new b2Vec2();
		this.anchorPoint1 = new b2Vec2();
		this.anchorPoint2 = new b2Vec2();
		//

		this.type = b2Joint.e_pulleyJoint;
		this.groundPoint1.Set(-1.0, 1.0);
		this.groundPoint2.Set(1.0, 1.0);
		this.anchorPoint1.Set(-1.0, 0.0);
		this.anchorPoint2.Set(1.0, 0.0);
		this.maxLength1 = 0.5 * b2PulleyJoint.b2_minPulleyLength;
		this.maxLength2 = 0.5 * b2PulleyJoint.b2_minPulleyLength;
		this.ratio = 1.0;
		this.collideConnected = true;
	},

	groundPoint1: new b2Vec2(),
	groundPoint2: new b2Vec2(),
	anchorPoint1: new b2Vec2(),
	anchorPoint2: new b2Vec2(),
	maxLength1: null,
	maxLength2: null,
	ratio: null});

/*
* Copyright (c) 2006-2007 Erin Catto http:
*
* This software is provided 'as-is', without any express or implied
* warranty.  In no event will the authors be held liable for any damages
* arising from the use of this software.
* Permission is granted to anyone to use this software for any purpose,
* including commercial applications, and to alter it and redistribute it
* freely, subject to the following restrictions:
* 1. The origin of this software must not be misrepresented; you must not
* claim that you wrote the original software. If you use this software
* in a product, an acknowledgment in the product documentation would be
* appreciated but is not required.
* 2. Altered source versions must be plainly marked, and must not be
* misrepresented the original software.
* 3. This notice may not be removed or altered from any source distribution.
*/





// Point-to-point constraint
// C = p2 - p1
// Cdot = v2 - v1
//      = v2 + cross(w2, r2) - v1 - cross(w1, r1)
// J = [-I -r1_skew I r2_skew ]
// Identity used:
// w k % (rx i + ry j) = w * (-ry i + rx j)

// Motor constraint
// Cdot = w2 - w1
// J = [0 0 -1 0 0 1]
// K = invI1 + invI2

var b2RevoluteJoint = Class.create();
Object.extend(b2RevoluteJoint.prototype, b2Joint.prototype);
Object.extend(b2RevoluteJoint.prototype, 
{
	GetAnchor1: function(){
		var tMat = this.m_body1.m_R;
		return new b2Vec2(	this.m_body1.m_position.x + (tMat.col1.x * this.m_localAnchor1.x + tMat.col2.x * this.m_localAnchor1.y),
							this.m_body1.m_position.y + (tMat.col1.y * this.m_localAnchor1.x + tMat.col2.y * this.m_localAnchor1.y));
	},
	GetAnchor2: function(){
		var tMat = this.m_body2.m_R;
		return new b2Vec2(	this.m_body2.m_position.x + (tMat.col1.x * this.m_localAnchor2.x + tMat.col2.x * this.m_localAnchor2.y),
							this.m_body2.m_position.y + (tMat.col1.y * this.m_localAnchor2.x + tMat.col2.y * this.m_localAnchor2.y));
	},
	GetJointAngle: function(){
		return this.m_body2.m_rotation - this.m_body1.m_rotation;
	},
	GetJointSpeed: function(){
		return this.m_body2.m_angularVelocity - this.m_body1.m_angularVelocity;
	},
	GetMotorTorque: function(invTimeStep){
		return  invTimeStep * this.m_motorImpulse;
	},

	SetMotorSpeed: function(speed)
	{
		this.m_motorSpeed = speed;
	},

	SetMotorTorque: function(torque)
	{
		this.m_maxMotorTorque = torque;
	},

	GetReactionForce: function(invTimeStep)
	{
		var tVec = this.m_ptpImpulse.Copy();
		tVec.Multiply(invTimeStep);
		//return invTimeStep * this.m_ptpImpulse;
		return tVec;
	},

	GetReactionTorque: function(invTimeStep)
	{
		return invTimeStep * this.m_limitImpulse;
	},

	//--------------- Internals Below -------------------

	initialize: function(def){
		// The constructor for b2Joint
		// initialize instance variables for references
		this.m_node1 = new b2JointNode();
		this.m_node2 = new b2JointNode();
		//
		this.m_type = def.type;
		this.m_prev = null;
		this.m_next = null;
		this.m_body1 = def.body1;
		this.m_body2 = def.body2;
		this.m_collideConnected = def.collideConnected;
		this.m_islandFlag = false;
		this.m_userData = def.userData;
		//

		// initialize instance variables for references
		this.K = new b2Mat22();
		this.K1 = new b2Mat22();
		this.K2 = new b2Mat22();
		this.K3 = new b2Mat22();
		this.m_localAnchor1 = new b2Vec2();
		this.m_localAnchor2 = new b2Vec2();
		this.m_ptpImpulse = new b2Vec2();
		this.m_ptpMass = new b2Mat22();
		//

		//super(def);

		var tMat;
		var tX;
		var tY;

		//this.m_localAnchor1 = b2Math.b2MulTMV(this.m_body1.m_R, b2Math.SubtractVV( def.anchorPoint, this.m_body1.m_position));
		tMat = this.m_body1.m_R;
		tX = def.anchorPoint.x - this.m_body1.m_position.x;
		tY = def.anchorPoint.y - this.m_body1.m_position.y;
		this.m_localAnchor1.x = tX * tMat.col1.x + tY * tMat.col1.y;
		this.m_localAnchor1.y = tX * tMat.col2.x + tY * tMat.col2.y;
		//this.m_localAnchor2 = b2Math.b2MulTMV(this.m_body2.m_R, b2Math.SubtractVV( def.anchorPoint, this.m_body2.m_position));
		tMat = this.m_body2.m_R;
		tX = def.anchorPoint.x - this.m_body2.m_position.x;
		tY = def.anchorPoint.y - this.m_body2.m_position.y;
		this.m_localAnchor2.x = tX * tMat.col1.x + tY * tMat.col1.y;
		this.m_localAnchor2.y = tX * tMat.col2.x + tY * tMat.col2.y;

		this.m_intialAngle = this.m_body2.m_rotation - this.m_body1.m_rotation;

		this.m_ptpImpulse.Set(0.0, 0.0);
		this.m_motorImpulse = 0.0;
		this.m_limitImpulse = 0.0;
		this.m_limitPositionImpulse = 0.0;

		this.m_lowerAngle = def.lowerAngle;
		this.m_upperAngle = def.upperAngle;
		this.m_maxMotorTorque = def.motorTorque;
		this.m_motorSpeed = def.motorSpeed;
		this.m_enableLimit = def.enableLimit;
		this.m_enableMotor = def.enableMotor;
	},

	// internal vars
	K: new b2Mat22(),
	K1: new b2Mat22(),
	K2: new b2Mat22(),
	K3: new b2Mat22(),
	PrepareVelocitySolver: function(){
		var b1 = this.m_body1;
		var b2 = this.m_body2;

		var tMat;

		// Compute the effective mass matrix.
		//b2Vec2 r1 = b2Mul(b1->m_R, this.m_localAnchor1);
		tMat = b1.m_R;
		var r1X = tMat.col1.x * this.m_localAnchor1.x + tMat.col2.x * this.m_localAnchor1.y;
		var r1Y = tMat.col1.y * this.m_localAnchor1.x + tMat.col2.y * this.m_localAnchor1.y;
		//b2Vec2 r2 = b2Mul(b2->m_R, this.m_localAnchor2);
		tMat = b2.m_R;
		var r2X = tMat.col1.x * this.m_localAnchor2.x + tMat.col2.x * this.m_localAnchor2.y;
		var r2Y = tMat.col1.y * this.m_localAnchor2.x + tMat.col2.y * this.m_localAnchor2.y;

		// this.K    = [(1/m1 + 1/m2) * eye(2) - skew(r1) * invI1 * skew(r1) - skew(r2) * invI2 * skew(r2)]
		//      = [1/m1+1/m2     0    ] + invI1 * [r1.y*r1.y -r1.x*r1.y] + invI2 * [r1.y*r1.y -r1.x*r1.y]
		//        [    0     1/m1+1/m2]           [-r1.x*r1.y r1.x*r1.x]           [-r1.x*r1.y r1.x*r1.x]
		var invMass1 = b1.m_invMass;
		var invMass2 = b2.m_invMass;
		var invI1 = b1.m_invI;
		var invI2 = b2.m_invI;

		//var this.K1 = new b2Mat22();
		this.K1.col1.x = invMass1 + invMass2;	this.K1.col2.x = 0.0;
		this.K1.col1.y = 0.0;					this.K1.col2.y = invMass1 + invMass2;

		//var this.K2 = new b2Mat22();
		this.K2.col1.x =  invI1 * r1Y * r1Y;	this.K2.col2.x = -invI1 * r1X * r1Y;
		this.K2.col1.y = -invI1 * r1X * r1Y;	this.K2.col2.y =  invI1 * r1X * r1X;

		//var this.K3 = new b2Mat22();
		this.K3.col1.x =  invI2 * r2Y * r2Y;	this.K3.col2.x = -invI2 * r2X * r2Y;
		this.K3.col1.y = -invI2 * r2X * r2Y;	this.K3.col2.y =  invI2 * r2X * r2X;

		//var this.K = b2Math.AddMM(b2Math.AddMM(this.K1, this.K2), this.K3);
		this.K.SetM(this.K1);
		this.K.AddM(this.K2);
		this.K.AddM(this.K3);

		//this.m_ptpMass = this.K.Invert();
		this.K.Invert(this.m_ptpMass);

		this.m_motorMass = 1.0 / (invI1 + invI2);

		if (this.m_enableMotor == false)
		{
			this.m_motorImpulse = 0.0;
		}

		if (this.m_enableLimit)
		{
			var jointAngle = b2.m_rotation - b1.m_rotation - this.m_intialAngle;
			if (b2Math.b2Abs(this.m_upperAngle - this.m_lowerAngle) < 2.0 * b2Settings.b2_angularSlop)
			{
				this.m_limitState = b2Joint.e_equalLimits;
			}
			else if (jointAngle <= this.m_lowerAngle)
			{
				if (this.m_limitState != b2Joint.e_atLowerLimit)
				{
					this.m_limitImpulse = 0.0;
				}
				this.m_limitState = b2Joint.e_atLowerLimit;
			}
			else if (jointAngle >= this.m_upperAngle)
			{
				if (this.m_limitState != b2Joint.e_atUpperLimit)
				{
					this.m_limitImpulse = 0.0;
				}
				this.m_limitState = b2Joint.e_atUpperLimit;
			}
			else
			{
				this.m_limitState = b2Joint.e_inactiveLimit;
				this.m_limitImpulse = 0.0;
			}
		}
		else
		{
			this.m_limitImpulse = 0.0;
		}

		// Warm starting.
		if (b2World.s_enableWarmStarting)
		{
			//b1.m_linearVelocity.Subtract( b2Math.MulFV( invMass1, this.m_ptpImpulse) );
			b1.m_linearVelocity.x -= invMass1 * this.m_ptpImpulse.x;
			b1.m_linearVelocity.y -= invMass1 * this.m_ptpImpulse.y;
			//b1.m_angularVelocity -= invI1 * (b2Math.b2CrossVV(r1, this.m_ptpImpulse) + this.m_motorImpulse + this.m_limitImpulse);
			b1.m_angularVelocity -= invI1 * ((r1X * this.m_ptpImpulse.y - r1Y * this.m_ptpImpulse.x) + this.m_motorImpulse + this.m_limitImpulse);

			//b2.m_linearVelocity.Add( b2Math.MulFV( invMass2 , this.m_ptpImpulse ));
			b2.m_linearVelocity.x += invMass2 * this.m_ptpImpulse.x;
			b2.m_linearVelocity.y += invMass2 * this.m_ptpImpulse.y;
			//b2.m_angularVelocity += invI2 * (b2Math.b2CrossVV(r2, this.m_ptpImpulse) + this.m_motorImpulse + this.m_limitImpulse);
			b2.m_angularVelocity += invI2 * ((r2X * this.m_ptpImpulse.y - r2Y * this.m_ptpImpulse.x) + this.m_motorImpulse + this.m_limitImpulse);
		}
		else{
			this.m_ptpImpulse.SetZero();
			this.m_motorImpulse = 0.0;
			this.m_limitImpulse = 0.0;
		}

		this.m_limitPositionImpulse = 0.0;
	},


	SolveVelocityConstraints: function(step){
		var b1 = this.m_body1;
		var b2 = this.m_body2;

		var tMat;

		//var r1 = b2Math.b2MulMV(b1.m_R, this.m_localAnchor1);
		tMat = b1.m_R;
		var r1X = tMat.col1.x * this.m_localAnchor1.x + tMat.col2.x * this.m_localAnchor1.y;
		var r1Y = tMat.col1.y * this.m_localAnchor1.x + tMat.col2.y * this.m_localAnchor1.y;
		//var r2 = b2Math.b2MulMV(b2.m_R, this.m_localAnchor2);
		tMat = b2.m_R;
		var r2X = tMat.col1.x * this.m_localAnchor2.x + tMat.col2.x * this.m_localAnchor2.y;
		var r2Y = tMat.col1.y * this.m_localAnchor2.x + tMat.col2.y * this.m_localAnchor2.y;

		var oldLimitImpulse;

		// Solve point-to-point constraint
		//b2Vec2 ptpCdot = b2.m_linearVelocity + b2Cross(b2.m_angularVelocity, r2) - b1.m_linearVelocity - b2Cross(b1.m_angularVelocity, r1);
		var ptpCdotX = b2.m_linearVelocity.x + (-b2.m_angularVelocity * r2Y) - b1.m_linearVelocity.x - (-b1.m_angularVelocity * r1Y);
		var ptpCdotY = b2.m_linearVelocity.y + (b2.m_angularVelocity * r2X) - b1.m_linearVelocity.y - (b1.m_angularVelocity * r1X);

		//b2Vec2 ptpImpulse = -b2Mul(this.m_ptpMass, ptpCdot);
		var ptpImpulseX = -(this.m_ptpMass.col1.x * ptpCdotX + this.m_ptpMass.col2.x * ptpCdotY);
		var ptpImpulseY = -(this.m_ptpMass.col1.y * ptpCdotX + this.m_ptpMass.col2.y * ptpCdotY);
		this.m_ptpImpulse.x += ptpImpulseX;
		this.m_ptpImpulse.y += ptpImpulseY;

		//b1->m_linearVelocity -= b1->m_invMass * ptpImpulse;
		b1.m_linearVelocity.x -= b1.m_invMass * ptpImpulseX;
		b1.m_linearVelocity.y -= b1.m_invMass * ptpImpulseY;
		//b1->m_angularVelocity -= b1->m_invI * b2Cross(r1, ptpImpulse);
		b1.m_angularVelocity -= b1.m_invI * (r1X * ptpImpulseY - r1Y * ptpImpulseX);

		//b2->m_linearVelocity += b2->m_invMass * ptpImpulse;
		b2.m_linearVelocity.x += b2.m_invMass * ptpImpulseX;
		b2.m_linearVelocity.y += b2.m_invMass * ptpImpulseY;
		//b2->m_angularVelocity += b2->m_invI * b2Cross(r2, ptpImpulse);
		b2.m_angularVelocity += b2.m_invI * (r2X * ptpImpulseY - r2Y * ptpImpulseX);

		if (this.m_enableMotor && this.m_limitState != b2Joint.e_equalLimits)
		{
			var motorCdot = b2.m_angularVelocity - b1.m_angularVelocity - this.m_motorSpeed;
			var motorImpulse = -this.m_motorMass * motorCdot;
			var oldMotorImpulse = this.m_motorImpulse;
			this.m_motorImpulse = b2Math.b2Clamp(this.m_motorImpulse + motorImpulse, -step.dt * this.m_maxMotorTorque, step.dt * this.m_maxMotorTorque);
			motorImpulse = this.m_motorImpulse - oldMotorImpulse;
			b1.m_angularVelocity -= b1.m_invI * motorImpulse;
			b2.m_angularVelocity += b2.m_invI * motorImpulse;
		}

		if (this.m_enableLimit && this.m_limitState != b2Joint.e_inactiveLimit)
		{
			var limitCdot = b2.m_angularVelocity - b1.m_angularVelocity;
			var limitImpulse = -this.m_motorMass * limitCdot;

			if (this.m_limitState == b2Joint.e_equalLimits)
			{
				this.m_limitImpulse += limitImpulse;
			}
			else if (this.m_limitState == b2Joint.e_atLowerLimit)
			{
				oldLimitImpulse = this.m_limitImpulse;
				this.m_limitImpulse = b2Math.b2Max(this.m_limitImpulse + limitImpulse, 0.0);
				limitImpulse = this.m_limitImpulse - oldLimitImpulse;
			}
			else if (this.m_limitState == b2Joint.e_atUpperLimit)
			{
				oldLimitImpulse = this.m_limitImpulse;
				this.m_limitImpulse = b2Math.b2Min(this.m_limitImpulse + limitImpulse, 0.0);
				limitImpulse = this.m_limitImpulse - oldLimitImpulse;
			}

			b1.m_angularVelocity -= b1.m_invI * limitImpulse;
			b2.m_angularVelocity += b2.m_invI * limitImpulse;
		}
	},


	SolvePositionConstraints: function(){

		var oldLimitImpulse;
		var limitC;

		var b1 = this.m_body1;
		var b2 = this.m_body2;

		var positionError = 0.0;

		var tMat;

		// Solve point-to-point position error.
		//var r1 = b2Math.b2MulMV(b1.m_R, this.m_localAnchor1);
		tMat = b1.m_R;
		var r1X = tMat.col1.x * this.m_localAnchor1.x + tMat.col2.x * this.m_localAnchor1.y;
		var r1Y = tMat.col1.y * this.m_localAnchor1.x + tMat.col2.y * this.m_localAnchor1.y;
		//var r2 = b2Math.b2MulMV(b2.m_R, this.m_localAnchor2);
		tMat = b2.m_R;
		var r2X = tMat.col1.x * this.m_localAnchor2.x + tMat.col2.x * this.m_localAnchor2.y;
		var r2Y = tMat.col1.y * this.m_localAnchor2.x + tMat.col2.y * this.m_localAnchor2.y;

		//b2Vec2 p1 = b1->m_position + r1;
		var p1X = b1.m_position.x + r1X;
		var p1Y = b1.m_position.y + r1Y;
		//b2Vec2 p2 = b2->m_position + r2;
		var p2X = b2.m_position.x + r2X;
		var p2Y = b2.m_position.y + r2Y;

		//b2Vec2 ptpC = p2 - p1;
		var ptpCX = p2X - p1X;
		var ptpCY = p2Y - p1Y;

		//float32 positionError = ptpC.Length();
		positionError = Math.sqrt(ptpCX*ptpCX + ptpCY*ptpCY);

		// Prevent overly large corrections.
		//b2Vec2 dpMax(b2_maxLinearCorrection, b2_maxLinearCorrection);
		//ptpC = b2Clamp(ptpC, -dpMax, dpMax);

		//float32 invMass1 = b1->m_invMass, invMass2 = b2->m_invMass;
		var invMass1 = b1.m_invMass;
		var invMass2 = b2.m_invMass;
		//float32 invI1 = b1->m_invI, invI2 = b2->m_invI;
		var invI1 = b1.m_invI;
		var invI2 = b2.m_invI;

		//b2Mat22 this.K1;
		this.K1.col1.x = invMass1 + invMass2;	this.K1.col2.x = 0.0;
		this.K1.col1.y = 0.0;					this.K1.col2.y = invMass1 + invMass2;

		//b2Mat22 this.K2;
		this.K2.col1.x =  invI1 * r1Y * r1Y;	this.K2.col2.x = -invI1 * r1X * r1Y;
		this.K2.col1.y = -invI1 * r1X * r1Y;	this.K2.col2.y =  invI1 * r1X * r1X;

		//b2Mat22 this.K3;
		this.K3.col1.x =  invI2 * r2Y * r2Y;		this.K3.col2.x = -invI2 * r2X * r2Y;
		this.K3.col1.y = -invI2 * r2X * r2Y;		this.K3.col2.y =  invI2 * r2X * r2X;

		//b2Mat22 this.K = this.K1 + this.K2 + this.K3;
		this.K.SetM(this.K1);
		this.K.AddM(this.K2);
		this.K.AddM(this.K3);
		//b2Vec2 impulse = this.K.Solve(-ptpC);
		this.K.Solve(b2RevoluteJoint.tImpulse, -ptpCX, -ptpCY);
		var impulseX = b2RevoluteJoint.tImpulse.x;
		var impulseY = b2RevoluteJoint.tImpulse.y;

		//b1.m_position -= b1.m_invMass * impulse;
		b1.m_position.x -= b1.m_invMass * impulseX;
		b1.m_position.y -= b1.m_invMass * impulseY;
		//b1.m_rotation -= b1.m_invI * b2Cross(r1, impulse);
		b1.m_rotation -= b1.m_invI * (r1X * impulseY - r1Y * impulseX);
		b1.m_R.Set(b1.m_rotation);

		//b2.m_position += b2.m_invMass * impulse;
		b2.m_position.x += b2.m_invMass * impulseX;
		b2.m_position.y += b2.m_invMass * impulseY;
		//b2.m_rotation += b2.m_invI * b2Cross(r2, impulse);
		b2.m_rotation += b2.m_invI * (r2X * impulseY - r2Y * impulseX);
		b2.m_R.Set(b2.m_rotation);


		// Handle limits.
		var angularError = 0.0;

		if (this.m_enableLimit && this.m_limitState != b2Joint.e_inactiveLimit)
		{
			var angle = b2.m_rotation - b1.m_rotation - this.m_intialAngle;
			var limitImpulse = 0.0;

			if (this.m_limitState == b2Joint.e_equalLimits)
			{
				// Prevent large angular corrections
				limitC = b2Math.b2Clamp(angle, -b2Settings.b2_maxAngularCorrection, b2Settings.b2_maxAngularCorrection);
				limitImpulse = -this.m_motorMass * limitC;
				angularError = b2Math.b2Abs(limitC);
			}
			else if (this.m_limitState == b2Joint.e_atLowerLimit)
			{
				limitC = angle - this.m_lowerAngle;
				angularError = b2Math.b2Max(0.0, -limitC);

				// Prevent large angular corrections and allow some slop.
				limitC = b2Math.b2Clamp(limitC + b2Settings.b2_angularSlop, -b2Settings.b2_maxAngularCorrection, 0.0);
				limitImpulse = -this.m_motorMass * limitC;
				oldLimitImpulse = this.m_limitPositionImpulse;
				this.m_limitPositionImpulse = b2Math.b2Max(this.m_limitPositionImpulse + limitImpulse, 0.0);
				limitImpulse = this.m_limitPositionImpulse - oldLimitImpulse;
			}
			else if (this.m_limitState == b2Joint.e_atUpperLimit)
			{
				limitC = angle - this.m_upperAngle;
				angularError = b2Math.b2Max(0.0, limitC);

				// Prevent large angular corrections and allow some slop.
				limitC = b2Math.b2Clamp(limitC - b2Settings.b2_angularSlop, 0.0, b2Settings.b2_maxAngularCorrection);
				limitImpulse = -this.m_motorMass * limitC;
				oldLimitImpulse = this.m_limitPositionImpulse;
				this.m_limitPositionImpulse = b2Math.b2Min(this.m_limitPositionImpulse + limitImpulse, 0.0);
				limitImpulse = this.m_limitPositionImpulse - oldLimitImpulse;
			}

			b1.m_rotation -= b1.m_invI * limitImpulse;
			b1.m_R.Set(b1.m_rotation);
			b2.m_rotation += b2.m_invI * limitImpulse;
			b2.m_R.Set(b2.m_rotation);
		}

		return positionError <= b2Settings.b2_linearSlop && angularError <= b2Settings.b2_angularSlop;
	},

	m_localAnchor1: new b2Vec2(),
	m_localAnchor2: new b2Vec2(),
	m_ptpImpulse: new b2Vec2(),
	m_motorImpulse: null,
	m_limitImpulse: null,
	m_limitPositionImpulse: null,

	m_ptpMass: new b2Mat22(),
	m_motorMass: null,
	m_intialAngle: null,
	m_lowerAngle: null,
	m_upperAngle: null,
	m_maxMotorTorque: null,
	m_motorSpeed: null,

	m_enableLimit: null,
	m_enableMotor: null,
	m_limitState: 0});

b2RevoluteJoint.tImpulse = new b2Vec2();
/*
* Copyright (c) 2006-2007 Erin Catto http:
*
* This software is provided 'as-is', without any express or implied
* warranty.  In no event will the authors be held liable for any damages
* arising from the use of this software.
* Permission is granted to anyone to use this software for any purpose,
* including commercial applications, and to alter it and redistribute it
* freely, subject to the following restrictions:
* 1. The origin of this software must not be misrepresented; you must not
* claim that you wrote the original software. If you use this software
* in a product, an acknowledgment in the product documentation would be
* appreciated but is not required.
* 2. Altered source versions must be plainly marked, and must not be
* misrepresented the original software.
* 3. This notice may not be removed or altered from any source distribution.
*/






var b2RevoluteJointDef = Class.create();
Object.extend(b2RevoluteJointDef.prototype, b2JointDef.prototype);
Object.extend(b2RevoluteJointDef.prototype, 
{
	initialize: function()
	{
		// The constructor for b2JointDef
		this.type = b2Joint.e_unknownJoint;
		this.userData = null;
		this.body1 = null;
		this.body2 = null;
		this.collideConnected = false;
		//

		this.type = b2Joint.e_revoluteJoint;
		this.anchorPoint = new b2Vec2(0.0, 0.0);
		this.lowerAngle = 0.0;
		this.upperAngle = 0.0;
		this.motorTorque = 0.0;
		this.motorSpeed = 0.0;
		this.enableLimit = false;
		this.enableMotor = false;
	},

	anchorPoint: null,
	lowerAngle: null,
	upperAngle: null,
	motorTorque: null,
	motorSpeed: null,
	enableLimit: null,
	enableMotor: null});

