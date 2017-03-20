import Ember from 'ember';

import Scroller from "nullbase-virtual-list/util/scroller/scroller";
import {addResizeListener, removeResizeListener} from 'nullbase-virtual-list/util/scroller/resize-listener';
import _ from "npm:lodash";


var wheelDistance = function ( evt ) {
  if ( !evt ) {
    evt = event;
  }
  var w = evt.originalEvent.wheelDelta, d = evt.originalEvent.detail;
  if ( d ) {
    if ( w ) {
      return w / d / 40 * d > 0 ? 1 : -1;
    }// Opera
    else {
      return -d / 3;
    }             // Firefox;         TODO: do not /3 for OS X
  }
  else {
    return w / 120;
  }            // IE/Safari/Chrome TODO: /3 for Chrome OS X
};


function makeRAFJS( updates, self, itemHeight, contentProperty, items, scrollTop, scrollKnob, scrollKnobPosition, contentElement ) {
  return function () {

    contentElement.style[ "transform" ] = 'translate3d(0px, ' + (-(scrollTop)) + 'px, 0)';
    if ( self.get('scrollBar') ) {
      scrollKnob.style[ "transform" ] = 'translate3d(0px, ' + scrollKnobPosition + 'px, 0)';
    }
    var childComponents = self ? self.get('childComponents') : undefined;
    if ( childComponents ) {
      var updatesLength = updates.length;
      for ( var i = 0; i < updatesLength; i++ ) {
        if ( childComponents[ updates[ i ][ 1 ] ] && !childComponents[ updates[ i ][ 1 ] ].get('isDestroyed') ) {
          childComponents[ updates[ i ][ 1 ] ].get('element').style[ "transform" ] = 'translate3d(0px, ' + (updates[ i ][ 0 ] * itemHeight) + 'px, 0)';
        }
      }

      setImmediate(function () {
        for ( var i = 0; i < updatesLength; i++ ) {
          if ( childComponents[ updates[ i ][ 1 ] ] && !childComponents[ updates[ i ][ 1 ] ].get('isDestroyed') ) {
            childComponents[ updates[ i ][ 1 ] ].set(contentProperty, items[ updates[ i ][ 0 ] ]);
          }

        }

      });


    }
  };
}


function makeRAF( updates, self, itemHeight, contentProperty, items ) {

  return function () {

    var childComponents = self ? _.clone(self.get('childComponents')) : undefined;

    if ( childComponents && childComponents.length ) {
      for ( var i = 0; i < updates.length; i++ ) {

        if ( childComponents[ updates[ i ][ 1 ] ] && !childComponents[ updates[ i ][ 1 ] ].get('isDestroyed') ) {
          childComponents[ updates[ i ][ 1 ] ].get('element').style[ "transform" ] = 'translate3d(0px, ' + (updates[ i ][ 0 ] * itemHeight) + 'px, 0) scale(1)';

        }
      }

      setImmediate(function () {

        for ( var i = 0; i < updates.length; i++ ) {

          if ( childComponents[ updates[ i ][ 1 ] ] && !childComponents[ updates[ i ][ 1 ] ].get('isDestroyed') ) {

            childComponents[ updates[ i ][ 1 ] ].set(contentProperty, items[ updates[ i ][ 0 ] ]);

          }
        }
      });
    }

  };
}


