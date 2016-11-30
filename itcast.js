(function(global) {
	var init,
		document = global.document;

	var itcast = function(selector) {
		return new itcast.fn.init(selector);
	};

	itcast.fn = itcast.prototype = {
		constructor: itcast,
		length: 0,
		get: function(index) {
			index = index - 0;
			index = index < 0 ? index + this.length : index;
			return this[index];
		},
		eq: function(index) {
			return itcast(this.get(index));
		},
		first: function() {
			return this.eq(0);
		},
		last: function() {
			return this.eq(-1);
		}
	};
	init = itcast.fn.init = function(selector) {
		// handle: null undefined '' false
		if (!selector) return this;
		// handle: string
		else if (itcast.isString(selector)) {
			// handle: html string '<p>123</p>'
			if (itcast.isHTML(selector)) {
				// 怎么存储 以伪数组对象形式存储 dom元素
				Array.prototype.push.apply(this, itcast.parseHTML(selector));
			}
			// handle: selector
			else {
				// 根据选择器获取dom元素
				var nodelist = document.querySelectorAll(selector);
				// 将结果伪数组对象 变成 真数组
				// var ret = Array.prototype.slice.call(nodelist);
				// 借调数组对象的slice方法将数组中的所有元素 以伪数组形式存储在this上
				Array.prototype.push.apply(this, nodelist);
			}
		}
		// handle: dom node
		else if (itcast.isDOM(selector)) {
			this[0] = selector;
			this.length = 1;
		}
		// handle: dom array(伪数组对象)
		else if (itcast.isArrayLike(selector)) {
			Array.prototype.push.apply(this, selector);
		}
		// handle: function
		else if (itcast.isFunction(selector)) {
			if (itcast.isReady) {
				selector();
			} else {
				if (document.addEventListener) {
					document.addEventListener('DOMContentLoaded', function() {
						selector();
						itcast.isReady = true;
					});
				} else {
					document.attachEvent('onreadystatechange', function() {
						if (document.readyState === 'complete') {
							selector();
							itcast.isReady = true;
						}
					});
				}
			}
		}
	};
	init.prototype = itcast.fn;

	itcast.extend = itcast.fn.extend = function(source, target) {
		var k;

		target = target || this;

		for (k in source) {
			target[k] = source[k];
		}
	};

	// 添加工具类方法
	itcast.extend({
		isReady: false,
		parseHTML: function(html) {
			var div = document.createElement('div'),
				ret = [];
			div.innerHTML = html;

			for (var elem = div.firstChild; elem; elem = elem.nextSibling) {
				if (elem.nodeType === 1) ret.push(elem);
			}

			return ret;
		},
		each: function(obj, callback) {
			var i = 0,
				l = obj.length;
			// 遍历数组元素
			for (; i < l; i++) {
				// 执行用户指定回调函数
				// 将当前遍历到的元素以及索引传入回调函数
				if (callback.call(obj[i], obj[i], i) === false) break;
			}
		}
	});
	// 类型判断方法
	itcast.extend({
		// 判断是否为字符串类型
		isString: function(obj) {
			// 如果为null或undefined，返回false
			// 如果typeof值为string，返回true否则返回false。
			return typeof obj === 'string';
		},
		isHTML: function(obj) {
			return !!obj && obj.charAt(0) === '<' &&
				obj.charAt(obj.length - 1) === '>' &&
				obj.length >= 3;
		},
		isDOM: function(obj) {
			return !!obj && !!obj.nodeType;
		},
		isFunction: function(obj) {
			return typeof obj === 'function';
		},
		isGlobal: function(obj) {
			return !!obj && obj.window === obj;
		},
		isArrayLike: function(obj) { // {length: 0} {2:p,length: 3}
			var _type = Object.prototype.toString.call(obj).slice(8, -1).toLowerCase(),
				length = !!obj && 'length' in obj && obj.length;
			// 过滤 window对象和函数对象
			if (itcast.isFunction(obj) || itcast.isGlobal(obj)) return false;
			return _type === 'array' || length === 0 ||
				typeof length === 'number' && length > 0 && (length - 1) in obj;
		}
	});

	// css样式模块
	itcast.fn.extend({
		// 提供给itcast对象调用的
		// 遍历this
		each: function(callback) {
			itcast.each(this, callback);
			// 实现链式编程
			// 返回方法的调用者
			return this;
		}
	});
	itcast.fn.extend({
		hasClass: function(className) {
			// 默认结果false
			var ret = false;
			// 遍历this上的每一个dom元素					
			// for(var i = 0, l = this.length;i < l;i++){
			// 	// 如果当前dom元素具有指定的样式类
			// 	// 返回值为true，结束循环
			// if((' ' + this[i].className + ' ')
			// 	.indexOf(' ' + className + ' ') !== -1) {
			// 	ret = true;
			// 	break;
			// }
			// }
			this.each(function(v) {
				if ((' ' + v.className + ' ')
					.indexOf(' ' + className + ' ') !== -1) {
					ret = true;
					return false;
				}
			});

			return ret;
		},
		css: function(name, value) {
			// 只传入一个参数
			if (value == undefined) {
				// 如果name类型为对象，同时设置多个样式
				if (typeof name === 'object') {
					// 遍历this上的每一个dom元素
					this.each(function(v) {
						// 枚举name上的每个属性值
						for (var k in name) {
							// 给当前遍历到的dom元素设置样式
							v.style[k] = name[k];
						}
					});
				} else { // 如果name不为对象
					// 默认获取this上的第一个dom元素的指定样式值
					// 如果浏览器支持getComputedStyle，使用该方法获取指定样式值
					// if(window.getComputedStyle){
					// 	return window.getComputedStyle(this[0])[name];
					// } else { //否则使用currentStyle获取
					// 	return this[0].currentStyle[name];
					// }
					// 如果this上没有任何dom元素， 就返回null
					if (!this[0]) return null;
					return global.getComputedStyle ?
						global.getComputedStyle(this[0])[name] :
						this[0].currentStyle[name];

				}
			} else { // 如果传入两个参数
				this.each(function(v) {
					v.style[name] = value;
				});
			}
			// 实现链式编程
			return this;
		},
		addClass: function(className) {
			// 遍历this上的每一个dom元素，并实现链式编程
			return this.each(function(v) {
				// 判断当前dom元素v是否具有className
				// 如果不具有，给其添加指定的样式类
				if (!itcast(v).hasClass(className)) {
					v.className += ' ' + className;
				}
			});
		},
		removeClass: function(className) {
			// 遍历this上的每一个dom元素，并实现链式编程
			return this.each(function(v) {
				// 删除当前dom元素的样式类className
				v.className = (' ' + v.className + ' ').
				replace(' ' + className + ' ', ' ');
			});
		}
	});

	// 属性模块
	itcast.propFix = {
		'for': 'htmlFor',
		'class': 'className'
	};
	itcast.each([
		"tabIndex",
		"readOnly",
		"maxLength",
		"cellSpacing",
		"cellPadding",
		"rowSpan",
		"colSpan",
		"useMap",
		"frameBorder",
		"contentEditable"
	], function() {
		itcast.propFix[this.toLowerCase()] = this;
	});
	console.log(itcast.propFix);
	itcast.fn.extend({
		attr: function(name, value) {
			// 只传入一个参数
			if (value == undefined) {
				// 如果类型为 对象，表示设置多个属性
				if (typeof name === 'object') {
					// 遍历itcast上的每一个dom元素，并设置属性节点值
					this.each(function(v) {
						// 枚举name对象上每一个属性
						for (var k in name) {
							v.setAttribute(k, name[k]);
						}
					});
				} else { // 如果类型为 字符串，获取属性节点值
					if (!this[0]) return null;
					return this[0].getAttribute(name);
				}
			} else { // 传入两个参数，表示设置单个属性节点值
				this.each(function(v) {
					v.setAttribute(name, value);
				});
			}
			// 实现链式编程
			return this;
		},
		html: function(html) {
			// 如果没有给html传入值，表示获取
			if (html == undefined) {
				// 如果itcast对象没有任何dom元素，就返回一个期望值 即空字符串
				// 如果有的话，就返回第一个dom元素的innerHTML属性值
				return this[0] ? this[0].innerHTML : '';
			} else { // 如果给html传值。给itcast对象上每一个dom元素设置innerHTML属性
				return this.each(function(v) {
					v.innerHTML = html;
				});
			}
		},
		text: function(text) {
			// 如果没有传值，表示获取文本值
			if (text == undefined) {
				// 定义结果变量，存储每个dom元素的文本
				var ret = '';
				// 遍历每一个dom元素
				this.each(function(v) {
					// 如果支持textContent，使用其获取文本，累加到ret上
					ret += 'textContent' in document ?
						v.textContent :
						v.innerText.replace(/\r\n/g, '');
				});
				// 返回所有文本
				return ret;
			} else { // 如果传值了，表示为每个dom设置文本
				return this.each(function(v) {
					// 如果支持textContent，就使用该属性为当前dom元素设置文本节点值
					// 否则，使用innerText设置文本节点值。
					if ('textContent' in document) {
						v.textContent = text;
					} else {
						v.innerText = text;
					}
				});
			}
		},
		val: function(value) {
			// 如果没有传值，表示获取第一个dom元素的value属性值
			// 如果itcast对象上没有任何dom元素，返回空字符串
			if (value == undefined) {
				return this[0] ? this[0].value : '';
			} else { // 否则，为每一个dom元素设置value属性值
				return this.each(function() {
					this.value = value;
				});
			}
		},
		prop: function(name, value) {
			// 如果没有给value传值
			var prop;
			if (value == undefined) {
				// 并且name的类型为 对象，表示给每一个dom对象添加多个属性
				if (typeof name === 'object') {
					this.each(function() {
						for (var k in name) {
							// 首先从propFix对象上获取属性名字
							// 如果有，就使用新的属性名字
							// 如果没有，就使用原来的属性名字
							prop = itcast.propFix[k] ? itcast.propFix[k] : k;
							this[prop] = name[k];
						}
					});
				} else { // 如果name的类型 为字符串，表示获取第一个dom对象的指定属性值
					prop = itcast.propFix[name] ? itcast.propFix[name] : name;
					return this.length > 0 ? this[0][prop] : null;
				}
			} else { // 如果传入两个参数，表示给每一个dom对象添加单个属性
				// 遍历itcast上的每一个dom对象，添加属性
				prop = itcast.propFix[name] ? itcast.propFix[name] : name;
				this.each(function() {
					this[prop] = value;
				});
			}
			// 实现链式编程
			return this;
		}
	});

	// dom操作模块
	itcast.extend({
		unique: function(arr) {
			// 存储去重后的结果
			var ret = [];
			// 遍历原数组arr
			itcast.each(arr, function() {
				// 判断ret是否存在当前遍历到的元素
				// 如果不存在将其添加到ret中
				if (ret.indexOf(this) === -1) ret.push(this);
			});
			// 将ret返回
			return ret;
		}
	});
	itcast.fn.extend({
		appendTo: function(target) {
			var node,
				ret = [];
			// 统一target类型 为itcast对象（为了方便操作）
			target = itcast(target);
			// 遍历this上的每一个dom元素
			this.each(function(v) {
				// 在遍历目标dom元素
				target.each(function(t, i) {
					// 如果当前dom元素为 目标上的第一个.不拷贝节点
					// 否则拷贝节点
					node = i === 0 ? v : v.cloneNode(true);
					// 将被追加的节点,添加到ret内
					ret.push(node);
					// 将节点追加到指定的目标dom元素上.
					t.appendChild(node);
				});
			});
			// 将每一个添加的dom元素,转换成itcast对象返回,实现链式编程
			// 原因:在添加样式时,如果不这样做的话,只会给没克隆的节点添加样式.
			return itcast(ret);
		},
		append: function(source) {
			source = itcast(source);
			source.appendTo(this);
			return this;
		},
		prependTo: function(target) {
			var node,
				firstChild,
				self = this,
				ret = [];

			target = itcast(target);
			// 遍历target上的每一个目标dom元素
			target.each(function(elem, i) {
				// 缓存当前目标dom元素的第一个子节点
				firstChild = elem.firstChild;
				// 在遍历this上的每一个dom元素
				self.each(function(dom) {
					// 判断是否目标上第一个dom元素
					// 如果是，不需要克隆节点
					// 否则需要深克节点
					// 将得到的节点赋值给node
					node = i === 0 ? dom : dom.cloneNode(true);
					// 将上面得到的节点添加到ret中
					ret.push(node);
					// 使用insertBefor给当前目标元素，在firstChild添加node节点
					elem.insertBefore(node, firstChild);
				});
			});

			return itcast(ret);
		},
		prepend: function(source) {
			source = itcast(source);
			source.prependTo(this);
			return this;
		},
		next: function() {
			// 存储所用dom的下一个兄弟元素
			var ret = [];
			// 遍历this上的所有dom元素
			this.each(function() {
				// 在遍历当前dom元素下面所有的兄弟元素
				for (var node = this.nextSibling; node; node = node.nextSibling) {
					// 如果当前兄弟节点,为元素节点
					// 即为结果,将其添加ret内,并结束循环
					if (node.nodeType === 1) {
						ret.push(node);
						break;
					}
				}
			});
			// 将ret转换成itcast对象,返回
			return itcast(ret);
		},
		nextAll: function() {
			var ret = [],
				node;
			this.each(function() {
				for (node = this.nextSibling; node; node = node.nextSibling) {
					if (node.nodeType === 1) ret.push(node);
				}
			});

			return itcast(itcast.unique(ret));
		},
		before: function(source) {
			var node;
			source = itcast(source);
			this.each(function(dom, i) {
				source.each(function(elem) {
					node = i === 0 ? elem : elem.cloneNode(true);
					// 获取dom的父节点，调用insertBefore方法在dom前添加新的子节点node
					dom.parentNode.insertBefore(node, dom);
				});
			});
			return this;
		},
		after: function(source) {
			var node,
				nextSibling;
			source = itcast(source);
			this.each(function(dom, i) {
				nextSibling = dom.nextSibling;
				source.each(function(elem) {
					node = i === 0 ? elem : elem.cloneNode(true);
					// 获取dom的父节点，调用insertBefore方法在dom前添加新的子节点node
					dom.parentNode.insertBefore(node, nextSibling);
				});
			});
			return this;
		},
		remove: function() {
			return this.each(function() {
				this.parentNode.removeChild(this);
			});
		},
		prev: function() {
			var ret = [],
				node;

			this.each(function() {
				for (node = this.previousSibling; node; node = node.previousSibling) {
					if (node.nodeType === 1) {
						ret.push(node);
						break;
					}
				}
			});

			return itcast(ret);
		},
		prevAll: function() {
			var ret = [],
				node;

			this.each(function() {
				for (node = this.previousSibling; node; node = node.previousSibling) {
					if (node.nodeType === 1) {
						ret.push(node);
					}
				}
			});

			return itcast(itcast.unique(ret));
		},
		empty: function() {
			return this.each(function() {
				this.innerHTML = '';
			});
		}
	});

	// 兼容数组对象的indexOf方法
	(function() {
		// 如果浏览器不支持indexOf方法
		// 那么就给数组对象的原型添加indexOf方法
		if (!Array.prototype.indexOf) {
			Array.prototype.indexOf = function(val) {
				// 遍历this
				for (var i = 0, l = this.length; i < l; i++) {
					// 如果遍历到的当前元素和val相同，返回其索引值
					if (this[i] == val) return i;
				}
				// 表示具有指定val元素，返回 -1 
				return -1;
			};
		}
	}());

	// 提前返回
	var addEvent = function() {
		// 如果符合W3C标准，使用addEvnetListener绑定事件
		if (global.addEventListener) {
			return function(elem, type, callback, useCapture) {
				elem.addEventListener(type, callback, useCapture || false);
			};
		} else { // 否则就使用IE标准的 attachEvent绑定事件
			return function(elem, type, callback) {
				elem.attachEvent('on' + type, callback);
			};
		}
	}();

	var removeEvent = function() {
		if (global.removeEventListener) {
			return function(elem, type, callback) {
				elem.removeEventListener(type, callback);
			};
		} else {
			return function(elem, type, callback) {
				elem.detachEvent('on' + type, callback);
			};
		}
	}();

	// 事件模块
	itcast.fn.extend({
		on: function(type, callback, capture) {
			return this.each(function() {
				addEvent(this, type, callback, capture);
			});
		}
	});
	itcast.each(['click', 'dblclick', 'keypress', 'keyup', 'keydown', 'mouseover', 'mouseout',
		'mouseenter', 'mouseleave', 'mousemove', 'mouseup', 'mousedown'], function(type) {
			itcast.fn[type] = function(callback, capture) {
				return this.on(type, callback, capture);
				
			};
		});

	global.$ = global.itcast = itcast;
}(window));