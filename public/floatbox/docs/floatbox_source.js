/************************************************************************************************
* Floatbox v3.12
* September 17, 2008
*
* Copyright (C) 2008 Byron McGregor
* Website: http://randomous.com/tools/floatbox/
* License: Creative Commons Attribution 3.0 License (http://creativecommons.org/licenses/by/3.0/)
* This comment block must be retained in all deployments and distributions
*************************************************************************************************/

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

//************/
// init()
// Constructor
//************/
init: function() {
// 'global' vars
	this.win = top;
	this.doc = this.win.document;
	this.bod = this.doc.body;
	this.html = this.doc.documentElement;
	this.items = [];
	this.nodeNames = [];
	this.hiddenEls = [];
	this.timeouts = {};
	this.pos = {};
// things that could be configurable options but are here as constants instead
	this.lowerPanelSpace = 24;  // gap between infoPanel (on the left) and controlPanel (on the right)
	this.showHintsTime = 1600; // minimum milliseconds tooltip hints must be shown before they can be cleared
	this.zoomPopBorder = 1;  // fbZoomDiv and popup thumbnail border width
	this.controlSpacing = 8; // gap between control panel gadgets for English
	this.ctrlJump = 5;  // page jump size when ctrl+arrowKey is pressed
	this.slowLoadDelay = 1250;  // msecs to wait for initial content before showing the slow-load gif display
	this.loaderDelay = 200;  // msecs to wait when resizing or swapping before showing the loader gif
	this.shadowSize = 8;  // pixel size of the shadow graphics
	this.loadingImgSize = 42;  // loader gif width and height
	var folder = this.defaultOptions.urlGraphics;
	this.slowZoomImg = folder + 'loading_white.gif';  // overlays the zoomDiv image
	this.slowLoadImg = folder + 'loading_black.gif';  // appears above the clicked anchor
	this.iframeSrc = folder + 'loading_iframe.html';  // initial iframe content until the real fetch happens
	this.resizeUpCursor = folder + 'magnify_plus.cur';  // custom cursor appears above the image
	this.resizeDownCursor = folder + 'magnify_minus.cur';
	this.notFoundImg = folder + '404.jpg';  // show this image if the href'd image can't be found
	this.defaultWidth = 500;  // if item width can't be determined
	this.defaultHeight = 500;  // if item height can't be determined
	this.minInfoWidth = 80;  // if info panel width is less than this, don't display it
// child detection
	if (!(this.isChild = !!(this.win.floatbox && this.win.floatbox.fbBox))) {
		this.lastChild = this;
// things that are present only on the primary floatbox
		this.anchors = [];
		this.children = [];
		this.content = {};
		this.preloads = {};
		this.preloads.count = 0;
		this.saveReplace = top.location.replace;  // frame buster buster (ie and opera only)
		this.xhr = this.getXMLHttpRequest();
		// default strings in case xhr doesn't work (but it will)
		// also for english ie because ie on xp won't display the unicode arrows without language pack installs
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
		// some regular expressions we'll need
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
	} else {  // this is a secondary floatbox
// point some things to the primary objects
		this.anchors = fb.anchors;
		this.children = fb.children;
		this.content = fb.content;
		this.xhr = fb.xhr;
		this.strings = fb.strings;
		this.rex = fb.rex;
// keep track of the kids (add here, remove in end())
		fb.lastChild = this;
		this.children.push(this);
	}
// browser detects
	if (window.opera) {
		this.opera = true;
		this.operaOld = !document.getElementsByClassName;  // less than v9.5
	} else if (document.all) {
		this.ie = true;
		this.ieOld = parseInt(navigator.appVersion.substr(navigator.appVersion.indexOf('MSIE') + 5), 10) < 7;  // less than v7.0
		this.ie8b2 = window.postMessage && navigator.appMinorVersion === 'beta 2';  // ie8beta detect
		this.ieXP = parseInt(navigator.appVersion.substr(navigator.appVersion.indexOf('Windows NT') + 11), 10) < 6;  // less than Vista (6.0)
	} else if (navigator.userAgent.indexOf('Firefox') !== -1) {
		this.ff = true;
		this.ffOld = !document.getElementsByClassName;  // less than v3
		this.ffNew = !this.ffOld;
	}
	this.browserLanguage = (navigator.language || navigator.userLanguage || navigator.systemLanguage || navigator.browserLanguage || 'en').substring(0, 2);
// set international preferences
	if (!this.isChild) {
		// localized strings
		var lang = this.defaultOptions.language;
		if (lang === 'auto') lang = this.browserLanguage;
		if (this.xhr) {
			// get the language definition from an ajax/json response
			var that = this;
			this.xhr.getResponse(this.defaultOptions.urlLanguages + lang + '.json', function(xhr) {
				if ((xhr.status === 200 || xhr.status === 203 || xhr.status === 304) && xhr.responseText) {
					var text = xhr.responseText;
					if (that.ieXP) {  // ie on xp can't show the arrows in tooltips without language packs installed
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
	// control graphics
	if (this.defaultOptions.graphicsType.toLowerCase() === 'english' || (this.defaultOptions.graphicsType === 'auto' && this.browserLanguage === 'en')) {
		this.offPos = 'top left';
		this.onPos = 'bottom left';
	} else {
		this.offPos = 'top right';
		this.onPos = 'bottom right';
		this.controlSpacing = 0;  // the graphics-only widgets are narrower than the ones with text included
	}
// z-index values for floatbox elements
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
// look for autoStart request in the url query string
	var rex = /\bautoStart=(.+?)(?:&|$)/i,
		match = rex.exec(this.win.location.search);
	this.autoHref = match ? match[1] : false;
},  // end init

//**************************************/
// tagAnchors()
// Look for and 'tag' floatboxed anchors
//**************************************/
tagAnchors: function(baseEl) {
	// <a> elements
	var anchors = baseEl.getElementsByTagName('a');
	for (var i = 0, len = anchors.length; i < len; i++) {
		this.tagOneAnchor(anchors[i]);
	}
	// image map <area> elements
	var anchors = baseEl.getElementsByTagName('area');
	for (var i = 0, len = anchors.length; i < len; i++) {
		this.tagOneAnchor(anchors[i]);
	}
},  // end tagAnchors

//*******************************************************************************/
// tagOneAnchor()
// Set anchor action, determine type, add to anchor array, and look for autoStart
// Param can be a real anchor node or an associative object describing attributes
//*******************************************************************************/
tagOneAnchor: function(anchor) {
	var that = this,
		isAnchor = !!anchor.getAttribute,
		a, thumb, popup;
	if (isAnchor) {
		// build an object out of the anchor's attributes
		a = {
			href: anchor.href || anchor.getAttribute('href'),
			rel: anchor.getAttribute('rel'),
			rev: anchor.getAttribute('rev'),
			title: anchor.getAttribute('title'),
			anchor: anchor  // save the anchor for use in popups and animations
		};
		// see if this anchor has a popup thumbnail with it
		if (isAnchor && (popup = this.rex.popup.test(anchor.className))) {
			if ((thumb = this.getThumb(anchor))) {
				a.popup = true;
				thumb.style.borderWidth = this.zoomPopBorder + 'px';
				// move the thumb into place on mouseover
				anchor.onmouseover = function () {
					thumb.style.display = 'none';  // exclude thumbnail from measurments
					var aPos = that.getLeftTop(this, true),
						aLeft = aPos.left,
						aTop = aPos.top;
					aPos = that.getLayout(this);
					thumb.style.display = '';  // measurable
					// set popup to show just above the anchor
					var relLeft = (aPos.width - thumb.offsetWidth)/2,
						relTop = -(thumb.offsetHeight - 2),
						scroll = that.getScroll(),
						screenRight = scroll.left + that.getDisplayWidth(),
						screenTop = scroll.top;
					// if popup is offscreen, move it in and/or down
					var spill = aPos.left + relLeft + thumb.offsetWidth - screenRight;  // pixels past the right screen edge
					if (spill > 0) relLeft -= spill;
					var spill = aPos.left + relLeft - scroll.left;  // pixels before the left screen edge
					if (spill < 0) relLeft -= spill;
					if (aPos.top + relTop < screenTop) relTop = aPos.height;
					thumb.style.left = (aLeft + relLeft) + 'px';
					thumb.style.top = (aTop + relTop) + 'px';
				};
				// move the thumb off-screen on mouseout
				anchor.onmouseout = function () {
					thumb.style.left = '-9999px';
					thumb.style.top = '0';
				};
			}
		}
	} else {
		a = anchor;
	}
	if (this.rex.fbxd.test(a.rel)) {  // if one of the "pick me" strings is on the rel attribute...
		if (isAnchor) {
			// activated anchors do this
			anchor.onclick = function() {
				fb.start(this);
				return false;
			};
		}
		// capture revOptions for each anchor
		a.revOptions = this.parseOptionString(a.rev);
		// each anchor record is associated with a particular box/level
		a.level = this.children.length + (fb.lastChild.fbBox && !a.revOptions.sameBox ? 1 : 0);
		// don't duplicate anchors on a refresh
		var a_i, i = this.anchors.length;
		while (i--) {
			a_i = this.anchors[i];
			if (a_i.href === a.href && a_i.rel === a.rel && a_i.rev === a.rev && a_i.title === a.title && a_i.level === a.level) {
				a_i.anchor = anchor;  // update anchor record in case it's been re-generated
				break;
			}
		}
		if (i === -1) {  // not already in the anchor array
			// determine item type and grab the html content for some types
			this.rex.type.lastIndex = 0;
			var match = this.rex.type.exec(a.rev),  // look in rev tag for type, primarily for "type:ajax"
				typeOverride = match ? match[1].toLowerCase() : '';
			if (typeOverride === 'img' || this.rex.img.test(a.href)) { // image?
				a.type = 'img';
			} else if (typeOverride === 'flash' || this.rex.flash.test(a.href) || this.rex.youtube.test(a.href)) {  // flash?
				a.type = 'flash';
				this.content[a.href] = this.objectHTML(a.href, 'flash');
			} else if (typeOverride === 'quicktime' || this.rex.quicktime.test(a.href)) {  // quicktime?
				a.type = 'quicktime';
				this.content[a.href] = this.objectHTML(a.href, 'quicktime');
			} else if (typeOverride === 'ajax') {  // ajax?
				a.type = 'ajax';
			} else {  // inline div or iframe
				this.rex.div.lastIndex = 0;
				var match = this.rex.div.exec(a.href);
				if (match) {  // looks like an inline div request
					var doc = this.doc;  // which doc do we look for this div in?
					if (a.anchor) {  // try the owner doc for this anchor
						doc = a.anchor.ownerDocument || a.anchor.document || this.doc;
					}
					if (doc === this.doc && this.currentItem && this.currentItem.anchor) {  // or the owner doc for the currentItem (for links in the caption)
						doc = this.currentItem.anchor.ownerDocument || this.currentItem.anchor.document || this.doc;
					}
					var el = doc.getElementById(match[1]);
					if (el) {  // found the div
						a.type = 'inline';
						this.content[a.href] = el.cloneNode(true);  // capture a clone in case the original goes away
					} else {
						a.type = 'iframe';  // didn't find a div, use an iframe load
					}
				} else {
					a.type = 'iframe';  // everything else loads as iframe content
				}
			}
			this.anchors.push(a);  // add to the array of anchors that will be used by start()
			// look for autoStart request in the query string or rev option
			if (this.autoHref) {
				if (this.autoHref === a.href.substr(a.href.length - this.autoHref.length)) this.autoStart = a;
			} else {
				if (a.revOptions.autoStart) this.autoStart = a;
			}
		}
	}
	return a;
},  // end tagOneAnchor

//******************************************/
// objectHTML()
// Returns html object code for a given href
//******************************************/
objectHTML: function(href, type) {
	if (type === 'flash') {
		var classid = 'classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000"',
			mime = 'type="application/x-shockwave-flash"',
			pluginurl = 'http://www.macromedia.com/go/getflashplayer/',
			// pick up wmode, bgcolor and scale from query string (if they're there)
			match = /\bwmode=(\w+?)\b/i.exec(href),
			wmode = match ? match[1] : 'opaque',
			match = /\bbgcolor=(#\w+?)\b/i.exec(href),
			bgcolor = match ? match[1] : '',
			match = /\bscale=(\w+?)\b/i.exec(href),
			scale = match ? match[1] : 'exactfit',
			params = { wmode:wmode, bgcolor:bgcolor, scale:scale, quality:'high',
			flashvars:'autoplay=1&amp;ap=true&amp;border=0&amp;rel=0' };  // autoplay for youtube, (some) yahoo and google. ap for msn. border and rel(ated) for youtube
		// FF2 requires wmode=opaque for some flash.  FF3 requires wmode=window for some flash (only old yahoo that I've noticed)
		if (this.ff) params.wmode = this.ffOld ? 'opaque' : 'window';
	} else {  // quicktime
		var classid = 'classid="clsid:02BF25D5-8C17-4B23-BC80-D3488ABDDC6B"',
			mime = 'type="video/quicktime"',
			pluginurl = 'http://www.apple.com/quicktime/download/',
			params = { autoplay:'true', controller:'true', showlogo:'false', scale:'tofit' };
	}
	var html = '<object id="fbObject" width="%width%" height="%height%" ';  // width & height to be replaced later
	if (this.ie) {  // use active-x
		html += classid + '>';
		params.src = this.encodeHTML(href);
	} else {  // use plugin
		html += mime + ' data="' + this.encodeHTML(href) + '">';
	}
	for (var name in params) {
		if (params.hasOwnProperty(name)) {
			html += '<param name="' + name + '" value="' + params[name] + '" />';
		}
	}
	// object alternate content (hard-coded English unfortunately)
	html += '<p style="color:#000; background:#fff; margin:1em; padding:1em;">' +
	(type === 'flash' ? 'Flash' : 'QuickTime') + ' player is required to view this content.' +
	'<br /><a href="' + pluginurl + '">download player</a></p></object>';
	return html;
},  // end objectHTML

//**************************************/
// preloadImages()
// Preload/cache floatboxed images
// Chains preloading if that's enabled
//**************************************/
preloadImages: function(href, chain) {
	// do all preloading with the primary floatbox
	if (this !== fb) return fb.preloadImages(href, chain);
	var that = this;
	// turn chaining on or off with the chain param
	if (typeof chain !== 'undefined') arguments.callee.chain = chain;
	// if no href passed and chaining is enabled, look for an image to preload
	if (!href && arguments.callee.chain && (this.defaultOptions.preloadAll || !this.preloads.count)) {
		for (var i = 0, len = this.anchors.length; i < len; i++) {
			var a = this.anchors[i];
			if (a.type === 'img' && !this.preloads[a.href]) {
				href = a.href;  // not yet loaded - use this one
				break;
			}
		}
	}
	if (href) {  // from param or from the for loop
		if (this.preloads[href]) {  // already loaded?
			this.preloadImages();  // look for the next one to load
		} else {
			var img = this.preloads[href] = new Image();
			// chain the next image when this one completes or errors out
			img.onerror = function() {
				setTimeout(function() { that.preloadImages(); }, 50);
				that.preloads[href] = true;  // let the image object get garbage collected
			};
			img.onload = function() {
				that.preloads.count++;
				this.onerror();
			};
			img.src = href;
		}
	}
},  // end preloadImages

//*******************************************************/
// start()
// Fired when user clicks on one of the activated anchors
//*******************************************************/
start: function(anchor) {
	// only the last (top-most) child box is allowed to start stuff
	if (this !== fb.lastChild) return fb.lastChild.start(anchor);
	var that = this;
	this.preloadImages('', false);  // suspend image preloading
	if (anchor.getAttribute) {  // param can be an anchor or an object with anchor-like named properties
		var a = {
			href: anchor.href || anchor.getAttribute('href'),
			rel: anchor.getAttribute('rel'),
			rev: anchor.getAttribute('rev'),
			title: anchor.getAttribute('title')
		};
		a.revOptions = this.parseOptionString(a.rev);
		anchor.blur();  // remove focus (especially for Opera 9.5+)
	} else {
		var a = anchor;
	}
	this.isRestart = !!this.fbBox;
	if (this.isRestart) {
		// new floatbox requested and we're already in one?
		if (!a.revOptions.sameBox) return new Floatbox().start(anchor);  // start in a new floatbox
		this.setOptions(a.revOptions);  // else pick up new options from this rev tag
	} else {
		this.clickedAnchor = anchor.getAttribute ? anchor : false;  // for start and end animations
		top.location.replace = function() { return false; };  // frame buster buster (ie and opera only)
	}
	a.level = this.children.length + (fb.lastChild.fbBox && !a.revOptions.sameBox ? 1 : 0);  // capture level
	this.itemsShown = 0;  // slideshow counter
	fb.previousAnchor = this.currentItem;  // save previous start anchor (for goBack)
	this.buildItemArray(a);  // get the array of anchors for this group
	if (!this.itemCount) return;  // bail if we didn't find any
	if (this.itemCount === 1 && this.fbLowerNav) this.fbLowerNav.style.display = 'none';  // mostly for if loadAnchor has interrupted a group of items
	this.win.focus();  // grab keyboard handler
	this.revOptions = a.revOptions;  // use clicked anchor's rev options (esp. if showThis=false)
	if (!this.isRestart) {  // if this is a new floatbox, build it
		this.getOptions();
		this.buildDOM();
		this.addEventHandlers();
		this.initState();
	}
	// fetch and show content
	this.collapse();  // shows the loading gif
	this.updateInfoPanel();  // do this first so it's ready for calcSize
	if (this.fbBox.style.visibility  || this.isRestart) {
		// we're zooming in or restarting, overlay will be shown by the zoom in function or is already there
		this.fetchContent(function() { that.calcSize(); });
	} else {  // normal start
		var oncomplete = function() {
			that.fetchContent(function() {  // fetch content
				// when done, cancel and tear down slow-load display that was setup in initState
				that.clearTimeout('slowLoad');
				var zoomDiv = that.fbZoomDiv.style;
				zoomDiv.display = 'none';
				that.fbZoomImg.src = '';
				that.fbZoomImg.width = that.fbZoomImg.height = 0;
				zoomDiv.left = zoomDiv.top = zoomDiv.width = zoomDiv.height = '0';
				// proceed with floatbox display
				that.calcSize();
			} );
		};
		// show overlay and carry on from there
		this.fadeOpacity(this.fbOverlay, this.overlayOpacity, this.overlayFadeDuration, oncomplete);
	}
},  // end start

//***************************************************/
// buildItemArray()
// Populate the item array with items from this group
//***************************************************/
buildItemArray: function(a) {
	this.itemCount = this.items.length = this.currentIndex = 0;
	this.justImages = true;
	var isSingle = this.rex.single.test(a.rel);  // standalone item
	for (var i = 0, len = this.anchors.length; i < len; i++) {
		var a_i = this.anchors[i];
		if (a_i.rel === a.rel && a_i.level === a.level) {  // if rel matches the one from the clicked anchor...
			if (a_i.revOptions.showThis !== false) {
				var isMatch = a_i.rev === a.rev && a_i.title === a.title && a_i.href === a.href.substr(a.href.length - a_i.href.length);
				if (isMatch || !isSingle) {
					a_i.seen = false;  // for the slideshow counter
					// add it to the item array for this run
					this.items.push(a_i);
					if (a_i.type !== 'img') this.justImages = false;
					if (isMatch) this.currentIndex = this.items.length - 1;
				}
			}
		}
	}
	if (a.revOptions.showThis === false && a.href) {
		// a noShow item was clicked, look for a starting item based on href
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
},  // end buildItemArray

//*********************************************************/
// getOptions()
// options precedence is:
// 1) querystring from the host page url (good for testing)
// 2) options from the clicked link's rev attribute
// 3) from cookies set by external form or code
// 4) setFloatboxOptions() function defined on host page
// 5) those defined above in defaultOptions
//*********************************************************/
getOptions: function() {
	if (this.isChild) {
		// copy current options from the parent box
		var par = this.children[this.children.length - 2] || fb;
		for (var name in this.defaultOptions) {
			if (this.defaultOptions.hasOwnProperty(name)) this[name] = par[name];
		}
		// get the child box options overrides from above
		this.setOptions(this.childOptions, true);
	} else {
		this.setOptions(this.defaultOptions, true);
	}
	this.doSlideshow = this.loadPageOnClose = this.sameBox = false;  // these will be picked up from rev tag, setFloatboxOptions(), etc
	if (!(this.isChild || this.fbBox)) {
		if (typeof this.win.setFloatboxOptions === 'function') this.win.setFloatboxOptions();
		if (this.enableCookies) {
			// get and parse our options cookie
			this.rex.cookie.lastIndex = 0;
			var match = this.rex.cookie.exec(this.doc.cookie);
			if (match) this.setOptions(this.parseOptionString(match[1]));
			// set the options cookie for the benefit of external options forms or other code
			// cookie will look like "fbOptions= option1:value1 option2:value2 ..."
			// cookie will contain only options listed in the defaultOptions object
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
	this.setOptions(this.revOptions);  // options from the clicked item's rev attribute
	this.setOptions(this.parseOptionString(this.win.location.search.substring(1)));  //options from the page url's querystring
// adjust options to circumstances
	if (this.theme === 'grey') this.theme = 'white';  // backward compatability
	if (this.endTask === 'cont') this.endTask = 'loop';  // backward compatability
	if (!this.rex.validTheme.test(this.theme)) this.theme='auto';  // default
	if (!this.rex.validNav.test(this.navType)) this.navType = 'lower';  // default
	this.isSlideshow = this.itemCount > 1 && (this.rex.slideshow.test(this.currentItem.rel) || this.doSlideshow);
	this.isPaused = this.startPaused;
	if ((this.lclTheme = this.theme) === 'auto') {
		this.lclTheme = this.currentItem.type === 'img' ? 'black' : /flash|quicktime/.test(this.currentItem.type) ? 'blue' : 'white';
	}
	if (!this.doAnimations) {
		this.resizeDuration = this.imageFadeDuration = this.overlayFadeDuration = 0;
	}
	if (!this.resizeDuration) this.zoomImageStart = false;
	if (this.ieOld) this.dropShadow = false;  // ie6 can't handle transparent pngs
// adjust opacity to 0-1 decimal values
	this.overlayOpacity /= 100;
	this.upperOpacity /= 100;
// adjust nav type to circumstances
	this.upperNav = this.itemCount > 1 && this.justImages && this.rex.upperNav.test(this.navType);
	this.lowerNav = this.itemCount > 1 && (this.rex.lowerNav.test(this.navType) || (!this.justImages && this.rex.upperNav.test(this.navType)));
},  // end getOptions

//*******************************************************************/
// parseOptionString()
// Return object of name:value pairs from a query string or a rev tag
// e.g., "doSlideshow=true&navType=none"   (queryString syntax)
//   or, "doSlideshow:true navType:none"   (valid rev attribute)
//   or, "doSlideshow:true; navType:none;"  (style/css syntax)
//*******************************************************************/
parseOptionString: function(str) {
	if (!str) return {};
	var quotes = [], match;
	this.rex.backQuote.lastIndex = 0;
	while ((match = this.rex.backQuote.exec(str))) quotes.push(match[1]);  // capture all backquoted segments
	if (quotes.length) str = str.replace(this.rex.backQuote, '``');  // remove backquoted segments from the string but leave the backquotes to mark the spot
	str = str.replace(/\s*[:=]\s*/g, ':');  // = to :, trim internal spaces
	str = str.replace(/\s*[;&]\s*/g, ' ');  // & and ; to space, trim extra spaces
	str = str.replace(/^\s+|\s+$/g, '');  // trim leading and trailing spaces
	// now we've got "key:value key:value" pairs
	var pairs = {},
		aVars = str.split(' '),
		i = aVars.length;
	while (i--) {
		var aThisVar = aVars[i].split(':'),  // split this name:value pair
			name = aThisVar[0],
			value = aThisVar[1];
		if (typeof value === 'string') {  // parse booleans and numbers out of strings
			if (!isNaN(value)) value = +value;  // convert to a number
			else if (value === 'true') value = true;
			else if (value === 'false') value = false;
		}
		if (value === '``') value = quotes.pop() || '';  // put any backquoted string back in place
		pairs[name] = value;  // add this one to our pairs object
	}
	return pairs;
},  // end parseOptionString

//*****************************************************/
// setOptions()
// Sets floatbox options from a name:value pairs object
//*****************************************************/
setOptions: function(pairs, quick) {
	for (var name in pairs) {
		if (pairs.hasOwnProperty(name)) this[name] = pairs[name];
	}
},  // end setOptions

//******************/
// buildDOM()
// Assemble floatbox
//******************/
buildDOM: function() {

// Insert elements into the document body that look like the following:
//	<div id="fbOverlay"></div>
// 	<div id="fbZoomDiv">
// 		<img id="fbZoomImg" />
// 	</div>
//	<div id="fbBox">
// 		<div id="fbShadowRight"></div>
// 		<div id="fbShadowBottom"></div>
// 		<div id="fbShadowCorner"></div>
//		<div id="fbLoader"></div>
//		<div id="fbContentPanel">
//			<div id="fbDiv">
//				<img|iframe id="fbContent" /> (maybe)
//			</div>
//			<a id="fbLeftNav"></a>
//			<a id="fbRightNav"></a>
//			<a id="fbUpperPrev" title="hintPrev"></a>
//			<a id="fbUpperNext" title="hintNext"></a>
//			<a id="fbResizer" title="hintResize"></a>
// 			<div id="fbInfoPanel">
// 				<span id="fbCaption"></span>
// 				<span id="fbInfoLink"></span>
// 				<span id="fbItemNumber"></span>
// 			</div>
// 			<div id="fbControlPanel">
// 				<div id="fbLowerNav">
// 					<a id="fbLowerPrev" title="hintPrev"></a>
// 					<a id="fbLowerNext" title="hintNext"></a>
// 				</div>
// 				<div id="fbControls">
// 					<a id="fbClose" title="hintClose"></a>
// 					<div id="fbPlayPause">
// 						<a id="fbPlay" title="hintPlay"></a>
// 						<a id="fbPause" title="hintPause"></a>
// 					</div>
// 				</div>
// 			</div>
// 		</div>
//	</div>

	this.fbOverlay		= this.newNode('div', 'fbOverlay', this.bod);
	this.fbZoomDiv		= this.newNode('div', 'fbZoomDiv', this.bod);
	this.fbZoomImg		= this.newNode('img', 'fbZoomImg', this.fbZoomDiv);
	this.fbBox			= this.newNode('div', 'fbBox');  // append to body after all the child nodes are in place
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
},  // end buildDOM

//*********************/
// newNode()
// Create a DOM element
//*********************/
newNode: function(nodeType, id, parentNode, title) {
	// remove pre-existing node
	if (this[id] && this[id].parentNode) {
		this[id].parentNode.removeChild(this[id]);
	}
	// create and configure new node
	var node = this.doc.createElement(nodeType);
	node.id = id;
	node.className = id + '_' + this.lclTheme;
	if (nodeType === 'a') {
		if (!this.operaOld) node.setAttribute('href', '');  // opera pre 9.5 shows fugly tooltips if there's an href (they won't get the hand cursor either)
		if (this.ieOld) node.setAttribute('hideFocus', 'true');  // ie6 css bug ignores outline:none;
	} else if (nodeType === 'iframe') {
		node.setAttribute('scrolling', this.itemScroll);  // IE will ignore setting iframe scrolling after the element has been added to the dom
		node.setAttribute('frameBorder', '0');  // note: IE needs the capital B and will ignore any changes to frameborder after the element is added to the DOM
		node.setAttribute('align', 'middle');
		node.src = this.iframeSrc;  // shows the initial loading gif and avoids the IE6 SSL bug
	}
	if (title && this.showHints !== 'never') node.setAttribute('title', title);
	if (this.zIndex[id]) node.style.zIndex = this.zIndex.base + this.zIndex[id];
	node.style.display = 'none';  // everything starts off hidden
	if (parentNode) parentNode.appendChild(node);
	this.nodeNames.push(id);  // keep a list of created nodes for cleanup on end
	return node;
},  // end newNode

//**********************************************/
// addEventHandlers()
// Add event handlers to the floatbox components
//**********************************************/
addEventHandlers: function() {
	var that = this,
// short-hand style closures for event handlers
	leftNav = this.fbLeftNav.style,
	rightNav = this.fbRightNav.style,
	upperPrev = this.fbUpperPrev.style,
	upperNext = this.fbUpperNext.style,
	lowerPrev = this.fbLowerPrev.style,
	lowerNext = this.fbLowerNext.style;
// utility function used by mouse events to clear show-once hints
	if (this.showHints === 'once') {
		this.hideHint = function(id) {
			if (that[id].title) {
				that.timeouts[id] = setTimeout(function() {
					if (/fb(Upper|Lower)(Prev|Next)/.test(id)) {  // clear both nav thingy titles together
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
// attach event behaviours to the controls
	this.fbPlay.onclick = function() { that.setPause(false); return false; };
	this.fbPause.onclick = function() { that.setPause(true); return false; };
	this.fbClose.onclick = function() { that.end(); return false; };
	if (this.outsideClickCloses) {
		this.fbOverlay.onclick = this.fbShadowRight.onclick = this.fbShadowBottom.onclick =
		this.fbShadowCorner.onclick = function() { that.end(); return false; };
	}
	this.fbLowerPrev.onclick = function(step) {
		if (typeof step !== 'number') step = 1;
		var newIndex = (that.currentIndex - step) % that.itemCount;  // modulo remainder
		if (newIndex < 0) newIndex += that.itemCount;  // adjust if it's negative
		if (that.enableWrap || newIndex < that.currentIndex) {
			// show previous item and adjust pause state
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
			// show next item and adjust pause state
			that.newContent(newIndex);
			if (that.isSlideshow && that.pauseOnNext && !that.isPaused) {
				that.setPause(true);
			}
		}
		return false;
	};
// set upper nav panel mouse actions
	// onclick same as lower nav onclick action
	this.fbLeftNav.onclick = this.fbUpperPrev.onclick = this.fbLowerPrev.onclick;
	this.fbRightNav.onclick = this.fbUpperNext.onclick = this.fbLowerNext.onclick;
	// mouseover, mousemove
	this.fbLeftNav.onmouseover = this.fbLeftNav.onmousemove =
	this.fbUpperPrev.onmousemove = function() {
		// if the content panel is not currently fading in, show the upper prev widget
		if (!that.timeouts.fbContentPanel) upperPrev.visibility = '';
		// if the upper prev widget is set to not show, light up the lower prev instead
		if (that.lowerNav) lowerPrev.backgroundPosition = that.onPos;
		return true;  // block status bar showing of bogus href
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
	// mouseout
	this.fbLeftNav.onmouseout = function() {
		// hide the upper prev widget and turn off highlighting of lower prev
		upperPrev.visibility = 'hidden';
		if (that.lowerNav) lowerPrev.backgroundPosition = that.offPos;
	};
	this.fbRightNav.onmouseout = function() {
		upperNext.visibility = 'hidden';
		if (that.lowerNav) lowerNext.backgroundPosition = that.offPos;
	};
	this.fbUpperPrev.onmouseout = this.fbUpperNext.onmouseout = function() {
		this.style.visibility = 'hidden';
		// cancel the remove title timer. Tooltip did not have enough time to display
		that.clearTimeout(this.id);
	};
	// right-click handler to show the image context menu in place of the nav overlay context menu
	this.fbLeftNav.onmousedown = this.fbRightNav.onmousedown = function(e) {
		e = e || that.win.event;
		if (e.button === 2) {  // if it's a right-click
			// briefly hide the nav panels so the image will be the topmost event handler
			leftNav.visibility = rightNav.visibility = 'hidden';
			that.timeouts.hideUpperNav = setTimeout(function() {
				leftNav.visibility = rightNav.visibility = '';
			}, 600);
		}
	};
// mouse actions to clear show-once hints and activate lower controls background sprite animation
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
// turn keyboard handler on or off
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
// block stupid opera spacebar keypress action
	if (this.opera && !this.keypressSet) {
		this.priorOnkeypress = this.doc.onkeypress;
		this.doc.onkeypress = function() { return false; };
		this.keypressSet = true;
	}
},  // end addEventHandlers

//********************************/
// keyboardAction()
// returns onkeydown event handler
//********************************/
keyboardAction: function() {
	var that = this;
	return function(e) {
		e = e || that.win.event;
		var keyCode = e.keyCode || e.which;
		switch (keyCode) {
	// left/right arrow: prev/next item
			case 37: case 39:
				if (that.itemCount > 1) {
					that[keyCode === 37 ? 'fbLowerPrev' : 'fbLowerNext'].onclick((e.ctrlKey || e.metaKey) ? that.ctrlJump : 1);
					if (that.showHints === 'once') {
						// turn off hints, because user already knows
						that.fbLowerPrev.title = that.fbLowerNext.title =
						that.fbUpperPrev.title = that.fbUpperNext.title = '';
					}
				}
				return false;  // block horizontal scroll
	// spacebar: toggle play/pause
			case 32:
				if (that.isSlideshow) {
					that.setPause(!that.isPaused);
					if (that.showHints === 'once') that.fbPlay.title = that.fbPause.title = '';
				}
				return false;  // block vertical scroll
	// tab: resize
			case 9:
				if (that.fbResizer.onclick) {
					that.fbResizer.onclick();
					if (that.showHints === 'once') that.fbResizer.title = '';
				}
				return false;
	// esc: exit
			case 27:
				if (that.showHints === 'once') that.fbClose.title = '';  // for next run
				that.end();
				return false;  // don't let esc cancel end() function's loadPageOnClose action
	// block enter key reload of active anchor on the launching page
			case 13:
				return false;
		}
	};
},  // end keyboardAction

//*********************************************/
// initState()
//*********************************************/
initState: function() {
	var that = this,
// short names for styles
		box = this.fbBox.style,
		div = this.fbDiv.style,
		resizer = this.fbResizer.style,
		contentPanel = this.fbContentPanel.style,
		infoPanel = this.fbInfoPanel.style,
		controlPanel = this.fbControlPanel.style,
		zoomDiv = this.fbZoomDiv.style,
		zoomImg = this.fbZoomImg.style;
// set starting dimensions
	if (this.currentItem.popup) this.currentItem.anchor.onmouseover();  // on some browsers the popup won't go away on it's on under fb
	var anchorPos = this.getAnchorPos(this.clickedAnchor, this.currentItem.anchor === this.clickedAnchor && this.currentItem.type === 'img');
	if (anchorPos.width) {  // it's a thumbnail and we're zooming from it
		this.pos.fbZoomDiv = anchorPos;
		zoomDiv.borderWidth = this.zoomPopBorder + 'px';
		zoomDiv.left = (anchorPos.left - this.zoomPopBorder) + 'px';
		zoomDiv.top = (anchorPos.top - this.zoomPopBorder) + 'px';
		zoomDiv.width = (this.fbZoomImg.width = anchorPos.width) + 'px';
		zoomDiv.height = (this.fbZoomImg.height = anchorPos.height) + 'px';
		this.fbZoomImg.src = anchorPos.src;
		box.visibility = 'hidden';
		// show the loading gif over the thumbnail if the image is slow to load
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
		// show loading gif over clicked anchor if content is slow to load
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
// configure elements
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
		if (fb.showUpperNav === 'never' || (fb.showUpperNav === 'once' && fb.upperNavShown)) {  //upperNavShown persists through restarts
			fb.showUpperNav = false;  // using fb instead of this to make it universal across all boxes
		} else {
			this.fbUpperPrev.style.backgroundPosition = this.fbUpperNext.style.backgroundPosition = this.onPos;
			this.fadeOpacity(this.fbUpperPrev, this.upperOpacity);
			this.fadeOpacity(this.fbUpperNext, this.upperOpacity);
		}
	}
	infoPanel.width = '400px';  // an average value to start measuring from
	this.buildControlPanel();
	this.lastShown = false;
// hide flash and java 'cause they can bleed through in some circumstances
	if (this.hideFlash) this.hideElements('flash');
	if (this.hideJava) this.hideElements('applet');
// ie6 always shows selects on top, doesn't handle position:fixed and doesn't respect height/width:100% against the body
	if (this.ieOld) {
		this.hideElements('select');
		this.fbOverlay.style.position = 'absolute';
		this.stretchOverlay()();
		this.win.attachEvent('onresize', this.stretchOverlay());
		this.win.attachEvent('onscroll', this.stretchOverlay());
	}
},  // end initState

//**********************************************************/
// getAnchorPos()
// Gets the position we want to use for starting and ending,
// not always the real anchor pos
//**********************************************************/
getAnchorPos: function(anchor, isImg) {
	var display = this.getDisplaySize(),
		scroll = this.getScroll(),
		noAnchorPos = { left: display.width/2 + scroll.left, top: display.height/3 + scroll.top, width: 0, height: 0 };
	// if this anchor points to an image, look for a corresponding thumbnail
	var thumb = isImg ? this.getThumb(anchor) : false;
	if (thumb && this.zoomImageStart) {
		var pos = this.getLeftTop(thumb),
			border = (thumb.offsetWidth - thumb.width)/2;
		pos.left += border;
		pos.top += border;
		pos.width = thumb.width;
		pos.height = thumb.height;
		pos.src = thumb.src;  // passed back to initState so it can be used as the starting image
	} else if (!(this.startAtClick && anchor && anchor.offsetWidth && /^a$/i.test(anchor.tagName))) {
		return noAnchorPos;  // not a real anchor, or we're not starting from anchors
	} else {
		var pos = this.getLayout(thumb || anchor);
	}
	// off screen? (maybe fired by code)
	var centerPos = { left: pos.left + pos.width/2, top: pos.top + pos.height/2, width: 0, height: 0 };
	if (centerPos.left < scroll.left || centerPos.left > (scroll.left + display.width) ||
	centerPos.top < scroll.top || centerPos.top > (scroll.top + display.height)) {
		return noAnchorPos;
	}
	return (thumb && this.zoomImageStart ? pos : centerPos);
},  // end getAnchorPos

//*********************************************/
// getThumb()
// Returns thumbnail element from inside anchor
//*********************************************/
getThumb: function(anchor) {
	var nodes = anchor.childNodes, i = nodes.length;
	while (i--) {
		if (/img/i.test(nodes[i].tagName)) {  // child node is an image?
			return nodes[i];
		}
	}
	return false;
},  // end getThumb

//***************************************/
// buildControlPanel()
// Controls: close, prev/next, play/pause
//***************************************/
buildControlPanel: function() {
	var controlPanel = this.fbControlPanel.style,
		controls = this.fbControls.style;
// lowerNav
	if (this.lowerNav) {
		var lowerPrev = this.fbLowerPrev.style,
			lowerNext = this.fbLowerNext.style,
			lowerNav = this.fbLowerNav.style;
		lowerPrev.backgroundPosition = lowerNext.backgroundPosition = this.offPos;
		lowerNav.paddingRight = this.controlSpacing + 'px';
		controlPanel.display = lowerNav.display =
		lowerPrev.display = lowerNext.display = '';
	}
// controls
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
// set and capture width
	controls.width = width + 'px';
	this.controlPanelWidth = this.fbLowerNav.offsetWidth + width;
	controlPanel.width = this.controlPanelWidth + 'px';
	this.controlPanelHeight = this.fbControlPanel.offsetHeight;
	controlPanel.right = Math.max(this.padding, 8) + 'px';
},  // end buildControlPanel

//****************************************************/
// fetchContent()
// Load fbDiv with currentItem
// Also captures nativeWidth & nativeHeight
//****************************************************/
fetchContent: function(callback, phase) {
	var that = this;
	if (!phase) {  // phase 0
		// discard previous content
		if (this.fbContent) {
			this.fbDiv.removeChild(this.fbContent);
			delete this.fbContent;
		}
		this.setInnerHTML(this.fbDiv, '');
		// Opera needs a timer break here to successfully remove fbContent
		return this.timeouts.fetch = setTimeout(function() { that.fetchContent(callback, 1); }, 10);
	}
	// phase 1
	var div = this.fbDiv.style,
		item = this.currentItem;
	item.nativeWidth = item.revOptions.width;
	item.nativeHeight = item.revOptions.height;
	if (item.type !== 'img') {
		item.nativeWidth = item.nativeWidth || this.defaultWidth;
		item.nativeHeight = item.nativeHeight || this.defaultHeight;
	}
	// itemScroll is used by newNode when setting up an iframe
	this.itemScroll = item.revOptions.scroll || item.revOptions.scrolling || 'auto';
	if (/img|iframe/.test(item.type)) {
		div.overflow = 'hidden';  // turn off previously set div scrolling
		this.fbContent = this.newNode(item.type, 'fbContent', this.fbDiv);
		this.fbContent.style.display = '';
		this.fbContent.style.border = '0';  // override css conflicts
		if (item.type === 'img') {
			var loader = new Image();
			loader.onload = function() {
				item.nativeWidth = item.nativeWidth || loader.width;  // preference to dimensions in the rev option
				item.nativeHeight = item.nativeHeight || loader.height;
				that.fbContent.src = loader.src;
				if (callback) callback();
			};
			loader.onerror = function() {  // if the image can't be found
				// show the 404 image
				if (item.href !== that.notFoundImg) {
					this.src = item.href = that.notFoundImg;
				}
			};
			loader.src = item.href;
		}
		// iframe src is loaded at show time so as not to interfere with animated resizing
	} else {  // some kind of html content
		// set scroller preference via overflow
		div.overflow = this.itemScroll === 'yes' ? 'scroll' : (this.itemScroll === 'no' ? 'hidden' : 'auto');
		var contents = this.content[item.href];
		if (item.type === 'inline') {
			var el = contents.cloneNode(true);  // clone so we don't modify the original (although there's evidence that the original can change anyway)
			el.style.display = el.style.visibility = '';
			try { this.fbDiv.appendChild(el); }  // stick the clone in our div
			catch(e) { this.setInnerHTML(this.fbDiv, el.innerHTML); }
			this.tagAnchors(this.fbDiv);  // light up an floatbox links in the div content
		} else if (item.type === 'ajax') {
			// insert fetched html into our div
			this.xhr.getResponse(item.href, function(xhr) {
				if ((xhr.status === 200 || xhr.status === 203 || xhr.status === 304) && xhr.responseText) {
					that.setInnerHTML(that.fbDiv, xhr.responseText);
					that.tagAnchors(that.fbDiv);  // light up any floatbox links in the ajax content
				} else {
					that.setInnerHTML(that.fbDiv, '<p style="color:#000; background:#fff; margin:1em; padding:1em;">' +
					'Unable to fetch content from ' + item.href + '</p>');  // in case it don't work
				}
			});
		}
		// flash and quicktime will be inserted at show time when we have the potentially resized or max/% dimensions
	}
	// do oncomplete action, except the image will fire it via onload
	if (item.type !== 'img' && callback) callback();
},  // end fetchContent

//********************************/
// updateInfoPanel()
// Caption, info link, item number
//********************************/
updateInfoPanel: function() {
	var infoPanel = this.fbInfoPanel.style,
		caption = this.fbCaption.style,
		infoLink = this.fbInfoLink.style,
		itemNumber = this.fbItemNumber.style,
		item = this.currentItem,
		str;
	infoPanel.display = caption.display = infoLink.display = itemNumber.display = 'none';
	if (this.showCaption) {
		// caption can come from the rev options or use the title
		str = item.revOptions.caption || item.title || '';
		if (str) {
			if (str === 'href') str = this.currentItem.href;
			str = this.decodeHTML(str);
			if (this.setInnerHTML(this.fbCaption, str)) infoPanel.display = caption.display = '';
		}
	}
	if (item.revOptions.info && !this.isSlideshow) {
		str = this.encodeHTML(this.decodeHTML(item.revOptions.info));  // encode but don't double encode
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
	if (!infoPanel.display) this.tagAnchors(this.fbInfoPanel);  // light up any floatboxed anchors in the lower panel
},  // end updateInfoPanel

//****************************************/
// calcSize()
// Floatbox dimensions
// Side effect of setting infoPanel sizing
//****************************************/
calcSize: function(fit, recalc) {
	var that = this;
	if (!this.fbBox) return;  // might have been closed during the content fetch
	var boxX, boxY, boxW, boxH, divW, divH;  // things we need to calc
// use options preference if fit is not specified
	if (typeof fit === 'undefined') {
		fit = this.currentItem.type === 'img' ? this.autoSizeImages : this.autoSizeOther;
	}
// style short-names
	var infoPanel = this.fbInfoPanel.style,
		box = this.fbBox.style;
// capture current screen dimensions (showContent will compare against these)
	this.displaySize = this.getDisplaySize();
// measure the lower panel including height padding
	this.infoPanelHeight = this.fbInfoPanel.offsetHeight;
	this.lowerPanelHeight = Math.max(Math.max(this.infoPanelHeight, this.controlPanelHeight) + 2*this.panelPadding, this.padding);
// get max div dimensions that will fit the current window
	var frame = 2*(this.outerBorder + this.padding + this.innerBorder + this.shadowSize),
		maxW = this.displaySize.width - frame,
		maxH = this.displaySize.height - (frame - this.padding) - this.lowerPanelHeight,
		hardW = false, hardH = false;
// get div width & height, translate 'max' and '%' dimensions
	divW = this.currentItem.nativeWidth + '';
	if (divW === 'max') {
		divW = maxW;
	} else if (divW.substr(divW.length - 1) === '%') {
		divW = Math.floor((maxW + 2*this.shadowSize) * parseInt(divW, 10) / 100);
	} else {
		divW = parseInt(divW, 10);  // strip 'px' off
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
// scale item down if requested and needed
	this.scaledBy = this.oversizedBy = 0;
	if (fit) {
		var scaleW = maxW/divW,
			scaleH = maxH/divH,
			w = divW, h = divH;
		if (hardW && hardH) scaleW = scaleH = Math.min(scaleW, scaleH);
		if (scaleW < 1) divW = Math.round(divW * scaleW);
		if (scaleH < 1) divH = Math.round(divH * scaleH);
		this.scaledBy = Math.max(w - divW, h - divH);
		// undo tiny shrinkage
		if (this.scaledBy && this.scaledBy < this.outerBorder + 2*this.shadowSize + this.panelPadding) {
			divW = w;
			divH = h;
			this.scaledBy = 0;
		} 
	}
// box dimensions
	boxW = divW + 2*(this.innerBorder + this.padding);
	boxH = divH + this.lowerPanelHeight + 2*this.innerBorder + this.padding;
// if infoPanel width has changed, recalc everything
	var panelSpace = Math.max(this.padding, 8),  // Don't get too close to the sides
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
		if (recalc !== 2) return this.calcSize(fit, (recalc || 0) + 1);  // recalc max of two times
	}
// capture oversize
	if (!fit) this.oversizedBy = Math.max(boxW - this.displaySize.width, boxH - this.displaySize.height) + this.shadowSize;
	if (this.oversizedBy < 0) this.oversizedBy = 0;
// left
	var freeSpace = this.displaySize.width - boxW - 2*this.outerBorder;
	boxX = freeSpace <= 0 ? 0 : Math.floor(freeSpace/2);
// top
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
// add screen scroll values to left and top
// first take fb components out of flow in case they are stretching the body and scroll bars
	var boxPosition = box.position;  // save current state
	if (this.ieOld) {  // ie6 can't do position fixed
		box.display = 'none';
		this.stretchOverlay()();  // the overlay might be stretching the body
	} else {  // display=none has ugly flashes in FF2 and IE8
		this.setPosition(this.fbBox, 'fixed');
	}
	var scroll = this.getScroll();
	this.setPosition(this.fbBox, boxPosition);
	box.display = '';
	boxX += scroll.left;
	boxY += scroll.top;
// child window position
	if (this.isChild) {  // half way to the parent, if parent is higher or lefter
		var rex = /max|%/i,
			parPos = (this.children[this.children.length-2] || fb).pos.fbBox,
			childX = rex.test(this.currentItem.nativeWidth) ? 9999 : (parPos.left + boxX)/2,
			childY = rex.test(this.currentItem.nativeHeight) ? 9999 : (parPos.top + boxY)/2;
		if (scroll.left < childX && scroll.top < childY) {
			boxX = Math.min(boxX, childX);
			boxY = Math.min(boxY, childY);
		}
	}
	// resize then zoom or show
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
},  // end calcSize

//************************************************/
// setPosition()
// Set position type and adjust scroll values
// Assumes position has been set so it is readable
//************************************************/
setPosition: function(el, position) {
	if (el.style.position === position) return;
	var scroll = this.getScroll();
	if (position === 'fixed') {  // remove scroll values for fixed
		scroll.left = -scroll.left;
		scroll.top = -scroll.top;
	}
	if (this.pos[el.id]) {  // adjust the position record
		this.pos[el.id].left += scroll.left;
		this.pos[el.id].top += scroll.top;
	}
	// add or subtract scroll and set position
	el.style.left = (el.offsetLeft + scroll.left) + 'px';
	el.style.top = (el.offsetTop + scroll.top) + 'px';
	el.style.position = position;
},  // end setPosition

//****************************************************/
// collapse()
// Preps floatbox bits for content and/or size changes
//****************************************************/
collapse: function(callback, phase) {
	var that = this;
	if (!phase) {
// need to switch away from fixed positioning else animations are very jerky
	this.setPosition(this.fbBox, 'absolute');
// resizer
		this.fbResizer.onclick = null;
		this.fbResizer.style.display = 'none';
		if (this.fbContent) {
			this.fbContent.onclick = null;
			this.fbContent.style.cursor = '';
		}
// upper nav
		if (this.upperNav) {
			this.fbLeftNav.style.display = this.fbRightNav.style.display =
			this.fbUpperPrev.style.display = this.fbUpperNext.style.display = 'none';
		}
// content
		var opacity = 0, duration = 0;
		if (this.currentItem.type === 'img' && !this.fbContentPanel.style.visibility) {
			if (this.currentItem === this.lastShown && this.liveImageResize) opacity = 1;
			duration = this.imageFadeDuration;
		}
		this.liveResize = (opacity === 1);  // capturing this so we can speed up image resizing in resizeGroup()
		var oncomplete = function() { that.collapse(callback, 1); };
		return this.fadeOpacity(this.fbContentPanel, opacity, duration, oncomplete);
	}
	// phase 1
// loader
	if (!this.liveResize) {  // show the loader gif after a short interval
		this.fbDiv.style.display = 'none';
		this.clearTimeout('loader');  // in case one is already waiting to fire
		this.timeouts.loader = setTimeout(function() { that.fbLoader.style.display = ''; }, this.loaderDelay);
	}
// lower panels
	this.fbControlPanel.style.visibility = this.fbInfoPanel.style.visibility = 'hidden';
	this.fbInfoPanel.style.left = '-9999px';
	if (callback) callback();
},  // end collapse

//************************************************************/
// restore()
// Put back floatbox bits after a collapse, swap and/or resize
//************************************************************/
restore: function(callback, phase) {
	var that = this;
	if (!phase) {
// drop shadow
		if (this.dropShadow && this.fbShadowRight.style.display) {
			this.fbShadowRight.style.display = this.fbShadowBottom.style.display = this.fbShadowCorner.style.display = '';
		}
// lower panels
		var infoPanel = this.fbInfoPanel.style,
			controlPanel = this.fbControlPanel.style;
		infoPanel.bottom = ((this.lowerPanelHeight - this.infoPanelHeight)/2) + 'px';
		controlPanel.bottom = ((this.lowerPanelHeight - this.controlPanelHeight)/2) + 'px';
		infoPanel.left = Math.max(this.padding, 8) + 'px';
		infoPanel.visibility = controlPanel.visibility = '';
// content
		this.clearTimeout('loader');
		this.fbLoader.style.display = 'none';
		this.fbDiv.style.display = '';
		var duration = (this.currentItem.type === 'img' && !this.fbContentPanel.style.visibility) ? this.imageFadeDuration : 0,
			oncomplete = function() { that.restore(callback, 1); };
		return this.fadeOpacity(this.fbContentPanel, 1, duration, oncomplete);
	}
	// phase 1
// resizer
	if (this.currentItem.type === 'img' ? this.resizeImages : this.resizeOther) {
		var scale = 0;
		// tolerances for when to ignore need for scaling were determined by experiment
		if (this.scaledBy > 35) {
			scale = 1;  // scale up
		} else if (this.oversizedBy > 20){
			scale = -1;  // scale down
		}
		if (scale) {  // either direction
			this.fbResizer.onclick = function() {
				if (that.isSlideshow && that.pauseOnResize && !that.isPaused) {
					that.setPause(true);
				}
				that.collapse(function() { that.calcSize(scale === -1); });  // true = scale to fit, false = show native size
				return false;
			};
			if (this.currentItem.type === 'img' && !this.opera && /cursor|both/.test(this.resizeTool)) {
				// show the resize cursor (opera can't do it)
				this.fbContent.style.cursor = 'url(' + (scale === -1 ? this.resizeDownCursor : this.resizeUpCursor) +'), default';
				this.fbContent.onclick = this.fbResizer.onclick;
			}
			if (this.currentItem.type !== 'img' || this.opera || /topleft|both/.test(this.resizeTool)) {
				// show the resize gadget
				this.fbResizer.style.backgroundPosition = (scale === -1 ? 'bottom' : 'top');
				this.fadeOpacity(this.fbResizer, this.upperOpacity);
			}
		}
	}
// upper nav
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
			upperPrev.visibility = upperNext.visibility = 'hidden'; // to reappear on panel mouse movement
			upperPrev.display = upperNext.display = '';
		}
	}
	if (callback) callback();
},  // end restore

//*************************************************************/
// setSize()
// Takes a bunch of objects describing resizing to be done
// and passes array of objects to resizeGroup to make it happen
//*************************************************************/
setSize: function() {
// looking for objects containing id,top,left,width,height,borderWidth (only id is mandatory)
	var that = this,
		arr = [],
		oncomplete = function() {},  // default, override by passing a function as any argument
		node,
		i = arguments.length;
	while (i--) {
		if (typeof arguments[i] === 'object' && (node = this[arguments[i].id])) {
			var obj = arguments[i];
			if (!this.pos[obj.id]) this.pos[obj.id] = {};  // current/starting positions for different elements are in this.pos
			for (var property in obj) {
				if (obj.hasOwnProperty(property) && property !== 'id') {
					var start = this.pos[obj.id][property];  // pull current value
					if (typeof start !== 'number' || node.style.display || node.style.visibility) {
						// if no current start val or the element can't be seen, set start = end (no animation)
						start = obj[property];
					}
					arr.push({ node: node, property: property, start: start, finish: obj[property] });  // one object for each attribute to be set
					if (obj.id === 'fbDiv' && this.fbContent && this.rex.WH.test(property)) {  // set the content width/height to match
						arr.push({ node: this.fbContent, property: property, start: start, finish: obj[property] });
					} else if (obj.id === 'fbZoomDiv' && this.rex.WH.test(property)) {  // set the zoom image width/height to match
						arr.push({ node: this.fbZoomImg, property: property, start: start, finish: obj[property] });
					}
					this.pos[obj.id][property] = obj[property];  // update the record of current positions
				}
			}
		} else if (typeof arguments[i] === 'function') {
			oncomplete = arguments[i];
		}
	}
	this.resizeGroup(arr, oncomplete);  // resize everything together
},  // end setSize

//*******************************************************************/
// showContent()
// The last thing that happens after fetching, sizing, restoring etc.
//*******************************************************************/
showContent: function(phase) {
	var that = this;
	if (!phase) {  // phase 0
		var displaySize = this.getDisplaySize();
// if a scrollbar has come or gone, we might need some further resizing or positioning done
		if (!this.resized) {  // once only thanks
			var vscrollChanged = displaySize.width !== this.displaySize.width,
				hscrollChanged = displaySize.height !== this.displaySize.height;
			if ((vscrollChanged && Math.abs(this.pos.fbBox.width - displaySize.width) < 50) ||
			(hscrollChanged && Math.abs(this.pos.fbBox.height - displaySize.height) < 50)) {
				this.resized = true;
				return this.calcSize(this.scaledBy);
			}
		}
		this.resized = false;  // for next time
		this.win.focus();  // reclaim keyboard handler
		if (this.ieOld) this.stretchOverlay()();
// fixed positioning if requested or if ff2 is showing iframe or quicktime content, but only if the browser can handle fixed and the content fits the window
// FF2 has problems in floatbox absolute divs: 1) no mouse events for flash, 2) no video for quicktime, 3) no blinking cursor in form fields
// IE8 beta 2 has various layout problems with fixed positioning - hopefully fixed in the production release
		if ((this.disableScroll || (this.ffOld && /iframe|quicktime/i.test(this.currentItem.type))) && !this.ieOld && !this.ie8b2) {
			if (this.pos.fbBox.width <= displaySize.width && this.pos.fbBox.height <= displaySize.height) {
				this.setPosition(this.fbBox, 'fixed');
			}
		}
// fetch content that was deferred
		if (this.fbContent && (!this.fbContent.src || this.fbContent.src.indexOf(this.iframeSrc) !== -1)) {
			this.fbContent.src = this.currentItem.href;
		} else if (/flash|quicktime/.test(this.currentItem.type) && !this.fbDiv.innerHTML) {
			var html = this.content[this.currentItem.href];
			html = html.replace('%width%', this.pos.fbDiv.width).replace('%height%', this.pos.fbDiv.height);
			this.setInnerHTML(this.fbDiv, html);
		}
// determine neighbour items
		this.prevIndex = this.currentIndex ? this.currentIndex - 1 : this.itemCount - 1;
		this.nextIndex = this.currentIndex < this.itemCount - 1 ? this.currentIndex + 1 : 0;
		var prevHref = this.enableWrap || this.currentIndex !== 0 ? this.items[this.prevIndex].href : '',
			nextHref = this.enableWrap || this.currentIndex !== this.itemCount - 1 ?  this.items[this.nextIndex].href : '';
// toggle nav gadgets based on wrap status & update nav hrefs (for the browser status bar display)
		if (this.lowerNav) {
			// set hand cursor and tooltip behaviours
			if (prevHref) {
				if (!this.operaOld) this.fbLowerPrev.href = prevHref;  // opera prior to 9.5 gets nothing because of stupid big href url tooltips
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
			// set background image through the style sheet
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
			fb.upperNavShown = true;  // showUpperNav=once handler
		}
// light up the content
		this.fbContentPanel.style.visibility = '';
		return this.restore(function() {
			that.timeouts.showContent = setTimeout(function() { that.showContent(1); }, 10);
		} );
	}
// phase 1
	this.lastShown = this.currentItem;
// flag that we've seen this one and increment shown count if this is the first viewing of this item
	if (!this.currentItem.seen) {
		this.currentItem.seen = true;
		this.itemsShown++;
	}
// set next slideshow event timer
	if (this.isSlideshow && !this.isPaused) {
		this.timeouts.slideshow = setTimeout(function() {
			if (that.endTask === 'loop' || that.itemsShown < that.itemCount) {
				that.newContent(that.nextIndex);
			} else if (that.endTask === 'exit') {
				that.end();
			} else {  // that.endTask = 'stop' or unknown value
				that.setPause(true);
				var i = that.itemCount;
				while (i--) that.items[i].seen = false;
				that.itemsShown = 0;
			}
		}, this.slideInterval*1000);
	}
// resume preloading
	this.timeouts.preload = setTimeout(function() {
			that.preloadImages(nextHref || prevHref || '', true);
	}, 10);
},  // end showContent

//**************************************************************/
// newContent()
// Called by prev/next events, slideshow timer or external code.
// Index is position in the items array.
//**************************************************************/
newContent: function(index) {
	var that = this;
	this.clearTimeout('slideshow');
	this.clearTimeout('resizeGroup');
	this.currentIndex = index;
	this.currentItem = this.items[index];  // new item to swap to
	// clear showing of 1st-image-only upper nav gadgets
	if (this.showUpperNav == 'once' && this.upperNavShown) this.showUpperNav = false;
	// chain in the new item load
	var oncomplete = function() {
		that.updateInfoPanel();
		that.fetchContent(function() { that.calcSize();	});
	};
	this.collapse(function() {
		that.timeouts.fetch = setTimeout(oncomplete, 10);
	} );
},  // end newContent

//*******************************************************/
// end()
// Close down floatbox
// Called by event handlers, slideshow exit or externally
// iFrame content can call parent.fb.end() to terminate
// Div content and caption can call fb.end() to terminate
//*******************************************************/
end: function(all) {
// close in stack order
	if (this !== fb.lastChild) return fb.lastChild.end(all);
	var that = this;
	this.endAll = this.endAll || all;
	if (this.isChild && this.endAll) this.imageFadeDuration = this.overlayFadeDuration = this.resizeDuration = 0;
	if (this.saveReplace) top.location.replace = this.saveReplace;  // undo frame buster buster
// remove event handlers
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
// clear any pending timeouts
	for (var key in this.timeouts) {
		if (this.timeouts.hasOwnProperty(key)) this.clearTimeout(key);
	}
// if the zoomImg is still coming in, abandon it
	if (this.fbBox.style.visibility) {
		if (!this.lastShown) this.fbZoomDiv.style.display = 'none';
// maybe animate down to a thumbnail
	} else if (this.currentItem.type === 'img' && this.zoomImageStart) {
		if (this.currentItem.popup) this.currentItem.anchor.onmouseover();  // put the popup back so we can zoom out to it
		var anchorPos = this.getAnchorPos(this.currentItem.anchor, true);
		if (this.currentItem.popup) this.currentItem.anchor.onmouseout();  // re-hide the popup
		if (anchorPos.width) {
			this.fbZoomDiv.style.borderWidth = this.zoomPopBorder + 'px';
			anchorPos.left -= this.zoomPopBorder;
			anchorPos.top -= this.zoomPopBorder;
			this.pos.thumb = anchorPos;
			return this.zoomOut();
		}
	}
// if we didn't zoom out, shrink the box
	if (!this.fbBox.style.visibility) {
		var anchorPos = this.getAnchorPos(this.clickedAnchor, false);
		var oncomplete = function() {
			setTimeout(function() {
				that.fbBox.style.visibility = 'hidden';  // flags that we've done this section
				that.end();
			}, 10);
		};
		var oncomplete2 = function() {
			// discard previous content
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
		// size down to zero and come back
		return this.collapse(oncomplete2);
	}
	this.fbBox.style.display = 'none';
// discard tagged anchors associated with this box (they will all be at the end of the array)
	var level = this.children.length + 1,
		i = this.anchors.length;
	while(i && this.anchors[i-1].level >= level) i--;
	this.anchors.length = i;
//  update child info
	if (this.isChild) this.children.length--;
	fb.lastChild = this.children[this.children.length-1] || fb;
// do this when the overlay finishes fading out
	var oncomplete2 = function() {
		setTimeout(function() {
			// discard all floatbox elements
			while (that.nodeNames.length) {
				var id = that.nodeNames.pop();
				if (that[id] && that[id].parentNode) {
					that[id].parentNode.removeChild(that[id]);
					delete that[id];
				}
			}
			// do end tasks
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
		// unhide previously hidden elements (maybe there are none)
		while(that.hiddenEls.length) {
			var el = that.hiddenEls.pop();
			el.style.visibility = '';
			if (this.ffOld) {  // ff2/mac helper
				el.focus();
				el.blur();
			}
		}
		var overlay = that.fbOverlay.style;
		overlay.display = 'none';
		overlay.width = overlay.height = '0';  // helps the mouseover reshow of the popup
		var duration = that.currentItem.popup ? 6.5 : 0;
		that.fbZoomDiv.style.opacity = '1';  // set initial opacity for the fade
		that.fadeOpacity( that.fbZoomDiv, 0, duration, oncomplete2);
		that.currentItem = null;
	};
	this.fadeOpacity(this.fbOverlay, 0, this.overlayFadeDuration, oncomplete);
},  // end end

//********************************/
// zoomIn()
// Animated start from a thumbnail
//********************************/
zoomIn: function(phase) {
	var that = this,
		zoomDiv = this.fbZoomDiv.style;
	if (!phase) {  // phase 0
// show the overlay and animate zoomDiv up to the size and position where the content div will be
		// starting position and initial src was set in initState
		this.clearTimeout('slowLoad');
		zoomDiv.display = this.fbZoomImg.style.display = '';
		if (this.currentItem.popup) this.currentItem.anchor.onmouseout();  // turn off the popup if there is one
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
// animate box from exactly behind zoomDiv to its final size
		var boxPos = {  // capture current (hidden) position to return back to
			left: this.pos.fbBox.left, top: this.pos.fbBox.top,
			width: this.pos.fbBox.width, height: this.pos.fbBox.height
		};
		var pad = 2*(this.zoomPopBorder - this.outerBorder);
		this.pos.fbBox = {  // set starting position
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
	// phase 2
// turn off zoomDiv and resume showing content
	var show = function() {
		zoomDiv.display = 'none';
		that.fbZoomImg.src = '';
		zoomDiv.left = zoomDiv.top = zoomDiv.width = zoomDiv.height = that.fbZoomImg.width = that.fbZoomImg.height = '0';
		that.showContent();
	};
	this.timeouts.showContent = setTimeout(show, 10);
},  // end zoomIn

//********************************/
// zoomOut()
// Animated end down to a thumnail
//********************************/
zoomOut: function(phase) {
	var that = this;
	if (!phase) {  // phase 0
// place zoomDiv over top of current content
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
// show zoomDiv and hide the 'normal' content
		this.fbZoomDiv.style.display = this.fbZoomImg.style.display = '';
		this.fbContentPanel.style.visibility = 'hidden';
		return this.collapse(function() { that.zoomOut(2); });
	}
	if (phase === 2) {
// shrink box to behind zoomDiv
		var pad = 2*(this.zoomPopBorder - this.outerBorder);
		return this.setSize(
			{ id: 'fbBox', left: this.pos.fbZoomDiv.left, top: this.pos.fbZoomDiv.top,
			width: this.pos.fbZoomDiv.width + pad, height: this.pos.fbZoomDiv.height + pad },
			function() { that.zoomOut(3); }
		);
	}
	// phase 3
// shrink zoomDiv down to the thumbnail
	this.fbBox.style.visibility = 'hidden';  // a flag to end() that says we've zoomed
	var end = function() {
		that.fbZoomImg.src = that.pos.thumb.src;
		that.end();
	};
	this.setSize(
		{ id: 'fbZoomDiv', left: this.pos.thumb.left, top: this.pos.thumb.top,
		width: this.pos.thumb.width, height: this.pos.thumb.height },
		end);
},  // end zoomOut

//********************************************/
// setPause()
// Sets slideshow state to paused or playing
// and displays the appropriate control button
//********************************************/
setPause: function(bPause) {
	this.isPaused = bPause;
	if (bPause) {
		this.clearTimeout('slideshow');  // clear pending slideshow event
	} else {
		this.newContent(this.nextIndex);  // launch the next item
	}
	if (this.showPlayPause) {  // show the appropriate control
		this.fbPlay.style.left = bPause ? '' : '-9999px';
		this.fbPause.style.left = bPause ? '-9999px' : '';
	}
},  // end setPause

//**************************************************************/
// fadeOpacity()
// Changes opacity in graduated steps through timers
// This is a setup function for stepFade() which does the work
// Can fade in or out
//**************************************************************/
fadeOpacity: function(el, opacity, duration, callback) {
	var startOp = +(el.style.opacity || 0);
	duration = duration || 0;
	// block any currently running fade for this element
	this.clearTimeout['fade' + el.id];
// fading in?
	var fadeIn = (startOp <= opacity && opacity > 0);
// calc the % increment for each iteration
	if (duration > 10) duration = 10;
	if (duration < 0) duration = 0;
	if (duration === 0) {
		startOp = opacity;
	} else {
// magic log math that yields nice increments.  duration=1 -> incr=50%, 5 -> 9%, 10 -> 1%
		var root = Math.pow(100, 0.1),
			power = duration + ((10 - duration)/9) * (Math.log(2)/Math.log(root) - 1),
			incr = 1/Math.pow(root, power);
	}
	if (fadeIn) {
		el.style.display = el.style.visibility = '';
	} else {
		incr = -incr;
	}
// set initial opacity values and next timer event
	this.stepFade(el, startOp, opacity, incr, fadeIn, callback);
},  // end fadeOpacity

//********************************************************************/
// stepFade()
// Worker bee function for fadeOpacity()
// Applies opacity styles and maybe sets timer for next fade increment
//********************************************************************/
stepFade: function(el, thisOp, finishOp, incr, fadeIn, callback) {
	if (!el) return;  // safety from mid-fade ends
	var that = this;
// don't go beyond the finish state
	if ((fadeIn && thisOp >= finishOp) || (!fadeIn && thisOp <= finishOp)) thisOp = finishOp;
// set opacity styles
	if (this.ie) el.style.filter = 'alpha(opacity=' + thisOp*100 + ')';
	el.style.opacity = thisOp + '';
	if (thisOp === finishOp) {
// we're done. clear ie filter and run on-complete code
		if (this.ie && finishOp >= 1) el.style.removeAttribute('filter');  // fix for IE alpha opacity filter bug (from lytebox)
		if (callback) callback();
	} else {
// set timer for next step of opacity fade
		this.timeouts['fade' + el.id] = setTimeout(function() { that.stepFade(that[el.id], thisOp + incr, finishOp, incr, fadeIn, callback); }, 20);
	}
},  // end stepFade

//************************************************************************************************/
// resizeGroup()
// Does a graduated change of a group of pixel attributes together as a unit
// The set of objects, attributes and values to be set are in the passed arr parameter
// This is a setup function for stepResize() which does the actual property changes and timer sets
//************************************************************************************************/
resizeGroup: function(arr, callback) {
// resize everything in the array together (for smooth effect)
// arr is an array of objects with keys of { node, property, start, finish }
	var i = arr.length;
	if (!i) return callback ? callback() : null;
// clear any pending resizes
	this.clearTimeout('resizeGroup');
// calc maximum size differential
	var diff = 0;
	while (i--) {
		if (arr[i].start < 0) arr[i].start = 0;
		diff = Math.max(diff, Math.abs(arr[i].finish - arr[i].start));
	}
	var duration = this.resizeDuration * (this.liveResize ? 0.75 : 1);  // speed up live resizing
// resize rate is a log function of the diff size. makes a nice balance of speed and time.
// rate is the fractional amount of diff to do on each iteration (e.g., .1 for 10 increments).
	var rate = diff && duration ? Math.pow(Math.max(1, 2.2 - duration/10), (Math.log(diff))) / diff : 1;
// calc pixel differential for each element
	i = arr.length;
	while (i--) arr[i].diff = arr[i].finish - arr[i].start;
// set initial size and timers for resize steps
	this.stepResize(rate, rate, arr, callback);
},  // end resizeGroup

//****************************************************************/
// stepResize()
// Worker bee function for resizeGroup()
// Applies dimension styles and sets timer for next size increment
//****************************************************************/
stepResize: function(increment, rate, arr, callback) {
	var that = this;
// apply size changes to the elements listed in the passed array
	if (increment > 1) increment = 1;  // don't go beyond final value
// for each element in this array, extract the parameters and apply this iteration's size changes
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
// are we done?
	if (increment >= 1) {
		delete this.timeouts.resizeGroup;
		// run requested on-complete code
		if (callback) callback();
	} else {
// set a timer for the next iteration
		this.timeouts.resizeGroup = setTimeout(function() { that.stepResize(increment + rate, rate, arr, callback); }, 20);
	}
},  // end stepResize

//******************************************************/
// getDisplaySize()
// getDisplayWidth()
// getDisplayHeight()
// Width and height of the browser's current view portal
//******************************************************/
getDisplaySize: function() {
	return { width: this.getDisplayWidth(), height: this.getDisplayHeight() };
},  // end getDisplaySize

getDisplayWidth: function() {
	// width is easy.  If the documentElement width is given and not 0, it is correct.  Otherwise the body width is correct.
	return this.html.clientWidth || this.bod.clientWidth;
},  // end getDisplayWidth

getDisplayHeight: function() {
	if (this.doc.childNodes && !this.doc.all && !navigator.taintEnabled && !this.doc.evaluate) {
		// Safari 2 (browser test borrowed from mootools (does anyone still use this browser?))
		return this.win.innerHeight;
	}
	if (!this.html.clientHeight || this.operaOld || this.doc.compatMode === 'BackCompat') {
		// IEMac, Opera pre 9.5, others w. no doctype
		// For opera pre 9.5, body.clientHeight is the closest measurement but there's
		// a bug that excludes the body border from the reported height.
		// Removed code to adjust for body border now that 9.5 is out (body borders are rare and small, pre 9.5 will soon become rare)
		return this.bod.clientHeight;
	}
	// all others with doctypes
	return this.html.clientHeight;
},  // end getDisplayHeight

//********************************************************/
// getScroll()
// Return pixels by which the window is currently scrolled
//********************************************************/
getScroll: function(win) {
	win = win || this.win;
	var doc = win.document;
	return {
		left: win.pageXOffset || doc.body.scrollLeft || doc.documentElement.scrollLeft || 0,
		top: win.pageYOffset || doc.body.scrollTop || doc.documentElement.scrollTop || 0
	};
},  // end getScroll

//**********************************************************/
// getLeftTop()
// Returns left & top coordinates of an element
// Iterates through parent objects adding up all the offsets
// If not local, iframe offsets will be added in too
// (the hardest and messiest function in floatbox)
//**********************************************************/
getLeftTop: function(el, local) {
	var left = el.offsetLeft || 0,
		top = el.offsetTop || 0,
		doc = el.ownerDocument || el.document,
		win = doc.defaultView || doc.parentWindow || doc.contentWindow,  // win is this element's owner window
		scroll = this.getScroll(win),
		compStyle = win.getComputedStyle,
		position = ((el.currentStyle && el.currentStyle.position) || (compStyle && compStyle(el, '').getPropertyValue('position')) || '').toLowerCase(),
		// flag if el is not in the base page layout flow
		rex = /absolute|fixed/,
		elFlow = !rex.test(position),
		inFlow = elFlow,
		node = el;
	if (position === 'fixed') {  // scroll values not included in fixed offsets
		left += scroll.left;
		top += scroll.top;
	}
	while (position !== 'fixed' && (node = node.offsetParent)) {  // for each offset parent
		var borderLeft = 0, borderTop = 0, nodeFlow = true;
		if (node.currentStyle) {  // IE & Opera
			position = (node.currentStyle.position || '').toLowerCase();
			nodeFlow = !rex.test(position);
			if (this.opera) {  // Opera
				if (local && node !== doc.body) {
					// add in scroller values and take out border widths (applies to local positioning too)
					left += node.scrollLeft - node.clientLeft;
					top += node.scrollTop - node.clientTop;
				}
			} else { // IE
				if (node.currentStyle.hasLayout && node !== doc.documentElement) {
					// borders to be added in later (not for local position)
					borderLeft = node.clientLeft;
					borderTop = node.clientTop;
				}
			}
		} else if (compStyle) {  // FF, Chrome & Safari
			position = (compStyle(node, '').getPropertyValue('position') || '').toLowerCase();
			nodeFlow = !rex.test(position);
			// borders to be added in later (not for local position)
			borderLeft = parseInt(compStyle(node, '').getPropertyValue('border-left-width'), 10);
			borderTop = parseInt(compStyle(node, '').getPropertyValue('border-top-width'), 10);
			if (this.ff && node === el.offsetParent && !nodeFlow && (this.ffOld || !elFlow)) {  // FF adjustment
				// no clue why, but this is needed and it works
				// applies to both local and top positioning
				left += borderLeft;
				top += borderTop;
			}
		}
		if (!nodeFlow) {
			// if local coords were requested, stop at an absolute or fixed parent element
			if (local) return { left: left, top: top };
			inFlow = false;  // flag that we're not in the base layout flow
		}
		// add in offsets and borders
		left += node.offsetLeft + borderLeft;
		top += node.offsetTop + borderTop;
		if (position === 'fixed') {  // scroll values not included in fixed offsets
			left += scroll.left;
			top += scroll.top;
		}
		if (!(this.opera && elFlow) && node !== doc.body && node !== doc.documentElement) {
			// take out scroll values
			left -= node.scrollLeft;
			top -= node.scrollTop;
		}
	}
	if (this.ff && inFlow) {  // add in body border for FF in layout flow
		left += parseInt(compStyle(doc.body, '').getPropertyValue('border-left-width'), 10);
		top += parseInt(compStyle(doc.body, '').getPropertyValue('border-top-width'), 10);
	}
// add in containing iframe offset
	if (!local && win !== this.win) {  // if el is in an iframe, find it
		var rex = new RegExp(),
			iframes = win.parent.document.getElementsByTagName('iframe'),
			i = iframes.length;
		while (i--) {
			var node = iframes[i],
				idoc = false;
			try {  // in case of cross-domain script blocking
				idoc = node.contentDocument || node.contentWindow;  // iframe's document, or maybe its window
				idoc = idoc.document || idoc;  // now it's the doc for sure
			} catch(e) {}
			rex.compile(node.src + '$');
			if (idoc === doc || (typeof idoc !== 'object' && rex.test(win.location))) {  // if this iframe contains the element we are measuring...
				// add iframe offsets and scroll value
				var pos = this.getLeftTop(node);
				left += pos.left - scroll.left;
				top += pos.top - scroll.top;
				if (node.currentStyle) {
					// add iframe border and padding for IE and Opera
					var padLeft = 0, padTop = 0;
					if (!this.ie || elFlow) {  // don't add iframe padding for ie out-of-flow elements
						padLeft = parseInt(node.currentStyle.paddingLeft, 10);
						padTop = parseInt(node.currentStyle.paddingTop, 10);
					}
					left += node.clientLeft + padLeft;
					top += node.clientTop + padTop;
				}
				else if (compStyle) {
					// add iframe border and padding for FF, Chrome and Safari
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
},  // end getLeftTop

//********************************************************/
// getLayout()
// Adds width and height (including borders) to getLeftTop
//********************************************************/
getLayout: function(el) {
	var lay = this.getLeftTop(el);
	lay.width = el.offsetWidth;
	lay.height = el.offsetHeight;
	return lay;
},  // end getLayout

//**************************************************************/
// hideElements()
// Hides elements so they don't appear above the overlay and box
// (For flash, java and the ie6 select z-index bug)
//**************************************************************/
hideElements: function(type, thisWindow) {
	// thisWindow is used to recurse through all frames under the base window (usually top)
	if (!thisWindow) {  // first call?  start with the floatbox host window
		this.hideElements(type, this.win);
	} else {  // we've called in with a window object
		var tagName, tagNames = type === 'flash' ? ['object', 'embed'] : [type];
		try {  // this has gakked on some ie machines
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
		// recurse all the child frames
		var frames = thisWindow.frames,	i = frames.length;
		while (i--) {
			if (typeof frames[i].window === 'object') this.hideElements(type, frames[i].window);
		}
	}
},  // end hideElements

//**************************************/
// clearTimeout()
// Cancels pending timeout of type 'key'
//**************************************/
clearTimeout: function(key) {
	if (this.timeouts[key]) {
		clearTimeout(this.timeouts[key]);
		delete this.timeouts[key];
	}
},  // end clearTimeout

//********************************/
// stretchOverlay()
// IE6 window resize event handler
//********************************/
stretchOverlay: function() {
	var that = this;
	return function() {
// avoid repeated screen flashes by waiting until browser resizing is complete before redrawing the overlay
		if (arguments.length === 1) {  // it's from a resize event
			that.clearTimeout('stretch');  // cancel pending timeout
			that.timeouts.stretch = setTimeout(function() { that.stretchOverlay()(); }, 25);  // set a new one for a bit later
		} else {  // called directly or from a surviving timer
			delete that.timeouts.stretch;
			if (!that.fbBox) return;  // floatbox may have ended
			var width = that.fbBox.offsetLeft + that.fbBox.offsetWidth,
				height = that.fbBox.offsetTop + that.fbBox.offsetHeight,
				display = that.getDisplaySize(),
				scroll = that.getScroll(),
				overlay = that.fbOverlay.style;
			overlay.width = overlay.height = '0';  //shrink the overlay before measuring the doc body
			// size overlay up to the biggest dimensions we can measure
			overlay.width = Math.max(width, that.bod.scrollWidth, that.bod.clientWidth, that.html.clientWidth, display.width + scroll.left) + 'px';
			overlay.height = Math.max(height, that.bod.scrollHeight, that.bod.clientHeight, that.html.clientHeight, display.height + scroll.top) + 'px';
		}
	};
},  // end stretchOverlay

//***************************/
// encodeHTML(), decodeHTML()
// encode/decode &<>"'
//***************************/
encodeHTML: function(str) {
	return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');  // &amp; first
},
decodeHTML: function(str) {
	return str.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&apos;/g, "'").replace(/&#39;/g, "'").replace(/&amp;/g, '&');  // &amp; last
},

//****************************************************/
// getXMLHttpRequest()
// Browser transparent setup of XMLHttpRequest object.
// Returns getResponse function.
//****************************************************/
getXMLHttpRequest: function() {
	var xhr, that = this;
	// get the object
	if (window.XMLHttpRequest) {  // manly browsers
		if (!(xhr = new XMLHttpRequest())) return false;
	} else {  // old ie
		try { xhr = new ActiveXObject("Msxml2.XMLHTTP"); } catch(e) {
			try { xhr = new ActiveXObject("Microsoft.XMLHTTP"); } catch(e) { return false; }
		}
	}
	return {
		// call .getResponse with a url to fetch and a callback function to execute
		// callback can access the xhr object through its passed parameter
		getResponse: function(url, callback) {
			try {
				xhr.open('GET', url, true);  // asynchronous
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
},  // end getXMLHttpRequest

//*******************************************/
// setInnnerHTML()
// Uses dom calls to simulate .innerHTML
// (necessary for xhtml-xml application docs)
//*******************************************/
setInnerHTML: function(el, strHTML) {
	try {
		// empty the element
		var range = this.doc.createRange();
		range.selectNodeContents(el);
		range.deleteContents();
		// insert new elements
		if (strHTML) {
			var xmlDiv = new DOMParser().parseFromString('<div xmlns="http://www.w3.org/1999/xhtml">' + strHTML + '</div>', 'application/xhtml+xml'),
				childNodes = xmlDiv.documentElement.childNodes;
			for (var i = 0, len = childNodes.length; i < len; i++) {
				el.appendChild(this.doc.importNode(childNodes[i], true));
			}
		}
		return true;
	} catch (e) {}
	// if the dom methods didn't work, try setting good ol' innerHTML
	try {
		el.innerHTML = strHTML;
		return true;
	} catch(e) {}
	return false;
},  // end setInnerHTML

//**********************************************/
// loadAnchor()
// Utility API function.
// Adds a new anchor to floatbox's collection of
// activated anchors and then displays it.
// First parameter can be an anchor element.
//**********************************************/
loadAnchor: function(href, rev, title) {
	if (href.setAttribute) {  // it's an anchor, not a string
		var anchor = href;
		if (!anchor.getAttribute('rel')) anchor.setAttribute('rel', 'floatbox');
		fb.lastChild.start(this.tagOneAnchor(anchor));
	} else {
		fb.lastChild.start(this.tagOneAnchor({ href: href, rev: rev, title: title, rel: 'floatbox' }));
	}
},

//**************************************/
// goBack()
// Utility API function.
// Reverts to the previous started item.
//**************************************/
goBack: function() {
	var a;
	if ((a = fb.previousAnchor)) {
		this.loadAnchor(a.href, a.rev + ' sameBox:true', a.title);
	}
},

//**************************************/
// resize()
// Utility API function.
// Resize the top current box in place.
//**************************************/
resize: function(width, height) {
	if (width) fb.lastChild.currentItem.nativeWidth = width;
	if (height) fb.lastChild.currentItem.nativeHeight = height;
	fb.lastChild.calcSize(false);
}

};  // end Floatbox prototype

//***************************/
// initfb()
// Create the floatbox object
//***************************/
function initfb() {
	if (arguments.callee.done) return;  // init once only
	// quirks mode not allowed
	if (document.compatMode === 'BackCompat') {
		arguments.callee.done = true;
		alert('Floatbox does not support quirks mode.\nPage needs to have a valid a doc type.');
		return;
	}
	// IE inits nested pages child first, which reverses the order and causes garbage collection to delete top.floatbox when a child frame is refreshed
	// Force parent-first initialization (every page in the nested iframe chain must have floatbox.js included)
	if (self !== top && !parent.fb) return setTimeout(initfb, 50);
	arguments.callee.done = true;
	if (self === top) top.floatbox = new Floatbox();  // floatbox goes on the top doc
	fb = top.floatbox;  // each nested doc gets fb pointing to the floatbox on the top doc
	fb.tagAnchors(self.document.body);  // attach behaviours to the anchors in this document
	if (fb.autoStart) {  // run autoStart if requested
		fb.start(fb.autoStart);
		if (typeof fb !== 'undefined') delete fb.autoStart;
	} else {  // if not auto-starting, start the image preload chain
		fb.preloadImages('', true);
	}
}  // end initfb

//*********************************************************************************/
// Add listener to initialize floatbox when the dom is loaded (but before graphics)
// Modified from http://dean.edwards.name/weblog/2006/06/again/
// and from http://www.hedgerwow.com/360/dhtml/ie-dom-ondocumentready.html
//*********************************************************************************/
/*@cc_on
// Internet Explorer
fb_tempNode = document.createElement('div');
(function() {
	if (document.readyState !== 'complete') return setTimeout(arguments.callee, 50);
	try {
		fb_tempNode.doScroll('left');  // doScroll doesn't until the dom is fully loaded
	} catch(e) {
		return setTimeout(arguments.callee, 50);
	}
	initfb();
	delete fb_tempNode;
})();
/*@if (false) @*/
// Safari, Chrome, Konquerer
if (/Apple|KDE/i.test(navigator.vendor)) {
	(function() {
		if (/loaded|complete/.test(document.readyState)) {
			initfb();
		} else {
			setTimeout(arguments.callee, 50);
		}
	})();
// Mozilla, Opera9+
} else if (document.addEventListener) {
	document.addEventListener('DOMContentLoaded', initfb, false);
}
/*@end @*/

// Old or obscure browsers init here.
// Also fire window.onload for everyone in case the above dom-load routines fail or are delayed,
fb_prevOnload = window.onload;
window.onload = function() {
	if (typeof fb_prevOnload === 'function') fb_prevOnload();
	initfb();  // make sure floatbox is there - it should already be
};
