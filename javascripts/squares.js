(function() {

  var SETTINGS = {
    version: '0.0.1',
    env: 'dev'
  };
 
  // HELPERS

  // show msg just for debug info
  function puts(msg) {
    if (SETTINGS.env === 'dev') {
      if (typeof console !== 'undefined' && console !== null) {
        console.log(msg);
      } else {
        alert(msg);
      }
    }
  };

  // subscribe on event
  function bind(element, event_name, listener, capturing) {
    if (element.addEventListener) {
      element.addEventListener(event_name, listener, capturing);
    } else if (element.attachEvent) {
      element.attachEvent('on' + event_name, listener);
    }
  };

  // unsubscribe
  function unbind(element, event_name, listener, capturing) {
    if (element.removeEventListener) {
      element.removeEventListener(event_name, listener, capturing);
    } else if (element.detachEvent) {
      element.detachEvent('on' + event_name, listener);
    }
  };
  
  // blocking events
  function block_event(e) {
    if (!e) e = window.event;
    
    if (e.stopPropagation) {
      e.stopPropagation();
    } else {
      e.cancelBubble = true;
    }

    if (e.preventDefault) {
      e.preventDefault();
    } else {
      e.returnValue = false;
    }
  };

  // class Square
  var Square = (function() {

    var self;

    // constructor
    function Square() {
      self = this;
      this.el = build_element();
    }


    // public methods
    
    Square.prototype.append_to = function (node) {
      if (typeof node !== 'undefined' && node) {
        node.appendChild(this.el);
      }
      return this.el;
    };


    // private methods: helpers and listeners
    
    var build_element = function() {
      var el = document.createElement('div');
      el.id = new Date().getTime();
      el.className = 'square';
      return el;
    };

    return Square;
  
  })();


  // class Canvas
  var Canvas = (function() {

    // private varialbles
    var self, add_btn, clear_btn;
    var mouse_down = false;
    var mouse_x0, mouse_y0, square_x0, square_y0;
    var zindex = 1;
    var captured_square = null;

    // constructor
    function Canvas(node) {
      self = this;

      if (typeof node === 'undefined' || !node) {
        node = document.createElement('div');
        node.id = 'canvas';
        document.getElementsByTagName('body')[0].appendChild(node);
      }

      this.el = node;

      add_btn = document.createElement('div');
      add_btn.id = 'add_button';
      add_btn.innerHTML = 'ADD';
      node.appendChild(add_btn);
      bind(add_btn, 'click', on_add_button_click, false);

      clear_btn = document.createElement('div');
      clear_btn.id = 'clear_button';
      clear_btn.innerHTML = 'CLEAR';
      node.appendChild(clear_btn);
      bind(clear_btn, 'click', on_clear_button_click, false);

      bind(this.el, 'mousemove', on_canvas_mouse_move, false);
      bind(document, 'mouseup', on_document_mouse_up, false);
    }


    // public methods

    // private methods: helpers and listeners

    var on_add_button_click = function(e) {
      e || (e = window.event);

      var square = new Square();
      square.append_to(self.el);
      square.el.style.top = square.el.offsetTop + Math.round((self.el.offsetHeight - square.el.offsetHeight) / 2) + 'px';
      square.el.style.left = square.el.offsetLeft + Math.round((self.el.offsetWidth - square.el.offsetWidth) / 2) + 'px';
      square.el.style.zIndex = zindex++;
      bind(square.el, 'mousedown', on_square_mouse_down, false);
    };

    var on_clear_button_click = function(e) {
      e || (e = window.event);

      while (self.el.lastChild !== add_btn && self.el.lastChild !== clear_btn) {
        self.el.removeChild(self.el.lastChild);
      }
    };

    var on_square_mouse_down = function(e) {
      mouse_down = true;
      captured_square = get_element(e);
      captured_square.style.cursor = 'move';

      mouse_x0 = e.clientX;
      mouse_y0 = e.clientY;

      square_x0 = captured_square.offsetLeft;
      square_y0 = captured_square.offsetTop;

    };

    var on_canvas_mouse_move = function(e) {
      e || (e = window.event);

      if (mouse_down) {
        var move_to = function(x, y) {

          captured_square.style.left = square_x0 + x + 'px';
          captured_square.style.top = square_y0 + y + 'px';
        };

        move_to(e.clientX - mouse_x0, e.clientY - mouse_y0);
      }
    };

    var on_document_mouse_up = function(e) {
      mouse_down = false;
      if (captured_square) {
        captured_square.style.cursor = 'auto';
      }
    };

    // helper for getting targer (src) element from event
    var get_element = function(event) {
      var element = null;
      if (typeof event.target !== 'undefined') {
        element = event.target;
      } else if (typeof event.srcElement !== 'undefined'){
        element = event.srcElement;
      }
      return element;
    };

    return Canvas;
  })();


  // USAGE
  window.onload = function() {
    var css = document.createElement('link');
    css.setAttribute("rel", "stylesheet");
    css.setAttribute("type", "text/css");
    css.setAttribute("href", "stylesheets/squares.css");
    document.getElementsByTagName("head")[0].appendChild(css);

    var canvas = new Canvas();
    window.canvas = canvas;
  };
 })(this);
