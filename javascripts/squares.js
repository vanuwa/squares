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
    
    // build square element
    var build_element = function() {
      var el = document.createElement('div');
      el.id = new Date().getTime();
      el.className = 'square';

      self.nw_corner = build_corner(el, {top: '-4px', left: '-4px'},'nw-resize');
      self.ne_corner = build_corner(el, {top: '-4px', right: '-4px'}, 'ne-resize');
      self.sw_corner = build_corner(el, {bottom: '-4px', left: '-4px'}, 'sw-resize');
      self.se_corner = build_corner(el, {bottom: '-4px', right: '-4px'}, 'se-resize');

      return el;
    };

    // build corner element
    var build_corner = function(parent_node, styles, cursor) {
      var corner = document.createElement('div');
      corner.className = 'corner';
      parent_node.appendChild(corner);
      for (var item in styles) {
        corner.style[item] = styles[item];
      }
      bind(corner, 'mouseover', function(e) {
        corner.style.cursor = cursor;
      }, false);
      bind(corner, 'mouseout', function(e) {
        corner.style.cursor = 'auto';
      }, false);
      return corner;
    };

    return Square;
  
  })();


  // class Canvas
  var Canvas = (function() {

    // private varialbles
    var self, add_btn, clear_btn;
    var square_mouse_down = false, corner_mouse_down = false;
    var mouse_x0, mouse_y0, square_x0, square_y0, square_height0, square_width0;
    var zindex = 1;
    var captured_square = null, captured_corner = null;

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


    // private methods: helpers and listeners

    var on_add_button_click = function(e) {
      e || (e = window.event);

      var square = new Square();
      square.append_to(self.el);
      square.el.style.top = square.el.offsetTop + Math.round((self.el.offsetHeight - square.el.offsetHeight) / 2) + 'px';
      square.el.style.left = square.el.offsetLeft + Math.round((self.el.offsetWidth - square.el.offsetWidth) / 2) + 'px';
      square.el.style.zIndex = zindex++;
      bind(square.el, 'mousedown', on_square_mouse_down, false);

      bind(square.nw_corner, 'mousedown', on_corner_mouse_down , false);
      bind(square.ne_corner, 'mousedown', on_corner_mouse_down , false);
      bind(square.sw_corner, 'mousedown', on_corner_mouse_down , false);
      bind(square.se_corner, 'mousedown', on_corner_mouse_down , false);
    };

    var on_clear_button_click = function(e) {
      e || (e = window.event);

      while (self.el.lastChild !== add_btn && self.el.lastChild !== clear_btn) {
        self.el.removeChild(self.el.lastChild);
      }
    };

    var on_square_mouse_down = function(e) {
      e || (e = window.event);

      captured_square = get_element(e);
      if (captured_square.className === 'square') {
        square_mouse_down = true;
        captured_square.style.cursor = 'move';

        mouse_x0 = e.clientX;
        mouse_y0 = e.clientY;

        square_x0 = captured_square.offsetLeft;
        square_y0 = captured_square.offsetTop;

        block_event(e);
      }
    };

    var on_corner_mouse_down = function(e) {
      e || (e = window.event);

      captured_corner = get_element(e);
      if (captured_corner.className === 'corner') {
        corner_mouse_down = true;

        mouse_x0 = e.clientX;
        mouse_y0 = e.clientY;
        square_x0 = captured_corner.parentNode.offsetLeft;
        square_y0 = captured_corner.parentNode.offsetTop;
        square_height0 = captured_corner.parentNode.offsetHeight;
        square_width0 = captured_corner.parentNode.offsetWidth;

        block_event(e);
      }
    };

    var on_canvas_mouse_move = function(e) {
      e || (e = window.event);

      // moving
      if (square_mouse_down) {
        var move_to = function(dx, dy) {

          captured_square.style.left = square_x0 + dx + 'px';
          captured_square.style.top = square_y0 + dy + 'px';
        };

        move_to(e.clientX - mouse_x0, e.clientY - mouse_y0);
        block_event(e);
        return false;
      }

      // resizing
      if (corner_mouse_down) {
        var resize_to = function(dx, dy) {
          var square = captured_corner.parentNode;
          var left = parseInt(captured_corner.style.left); isNaN(left) ? left = 0 : true;
          var top = parseInt(captured_corner.style.top); isNaN(top) ? top = 0 : true;
          var right = parseInt(captured_corner.style.right); isNaN(right) ? right = 0 : true;
          var bottom = parseInt(captured_corner.style.bottom); isNaN(bottom) ? bottom = 0 : true;

          if (left < 0 && top < 0) {              // north-west
            square.style.height = ((square_height0 - dy < 12) ? 12 : (square_height0 - dy))  + 'px';
            square.style.width = ((square_width0 - dx < 12) ? 12 : (square_width0 - dx)) + 'px';
            parseInt(square.style.width) > 12 ? (square.style.left = square_x0 + dx + 'px') : true;
            parseInt(square.style.height) > 12 ? (square.style.top = square_y0 + dy + 'px') : true;
          } else if (left < 0 && bottom < 0) {    // south-west
            square.style.height = ((square_height0 + dy < 12) ? 12 : (square_height0 + dy))  + 'px';
            square.style.width = ((square_width0 - dx < 12) ? 12 : (square_width0 - dx)) + 'px';
            parseInt(square.style.width) > 12 ? (square.style.left = square_x0 + dx + 'px') : true;
          } else if (right < 0 && top < 0) {      // north-east
            square.style.height = ((square_height0 - dy < 12) ? 12 : (square_height0 - dy))  + 'px';
            square.style.width = ((square_width0 + dx < 12) ? 12 : (square_width0 + dx)) + 'px';
            parseInt(square.style.height) > 12 ? (square.style.top = square_y0 + dy + 'px') : true;
          } else if (right < 0 && bottom < 0) {   // south-east
            square.style.height = ((square_height0 + dy < 12) ? 12 : (square_height0 + dy))  + 'px';
            square.style.width = ((square_width0 + dx < 12) ? 12 : (square_width0 + dx)) + 'px';
          }
        };

        resize_to(e.clientX - mouse_x0, e.clientY - mouse_y0);
        block_event(e);
        return false;
      }
    };

    var on_document_mouse_up = function(e) {
      square_mouse_down = false;
      corner_mouse_down = false;
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
