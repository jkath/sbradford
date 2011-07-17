// Quickly hacked-together animation test showing fluid layout, etc.
// Demo only - Not needed for normal use.

function Animator() {
  var self = this;
  this.timer = null;
  this.active = null;
  this.methods = [];
  // this.tweenStep = [1,2,3,4,5,6,7,8,9,10,9,8,7,6,5,4,3,2];
  this.tweenStep = [15,26,36,22,5];
  this.frameCount = this.tweenStep.length;
  // this.lastExec = new Date();
  
  this.start = function() {
    if (self.active==true) return false;
    self.active = true;
    self.timer = window.setInterval(self.animate,20);
  }

  this.stop = function() {
    if (self.timer) {
      window.clearInterval(self.timer);
      self.timer = null;
      self.active = false;
    }
  }

  this.reset = function() {
    self.methods = [];
  }

  this.addMethod = function(oMethod,oncomplete) {
    for (var i=self.methods.length; i--;) {
      if (self.methods[i] == oMethod) {
        if (oncomplete) {
          self.methods[i]._oncomplete = oncomplete;
        }
        return false;
      }
    }
    self.methods[self.methods.length] = oMethod;
    self.methods[self.methods.length-1]._oncomplete = oncomplete||null;
  }

  this.createTween = function(start,end) {
    var start = parseInt(start);
    var end = parseInt(end);
    var tweenStepData = self.tweenStep;
    var tween = [start];
    var tmp = start;
    var diff = end-start;
    var j = tweenStepData.length;
    var isAscending = end>start;
    for (var i=0; i<j; i++) {
      tmp += diff*tweenStepData[i]*0.01;
      tween[i] = parseInt(tmp);
      // floor/ceiling checks (rounding errors?)
      /*
      if (isAscending) {
        if (tween[i]>end) tween[i] = end;
      } else {
        if (tween[i]<end) tween[i] = end;
      }
      */
    }
    if (tween[i] != end) tween[i] = end;
    return tween;
  }

  this.determineFrame = function(tStart,nInterval) {
    var d = new Date();
    // var tElapsed = (new Date()-tStart);
    // determine current frame, including lag
    return Math.min(self.frameCount,Math.floor(self.frameCount*((new Date()-tStart)/(nInterval*self.frameCount))));
  }
  
  this.animate = function(e) { 
    if (!self.active) return false;
    /*
    var now = new Date();
    if (now-self.lastExec<50) return false; // no more than 20 fps
    self.lastExec = now;
    */
    var active = false;
    for (var i=self.methods.length; i--;) {
      if (self.methods[i]) {
        if (self.methods[i]()) {
          active = true;
        } else {
          if (self.methods[i]._oncomplete) {
            self.methods[i]._oncomplete();
            self.methods[i]._oncomplete = null;
          }
          self.methods[i] = null;
        }
      }
    }
    if (!active) {
      self.stop();
      self.reset();
    }
  }

}

var animator = new Animator();

function Utils() {
  var self = this;

  this.classContains = function(o,cStr) {
    return (typeof(o.className)!='undefined'?o.className.match(cStr):false);
  }

  this.addClass = function(o,cStr) {
    if (!o) return false; // safety net
    if (self.classContains(o,cStr)) return false;
    o.className = (o.className?o.className+' ':'')+cStr;
  }

  this.removeClass = function(o,cStr) {
    if (!o) return false; // safety net
    if (!self.classContains(o,cStr)) return false;
    o.className = o.className.replace(new RegExp('( '+cStr+')|('+cStr+')','g'),'');
  }

  this.getElementsByClassName = function(className,tagNames,oParent) {
    var doc = (oParent||document);
    var matches = [];
    var i,j;
    var nodes = [];
    if (typeof(tagNames)!='undefined' && typeof(tagNames)!='string') {
      for (i=tagNames.length; i--;) {
        if (!nodes || !nodes[tagNames[i]]) {
          nodes[tagNames[i]] = doc.getElementsByTagName(tagNames[i]);
        }
      }
    } else if (tagNames) {
      nodes = doc.getElementsByTagName(tagNames);
    } else {
      nodes = doc.all||doc.getElementsByTagName('*');
    }
    if (typeof(tagNames)!='string') {
      for (i=tagNames.length; i--;) {
        for (j=nodes[tagNames[i]].length; j--;) {
          if (self.classContains(nodes[tagNames[i]][j],className)) {
            matches[matches.length] = nodes[tagNames[i]][j];
          }
        }
      }
    } else {
      for (i=0; i<nodes.length; i++) {
        if (self.classContains(nodes[i],className)) {
          matches[matches.length] = nodes[i];
        }
      }
    }
    return matches;
  }

}

var utils = new Utils();

