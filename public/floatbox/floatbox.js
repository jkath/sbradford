function Floatbox() {
this.defaultOptions = {

/***** BEGIN OPTIONS CONFIGURATION *****/
// see docs/options.html for detailed descriptions

/*** <General Options> ***/
theme:          'auto'   ,// 'auto'|'black'|'white'|'blue'|'yellow'|'red'|'custom'
padding:         12      ,// pixels
panelPadding:    8       ,// pixels
outerBorder:     4       ,// pixels
innerBorder:     1       ,// pixels
overlayOpacity:  55      ,// 0-100
upperOpacity:    60      ,// 0-100
dropShadow:      true    ,// true|false
autoSizeImages:  true    ,// true|false
autoSizeOther:   false   ,// true|false
resizeImages:    true    ,// true|false
resizeOther:     false   ,// true|false
resizeTool:     'cursor' ,// 'cursor'|'topleft'|'both'
showCaption:     true    ,// true|false
showItemNumber:  true    ,// true|false
showClose:       true    ,// true|false
hideFlash:       true    ,// true|false
hideJava:        true    ,// true|false
disableScroll:   false   ,// true|false
enableCookies:   false   ,// true|false
cookieScope:    'site'   ,// 'site'|'folder'
/*** </General Options> ***/

/*** <Navigation Options> ***/
navType:            'both'  ,// 'upper'|'lower'|'both'|'none'
upperNavWidth:       35     ,// 0-50
upperNavPos:         20     ,// 0-100
showUpperNav:       'never' ,// 'always'|'once'|'never'
showHints:          'once'  ,// 'always'|'once'|'never'
enableWrap:          true   ,// true|false
enableKeyboardNav:   true   ,// true|false
outsideClickCloses:  true   ,// true|false
/*** </Navigation Options> ***/

/*** <Animation Options> ***/
doAnimations:         true  ,// true|false
resizeDuration:       3.5   ,// 0-10
imageFadeDuration:    3.5   ,// 0-10
overlayFadeDuration:  4     ,// 0-10
startAtClick:         true  ,// true|false
zoomImageStart:       true  ,// true|false
liveImageResize:      true  ,// true|false
/*** </Animation Options> ***/

/*** <Slideshow Options> ***/
slideInterval:  4.5    ,// seconds
endTask:       'exit'  ,// 'stop'|'exit'|'loop'
showPlayPause:  true   ,// true|false
startPaused:    false  ,// true|false
pauseOnResize:  true   ,// true|false
pauseOnPrev:    true   ,// true|false
pauseOnNext:    false  ,// true|false
/*** </Slideshow Options> ***/

/*** <Configuration Settings> ***/
preloadAll:     true     ,// true|false
language:      'auto'    ,// 'auto'|'en'|... (see the languages folder)
graphicsType:  'auto'    ,// 'auto'|'international'|'english'
urlGraphics:   '/floatbox/graphics/'    ,// change this if you install in another folder
urlLanguages:  '/floatbox/languages/'  };// change this if you install in another folder
/*** </Configuration Settings> ***/

/*** <New Child Window Options> ***/
// Will inherit from the primary floatbox defaultOptions unless overridden here.
// Add any you like.
this.childOptions = {
overlayOpacity:      45,
resizeDuration:       3,
imageFadeDuration:    3,
overlayFadeDuration:  3
};
/*** </New Child Window Options> ***/

/***** END OPTIONS CONFIGURATION *****/
this.init();
}
Floatbox.prototype = {
init: function() {
	this.win = top;
	this.doc = this.win.document;
	this.bod = this.doc.body;
	this.html = this.doc.documentElement;
	this.items = [];
	this.nodeNames = [];
	this.hiddenEls = [];
	this.timeouts = {};
	this.pos = {};
	this.lowerPanelSpace = 24;
	this.showHintsTime = 1600;
	this.zoomPopBorder = 1;
	this.controlSpacing = 8;
	this.ctrlJump = 5;
	this.slowLoadDelay = 1250;
	this.loaderDelay = 200;
	this.shadowSize = 8;
	this.loadingImgSize = 42;
	var folder = this.defaultOptions.urlGraphics;
	this.slowZoomImg = folder + 'loading_white.gif';
	this.slowLoadImg = folder + 'loading_black.gif';
	this.iframeSrc = folder + 'loading_iframe.html';
	this.resizeUpCursor = folder + 'magnify_plus.cur';
	this.resizeDownCursor = folder + 'magnify_minus.cur';
	this.notFoundImg = folder + '404.jpg';
	this.defaultWidth = 500;
	this.defaultHeight = 500;
	this.minInfoWidth = 80;
	if (!(this.isChild = !!(this.win.floatbox && this.win.floatbox.fbBox))) {
		this.lastChild = this;
		this.anchors = [];
		this.children = [];
		this.content = {};
		this.preloads = {};
		this.preloads.count = 0;
		this.saveReplace = top.location.replace;
		this.xhr = this.getXMLHttpRequest();
		this.strings = {
			hintClose:   'Exit (key: Esc)',
			hintPrev:    'Previous (key: <--)',
			hintNext:    'Next (key: -->)',
			hintPlay:    'Play (key: spacebar)',
			hintPause:   'Pause (key: spacebar)',
			hintResize:  'Resize (key: Tab)',
			imgCount:    'Image %1 of %2',
			nonImgCount: 'Page %1 of %2',
			mixedCount:  '(%1 of %2)',
			infoText:    'Info...'
		};
		this.rex = {
			fbxd: /^(floatbox|gallery|iframe|slideshow|lytebox|lyteshow|lyteframe|lightbox)/i,
			single: /^(floatbox|gallery|iframe|lytebox|lyteframe|lightbox)$/i,
			type: /\btype\s*[:=]\s*(\w+?)\b/i,
			img: /\.(jpg|jpeg|png|gif|bmp)(\?|$)/i,
			ajax: /\btype\s*[:=]\s*ajax\b/i,
			div: /#(\w+)/,
			flash: /\.swf(\?|$)/i,
			youtube: /^(http:)?\/\/(www.)?youtube.com\/v\//i,
			quicktime: /\.(mov|mpg|mpeg|movie)(\?|$)/i,
			popup: /(^|\s)fbPopup(\s|$)/i,
			backQuote: /`([^`]*?)`/g,
			cookie: /fbOptions=(.+?)(;|$)/,
			validTheme: /^(auto|black|white|blue|yellow|red|custom)$/,
			validNav: /^(upper|lower|both|none)$/i,
			slideshow: /^(slideshow|lyteshow)/i,
			upperNav: /upper|both/i,
			lowerNav: /lower|both/i,
			WH: /\b(width|height)\b/i
		};
	} else {
		this.anchors = fb.anchors;
		this.children = fb.children;
		this.content = fb.content;
		this.xhr = fb.xhr;
		this.strings = fb.strings;
		this.rex = fb.rex;
		fb.lastChild = this;
		this.children.push(this);
	}
	if (window.opera) {
		this.opera = true;
		this.operaOld = !document.getElementsByClassName;
	} else if (document.all) {
		this.ie = true;
		this.ieOld = parseInt(navigator.appVersion.substr(navigator.appVersion.indexOf('MSIE') + 5), 10) < 7;
		this.ie8b2 = window.postMessage && navigator.appMinorVersion === 'beta 2';
		this.ieXP = parseInt(navigator.appVersion.substr(navigator.appVersion.indexOf('Windows NT') + 11), 10) < 6;
	} else if (navigator.userAgent.indexOf('Firefox') !== -1) {
		this.ff = true;
		this.ffOld = !document.getElementsByClassName;
		this.ffNew = !this.ffOld;
	}
	this.browserLanguage = (navigator.language || navigator.userLanguage || navigator.systemLanguage || navigator.browserLanguage || 'en').substring(0, 2);
	if (!this.isChild) {
		var lang = this.defaultOptions.language;
		if (lang === 'auto') lang = this.browserLanguage;
		if (this.xhr) {
			var that = this;
			this.xhr.getResponse(this.defaultOptions.urlLanguages + lang + '.json', function(xhr) {
				if ((xhr.status === 200 || xhr.status === 203 || xhr.status === 304) && xhr.responseText) {
					var text = xhr.responseText;
					if (that.ieXP) {
						text = text.replace(String.fromCharCode(8592), '<--').replace(String.fromCharCode(8594), '-->');
					}
					try {
						var obj = eval('(' + text + ')');
						if (obj && obj.hintClose) that.strings = obj;
					} catch(e) {}
				}
			});
		}
	}
	if (this.defaultOptions.graphicsType.toLowerCase() === 'english' || (this.defaultOptions.graphicsType === 'auto' && this.browserLanguage === 'en')) {
		this.offPos = 'top left';
		this.onPos = 'bottom left';
	} else {
		this.offPos = 'top right';
		this.onPos = 'bottom right';
		this.controlSpacing = 0;
	}
	this.zIndex = {
		base: 90000 + 10*this.children.length,
		fbOverlay: 1,
		fbBox: 3,
		fbDiv: 4,
		fbLeftNav: 5,
		fbRightNav: 5,
		fbUpperPrev: 6,
		fbUpperNext: 6,
		fbResizer: 7,
		fbZoomDiv: 8
	};
	var rex = /\bautoStart=(.+?)(?:&|$)/i,
		match = rex.exec(this.win.location.search);
	this.autoHref = match ? match[1] : false;
},
tagAnchors: function(baseEl) {
	var anchors = baseEl.getElementsByTagName('a');
	for (var i = 0, len = anchors.length; i < len; i++) {
		this.tagOneAnchor(anchors[i]);
	}
	var anchors = baseEl.getElementsByTagName('area');
	for (var i = 0, len = anchors.length; i < len; i++) {
		this.tagOneAnchor(anchors[i]);
	}
},
tagOneAnchor: function(anchor) {
	var that = this,
		isAnchor = !!anchor.getAttribute,
		a, thumb, popup;
	if (isAnchor) {
		a = {
			href: anchor.href || anchor.getAttribute('href'),
			rel: anchor.getAttribute('rel'),
			rev: anchor.getAttribute('rev'),
			title: anchor.getAttribute('title'),
			anchor: anchor
		};
		if (isAnchor && (popup = this.rex.popup.test(anchor.className))) {
			if ((thumb = this.getThumb(anchor))) {
				a.popup = true;
				thumb.style.borderWidth = this.zoomPopBorder + 'px';
				anchor.onmouseover = function () {
					thumb.style.display = 'none';
					var aPos = that.getLeftTop(this, true),
						aLeft = aPos.left,
						aTop = aPos.top;
					aPos = that.getLayout(this);
					thumb.style.display = '';
					var relLeft = (aPos.width - thumb.offsetWidth)/2,
						relTop = -(thumb.offsetHeight - 2),
						scroll = that.getScroll(),
						screenRight = scroll.left + that.getDisplayWidth(),
						screenTop = scroll.top;
					var spill = aPos.left + relLeft + thumb.offsetWidth - screenRight;
					if (spill > 0) relLeft -= spill;
					var spill = aPos.left + relLeft - scroll.left;
					if (spill < 0) relLeft -= spill;
					if (aPos.top + relTop < screenTop) relTop = aPos.height;
					thumb.style.left = (aLeft + relLeft) + 'px';
					thumb.style.top = (aTop + relTop) + 'px';
				};
				anchor.onmouseout = function () {
					thumb.style.left = '-9999px';
					thumb.style.top = '0';
				};
			}
		}
	} else {
		a = anchor;
	}
	if (this.rex.fbxd.test(a.rel)) {
		if (isAnchor) {
			anchor.onclick = function() {
				fb.start(this);
				return false;
			};
		}
		a.revOptions = this.parseOptionString(a.rev);
		a.level = this.children.length + (fb.lastChild.fbBox && !a.revOptions.sameBox ? 1 : 0);
		var a_i, i = this.anchors.length;
		while (i--) {
			a_i = this.anchors[i];
			if (a_i.href === a.href && a_i.rel === a.rel && a_i.rev === a.rev && a_i.title === a.title && a_i.level === a.level) {
				a_i.anchor = anchor;
				break;
			}
		}
		if (i === -1) {
			this.rex.type.lastIndex = 0;
			var match = this.rex.type.exec(a.rev),
				typeOverride = match ? match[1].toLowerCase() : '';
			if (typeOverride === 'img' || this.rex.img.test(a.href)) {
				a.type = 'img';
			} else if (typeOverride === 'flash' || this.rex.flash.test(a.href) || this.rex.youtube.test(a.href)) {
				a.type = 'flash';
				this.content[a.href] = this.objectHTML(a.href, 'flash');
			} else if (typeOverride === 'quicktime' || this.rex.quicktime.test(a.href)) {
				a.type = 'quicktime';
				this.content[a.href] = this.objectHTML(a.href, 'quicktime');
			} else if (typeOverride === 'ajax') {
				a.type = 'ajax';
			} else {
				this.rex.div.lastIndex = 0;
				var match = this.rex.div.exec(a.href);
				if (match) {
					var doc = this.doc;
					if (a.anchor) {
						doc = a.anchor.ownerDocument || a.anchor.document || this.doc;
					}
					if (doc === this.doc && this.currentItem && this.currentItem.anchor) {
						doc = this.currentItem.anchor.ownerDocument || this.currentItem.anchor.document || this.doc;
					}
					var el = doc.getElementById(match[1]);
					if (el) {
						a.type = 'inline';
						this.content[a.href] = el.cloneNode(true);
					} else {
						a.type = 'iframe';
					}
				} else {
					a.type = 'iframe';
				}
			}
			this.anchors.push(a);
			if (this.autoHref) {
				if (this.autoHref === a.href.substr(a.href.length - this.autoHref.length)) this.autoStart = a;
			} else {
				if (a.revOptions.autoStart) this.autoStart = a;
			}
		}
	}
	return a;
},
objectHTML: function(href, type) {
	if (type === 'flash') {
		var classid = 'classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000"',
			mime = 'type="application/x-shockwave-flash"',
			pluginurl = 'http://www.macromedia.com/go/getflashplayer/',
			match = /\bwmode=(\w+?)\b/i.exec(href),
			wmode = match ? match[1] : 'opaque',
			match = /\bbgcolor=(#\w+?)\b/i.exec(href),
			bgcolor = match ? match[1] : '',
			match = /\bscale=(\w+?)\b/i.exec(href),
			scale = match ? match[1] : 'exactfit',
			params = { wmode:wmode, bgcolor:bgcolor, scale:scale, quality:'high',
			flashvars:'autoplay=1&amp;ap=true&amp;border=0&amp;rel=0' };
		if (this.ff) params.wmode = this.ffOld ? 'opaque' : 'window';
	} else {
		var classid = 'classid="clsid:02BF25D5-8C17-4B23-BC80-D3488ABDDC6B"',
			mime = 'type="video/quicktime"',
			pluginurl = 'http://www.apple.com/quicktime/download/',
			params = { autoplay:'true', controller:'true', showlogo:'false', scale:'tofit' };
	}
	var html = '<object id="fbObject" width="%width%" height="%height%" ';
	if (this.ie) {
		html += classid + '>';
		params.src = this.encodeHTML(href);
	} else {
		html += mime + ' data="' + this.encodeHTML(href) + '">';
	}
	for (var name in params) {
		if (params.hasOwnProperty(name)) {
			html += '<param name="' + name + '" value="' + params[name] + '" />';
		}
	}
	html += '<p style="color:#000; background:#fff; margin:1em; padding:1em;">' +
	(type === 'flash' ? 'Flash' : 'QuickTime') + ' player is required to view this content.' +
	'<br /><a href="' + pluginurl + '">download player</a></p></object>';
	return html;
},
preloadImages: function(href, chain) {
	if (this !== fb) return fb.preloadImages(href, chain);
	var that = this;
	if (typeof chain !== 'undefined') arguments.callee.chain = chain;
	if (!href && arguments.callee.chain && (this.defaultOptions.preloadAll || !this.preloads.count)) {
		for (var i = 0, len = this.anchors.length; i < len; i++) {
			var a = this.anchors[i];
			if (a.type === 'img' && !this.preloads[a.href]) {
				href = a.href;
				break;
			}
		}
	}
	if (href) {
		if (this.preloads[href]) {
			this.preloadImages();
		} else {
			var img = this.preloads[href] = new Image();
			img.onerror = function() {
				setTimeout(function() { that.preloadImages(); }, 50);
				that.preloads[href] = true;
			};
			img.onload = function() {
				that.preloads.count++;
				this.onerror();
			};
			img.src = href;
		}
	}
},
start: function(anchor) {
	if (this !== fb.lastChild) return fb.lastChild.start(anchor);
	var that = this;
	this.preloadImages('', false);
	if (anchor.getAttribute) {
		var a = {
			href: anchor.href || anchor.getAttribute('href'),
			rel: anchor.getAttribute('rel'),
			rev: anchor.getAttribute('rev'),
			title: anchor.getAttribute('title')
		};
		a.revOptions = this.parseOptionString(a.rev);
		anchor.blur();
	} else {
		var a = anchor;
	}
	this.isRestart = !!this.fbBox;
	if (this.isRestart) {
		if (!a.revOptions.sameBox) return new Floatbox().start(anchor);
		this.setOptions(a.revOptions);
	} else {
		this.clickedAnchor = anchor.getAttribute ? anchor : false;
		top.location.replace = function() { return false; };
	}
	a.level = this.children.length + (fb.lastChild.fbBox && !a.revOptions.sameBox ? 1 : 0);
	this.itemsShown = 0;
	fb.previousAnchor = this.currentItem;
	this.buildItemArray(a);
	if (!this.itemCount) return;
	if (this.itemCount === 1 && this.fbLowerNav) this.fbLowerNav.style.display = 'none';
	this.win.focus();
	this.revOptions = a.revOptions;
	if (!this.isRestart) {
		this.getOptions();
		this.buildDOM();
		this.addEventHandlers();
		this.initState();
	}
	this.collapse();
	this.updateInfoPanel();
	if (this.fbBox.style.visibility  || this.isRestart) {
		this.fetchContent(function() { that.calcSize(); });
	} else {
		var oncomplete = function() {
			that.fetchContent(function() {
				that.clearTimeout('slowLoad');
				var zoomDiv = that.fbZoomDiv.style;
				zoomDiv.display = 'none';
				that.fbZoomImg.src = '';
				that.fbZoomImg.width = that.fbZoomImg.height = 0;
				zoomDiv.left = zoomDiv.top = zoomDiv.width = zoomDiv.height = '0';
				that.calcSize();
			} );
		};
		this.fadeOpacity(this.fbOverlay, this.overlayOpacity, this.overlayFadeDuration, oncomplete);
	}
},
buildItemArray: function(a) {
	this.itemCount = this.items.length = this.currentIndex = 0;
	this.justImages = true;
	var isSingle = this.rex.single.test(a.rel);
	for (var i = 0, len = this.anchors.length; i < len; i++) {
		var a_i = this.anchors[i];
		if (a_i.rel === a.rel && a_i.level === a.level) {
			if (a_i.revOptions.showThis !== false) {
				var isMatch = a_i.rev === a.rev && a_i.title === a.title && a_i.href === a.href.substr(a.href.length - a_i.href.length);
				if (isMatch || !isSingle) {
					a_i.seen = false;
					this.items.push(a_i);
					if (a_i.type !== 'img') this.justImages = false;
					if (isMatch) this.currentIndex = this.items.length - 1;
				}
			}
		}
	}
	if (a.revOptions.showThis === false && a.href) {
		i = this.items.length;
		while (i--) {
			var href = this.items[i].href;
			if (href === a.href.substr(a.href.length - href.length)) {
				this.currentIndex = i;
			}
		}
	}
  	this.itemCount = this.items.length;
  	this.currentItem = this.items[this.currentIndex];
},
getOptions: function() {
	if (this.isChild) {
		var par = this.children[this.children.length - 2] || fb;
		for (var name in this.defaultOptions) {
			if (this.defaultOptions.hasOwnProperty(name)) this[name] = par[name];
		}
		this.setOptions(this.childOptions, true);
	} else {
		this.setOptions(this.defaultOptions, true);
	}
	this.doSlideshow = this.loadPageOnClose = this.sameBox = false;
	if (!(this.isChild || this.fbBox)) {
		if (typeof this.win.setFloatboxOptions === 'function') this.win.setFloatboxOptions();
		if (this.enableCookies) {
			this.rex.cookie.lastIndex = 0;
			var match = this.rex.cookie.exec(this.doc.cookie);
			if (match) this.setOptions(this.parseOptionString(match[1]));
			var strOptions = '';
			for (var name in this.defaultOptions) {
				if (this.defaultOptions.hasOwnProperty(name)) {
					strOptions += ' ' + name + ':' + this[name];
				}
			}
			var strPath = '/';
			if (this.cookieScope === 'folder') {
				strPath = this.win.location.pathname;
				strPath = strPath.substring(0, strPath.lastIndexOf('/') + 1);
			}
			this.doc.cookie = 'fbOptions=' + strOptions + '; path=' + strPath;
		}
	}
	this.setOptions(this.revOptions);
	this.setOptions(this.parseOptionString(this.win.location.search.substring(1)));
	if (this.theme === 'grey') this.theme = 'white';
	if (this.endTask === 'cont') this.endTask = 'loop';
	if (!this.rex.validTheme.test(this.theme)) this.theme='auto';
	if (!this.rex.validNav.test(this.navType)) this.navType = 'lower';
	this.isSlideshow = this.itemCount > 1 && (this.rex.slideshow.test(this.currentItem.rel) || this.doSlideshow);
	this.isPaused = this.startPaused;
	if ((this.lclTheme = this.theme) === 'auto') {
		this.lclTheme = this.currentItem.type === 'img' ? 'black' : /flash|quicktime/.test(this.currentItem.type) ? 'blue' : 'white';
	}
	if (!this.doAnimations) {
		this.resizeDuration = this.imageFadeDuration = this.overlayFadeDuration = 0;
	}
	if (!this.resizeDuration) this.zoomImageStart = false;
	if (this.ieOld) this.dropShadow = false;
	this.overlayOpacity /= 100;
	this.upperOpacity /= 100;
	this.upperNav = this.itemCount > 1 && this.justImages && this.rex.upperNav.test(this.navType);
	this.lowerNav = this.itemCount > 1 && (this.rex.lowerNav.test(this.navType) || (!this.justImages && this.rex.upperNav.test(this.navType)));
},
parseOptionString: function(str) {
	if (!str) return {};
	var quotes = [], match;
	this.rex.backQuote.lastIndex = 0;
	while ((match = this.rex.backQuote.exec(str))) quotes.push(match[1]);
	if (quotes.length) str = str.replace(this.rex.backQuote, '``');
	str = str.replace(/\s*[:=]\s*/g, ':');
	str = str.replace(/\s*[;&]\s*/g, ' ');
	str = str.replace(/^\s+|\s+$/g, '');
	var pairs = {},
		aVars = str.split(' '),
		i = aVars.length;
	while (i--) {
		var aThisVar = aVars[i].split(':'),
			name = aThisVar[0],
			value = aThisVar[1];
		if (typeof value === 'string') {
			if (!isNaN(value)) value = +value;
			else if (value === 'true') value = true;
			else if (value === 'false') value = false;
		}
		if (value === '``') value = quotes.pop() || '';
		pairs[name] = value;
	}
	return pairs;
},
setOptions: function(pairs, quick) {
	for (var name in pairs) {
		if (pairs.hasOwnProperty(name)) this[name] = pairs[name];
	}
},
buildDOM: function() {
	this.fbOverlay		= this.newNode('div', 'fbOverlay', this.bod);
	this.fbZoomDiv		= this.newNode('div', 'fbZoomDiv', this.bod);
	this.fbZoomImg		= this.newNode('img', 'fbZoomImg', this.fbZoomDiv);
	this.fbBox			= this.newNode('div', 'fbBox');
	this.fbShadowRight	= this.newNode('div', 'fbShadowRight', this.fbBox);
	this.fbShadowBottom	= this.newNode('div', 'fbShadowBottom', this.fbBox);
	this.fbShadowCorner	= this.newNode('div', 'fbShadowCorner', this.fbBox);
	this.fbLoader		= this.newNode('div', 'fbLoader', this.fbBox);
	this.fbContentPanel	= this.newNode('div', 'fbContentPanel', this.fbBox);
	this.fbDiv			= this.newNode('div', 'fbDiv', this.fbContentPanel);
	this.fbLeftNav		= this.newNode('a', 'fbLeftNav', this.fbContentPanel);
	this.fbRightNav		= this.newNode('a', 'fbRightNav', this.fbContentPanel);
	this.fbUpperPrev	= this.newNode('a', 'fbUpperPrev', this.fbContentPanel, this.strings.hintPrev);
	this.fbUpperNext	= this.newNode('a', 'fbUpperNext', this.fbContentPanel, this.strings.hintNext);
	this.fbResizer		= this.newNode('a', 'fbResizer', this.fbContentPanel, this.strings.hintResize);
	this.fbInfoPanel	= this.newNode('div', 'fbInfoPanel', this.fbContentPanel);
	this.fbCaption		= this.newNode('span', 'fbCaption', this.fbInfoPanel);
	this.fbInfoLink		= this.newNode('span', 'fbInfoLink', this.fbInfoPanel);
	this.fbItemNumber	= this.newNode('span', 'fbItemNumber', this.fbInfoPanel);
	this.fbControlPanel	= this.newNode('div', 'fbControlPanel', this.fbContentPanel);
	this.fbLowerNav		= this.newNode('div', 'fbLowerNav', this.fbControlPanel);
	this.fbLowerPrev	= this.newNode('a', 'fbLowerPrev', this.fbLowerNav, this.strings.hintPrev);
	this.fbLowerNext	= this.newNode('a', 'fbLowerNext', this.fbLowerNav, this.strings.hintNext);
	this.fbControls		= this.newNode('div', 'fbControls', this.fbControlPanel);
	this.fbClose		= this.newNode('a', 'fbClose', this.fbControls, this.strings.hintClose);
	this.fbPlayPause	= this.newNode('div', 'fbPlayPause', this.fbControls);
	this.fbPlay			= this.newNode('a', 'fbPlay', this.fbPlayPause, this.strings.hintPlay);
	this.fbPause		= this.newNode('a', 'fbPause', this.fbPlayPause, this.strings.hintPause);
	this.bod.appendChild(this.fbBox);
},
newNode: function(nodeType, id, parentNode, title) {
	if (this[id] && this[id].parentNode) {
		this[id].parentNode.removeChild(this[id]);
	}
	var node = this.doc.createElement(nodeType);
	node.id = id;
	node.className = id + '_' + this.lclTheme;
	if (nodeType === 'a') {
		if (!this.operaOld) node.setAttribute('href', '');
		if (this.ieOld) node.setAttribute('hideFocus', 'true');
	} else if (nodeType === 'iframe') {
		node.setAttribute('scrolling', this.itemScroll);
		node.setAttribute('frameBorder', '0');
		node.setAttribute('align', 'middle');
		node.src = this.iframeSrc;
	}
	if (title && this.showHints !== 'never') node.setAttribute('title', title);
	if (this.zIndex[id]) node.style.zIndex = this.zIndex.base + this.zIndex[id];
	node.style.display = 'none';
	if (parentNode) parentNode.appendChild(node);
	this.nodeNames.push(id);
	return node;
},
addEventHandlers: function() {
	var that = this,
	leftNav = this.fbLeftNav.style,
	rightNav = this.fbRightNav.style,
	upperPrev = this.fbUpperPrev.style,
	upperNext = this.fbUpperNext.style,
	lowerPrev = this.fbLowerPrev.style,
	lowerNext = this.fbLowerNext.style;
	if (this.showHints === 'once') {
		this.hideHint = function(id) {
			if (that[id].title) {
				that.timeouts[id] = setTimeout(function() {
					if (/fb(Upper|Lower)(Prev|Next)/.test(id)) {
						that[id.replace('Upper', 'Lower')].title =
						that[id.replace('Lower', 'Upper')].title = '';
					} else {
						that[id].title = '';
					}
				}, that.showHintsTime);
			}
		};
	} else {
		this.hideHint = function() {};
	}
	this.fbPlay.onclick = function() { that.setPause(false); return false; };
	this.fbPause.onclick = function() { that.setPause(true); return false; };
	this.fbClose.onclick = function() { that.end(); return false; };
	if (this.outsideClickCloses) {
		this.fbOverlay.onclick = this.fbShadowRight.onclick = this.fbShadowBottom.onclick =
		this.fbShadowCorner.onclick = function() { that.end(); return false; };
	}
	this.fbLowerPrev.onclick = function(step) {
		if (typeof step !== 'number') step = 1;
		var newIndex = (that.currentIndex - step) % that.itemCount;
		if (newIndex < 0) newIndex += that.itemCount;
		if (that.enableWrap || newIndex < that.currentIndex) {
			that.newContent(newIndex);
			if (that.isSlideshow && that.pauseOnPrev && !that.isPaused) {
				that.setPause(true);
			}
		}
		return false;
	};
	this.fbLowerNext.onclick = function(step) {
		if (typeof step !== 'number') step = 1;
		var newIndex = (that.currentIndex + step) % that.itemCount;
		if (that.enableWrap || newIndex > that.currentIndex) {
			that.newContent(newIndex);
			if (that.isSlideshow && that.pauseOnNext && !that.isPaused) {
				that.setPause(true);
			}
		}
		return false;
	};
	this.fbLeftNav.onclick = this.fbUpperPrev.onclick = this.fbLowerPrev.onclick;
	this.fbRightNav.onclick = this.fbUpperNext.onclick = this.fbLowerNext.onclick;
	this.fbLeftNav.onmouseover = this.fbLeftNav.onmousemove =
	this.fbUpperPrev.onmousemove = function() {
		if (!that.timeouts.fbContentPanel) upperPrev.visibility = '';
		if (that.lowerNav) lowerPrev.backgroundPosition = that.onPos;
		return true;
	};
	this.fbRightNav.onmouseover = this.fbRightNav.onmousemove =
	this.fbUpperNext.onmousemove = function() {
		if (!that.timeouts.fbContentPanel) upperNext.visibility = '';
		if (that.lowerNav) lowerNext.backgroundPosition = that.onPos;
		return true;
	};
	this.fbUpperPrev.onmouseover = this.fbUpperNext.onmouseover = function() {
		this.onmousemove();
		that.hideHint(this.id);
		return true;
	};
	this.fbLeftNav.onmouseout = function() {
		upperPrev.visibility = 'hidden';
		if (that.lowerNav) lowerPrev.backgroundPosition = that.offPos;
	};
	this.fbRightNav.onmouseout = function() {
		upperNext.visibility = 'hidden';
		if (that.lowerNav) lowerNext.backgroundPosition = that.offPos;
	};
	this.fbUpperPrev.onmouseout = this.fbUpperNext.onmouseout = function() {
		this.style.visibility = 'hidden';
		that.clearTimeout(this.id);
	};
	this.fbLeftNav.onmousedown = this.fbRightNav.onmousedown = function(e) {
		e = e || that.win.event;
		if (e.button === 2) {
			leftNav.visibility = rightNav.visibility = 'hidden';
			that.timeouts.hideUpperNav = setTimeout(function() {
				leftNav.visibility = rightNav.visibility = '';
			}, 600);
		}
	};
	this.fbPlay.onmouseover = this.fbPause.onmouseover = this.fbClose.onmouseover =
	this.fbLowerPrev.onmouseover =	this.fbLowerNext.onmouseover = function() {
		this.style.backgroundPosition = that.onPos;
		that.hideHint(this.id);
		return true;
	};
	this.fbResizer.onmouseover = function() {
		that.hideHint(this.id);
		return true;
	};
	this.fbPlay.onmouseout = this.fbPause.onmouseout = this.fbClose.onmouseout =
	this.fbLowerPrev.onmouseout = this.fbLowerNext.onmouseout = function() {
		this.style.backgroundPosition = that.offPos;
		that.clearTimeout(this.id);
	};
	this.fbResizer.onmouseout = function() {
		that.clearTimeout(this.id);
	};
	if (this.enableKeyboardNav) {
		if (!this.keydownSet) {
			this.priorOnkeydown = this.doc.onkeydown;
			this.doc.onkeydown = this.keyboardAction();
			this.keydownSet = true;
		}
	} else if (this.keydownSet) {
		this.doc.onkeydown = this.priorOnkeydown;
		this.keydownSet = false;
	}
	if (this.opera && !this.keypressSet) {
		this.priorOnkeypress = this.doc.onkeypress;
		this.doc.onkeypress = function() { return false; };
		this.keypressSet = true;
	}
},
keyboardAction: function() {
	var that = this;
	return function(e) {
		e = e || that.win.event;
		var keyCode = e.keyCode || e.which;
		switch (keyCode) {
			case 37: case 39:
				if (that.itemCount > 1) {
					that[keyCode === 37 ? 'fbLowerPrev' : 'fbLowerNext'].onclick((e.ctrlKey || e.metaKey) ? that.ctrlJump : 1);
					if (that.showHints === 'once') {
						that.fbLowerPrev.title = that.fbLowerNext.title =
						that.fbUpperPrev.title = that.fbUpperNext.title = '';
					}
				}
				return false;
			case 32:
				if (that.isSlideshow) {
					that.setPause(!that.isPaused);
					if (that.showHints === 'once') that.fbPlay.title = that.fbPause.title = '';
				}
				return false;
			case 9:
				if (that.fbResizer.onclick) {
					that.fbResizer.onclick();
					if (that.showHints === 'once') that.fbResizer.title = '';
				}
				return false;
			case 27:
				if (that.showHints === 'once') that.fbClose.title = '';
				that.end();
				return false;
			case 13:
				return false;
		}
	};
},
initState: function() {
	var that = this,
		box = this.fbBox.style,
		div = this.fbDiv.style,
		resizer = this.fbResizer.style,
		contentPanel = this.fbContentPanel.style,
		infoPanel = this.fbInfoPanel.style,
		controlPanel = this.fbControlPanel.style,
		zoomDiv = this.fbZoomDiv.style,
		zoomImg = this.fbZoomImg.style;
	if (this.currentItem.popup) this.currentItem.anchor.onmouseover();
	var anchorPos = this.getAnchorPos(this.clickedAnchor, this.currentItem.anchor === this.clickedAnchor && this.currentItem.type === 'img');
	if (anchorPos.width) {
		this.pos.fbZoomDiv = anchorPos;
		zoomDiv.borderWidth = this.zoomPopBorder + 'px';
		zoomDiv.left = (anchorPos.left - this.zoomPopBorder) + 'px';
		zoomDiv.top = (anchorPos.top - this.zoomPopBorder) + 'px';
		zoomDiv.width = (this.fbZoomImg.width = anchorPos.width) + 'px';
		zoomDiv.height = (this.fbZoomImg.height = anchorPos.height) + 'px';
		this.fbZoomImg.src = anchorPos.src;
		box.visibility = 'hidden';
		var slowLoad = function() {
			that.fbZoomImg.src = that.slowZoomImg;
			zoomDiv.display = zoomImg.display = '';
		};
	} else {
		this.pos.fbBox = anchorPos;
		this.pos.fbBox.borderWidth = 0;
		this.pos.fbDiv = { width:0, height:0 };
		box.left = '-9999px';
		box.top = '0';
		var slowLoad = function() {
			zoomDiv.left = (anchorPos.left - that.loadingImgSize/2) + 'px';
			zoomDiv.top = (anchorPos.top - that.loadingImgSize/2) + 'px';
			zoomDiv.width = (that.fbZoomImg.width = that.loadingImgSize) + 'px';
			zoomDiv.height = (that.fbZoomImg.height = that.loadingImgSize) + 'px';
			that.fbZoomImg.src = that.slowLoadImg;
			zoomDiv.display = zoomImg.display = '';
		};
	}
	this.timeouts.slowLoad = setTimeout(slowLoad, this.slowLoadDelay);
	box.position = 'absolute';
	contentPanel.visibility = 'hidden';
	div.borderWidth = this.innerBorder + 'px';
	box.display = contentPanel.display = '';
	div.left = div.top = this.padding + 'px';
	resizer.left = resizer.top = (this.padding + this.innerBorder) + 'px';
	if (this.dropShadow) {
		var shadowRight = this.fbShadowRight.style,
			shadowBottom = this.fbShadowBottom.style,
			shadowCorner = this.fbShadowCorner.style;
		shadowRight.paddingBottom = shadowBottom.paddingRight = this.outerBorder*2 + 'px';
		shadowRight.paddingRight = shadowBottom.paddingBottom =
		shadowCorner.paddingRight = shadowCorner.paddingBottom = (this.outerBorder + this.shadowSize) + 'px';
		shadowRight.top = shadowBottom.left = -this.outerBorder + 'px';
	}
	if (this.upperNav) {
		var leftNav = this.fbLeftNav.style,
			rightNav = this.fbRightNav.style;
		leftNav.top = rightNav.top = leftNav.left = rightNav.right =
		this.fbUpperPrev.style.left = this.fbUpperNext.style.right = (this.padding + this.innerBorder) + 'px';
		if (fb.showUpperNav === 'never' || (fb.showUpperNav === 'once' && fb.upperNavShown)) {
			fb.showUpperNav = false;
		} else {
			this.fbUpperPrev.style.backgroundPosition = this.fbUpperNext.style.backgroundPosition = this.onPos;
			this.fadeOpacity(this.fbUpperPrev, this.upperOpacity);
			this.fadeOpacity(this.fbUpperNext, this.upperOpacity);
		}
	}
	infoPanel.width = '400px';
	this.buildControlPanel();
	this.lastShown = false;
	if (this.hideFlash) this.hideElements('flash');
	if (this.hideJava) this.hideElements('applet');
	if (this.ieOld) {
		this.hideElements('select');
		this.fbOverlay.style.position = 'absolute';
		this.stretchOverlay()();
		this.win.attachEvent('onresize', this.stretchOverlay());
		this.win.attachEvent('onscroll', this.stretchOverlay());
	}
},
getAnchorPos: function(anchor, isImg) {
	var display = this.getDisplaySize(),
		scroll = this.getScroll(),
		noAnchorPos = { left: display.width/2 + scroll.left, top: display.height/3 + scroll.top, width: 0, height: 0 };
	var thumb = isImg ? this.getThumb(anchor) : false;
	if (thumb && this.zoomImageStart) {
		var pos = this.getLeftTop(thumb),
			border = (thumb.offsetWidth - thumb.width)/2;
		pos.left += border;
		pos.top += border;
		pos.width = thumb.width;
		pos.height = thumb.height;
		pos.src = thumb.src;
	} else if (!(this.startAtClick && anchor && anchor.offsetWidth && /^a$/i.test(anchor.tagName))) {
		return noAnchorPos;
	} else {
		var pos = this.getLayout(thumb || anchor);
	}
	var centerPos = { left: pos.left + pos.width/2, top: pos.top + pos.height/2, width: 0, height: 0 };
	if (centerPos.left < scroll.left || centerPos.left > (scroll.left + display.width) ||
	centerPos.top < scroll.top || centerPos.top > (scroll.top + display.height)) {
		return noAnchorPos;
	}
	return (thumb && this.zoomImageStart ? pos : centerPos);
},
getThumb: function(anchor) {
	var nodes = anchor.childNodes, i = nodes.length;
	while (i--) {
		if (/img/i.test(nodes[i].tagName)) {
			return nodes[i];
		}
	}
	return false;
},
buildControlPanel: function() {
	var controlPanel = this.fbControlPanel.style,
		controls = this.fbControls.style;
	if (this.lowerNav) {
		var lowerPrev = this.fbLowerPrev.style,
			lowerNext = this.fbLowerNext.style,
			lowerNav = this.fbLowerNav.style;
		lowerPrev.backgroundPosition = lowerNext.backgroundPosition = this.offPos;
		lowerNav.paddingRight = this.controlSpacing + 'px';
		controlPanel.display = lowerNav.display =
		lowerPrev.display = lowerNext.display = '';
	}
	var width = 0;
	if (this.showClose) {
		var close = this.fbClose.style;
		close.backgroundPosition = this.offPos;
		controlPanel.display = controls.display = close.display = '';
		width = this.fbClose.offsetWidth;
	}
	if (this.showPlayPause && this.isSlideshow) {
		var play = this.fbPlay.style,
			pause = this.fbPause.style,
			playPause = this.fbPlayPause.style;
		play.backgroundPosition = pause.backgroundPosition = this.offPos;
		playPause.paddingRight = this.controlSpacing + 'px';
		controlPanel.display = controls.display = playPause.display = play.display = pause.display = '';
		play.left = this.isPaused ? '' : '-9999px';
		pause.left = this.isPaused ? '-9999px' : '';
		width += this.fbPlayPause.offsetWidth;
	}
	controls.width = width + 'px';
	this.controlPanelWidth = this.fbLowerNav.offsetWidth + width;
	controlPanel.width = this.controlPanelWidth + 'px';
	this.controlPanelHeight = this.fbControlPanel.offsetHeight;
	controlPanel.right = Math.max(this.padding, 8) + 'px';
},
fetchContent: function(callback, phase) {
	var that = this;
	if (!phase) {
		if (this.fbContent) {
			this.fbDiv.removeChild(this.fbContent);
			delete this.fbContent;
		}
		this.setInnerHTML(this.fbDiv, '');
		return this.timeouts.fetch = setTimeout(function() { that.fetchContent(callback, 1); }, 10);
	}
	var div = this.fbDiv.style,
		item = this.currentItem;
	item.nativeWidth = item.revOptions.width;
	item.nativeHeight = item.revOptions.height;
	if (item.type !== 'img') {
		item.nativeWidth = item.nativeWidth || this.defaultWidth;
		item.nativeHeight = item.nativeHeight || this.defaultHeight;
	}
	this.itemScroll = item.revOptions.scroll || item.revOptions.scrolling || 'auto';
	if (/img|iframe/.test(item.type)) {
		div.overflow = 'hidden';
		this.fbContent = this.newNode(item.type, 'fbContent', this.fbDiv);
		this.fbContent.style.display = '';
		this.fbContent.style.border = '0';
		if (item.type === 'img') {
			var loader = new Image();
			loader.onload = function() {
				item.nativeWidth = item.nativeWidth || loader.width;
				item.nativeHeight = item.nativeHeight || loader.height;
				that.fbContent.src = loader.src;
				if (callback) callback();
			};
			loader.onerror = function() {
				if (item.href !== that.notFoundImg) {
					this.src = item.href = that.notFoundImg;
				}
			};
			loader.src = item.href;
		}
	} else {
		div.overflow = this.itemScroll === 'yes' ? 'scroll' : (this.itemScroll === 'no' ? 'hidden' : 'auto');
		var contents = this.content[item.href];
		if (item.type === 'inline') {
			var el = contents.cloneNode(true);
			el.style.display = el.style.visibility = '';
			try { this.fbDiv.appendChild(el); }
			catch(e) { this.setInnerHTML(this.fbDiv, el.innerHTML); }
			this.tagAnchors(this.fbDiv);
		} else if (item.type === 'ajax') {
			this.xhr.getResponse(item.href, function(xhr) {
				if ((xhr.status === 200 || xhr.status === 203 || xhr.status === 304) && xhr.responseText) {
					that.setInnerHTML(that.fbDiv, xhr.responseText);
					that.tagAnchors(that.fbDiv);
				} else {
					that.setInnerHTML(that.fbDiv, '<p style="color:#000; background:#fff; margin:1em; padding:1em;">' +
					'Unable to fetch content from ' + item.href + '</p>');
				}
			});
		}
	}
	if (item.type !== 'img' && callback) callback();
},
updateInfoPanel: function() {
	var infoPanel = this.fbInfoPanel.style,
		caption = this.fbCaption.style,
		infoLink = this.fbInfoLink.style,
		itemNumber = this.fbItemNumber.style,
		item = this.currentItem,
		str;
	infoPanel.display = caption.display = infoLink.display = itemNumber.display = 'none';
	if (this.showCaption) {
		str = item.revOptions.caption || item.title || '';
		if (str) {
			if (str === 'href') str = this.currentItem.href;
			str = this.decodeHTML(str);
			if (this.setInnerHTML(this.fbCaption, str)) infoPanel.display = caption.display = '';
		}
	}
	if (item.revOptions.info && !this.isSlideshow) {
		str = this.encodeHTML(this.decodeHTML(item.revOptions.info));
		var options = item.revOptions.infoOptions || '';
		if (options) options = this.encodeHTML(this.decodeHTML(options));
		str = '<a href="' + str + '" rel="floatbox" rev="' + options + '"><b>' + (item.revOptions.infoText || this.strings.infoText) + '</b></a>';
		if (this.setInnerHTML(this.fbInfoLink, str)) infoPanel.display = infoLink.display = '';
	}
	if (this.itemCount > 1 && this.showItemNumber) {
		str = this.justImages ? this.strings.imgCount : this.strings.nonImgCount;
		str = str.replace('%1', this.currentIndex + 1);
		str = str.replace('%2', this.itemCount);
		if (this.setInnerHTML(this.fbItemNumber, str)) infoPanel.display = itemNumber.display = '';
	}
	if (!infoPanel.display) this.tagAnchors(this.fbInfoPanel);
},
calcSize: function(fit, recalc) {
	var that = this;
	if (!this.fbBox) return;
	var boxX, boxY, boxW, boxH, divW, divH;
	if (typeof fit === 'undefined') {
		fit = this.currentItem.type === 'img' ? this.autoSizeImages : this.autoSizeOther;
	}
	var infoPanel = this.fbInfoPanel.style,
		box = this.fbBox.style;
	this.displaySize = this.getDisplaySize();
	this.infoPanelHeight = this.fbInfoPanel.offsetHeight;
	this.lowerPanelHeight = Math.max(Math.max(this.infoPanelHeight, this.controlPanelHeight) + 2*this.panelPadding, this.padding);
	var frame = 2*(this.outerBorder + this.padding + this.innerBorder + this.shadowSize),
		maxW = this.displaySize.width - frame,
		maxH = this.displaySize.height - (frame - this.padding) - this.lowerPanelHeight,
		hardW = false, hardH = false;
	divW = this.currentItem.nativeWidth + '';
	if (divW === 'max') {
		divW = maxW;
	} else if (divW.substr(divW.length - 1) === '%') {
		divW = Math.floor((maxW + 2*this.shadowSize) * parseInt(divW, 10) / 100);
	} else {
		divW = parseInt(divW, 10);
		hardW = true;
	}
	divH = this.currentItem.nativeHeight + '';
	if (divH === 'max') {
		divH = maxH;
	} else if (divH.substr(divH.length - 1) === '%') {
		divH = Math.floor((maxH + 2*this.shadowSize) * parseInt(divH, 10) / 100);
	} else {
		divH = parseInt(divH, 10);
		hardH = true;
	}
	this.scaledBy = this.oversizedBy = 0;
	if (fit) {
		var scaleW = maxW/divW,
			scaleH = maxH/divH,
			w = divW, h = divH;
		if (hardW && hardH) scaleW = scaleH = Math.min(scaleW, scaleH);
		if (scaleW < 1) divW = Math.round(divW * scaleW);
		if (scaleH < 1) divH = Math.round(divH * scaleH);
		this.scaledBy = Math.max(w - divW, h - divH);
		if (this.scaledBy && this.scaledBy < this.outerBorder + 2*this.shadowSize + this.panelPadding) {
			divW = w;
			divH = h;
			this.scaledBy = 0;
		}
	}
	boxW = divW + 2*(this.innerBorder + this.padding);
	boxH = divH + this.lowerPanelHeight + 2*this.innerBorder + this.padding;
	var panelSpace = Math.max(this.padding, 8),
		infoW = Math.max(boxW - 2*panelSpace - this.controlPanelWidth - this.lowerPanelSpace, 0),
		changed = this.fbInfoPanel.offsetWidth !== infoW;
	if (this.fbInfoLink.offsetWidth + this.fbItemNumber.offsetWidth > infoW) {
		this.fbItemNumber.style.display = 'none';
		changed = true;
	}
	if (!infoPanel.display && changed) {
		infoPanel.width = infoW + 'px';
		if (infoW < this.minInfoWidth) {
			infoPanel.display = 'none';
			this.infoPanelHeight = 0;
		}
		if (recalc !== 2) return this.calcSize(fit, (recalc || 0) + 1);
	}
	if (!fit) this.oversizedBy = Math.max(boxW - this.displaySize.width, boxH - this.displaySize.height) + this.shadowSize;
	if (this.oversizedBy < 0) this.oversizedBy = 0;
	var freeSpace = this.displaySize.width - boxW - 2*this.outerBorder;
	boxX = freeSpace <= 0 ? 0 : Math.floor(freeSpace/2);
	freeSpace = this.displaySize.height - boxH - 2*this.outerBorder;
	var ratio = freeSpace / this.displaySize.height, factor;
	if (ratio <= 0.15) {
		factor = 2;
	} else if (ratio >= 0.3) {
		factor = 3;
	} else {
		factor = 2 + (ratio - 0.15)/0.15;
	}
	boxY = freeSpace <= 0 ? 0 : Math.floor(freeSpace/factor);
	var boxPosition = box.position;
	if (this.ieOld) {
		box.display = 'none';
		this.stretchOverlay()();
	} else {
		this.setPosition(this.fbBox, 'fixed');
	}
	var scroll = this.getScroll();
	this.setPosition(this.fbBox, boxPosition);
	box.display = '';
	boxX += scroll.left;
	boxY += scroll.top;
	if (this.isChild) {
		var rex = /max|%/i,
			parPos = (this.children[this.children.length-2] || fb).pos.fbBox,
			childX = rex.test(this.currentItem.nativeWidth) ? 9999 : (parPos.left + boxX)/2,
			childY = rex.test(this.currentItem.nativeHeight) ? 9999 : (parPos.top + boxY)/2;
		if (scroll.left < childX && scroll.top < childY) {
			boxX = Math.min(boxX, childX);
			boxY = Math.min(boxY, childY);
		}
	}
	var oncomplete = function() {
		that.fbBox.style.visibility ? that.zoomIn() : that.showContent();
	};
	var setSize = function() {
		that.setSize(
			{ id: 'fbBox', left: boxX, top: boxY, width: boxW, height: boxH, borderWidth: that.outerBorder },
			{ id: 'fbDiv', width: divW, height: divH },
			function() { that.timeouts.showContent = setTimeout(oncomplete, 10); }
		);
	};
	this.timeouts.setSize = setTimeout( setSize, 10);
},
setPosition: function(el, position) {
	if (el.style.position === position) return;
	var scroll = this.getScroll();
	if (position === 'fixed') {
		scroll.left = -scroll.left;
		scroll.top = -scroll.top;
	}
	if (this.pos[el.id]) {
		this.pos[el.id].left += scroll.left;
		this.pos[el.id].top += scroll.top;
	}
	el.style.left = (el.offsetLeft + scroll.left) + 'px';
	el.style.top = (el.offsetTop + scroll.top) + 'px';
	el.style.position = position;
},
collapse: function(callback, phase) {
	var that = this;
	if (!phase) {
	this.setPosition(this.fbBox, 'absolute');
		this.fbResizer.onclick = null;
		this.fbResizer.style.display = 'none';
		if (this.fbContent) {
			this.fbContent.onclick = null;
			this.fbContent.style.cursor = '';
		}
		if (this.upperNav) {
			this.fbLeftNav.style.display = this.fbRightNav.style.display =
			this.fbUpperPrev.style.display = this.fbUpperNext.style.display = 'none';
		}
		var opacity = 0, duration = 0;
		if (this.currentItem.type === 'img' && !this.fbContentPanel.style.visibility) {
			if (this.currentItem === this.lastShown && this.liveImageResize) opacity = 1;
			duration = this.imageFadeDuration;
		}
		this.liveResize = (opacity === 1);
		var oncomplete = function() { that.collapse(callback, 1); };
		return this.fadeOpacity(this.fbContentPanel, opacity, duration, oncomplete);
	}
	if (!this.liveResize) {
		this.fbDiv.style.display = 'none';
		this.clearTimeout('loader');
		this.timeouts.loader = setTimeout(function() { that.fbLoader.style.display = ''; }, this.loaderDelay);
	}
	this.fbControlPanel.style.visibility = this.fbInfoPanel.style.visibility = 'hidden';
	this.fbInfoPanel.style.left = '-9999px';
	if (callback) callback();
},
restore: function(callback, phase) {
	var that = this;
	if (!phase) {
		if (this.dropShadow && this.fbShadowRight.style.display) {
			this.fbShadowRight.style.display = this.fbShadowBottom.style.display = this.fbShadowCorner.style.display = '';
		}
		var infoPanel = this.fbInfoPanel.style,
			controlPanel = this.fbControlPanel.style;
		infoPanel.bottom = ((this.lowerPanelHeight - this.infoPanelHeight)/2) + 'px';
		controlPanel.bottom = ((this.lowerPanelHeight - this.controlPanelHeight)/2) + 'px';
		infoPanel.left = Math.max(this.padding, 8) + 'px';
		infoPanel.visibility = controlPanel.visibility = '';
		this.clearTimeout('loader');
		this.fbLoader.style.display = 'none';
		this.fbDiv.style.display = '';
		var duration = (this.currentItem.type === 'img' && !this.fbContentPanel.style.visibility) ? this.imageFadeDuration : 0,
			oncomplete = function() { that.restore(callback, 1); };
		return this.fadeOpacity(this.fbContentPanel, 1, duration, oncomplete);
	}
	if (this.currentItem.type === 'img' ? this.resizeImages : this.resizeOther) {
		var scale = 0;
		if (this.scaledBy > 35) {
			scale = 1;
		} else if (this.oversizedBy > 20){
			scale = -1;
		}
		if (scale) {
			this.fbResizer.onclick = function() {
				if (that.isSlideshow && that.pauseOnResize && !that.isPaused) {
					that.setPause(true);
				}
				that.collapse(function() { that.calcSize(scale === -1); });
				return false;
			};
			if (this.currentItem.type === 'img' && !this.opera && /cursor|both/.test(this.resizeTool)) {
				this.fbContent.style.cursor = 'url(' + (scale === -1 ? this.resizeDownCursor : this.resizeUpCursor) +'), default';
				this.fbContent.onclick = this.fbResizer.onclick;
			}
			if (this.currentItem.type !== 'img' || this.opera || /topleft|both/.test(this.resizeTool)) {
				this.fbResizer.style.backgroundPosition = (scale === -1 ? 'bottom' : 'top');
				this.fadeOpacity(this.fbResizer, this.upperOpacity);
			}
		}
	}
	if (this.upperNav) {
		var leftNav = this.fbLeftNav.style,
			rightNav = this.fbRightNav.style,
			upperPrev = this.fbUpperPrev.style,
			upperNext = this.fbUpperNext.style;
		leftNav.width = rightNav.width = Math.max(this.upperNavWidth/100 * this.pos.fbDiv.width, this.fbUpperPrev.offsetWidth) + 'px';
		leftNav.height = rightNav.height = this.pos.fbDiv.height + 'px';
		leftNav.display = rightNav.display = '';
		if (fb.showUpperNav) {
			upperPrev.top = upperNext.top = (this.pos.fbDiv.height * this.upperNavPos/100 + this.padding + this.innerBorder) + 'px';
			upperPrev.visibility = upperNext.visibility = 'hidden';
			upperPrev.display = upperNext.display = '';
		}
	}
	if (callback) callback();
},
setSize: function() {
	var that = this,
		arr = [],
		oncomplete = function() {},
		node,
		i = arguments.length;
	while (i--) {
		if (typeof arguments[i] === 'object' && (node = this[arguments[i].id])) {
			var obj = arguments[i];
			if (!this.pos[obj.id]) this.pos[obj.id] = {};
			for (var property in obj) {
				if (obj.hasOwnProperty(property) && property !== 'id') {
					var start = this.pos[obj.id][property];
					if (typeof start !== 'number' || node.style.display || node.style.visibility) {
						start = obj[property];
					}
					arr.push({ node: node, property: property, start: start, finish: obj[property] });
					if (obj.id === 'fbDiv' && this.fbContent && this.rex.WH.test(property)) {
						arr.push({ node: this.fbContent, property: property, start: start, finish: obj[property] });
					} else if (obj.id === 'fbZoomDiv' && this.rex.WH.test(property)) {
						arr.push({ node: this.fbZoomImg, property: property, start: start, finish: obj[property] });
					}
					this.pos[obj.id][property] = obj[property];
				}
			}
		} else if (typeof arguments[i] === 'function') {
			oncomplete = arguments[i];
		}
	}
	this.resizeGroup(arr, oncomplete);
},
showContent: function(phase) {
	var that = this;
	if (!phase) {
		var displaySize = this.getDisplaySize();
		if (!this.resized) {
			var vscrollChanged = displaySize.width !== this.displaySize.width,
				hscrollChanged = displaySize.height !== this.displaySize.height;
			if ((vscrollChanged && Math.abs(this.pos.fbBox.width - displaySize.width) < 50) ||
			(hscrollChanged && Math.abs(this.pos.fbBox.height - displaySize.height) < 50)) {
				this.resized = true;
				return this.calcSize(this.scaledBy);
			}
		}
		this.resized = false;
		this.win.focus();
		if (this.ieOld) this.stretchOverlay()();
		if ((this.disableScroll || (this.ffOld && /iframe|quicktime/i.test(this.currentItem.type))) && !this.ieOld && !this.ie8b2) {
			if (this.pos.fbBox.width <= displaySize.width && this.pos.fbBox.height <= displaySize.height) {
				this.setPosition(this.fbBox, 'fixed');
			}
		}
		if (this.fbContent && (!this.fbContent.src || this.fbContent.src.indexOf(this.iframeSrc) !== -1)) {
			this.fbContent.src = this.currentItem.href;
		} else if (/flash|quicktime/.test(this.currentItem.type) && !this.fbDiv.innerHTML) {
			var html = this.content[this.currentItem.href];
			html = html.replace('%width%', this.pos.fbDiv.width).replace('%height%', this.pos.fbDiv.height);
			this.setInnerHTML(this.fbDiv, html);
		}
		this.prevIndex = this.currentIndex ? this.currentIndex - 1 : this.itemCount - 1;
		this.nextIndex = this.currentIndex < this.itemCount - 1 ? this.currentIndex + 1 : 0;
		var prevHref = this.enableWrap || this.currentIndex !== 0 ? this.items[this.prevIndex].href : '',
			nextHref = this.enableWrap || this.currentIndex !== this.itemCount - 1 ?  this.items[this.nextIndex].href : '';
		if (this.lowerNav) {
			if (prevHref) {
				if (!this.operaOld) this.fbLowerPrev.href = prevHref;
				this.fbLowerPrev.title = this.fbUpperPrev.title;
			} else {
				this.fbLowerPrev.removeAttribute('href');
				this.fbLowerPrev.title = '';
			}
			if (nextHref) {
				if (!this.operaOld) this.fbLowerNext.href = nextHref;
				this.fbLowerNext.title = this.fbUpperNext.title;
			} else {
				this.fbLowerNext.removeAttribute('href');
				this.fbLowerNext.title = '';
			}
			var prevOn = this.fbLowerPrev.className.replace('_off', ''),
				nextOn = this.fbLowerNext.className.replace('_off', '');
			this.fbLowerPrev.className = prevOn + (prevHref ? '' : '_off');
			this.fbLowerNext.className = nextOn + (nextHref ? '' : '_off');
		}
		if (this.upperNav) {
			if (!this.operaOld) {
				this.fbLeftNav.href = this.fbUpperPrev.href = prevHref;
				this.fbRightNav.href = this.fbUpperNext.href = nextHref;
			}
			this.fbLeftNav.style.visibility = prevHref ? '' : 'hidden';
			this.fbRightNav.style.visibility = nextHref ? '' : 'hidden';
			fb.upperNavShown = true;
		}
		this.fbContentPanel.style.visibility = '';
		return this.restore(function() {
			that.timeouts.showContent = setTimeout(function() { that.showContent(1); }, 10);
		} );
	}
	this.lastShown = this.currentItem;
	if (!this.currentItem.seen) {
		this.currentItem.seen = true;
		this.itemsShown++;
	}
	if (this.isSlideshow && !this.isPaused) {
		this.timeouts.slideshow = setTimeout(function() {
			if (that.endTask === 'loop' || that.itemsShown < that.itemCount) {
				that.newContent(that.nextIndex);
			} else if (that.endTask === 'exit') {
				that.end();
			} else {
				that.setPause(true);
				var i = that.itemCount;
				while (i--) that.items[i].seen = false;
				that.itemsShown = 0;
			}
		}, this.slideInterval*1000);
	}
	this.timeouts.preload = setTimeout(function() {
			that.preloadImages(nextHref || prevHref || '', true);
	}, 10);
},
newContent: function(index) {
	var that = this;
	this.clearTimeout('slideshow');
	this.clearTimeout('resizeGroup');
	this.currentIndex = index;
	this.currentItem = this.items[index];
	if (this.showUpperNav == 'once' && this.upperNavShown) this.showUpperNav = false;
	var oncomplete = function() {
		that.updateInfoPanel();
		that.fetchContent(function() { that.calcSize();	});
	};
	this.collapse(function() {
		that.timeouts.fetch = setTimeout(oncomplete, 10);
	} );
},
end: function(all) {
	if (this !== fb.lastChild) return fb.lastChild.end(all);
	var that = this;
	this.endAll = this.endAll || all;
	if (this.isChild && this.endAll) this.imageFadeDuration = this.overlayFadeDuration = this.resizeDuration = 0;
	if (this.saveReplace) top.location.replace = this.saveReplace;
	this.fbOverlay.onclick = null;
	if (this.keydownSet) {
		this.doc.onkeydown = this.priorOnkeydown;
		this.keydownSet = false;
	}
	if (this.keypressSet) {
		this.doc.onkeypress = this.priorOnkeypress;
		this.keypressSet = false;
	}
	if (this.ieOld) {
		this.win.detachEvent('onresize', this.stretchOverlay());
		this.win.detachEvent('onscroll', this.stretchOverlay());
	}
	for (var key in this.timeouts) {
		if (this.timeouts.hasOwnProperty(key)) this.clearTimeout(key);
	}
	if (this.fbBox.style.visibility) {
		if (!this.lastShown) this.fbZoomDiv.style.display = 'none';
	} else if (this.currentItem.type === 'img' && this.zoomImageStart) {
		if (this.currentItem.popup) this.currentItem.anchor.onmouseover();
		var anchorPos = this.getAnchorPos(this.currentItem.anchor, true);
		if (this.currentItem.popup) this.currentItem.anchor.onmouseout();
		if (anchorPos.width) {
			this.fbZoomDiv.style.borderWidth = this.zoomPopBorder + 'px';
			anchorPos.left -= this.zoomPopBorder;
			anchorPos.top -= this.zoomPopBorder;
			this.pos.thumb = anchorPos;
			return this.zoomOut();
		}
	}
	if (!this.fbBox.style.visibility) {
		var anchorPos = this.getAnchorPos(this.clickedAnchor, false);
		var oncomplete = function() {
			setTimeout(function() {
				that.fbBox.style.visibility = 'hidden';
				that.end();
			}, 10);
		};
		var oncomplete2 = function() {
			if (that.fbContent) {
				that.fbDiv.removeChild(that.fbContent);
				delete that.fbContent;
			}
			that.setInnerHTML(that.fbDiv, '');
			that.fbLoader.style.display = '';
			that.fbContentPanel.style.display = that.fbShadowRight.style.display =
			that.fbShadowBottom.style.display = that.fbShadowCorner.style.display = 'none';
			that.setSize({ id: 'fbBox', left: anchorPos.left, top: anchorPos.top, width: 0, height: 0, borderWidth: 0 }, oncomplete);
		};
		return this.collapse(oncomplete2);
	}
	this.fbBox.style.display = 'none';
	var level = this.children.length + 1,
		i = this.anchors.length;
	while(i && this.anchors[i-1].level >= level) i--;
	this.anchors.length = i;
	if (this.isChild) this.children.length--;
	fb.lastChild = this.children[this.children.length-1] || fb;
	var oncomplete2 = function() {
		setTimeout(function() {
			while (that.nodeNames.length) {
				var id = that.nodeNames.pop();
				if (that[id] && that[id].parentNode) {
					that[id].parentNode.removeChild(that[id]);
					delete that[id];
				}
			}
			if (that.endAll && that.isChild) {
				return fb.end(true);
			} else if (that.loadPageOnClose) {
				if (that.loadPageOnClose === 'this') {
					that.win.location.reload(true);
				} else if (that.loadPageOnClose === 'back') {
					history.back();
				} else {
					that.win.location.replace(that.loadPageOnClose);
				}
			}
		}, 10);
	};
	var oncomplete = function() {
		while(that.hiddenEls.length) {
			var el = that.hiddenEls.pop();
			el.style.visibility = '';
			if (this.ffOld) {
				el.focus();
				el.blur();
			}
		}
		var overlay = that.fbOverlay.style;
		overlay.display = 'none';
		overlay.width = overlay.height = '0';
		var duration = that.currentItem.popup ? 6.5 : 0;
		that.fbZoomDiv.style.opacity = '1';
		that.fadeOpacity( that.fbZoomDiv, 0, duration, oncomplete2);
		that.currentItem = null;
	};
	this.fadeOpacity(this.fbOverlay, 0, this.overlayFadeDuration, oncomplete);
},
zoomIn: function(phase) {
	var that = this,
		zoomDiv = this.fbZoomDiv.style;
	if (!phase) {
		this.clearTimeout('slowLoad');
		zoomDiv.display = this.fbZoomImg.style.display = '';
		if (this.currentItem.popup) this.currentItem.anchor.onmouseout();
		var pad = this.outerBorder + this.padding + this.innerBorder - this.zoomPopBorder;
		var oncomplete = function () {
			that.fbZoomImg.src = that.currentItem.href;
			that.setSize(
				{ id: 'fbZoomDiv', left: that.pos.fbBox.left + pad, top: that.pos.fbBox.top + pad,
				width: that.pos.fbDiv.width, height: that.pos.fbDiv.height },
				function() { that.zoomIn(1); } );
		};
		return this.fadeOpacity(this.fbOverlay, this.overlayOpacity, this.overlayFadeDuration, oncomplete);
	}
	if (phase === 1) {
		var boxPos = {
			left: this.pos.fbBox.left, top: this.pos.fbBox.top,
			width: this.pos.fbBox.width, height: this.pos.fbBox.height
		};
		var pad = 2*(this.zoomPopBorder - this.outerBorder);
		this.pos.fbBox = {
			left: this.pos.fbZoomDiv.left, top: this.pos.fbZoomDiv.top,
			width: this.pos.fbZoomDiv.width + pad, height: this.pos.fbZoomDiv.height + pad
		};
		this.fbBox.style.visibility = '';
		var oncomplete = function() {
			that.restore(function() { that.zoomIn(2); });
		};
		return this.setSize(
			{ id: 'fbBox', left: boxPos.left, top: boxPos.top,
			width: boxPos.width, height: boxPos.height},
			oncomplete);
	}
	var show = function() {
		zoomDiv.display = 'none';
		that.fbZoomImg.src = '';
		zoomDiv.left = zoomDiv.top = zoomDiv.width = zoomDiv.height = that.fbZoomImg.width = that.fbZoomImg.height = '0';
		that.showContent();
	};
	this.timeouts.showContent = setTimeout(show, 10);
},
zoomOut: function(phase) {
	var that = this;
	if (!phase) {
		this.fbZoomImg.src = this.currentItem.href;
		var pad = this.outerBorder + this.padding + this.innerBorder - this.zoomPopBorder,
			oncomplete = function() {
				that.setSize( {
				id: 'fbZoomDiv', left: that.pos.fbBox.left + pad, top: that.pos.fbBox.top + pad,
				width: that.pos.fbDiv.width, height: that.pos.fbDiv.height },
				function() { that.zoomOut(1); } );
			};
		return this.collapse(oncomplete);
	}
	if (phase === 1) {
		this.fbZoomDiv.style.display = this.fbZoomImg.style.display = '';
		this.fbContentPanel.style.visibility = 'hidden';
		return this.collapse(function() { that.zoomOut(2); });
	}
	if (phase === 2) {
		var pad = 2*(this.zoomPopBorder - this.outerBorder);
		return this.setSize(
			{ id: 'fbBox', left: this.pos.fbZoomDiv.left, top: this.pos.fbZoomDiv.top,
			width: this.pos.fbZoomDiv.width + pad, height: this.pos.fbZoomDiv.height + pad },
			function() { that.zoomOut(3); }
		);
	}
	this.fbBox.style.visibility = 'hidden';
	var end = function() {
		that.fbZoomImg.src = that.pos.thumb.src;
		that.end();
	};
	this.setSize(
		{ id: 'fbZoomDiv', left: this.pos.thumb.left, top: this.pos.thumb.top,
		width: this.pos.thumb.width, height: this.pos.thumb.height },
		end);
},
setPause: function(bPause) {
	this.isPaused = bPause;
	if (bPause) {
		this.clearTimeout('slideshow');
	} else {
		this.newContent(this.nextIndex);
	}
	if (this.showPlayPause) {
		this.fbPlay.style.left = bPause ? '' : '-9999px';
		this.fbPause.style.left = bPause ? '-9999px' : '';
	}
},
fadeOpacity: function(el, opacity, duration, callback) {
	var startOp = +(el.style.opacity || 0);
	duration = duration || 0;
	this.clearTimeout['fade' + el.id];
	var fadeIn = (startOp <= opacity && opacity > 0);
	if (duration > 10) duration = 10;
	if (duration < 0) duration = 0;
	if (duration === 0) {
		startOp = opacity;
	} else {
		var root = Math.pow(100, 0.1),
			power = duration + ((10 - duration)/9) * (Math.log(2)/Math.log(root) - 1),
			incr = 1/Math.pow(root, power);
	}
	if (fadeIn) {
		el.style.display = el.style.visibility = '';
	} else {
		incr = -incr;
	}
	this.stepFade(el, startOp, opacity, incr, fadeIn, callback);
},
stepFade: function(el, thisOp, finishOp, incr, fadeIn, callback) {
	if (!el) return;
	var that = this;
	if ((fadeIn && thisOp >= finishOp) || (!fadeIn && thisOp <= finishOp)) thisOp = finishOp;
	if (this.ie) el.style.filter = 'alpha(opacity=' + thisOp*100 + ')';
	el.style.opacity = thisOp + '';
	if (thisOp === finishOp) {
		if (this.ie && finishOp >= 1) el.style.removeAttribute('filter');
		if (callback) callback();
	} else {
		this.timeouts['fade' + el.id] = setTimeout(function() { that.stepFade(that[el.id], thisOp + incr, finishOp, incr, fadeIn, callback); }, 20);
	}
},
resizeGroup: function(arr, callback) {
	var i = arr.length;
	if (!i) return callback ? callback() : null;
	this.clearTimeout('resizeGroup');
	var diff = 0;
	while (i--) {
		if (arr[i].start < 0) arr[i].start = 0;
		diff = Math.max(diff, Math.abs(arr[i].finish - arr[i].start));
	}
	var duration = this.resizeDuration * (this.liveResize ? 0.75 : 1);
	var rate = diff && duration ? Math.pow(Math.max(1, 2.2 - duration/10), (Math.log(diff))) / diff : 1;
	i = arr.length;
	while (i--) arr[i].diff = arr[i].finish - arr[i].start;
	this.stepResize(rate, rate, arr, callback);
},
stepResize: function(increment, rate, arr, callback) {
	var that = this;
	if (increment > 1) increment = 1;
	var i = arr.length;
	while (i--) {
		var node = arr[i].node,
			prop = arr[i].property,
			val = Math.round(arr[i].start + arr[i].diff * increment);
		if (/img|iframe/i.test(node.tagName) && this.rex.WH.test(prop)) {
			node[prop] = val;
		} else {
			node.style[prop] = val + 'px';
		}
	}
	if (increment >= 1) {
		delete this.timeouts.resizeGroup;
		if (callback) callback();
	} else {
		this.timeouts.resizeGroup = setTimeout(function() { that.stepResize(increment + rate, rate, arr, callback); }, 20);
	}
},
getDisplaySize: function() {
	return { width: this.getDisplayWidth(), height: this.getDisplayHeight() };
},
getDisplayWidth: function() {
	return this.html.clientWidth || this.bod.clientWidth;
},
getDisplayHeight: function() {
	if (this.doc.childNodes && !this.doc.all && !navigator.taintEnabled && !this.doc.evaluate) {
		return this.win.innerHeight;
	}
	if (!this.html.clientHeight || this.operaOld || this.doc.compatMode === 'BackCompat') {
		return this.bod.clientHeight;
	}
	return this.html.clientHeight;
},
getScroll: function(win) {
	win = win || this.win;
	var doc = win.document;
	return {
		left: win.pageXOffset || doc.body.scrollLeft || doc.documentElement.scrollLeft || 0,
		top: win.pageYOffset || doc.body.scrollTop || doc.documentElement.scrollTop || 0
	};
},
getLeftTop: function(el, local) {
	var left = el.offsetLeft || 0,
		top = el.offsetTop || 0,
		doc = el.ownerDocument || el.document,
		win = doc.defaultView || doc.parentWindow || doc.contentWindow,
		scroll = this.getScroll(win),
		compStyle = win.getComputedStyle,
		position = ((el.currentStyle && el.currentStyle.position) || (compStyle && compStyle(el, '').getPropertyValue('position')) || '').toLowerCase(),
		rex = /absolute|fixed/,
		elFlow = !rex.test(position),
		inFlow = elFlow,
		node = el;
	if (position === 'fixed') {
		left += scroll.left;
		top += scroll.top;
	}
	while (position !== 'fixed' && (node = node.offsetParent)) {
		var borderLeft = 0, borderTop = 0, nodeFlow = true;
		if (node.currentStyle) {
			position = (node.currentStyle.position || '').toLowerCase();
			nodeFlow = !rex.test(position);
			if (this.opera) {
				if (local && node !== doc.body) {
					left += node.scrollLeft - node.clientLeft;
					top += node.scrollTop - node.clientTop;
				}
			} else {
				if (node.currentStyle.hasLayout && node !== doc.documentElement) {
					borderLeft = node.clientLeft;
					borderTop = node.clientTop;
				}
			}
		} else if (compStyle) {
			position = (compStyle(node, '').getPropertyValue('position') || '').toLowerCase();
			nodeFlow = !rex.test(position);
			borderLeft = parseInt(compStyle(node, '').getPropertyValue('border-left-width'), 10);
			borderTop = parseInt(compStyle(node, '').getPropertyValue('border-top-width'), 10);
			if (this.ff && node === el.offsetParent && !nodeFlow && (this.ffOld || !elFlow)) {
				left += borderLeft;
				top += borderTop;
			}
		}
		if (!nodeFlow) {
			if (local) return { left: left, top: top };
			inFlow = false;
		}
		left += node.offsetLeft + borderLeft;
		top += node.offsetTop + borderTop;
		if (position === 'fixed') {
			left += scroll.left;
			top += scroll.top;
		}
		if (!(this.opera && elFlow) && node !== doc.body && node !== doc.documentElement) {
			left -= node.scrollLeft;
			top -= node.scrollTop;
		}
	}
	if (this.ff && inFlow) {
		left += parseInt(compStyle(doc.body, '').getPropertyValue('border-left-width'), 10);
		top += parseInt(compStyle(doc.body, '').getPropertyValue('border-top-width'), 10);
	}
	if (!local && win !== this.win) {
		var rex = new RegExp(),
			iframes = win.parent.document.getElementsByTagName('iframe'),
			i = iframes.length;
		while (i--) {
			var node = iframes[i],
				idoc = false;
			try {
				idoc = node.contentDocument || node.contentWindow;
				idoc = idoc.document || idoc;
			} catch(e) {}
			rex.compile(node.src + '$');
			if (idoc === doc || (typeof idoc !== 'object' && rex.test(win.location))) {
				var pos = this.getLeftTop(node);
				left += pos.left - scroll.left;
				top += pos.top - scroll.top;
				if (node.currentStyle) {
					var padLeft = 0, padTop = 0;
					if (!this.ie || elFlow) {
						padLeft = parseInt(node.currentStyle.paddingLeft, 10);
						padTop = parseInt(node.currentStyle.paddingTop, 10);
					}
					left += node.clientLeft + padLeft;
					top += node.clientTop + padTop;
				}
				else if (compStyle) {
					left += parseInt(compStyle(node, '').getPropertyValue('border-left-width'), 10) +
					parseInt(compStyle(node, '').getPropertyValue('padding-left'), 10);
					top += parseInt(compStyle(node, '').getPropertyValue('border-top-width'), 10) +
					parseInt(compStyle(node, '').getPropertyValue('padding-top'), 10);
				}
				break;
			}
		}
	}
	return { left: left, top: top };
},
getLayout: function(el) {
	var lay = this.getLeftTop(el);
	lay.width = el.offsetWidth;
	lay.height = el.offsetHeight;
	return lay;
},
hideElements: function(type, thisWindow) {
	if (!thisWindow) {
		this.hideElements(type, this.win);
	} else {
		var tagName, tagNames = type === 'flash' ? ['object', 'embed'] : [type];
		try {
			while ((tagName = tagNames.pop())) {
				var els = thisWindow.document.getElementsByTagName(tagName),
					i = els.length;
				while (i--) {
					var el = els[i];
					if (el.style.visibility !== 'hidden' && (tagName !== 'object' ||
					(el.getAttribute('type') && el.getAttribute('type').toLowerCase() === 'application/x-shockwave-flash') ||
					(el.getAttribute('classid') && el.getAttribute('classid').toLowerCase() === 'clsid:d27cdb6e-ae6d-11cf-96b8-444553540000') ||
					/data\s*=\s*"?[^>"]+\.swf\b/i.test(el.innerHTML) ||
					/param\s+name\s*=\s*"?(movie|src)("|\s)[^>]+\.swf\b/i.test(el.innerHTML))) {
						this.hiddenEls.push(el);
						el.style.visibility = 'hidden';
					}
				}
			}
		} catch(e) {}
		var frames = thisWindow.frames,	i = frames.length;
		while (i--) {
			if (typeof frames[i].window === 'object') this.hideElements(type, frames[i].window);
		}
	}
},
clearTimeout: function(key) {
	if (this.timeouts[key]) {
		clearTimeout(this.timeouts[key]);
		delete this.timeouts[key];
	}
},
stretchOverlay: function() {
	var that = this;
	return function() {
		if (arguments.length === 1) {
			that.clearTimeout('stretch');
			that.timeouts.stretch = setTimeout(function() { that.stretchOverlay()(); }, 25);
		} else {
			delete that.timeouts.stretch;
			if (!that.fbBox) return;
			var width = that.fbBox.offsetLeft + that.fbBox.offsetWidth,
				height = that.fbBox.offsetTop + that.fbBox.offsetHeight,
				display = that.getDisplaySize(),
				scroll = that.getScroll(),
				overlay = that.fbOverlay.style;
			overlay.width = overlay.height = '0';
			overlay.width = Math.max(width, that.bod.scrollWidth, that.bod.clientWidth, that.html.clientWidth, display.width + scroll.left) + 'px';
			overlay.height = Math.max(height, that.bod.scrollHeight, that.bod.clientHeight, that.html.clientHeight, display.height + scroll.top) + 'px';
		}
	};
},
encodeHTML: function(str) {
	return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
},
decodeHTML: function(str) {
	return str.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&apos;/g, "'").replace(/&#39;/g, "'").replace(/&amp;/g, '&');
},
getXMLHttpRequest: function() {
	var xhr, that = this;
	if (window.XMLHttpRequest) {
		if (!(xhr = new XMLHttpRequest())) return false;
	} else {
		try { xhr = new ActiveXObject("Msxml2.XMLHTTP"); } catch(e) {
			try { xhr = new ActiveXObject("Microsoft.XMLHTTP"); } catch(e) { return false; }
		}
	}
	return {
		getResponse: function(url, callback) {
			try {
				xhr.open('GET', url, true);
				xhr.onreadystatechange = function() {
					if (xhr.readyState === 4) {
						xhr.onreadystatechange = function() {};
						callback(xhr);
					}
				};
				xhr.send(null);
			} catch(e) {}
		}
	};
},
setInnerHTML: function(el, strHTML) {
	try {
		var range = this.doc.createRange();
		range.selectNodeContents(el);
		range.deleteContents();
		if (strHTML) {
			var xmlDiv = new DOMParser().parseFromString('<div xmlns="http://www.w3.org/1999/xhtml">' + strHTML + '</div>', 'application/xhtml+xml'),
				childNodes = xmlDiv.documentElement.childNodes;
			for (var i = 0, len = childNodes.length; i < len; i++) {
				el.appendChild(this.doc.importNode(childNodes[i], true));
			}
		}
		return true;
	} catch (e) {}
	try {
		el.innerHTML = strHTML;
		return true;
	} catch(e) {}
	return false;
},
loadAnchor: function(href, rev, title) {
	if (href.setAttribute) {
		var anchor = href;
		if (!anchor.getAttribute('rel')) anchor.setAttribute('rel', 'floatbox');
		fb.lastChild.start(this.tagOneAnchor(anchor));
	} else {
		fb.lastChild.start(this.tagOneAnchor({ href: href, rev: rev, title: title, rel: 'floatbox' }));
	}
},
goBack: function() {
	var a;
	if ((a = fb.previousAnchor)) {
		this.loadAnchor(a.href, a.rev + ' sameBox:true', a.title);
	}
},
resize: function(width, height) {
	if (width) fb.lastChild.currentItem.nativeWidth = width;
	if (height) fb.lastChild.currentItem.nativeHeight = height;
	fb.lastChild.calcSize(false);
}
};
function initfb() {
	if (arguments.callee.done) return;
	if (document.compatMode === 'BackCompat') {
		arguments.callee.done = true;
		alert('Floatbox does not support quirks mode.\nPage needs to have a valid a doc type.');
		return;
	}
	if (self !== top && !parent.fb) return setTimeout(initfb, 50);
	arguments.callee.done = true;
	if (self === top) top.floatbox = new Floatbox();
	fb = top.floatbox;
	fb.tagAnchors(self.document.body);
	if (fb.autoStart) {
		fb.start(fb.autoStart);
		if (typeof fb !== 'undefined') delete fb.autoStart;
	} else {
		fb.preloadImages('', true);
	}
}
/*@cc_on
fb_tempNode = document.createElement('div');
(function() {
	if (document.readyState !== 'complete') return setTimeout(arguments.callee, 50);
	try {
		fb_tempNode.doScroll('left');
	} catch(e) {
		return setTimeout(arguments.callee, 50);
	}
	initfb();
	delete fb_tempNode;
})();
/*@if (false) @*/
if (/Apple|KDE/i.test(navigator.vendor)) {
	(function() {
		if (/loaded|complete/.test(document.readyState)) {
			initfb();
		} else {
			setTimeout(arguments.callee, 50);
		}
	})();
} else if (document.addEventListener) {
	document.addEventListener('DOMContentLoaded', initfb, false);
}
/*@end @*/
fb_prevOnload = window.onload;
window.onload = function() {
	if (typeof fb_prevOnload === 'function') fb_prevOnload();
	initfb();
};