export default Ember.Mixin.create({
  gestures: Ember.inject.service(),
  childComponents: Ember.A([]),
  tagName: 'div',
  items: [],
  unfilteredItems: [],
  classNames: [ 'hide-scrollbars'],
  classNameBindings: [ 'useNativeScroll:list-frame-mobile:list-frame' ],
  useNativeScroll: false,
  itemHeight: 0,
  height: 0,
  width: 0,
  scrollTop: 0,
  contentProperty: "content",
  lastScrollPosition: 0,
  childViewClass: null,
  autoScrollBar: false,
  scrollBar: false,
  scrollBarElement: null,
  updates: null,
  // attributeBindings: [ 'tabindex' ],
  // tabindex: 0,
  touchAction: Ember.computed('useNativeScroll', function () {
    return this.get('useNativeScroll') ? "" : "none";
  }),
  childViewsX: Ember.computed(function () {
    return Ember.A([]);
  }),

  focusedItem: null,

  updateTrigger: null,

  selectedItems: null,

  _down: null,
  _track: null,
  _up: null,
  init: function () {
    this._super();
    this.set('childComponents', Ember.A([]));


  },

  useNativeScrollObserver: Ember.on('init', Ember.observer('useNativeScroll', function () {

    var self = this;
    let gestures = self.get('gestures');
    if ( this.get('useNativeScroll') === false ) {


      self.set('scrollBar', true);
      Ember.run.scheduleOnce('afterRender', function () {


        $(self.get('element')).scrollTop(0);
        $('.item-container', self.get('element')).scrollTop(0);
        var $contentElement = self.$('.item-container');
        var contentElement = $contentElement.get(0);

        var scrollKnob = self.$('.ember-list-view-scrollbar-knob');
        var itemHeight = self.get('itemHeight');
        var render = function ( left, scrollTop /*, zoom*/ ) {
          var ren = this;
          setImmediate(function () {
            if ( !self.get('isDestroyed') && isFinite(scrollTop) ) {
              self.set('scrollTop', scrollTop);
              var itemCount = self.get('items') ? self.get('items').length : 0;
              var contentHeight = $contentElement.height();
              var viewPortHeight = self.get('height');
              var firstInView = ((Math.floor(scrollTop / itemHeight) - 10) > 0) ? (Math.floor(scrollTop / itemHeight) - 10) : 0;
              ren.updates = [];
              var childViewLength = self.get('childViewsX').length;
              var i;
              var loopCounterCache = Math.min(firstInView + childViewLength, itemCount);
              for ( i = firstInView; i < loopCounterCache; i++ ) {
                ren.updates.push([ i, i % childViewLength ]);
              }

              var scrollKnobPosition = Math.max(0, (scrollTop ) / ((contentHeight - viewPortHeight) / (viewPortHeight - scrollKnob.height())));
              //  scrollKnobPosition = Math.min(scrollKnobPosition, (viewPortHeight - scrollKnob.height()));


              var raf = makeRAFJS(ren.updates, self, itemHeight, self.get('contentProperty'), self.get('items'), scrollTop, scrollKnob.get(0), scrollKnobPosition, contentElement);
              window.requestAnimationFrame(raf);


            }
          });

        };


        self.set('scroller', new Scroller(render, { scrollingX: false, animating: true }));


        self.set('scrollBarElement', self.$('.ember-list-view-scrollbar'));

        self.adjustLayout();

        var elementC = $('.item-container', self.get('element')).get(0);


        var scroller = self.get('scroller');


        var mousedown = false;


        self._down = function ( e ) {

          if ( self && scroller ) {

            if ( e.target.tagName.match(/input|textarea|select/i) ) {
              return;
            }

            scroller.doTouchStart([
              {
                pageX: e.pageX,
                pageY: e.pageY
              }
            ], window.performance.now());


            mousedown = true;
          }
        };

        self.get('gestures').addEventListener(elementC, 'down', self._down);


        self._track = function ( e ) {
          e.preventTap();
          if ( self && scroller ) {

            if ( !mousedown ) {
              return;
            }

            scroller.doTouchMove([
              {
                pageX: e.pageX,
                pageY: e.pageY
              }
            ], window.performance.now());

            mousedown = true;
          }
        };
        self.get('gestures').addEventListener(elementC, 'track', self._track);


        /**
         *
         * @private
         */
        self._up = function () {
          if ( self && scroller ) {
            if ( !mousedown ) {
              return;
            }

            scroller.doTouchEnd(window.performance.now());

            mousedown = false;
          }
          else {

          }
        };
        self.get('gestures').addEventListener(document, 'up', self._up);
        $(elementC).on('focusout', function () {

          self.send('focusItem', null);
        });


        //$elementC.on("mousewheel DOMMouseScroll", function (event) {
        $(self.get('element')).on("mousewheel DOMMouseScroll", function ( event ) {

          event.preventDefault();
          event.stopPropagation();
          var delta = -wheelDistance(event);

          var finalScroll = parseInt(scroller.getValues().top) + parseInt(delta * 100);

          if ( -finalScroll > 0 ) {
            finalScroll = 0;
          }

          if ( Math.abs(finalScroll) > $(elementC).height() - self.get('height') ) {
            finalScroll = ($(elementC).height() - self.get('height'));
          }

          scroller.scrollTo(0, finalScroll);

          if ( Math.abs(self.get('lastScrollPosition') - finalScroll) > 50 ) {
            self.set('scrollTop', finalScroll);
            self.set('lastScrollPosition', finalScroll);
          }


        });

      });

    }
    // remove javascript scrolling and set up native scrolling.

    else {

      self.set('scrollBar', false);
      if ( this.get('scroller') ) {
        delete   this.get('scroller').__callback;
        this.set('scroller', null);
      }
      Ember.run.scheduleOnce('afterRender', function () {
        var contentElement = $('.item-container', self.get('element')).get(0);

        contentElement.style[ "transform" ] = 'translate3d(0px, 0px, 0px)';
        self.set('scrollTop', 0);
        if ( self.get('items') ) {
          $('.item-container', self.get('element')).height(Math.max(self.get('items').length * self.get('itemHeight'), self.get('height')));
        }


        var $element = $(self.get('element'));

        $element.on('scroll', function () {

          self.set('scrollTop', $element.scrollTop());
          var scrollTop = self.get('scrollTop');
          var itemCount = self.get('items') ? self.get('items').length : 0;

          var itemHeight = self.get('itemHeight');
          var firstInView = ((Math.floor(scrollTop / itemHeight) - 4) > 0) ? (Math.floor(scrollTop / itemHeight) - 4) : 0;
          self.updates = [];
          var childViewLength = self.get('childViewsX').length;

          for ( var i = firstInView; i < Math.min(firstInView + childViewLength, itemCount); i++ ) {
            self.updates.push([ i, i % childViewLength ]);
          }

          var raf = makeRAF(self.updates, self, itemHeight, self.get('contentProperty'), self.get('items'));

          window.requestAnimationFrame(raf);

        });

        $(self.get('element')).off("mousewheel");

        $(self.get('element')).off("DOMMouseScroll");
        $(self.get('element')).off("keydown");

        gestures.removeEventListener(self.get('element'), 'down', self._down);
        gestures.removeEventListener(self.get('element'), 'track', self._track);
        gestures.removeEventListener(document, 'up', self._up);

      });


    }


  })),
  previousScrollFrames: [],


  updateItems: Ember.on('init', Ember.observer("items.[]", "updateTrigger", "width", "height", "itemHeight", "contentHeight", function () {

    var self = this;
    //console.log('update items');
    Ember.run.next(function () {

      //  setImmediate(function(){
      var raf = null;
      var height = self.get('height');
      var itemCount = self.get('items') ? self.get('items').length : 0;
      var itemHeight = self.get('itemHeight');
      var requiredItemCount = 0;
      if ( itemCount < 100 ) {
        requiredItemCount = Math.min(itemCount, Math.ceil(height / itemHeight) + 100);
      }
      else {
        requiredItemCount = Math.min(itemCount, Math.ceil(height / itemHeight) + 40);
      }

      var childViewCount = self.get('childViewsX').length;
      var scrollTop = self.get('scrollTop');

      if ( requiredItemCount < childViewCount ) {
        self.set('childViewsX', Ember.A(_.take(self.get('childViewsX'), requiredItemCount)));
      }

      Ember.run.join(function () {
        //   setImmediate(function(){
        var objects = [];

        for ( var i = childViewCount; i < requiredItemCount; i++ ) {
          objects.push(self.get('childViewClass'));

        }
        self.get('childViewsX').pushObjects(objects);

        var firstInView = ((Math.floor(scrollTop / itemHeight) - 4) > 0) ? (Math.floor(scrollTop / itemHeight) - 4) : 0;

        var updates = [];
        var childViewLength = self.get('childViewsX').length;
        var x = Math.min((firstInView ) + childViewLength, itemCount);
        for ( let i = firstInView; i < x; i++ ) {
          updates.push([ i, i % childViewLength ]);
        }

        if ( self.get('useNativeScroll') === false ) {

          $('.item-container', self.get('element')).css('top', 0);
          $('.item-container', self.get('element')).height(Math.max(itemCount * self.get('itemHeight'), self.get('height')));


          if ( self.get('scrollBar') ) {

            //    width = $(this.get('element')).width($(this.get('element')).parent().width() - 30).width();


            if ( height > Math.max(itemCount * self.get('itemHeight')) ) {
              $('.item-container', self.get('element')).parent().addClass('hide-scrollbars');
            }
            else {
              $('.item-container', self.get('element')).parent().removeClass('hide-scrollbars');
            }

          }
          else {
            //     width = $(this.get('element')).parent().width();
          }


          if ( self.get('scroller') ) {


            self.get('scroller').setDimensions(null, height, null, Math.max(itemCount * self.get('itemHeight')));
          }


          raf = makeRAF(updates, self, itemHeight, self.get('contentProperty'), self.get('items'));


          window.requestAnimationFrame(raf);


        }
        else {
          $('.item-container', self.get('element')).get(0).style[ "transform" ] = 'translate3d(0px, 0px, 0)';
          $('.item-container', self.get('element')).height(Math.max(itemCount * self.get('itemHeight'), self.get('height')));
          raf = makeRAF(updates, self, itemHeight, self.get('contentProperty'), self.get('items'));


          window.requestAnimationFrame(raf);

        }

      });

    });
    //console.log(this.get('items.[]'));
    //   console.log(this.get('updateTrigger'))
    //  console.log(this.get('width'));
    //  console.log(this.get('height'));
    //   console.log(this.get('itemHeight'));
    //   console.log(this.get('contentHeight'));

  })),
  cachedLength:0,
  nativeUpdate: Ember.on('init', Ember.observer("items.length", function () {
    Ember.run.scheduleOnce('afterRender',()=>{
      if ( this.get('useNativeScroll') === true && this.get('cachedLength') !== this.get('items.length')) {
        this.set('cachedLength',this.get('items.length'));
        $(this.get('element')).scrollTop(0);
      }
    });



  })),

  setupScrollBar: Ember.observer('scrollBarElement', function () {
    var self = this;
    let gestures = self.get('gestures');
    if ( self.get('scrollBar') && self.get("scrollBarElement").length > 0 ) {

      var rect = null;
      self._scrollDown = function ( e ) {
        // Don't react if initial down happens on a form element
        var actualScale = (self.get('scrollBarElement').height() - $('.ember-list-view-scrollbar-knob', self.get('scrollBarElement')).height()) / self.get('scrollBarElement').height();

        rect = e.target.getBoundingClientRect();
        //var offsetX = e.clientX - rect.left;
        self.get('scrollBarElement').addClass('down');

        var offsetY = (e.clientY - rect.top);

        offsetY = offsetY / actualScale;

        offsetY = offsetY - ($('.ember-list-view-scrollbar-knob', self.get('scrollBarElement')).height() / 2);
        self.get('scroller').scrollTo(0, (offsetY * ($('.item-container', self.get('element')).height() - self.get('height')) / $('.ember-list-view-scroll-rail', self.get('scrollBarElement')).height()), false);
      };
      gestures.addEventListener(self.get('scrollBarElement').get(0), 'down', self._scrollDown);

      self._scrollTrack = function ( e ) {
        var scrollBarElementHeight = self.get('scrollBarElement').height();
        var scrollBarKnobHeight = $('.ember-list-view-scrollbar-knob', self.get('scrollBarElement')).height();
        var actualScale = (scrollBarElementHeight - scrollBarKnobHeight) / scrollBarElementHeight;
      //  var rect = e.target.getBoundingClientRect();


        var offsetY = (e.clientY - rect.top);
        offsetY = offsetY / actualScale;

        offsetY = offsetY - (scrollBarKnobHeight / 2);
        window.requestAnimationFrame(function(){
        self.get('scroller').scrollTo(0, (offsetY * ($('.item-container', self.get('element')).height() - self.get('height')) / $('.ember-list-view-scroll-rail', self.get('scrollBarElement')).height()), false);
        });
      };
      gestures.addEventListener(self.get('scrollBarElement').get(0), 'track', self._scrollTrack);
      self._scrollUp = function () {
        if ( self.get('scrollBarElement') ) {
          self.get('scrollBarElement').removeClass('down');
        }
      };
      gestures.addEventListener(document, 'up', self._scrollUp);

    }


  }),

  _scrollDown: null,
  _scrollTrack: null,
  _scrollUp: null,


  adjustLayout: function () {
    if ( !this.get('isDestroyed') ) {
      var $element = $(this.get('element'));
      this.beginPropertyChanges();

      this.set('height', $element.height());
      this.set('width', 'auto');

      this.set('contentHeight', $('.item-container', this.get('element')).outerHeight());

      this.endPropertyChanges();
    }


  },
  oneItemPresent: false,
  isLoaded: Ember.computed("items.[]", 'oneItemPresent', function () {
    if ( this.get('items').length > 0 ) {
      return this.get('oneItemPresent');
    }
    else {
      return true;
    }
  }),


  filtered: false,


  willDestroyElement: function () {

    var self = this;
    let gestures = self.get('gestures');
    let element = this.get('element');
    let $element = this.$();
    self.get('_mutationObserver').disconnect();
    $(window).off('resize.virtual-list.' + Ember.guidFor(self));
    // removeResizeListener(this.get('element'), this._resizeListener);

    this.set('updates', null);
    $element.off("mousewheel");
    $element.off("DOMMouseScroll");
    $element.off("keydown");
    gestures.removeEventListener(element, 'down', this._down);
    gestures.removeEventListener(element, 'track', this._track);
    gestures.removeEventListener(document, 'up', this._up);
    $(self.get('element')).off('inview', this._inView);
    if ( $('.item-container', self.get('element')).get(0) ) {
      removeResizeListener($('.item-container', self.get('element')).get(0), self._resizeListener);
    }

    this._super(...arguments);
    //  self.set('childViewsX', []);
    //   observer.disconnect();

  },


  scroller: null,
  adjustIntervalHandle: 0,
  _resizeListener: null,
  _lastSelected: null,
  _mutationObserver: null,
  didInsertElement: function () {

    this._super();
    var self = this;

    // select the target node
    var target = $('.item-container ', self.get('element')).get(0);

    // create an observer instance
    var observer = new MutationObserver(function ( mutations ) {
      mutations.forEach(function ( mutation ) {
        if ( $(mutation.target).children().length ) {
          self.set('oneItemPresent', true);
        }
        else {
          self.set('oneItemPresent', false);

        }

      });

    });

    // configuration of the observer:
    var config = { childList: true };

    // pass in the target node, as well as the observer options
    self.set('_mutationObserver', observer);
    observer.observe(target, config);

    // later, you can stop observing
    //   observer.disconnect();
    var element = self.get('element');
    var $element = $(element);
    var $window = $(window);
    $window.on('resize.virtual-list.' + Ember.guidFor(self), _.bind(self.adjustLayout, this));
    Ember.run.scheduleOnce('afterRender', function () {

      self.adjustLayout();
    });


    self._resizeListener = function () {

      if ( $element.is(':visible') ) {
        self.adjustLayout();
      }

    };

    this._inView = function ( e, isInView ) {
      if ( isInView ) {
        self._resizeListener();
      }
      else {
        $('.item-container', self.get('element')).parent().addClass('hide-scrollbars');
      }

      // $(self.get('element')).unbind('inview',inView);
    };


    $(self.get('element')).on('inview', this._inView);
    addResizeListener($('.item-container', self.get('element')).get(0), self._resizeListener);
    var elementC = $('.item-container', self.get('element')).get(0);
    var $elementC = $(elementC);


    //  var scroller = this.get('scroller');


    var isClick = false;


    $(elementC).on('mousedown', function () {

      isClick = true;
    });
    $(elementC).on('keydown', function () {

      isClick = false;
    });


    $(this.get('element')).on('focus', function ( /*e*/ ) {

      var firstInView = ((Math.floor(self.get('scrollTop') / self.get('itemHeight')) ) > 0) ? (Math.floor(self.get('scrollTop') / self.get('itemHeight')) ) : 0;

      self.send('focusItem', self.get('items')[ firstInView ]);       // tabby!
      //    setTimeout(focusHandler, 100)
    });
    $elementC.on("keydown", function ( e ) {

      var newpos = parseInt(self.get('scroller').getValues().top);


      var firstInView = null;
      if ( e.keyCode === 33 ) {
        newpos = newpos - (parseInt(self.get('height')) - ( parseInt(self.get('height')) % (self.get('itemHeight'))));

        self.get('scroller').scrollTo(0, newpos);
        firstInView = ((Math.floor(self.get('scrollTop') / self.get('itemHeight')) ) > 0) ? (Math.floor(self.get('scrollTop') / self.get('itemHeight')) ) : 0;

        self.send('focusItem', self.get('items')[ firstInView ]);
      }


      if ( e.keyCode === 34 ) {

        newpos = newpos + (parseInt(self.get('height')) - ( parseInt(self.get('height')) % (self.get('itemHeight'))));
        self.get('scroller').scrollTo(0, newpos);
        firstInView = ((Math.floor(self.get('scrollTop') / self.get('itemHeight')) ) > 0) ? (Math.floor(self.get('scrollTop') / self.get('itemHeight')) ) : 0;

        self.send('focusItem', self.get('items')[ firstInView ]);
      }

      if ( e.keyCode === 36 ) {

        self.get('scroller').scrollTo(0, 0);
        firstInView = ((Math.floor(self.get('scrollTop') / self.get('itemHeight')) ) > 0) ? (Math.floor(self.get('scrollTop') / self.get('itemHeight')) ) : 0;
        self.send('focusItem', self.get('items')[ firstInView ]);       // tabby!
      }
      if ( e.keyCode === 35 ) {
        var itemCount = self.get('items') ? self.get('items').length : 0;
        newpos = parseInt(itemCount * parseInt(self.get('itemHeight')));
        self.get('scroller').scrollTo(0, newpos);
        firstInView = ((Math.floor(self.get('scrollTop') / self.get('itemHeight')) ) > 0) ? (Math.floor(self.get('scrollTop') / self.get('itemHeight')) ) : 0;

        self.send('focusItem', self.get('items')[ firstInView ]);       // tabby!

      }
      // space, enter
      if ( e.keyCode === 32 || e.keyCode === 13 ) {
        if ( self.get('focusedItem') ) {
          //    console.log('space pressed')
          //    self.send('select', self.get('focusedItem'), e.ctrlKey, e.shiftKey);
        }
      }
      // tab, down arrow , up arrow,
      if ( e.keyCode === 9 || e.keyCode === 40 || e.keyCode === 38 ) {


        var newIndex = 0;
        var currentIndex = self.get('items').indexOf(self.get('focusedItem'));
        currentIndex = currentIndex !== -1 ? currentIndex : 0;
        if ( (e.shiftKey || (e.keyCode === 38 && !e.shiftKey)) && ((e.keyCode !== 40)) ) {

          if ( currentIndex > 0 ) {
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();

            newIndex = (currentIndex > 0) ? currentIndex - 1 : 0;
            while ( !self.get('items')[ newIndex ].get('id') && (newIndex > 0) ) {

              newIndex = (newIndex > -1) ? newIndex - 1 : 0;
            }

            self.send('focusItem', self.get('items')[ newIndex ]);
          }
          else {
            if ( e.keyCode === 9 ) {
              //    console.log('going to this item 2','null?');
              //  self.send('focusItem', null);
            }


          }
        }
        else {

          if ( (currentIndex < self.get('items').length - 1) ) {
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();

            currentIndex = currentIndex === -1 ? 0 : currentIndex;

            newIndex = (currentIndex < self.get('items').length - 1) ? currentIndex + 1 : currentIndex;
            while ( !self.get('items')[ newIndex ].get('id') && (newIndex < self.get('items').length - 1) ) {

              newIndex = (newIndex < self.get('items').length - 1) ? newIndex + 1 : newIndex;
            }

            self.send('focusItem', self.get('items')[ newIndex ]);
          }
          else {
            if ( e.keyCode === 0 ) {
              // console.log('going to this item 4','null?');
              //  self.send('focusItem', null);
            }

          }

        }


      }


    });


  },
  actions: {
    focusItem: function ( context ) {

      var self = this;
      var height = self.get('height');
      var itemCount = self.get('items') ? self.get('items').length : 0;

      var itemHeight = self.get('itemHeight');
      var scrollTop = self.get('scrollTop');
      var firstInView = ((Math.floor(scrollTop / itemHeight) ) > 0) ? (Math.floor(scrollTop / itemHeight) ) : 0;

      var requiredItemCount = Math.min(itemCount, Math.ceil(height / itemHeight) - 1);

      var searchTheseItems = [];
      if ( this.get('unfilteredItems') && this.get('unfilteredItems').length ) {
        searchTheseItems = this.get('unfilteredItems');
      }
      else {
        searchTheseItems = this.get('items');
      }

      _.each(_.filter(searchTheseItems, function ( item ) {
        return item.get('focused');
      }), function ( item ) {

        item.set('focused', false);
      });


      if ( context ) {

        context.set('focused', true);
      }

      var focusedIndex = this.get('items').indexOf(context);

      if ( context ) {
        var newpos = 0;
        if ( focusedIndex < firstInView ) {

          newpos = focusedIndex * itemHeight;
          this.get('scroller').scrollTo(0, newpos);
        }
        if ( focusedIndex > (firstInView + requiredItemCount - 1) ) {

          newpos = (focusedIndex - requiredItemCount + 1) * itemHeight;
          this.get('scroller').scrollTo(0, newpos);
        }
      }
      this.set('focusedItem', context);

    },


    select: function ( context, ctrlKey, shiftKey ) {

      if ( shiftKey && this.get('_lastSelected') ) {
        var indexOfLastSelected = _.indexOf(this.get('items'), this.get('_lastSelected.context'));
        var indexOfCurrentSelected = _.indexOf(this.get('items'), context);
        var firstIndex = Math.min(indexOfCurrentSelected, indexOfLastSelected);
        var lastIndex = Math.max(indexOfCurrentSelected, indexOfLastSelected);
        var selectedItems = _.slice(this.get('items'), firstIndex, lastIndex + 1);
        this.sendAction('select', selectedItems, ctrlKey, shiftKey);

      }
      else {
        this.sendAction('select', [ context ], ctrlKey, shiftKey);
      }

      if ( this.get('selectedItems.length') ) {
        this.set('_lastSelected', { context: context, ctrlkey: ctrlKey, shiftKey: shiftKey });
      }
      else {
        this.set('_lastSelected', null);
      }

    }
  }

});
