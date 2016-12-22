
  var attachEvent = document.attachEvent;
  var isIE = navigator.userAgent.match(/Trident/);


  function resizeListener(e) {

    var win = e.target || e.srcElement;

    if (win.document.defaultView.__resizeRAF__) {
      cancelAnimationFrame(win.__resizeRAF__);
    }
    win.document.defaultView.__resizeRAF__ = requestAnimationFrame(function () {

      var trigger = win.document.defaultView.__resizeTrigger__;

      trigger.__resizeListeners__.forEach(function (fn) {

        fn.call(trigger, e);
      });
    });

  }

  function objectLoad(/* e */) {

    try {
      this.contentDocument.defaultView.__resizeTrigger__ = this.__resizeElement__;

      this.contentDocument.defaultView.addEventListener('resize', resizeListener);
    }
    catch (e) {
      //console.log(e);
    }
  }

  export var addResizeListener = function (element, fn) {
    if (!element.__resizeListeners__) {
      element.__resizeListeners__ = [];
      if (attachEvent) {

        element.__resizeTrigger__ = element;
        element.attachEvent('onresize', resizeListener);
      }
      else {

        if (getComputedStyle(element).position === 'static') {
          element.style.position = 'relative';
        }
        var obj = element.__resizeTrigger__ = document.createElement('object');
        obj.className = "resize-listener";
        //obj.setAttribute('style', 'display: block; position: absolute; top: -2px; left: -2px; right:-2px;bottom:-2px;width:100%;height:100%; overflow: hidden; pointer-events: none; z-index: -1;border:0px solid #000;');
        obj.__resizeElement__ = element;
        obj.onload = objectLoad;
        obj.type = 'text/html';

        if (isIE) {
          element.appendChild(obj);
        }
        obj.data = 'about:blank';
        if (!isIE) {
          element.appendChild(obj);
        }
      }
    }
    element.__resizeListeners__.push(fn);
  };

  export var removeResizeListener = function (element, fn) {
    if (fn) {
      element.__resizeListeners__.splice(element.__resizeListeners__.indexOf(fn), 1);
    }
    else {
      element.__resizeListeners__.length = 0;
    }
    if (!element.__resizeListeners__.length) {
      if (attachEvent) {
        element.detachEvent('onresize', resizeListener);
      }
      else {
        try {
          if (element.__resizeTrigger__ && element.__resizeTrigger__.contentDocument) {

            element.__resizeTrigger__.contentDocument.removeEventListener('resize', resizeListener);

            $(element.__resizeTrigger__.__resizeElement__).remove();
            delete element.__resizeTrigger__.__resizeElement__;
            $(element.__resizeTrigger__).remove();

            delete element.__resizeTrigger__;

          }
        }
        catch (e) {
          //console.log(e);
        }
      }
    }
  };