function DialogWidget(o) {
  var self = this;
  this.o = o;
  this.oContent = utils.getElementsByClassName('content','div',this.o)[0];
  this.oFooter = this.o.getElementsByTagName('div')[this.o.getElementsByTagName('div').length-2];
  var pulseAmount = -32;
  var offset = 12;
  var _width = 0;
  var _height = 0;
  var _marginLeft = parseInt(self.o.style.marginLeft)||(self.o.className.indexOf('drip')+1?60:12);
  var _marginTop = parseInt(self.o.style.marginTop)||0;

  this.tweens = [];
  this.tweensOut = [];
  this.tweensIn = [];
  this.tweens = this.tweensOut;
  this.frame = 0;
  this.active = false;
  this.lastExec = new Date();

  this.refresh = function() {
    var oldWidth = parseInt(self.oContent.offsetWidth);
    self.oContent.style.width = 'auto';
    self.oFooter.style.width = 'auto';
    _width = parseInt(self.oContent.offsetWidth)-((self.o.className.indexOf('drip')+1)?6:offset);
    _height = parseInt(self.oContent.offsetHeight)-((self.o.className.indexOf('drip')+1)?16:offset);
    self.tweensOut = [animator.createTween(_width,_width+pulseAmount),animator.createTween(_height,_height+pulseAmount),animator.createTween(_marginLeft,_marginLeft-parseInt(pulseAmount/2)),animator.createTween(_marginTop,_marginTop-parseInt(pulseAmount/2))];
    self.tweensIn = [animator.createTween(_width+pulseAmount,_width),animator.createTween(_height+pulseAmount,_height),animator.createTween(_marginLeft-parseInt(pulseAmount/2),_marginLeft),animator.createTween(_marginTop-parseInt(pulseAmount/2),_marginTop)];
  }
  this.refresh();

  this.animate = function() {
    // self.moveTo(self.tween[self.frame]);
    self.oContent.style.width = self.tweens[0][self.frame]+'px';
    self.oFooter.style.width = (self.tweens[0][self.frame]+12)+'px';
    self.oContent.style.minHeight = self.tweens[1][self.frame]+'px';
    self.o.style.marginLeft = self.tweens[2][self.frame]+'px';
    self.o.style.marginTop = self.tweens[3][self.frame]+'px'
    // self.frame = Math.max(++self.frame,animator.determineFrame(self.lastExec,40));
    self.frame++;
    self.lastExec = new Date();
    if (self.frame>=self.tweens[0].length-1) {
      self.active = false;
      self.frame = 0;
      if (self._oncomplete) self._oncomplete();
      return false;
    }
    return true;
  }

  this.start = function(fOnComplete) {
    self.active = true;
    animator.addMethod(self.animate,fOnComplete);
    self.lastExec = new Date();
    animator.start();
  }

  this.pulseOut = function(fOnComplete) {
    self.tweens = self.tweensIn;
    if (self.active) return false;
    self.start(self.pulseComplete);
  }

  this.pulseIn = function(fOnComplete) {
    self.tweens = self.tweensOut;
    if (self.active) return false;
    self.start(fOnComplete);
  }

  this.pulseComplete = function() {
    self.oContent.style.width = 'auto';
    self.oFooter.style.width = 'auto';
    // self.oContent.style.minHeight = '180px'; // hack
    self.o.style.marginLeft = _marginLeft+'px';
    self.o.style.marginTop = _marginTop+'px';
  }

  this.doPulse = function() {
    if (!self.active) self.pulseIn(function(){setTimeout(self.pulseOut,20)});
  }

  this.oContent.ondblclick = this.doPulse;

}

var widgets = [];

function handleResize() {
  for (var i=widgets.length; i--;) {
    widgets[i].refresh();
  }
}

function doAnimationDemo() {
  for (var i=0,j=widgets.length; i<j; i++) {
    setTimeout('widgets['+i+'].doPulse()',500*i);
  }
}

var bgImages = ['bg-random.gif','bg-slice-squidfingers.com.gif','bg-slice-squidfingers.com-2.gif','rockface','ski','#336699','#666','#fff'];
var bgIndex = -1;

function killBackground() {
  document.getElementsByTagName('html')[0].style.background = 'none';
}

function setBackground(i) {
  document.getElementsByTagName('html')[0].style.background = (bgImages[i].indexOf('#')+1?bgImages[i]:'#222 url(demo/wallpaper/'+bgImages[i]+(bgImages[i].indexOf('.gif')==-1?'.jpg':'')+') 50% 50%');
}

function getBackground() {
  if (++bgIndex>=bgImages.length) bgIndex = 0;
  setBackground(bgIndex);
}

window.onload = function() {
  var nAV = navigator.appVersion.toLowerCase();
  if (nAV.match(/msie 5/) || nAV.match(/msie 6/)) return false;
  var items = utils.getElementsByClassName('dialog','div');
  for (var i=0,j=items.length; i<j; i++) {
    widgets[widgets.length] = new DialogWidget(items[i],i);
  }
  var d = document.createElement('div');
  d.style.cssText = 'position:fixed;bottom:3px;right:3px;font-size:xx-small;z-index:10';
  d.innerHTML = '<button onclick="getBackground()" title="Rotate background image" style="font-size:xx-small">1</button><button id="animation-demo" onclick="doAnimationDemo()" title="Cheap demo: Adjust width, height and margins, showing fluidity" style="font-size:xx-small">2</button>';
  document.body.appendChild(d);
  document.getElementById('animation-demo').style.display = 'block';
  getBackground();
  window.onresize = handleResize;
}