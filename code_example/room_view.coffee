root = exports ? this
$ = jQuery = ROOM.jQuery
_ = ROOM._
Backbone = ROOM.Backbone
$ = jQuery = ROOM.jQuery

ROOM.RoomView = Backbone.View.extend
  el: $ '#' + ROOM.content_id

  template: _.template '
    <div id="<%= ROOM.prefix %>entrance-popups" class="enter-popups"></div> <!-- Add a class .request-registration to prompt registration -->
    <div id="<%= ROOM.prefix %>recover-password-popup" class="recover-password-popup"></div>
    
    <div id="<%= ROOM.prefix %>handler" class="handler">
      <div id="<%= ROOM.prefix %>handler-user-counter" class="wrapper">
        <!--<div class="noone">
          <div class="title">Nobody</div>
          <div class="description">
            around<br />
            now
          </div>
        </div>-->
      </div>
      <div class="door-handle"></div>
      <div class="explanation"><div class="label">Click to open</div></div>
    </div>

    <div id="<%= ROOM.prefix %>exit" class="exit"><div class="exit-handler">x</div></div>

    <div id="<%= ROOM.prefix %>room" class="room">
      <div id="<%= ROOM.prefix %>carpet" class="carpet">
        <div id="<%= ROOM.prefix %>carpet-header" class="header"></div>
        <div id="<%= ROOM.prefix %>carpet-conversation-container" class="conversation-container">
          <table id="<%= ROOM.prefix %>carpet-sayings" class="conversation"></table>
          <!--div id="<%= ROOM.prefix %>carpet-saying-form" class="saying-form"></div--> 
        </div>
      </div>
      <div class="decorative-strip"></div>
    </div>
  '
  
  initialize: ->
    # Border-radius, because those who support will work fine for us
    @el.hide()
    @render()

    if Modernizr.borderradius
      check_if_css_is_loaded = =>
        if $("#" + ROOM.iframe_id).css("width") is "40px"
          @el.fadeIn()
          clearInterval(css_load_timer)

      css_load_timer = setInterval(check_if_css_is_loaded, 25)

  render: ->
    @el.html @template()
    $("#" + ROOM.prefix + "handler").click ->
      if ROOM.sayings.size() < 1
        ROOM.view.carpet_sayings.show_blank_state()
      $("#" + ROOM.content_id).addClass "opened"
      $("#" + ROOM.prefix + "carpet-new-saying-body").focus()

    $("#" + ROOM.prefix + "exit").click ->
      $("#" + ROOM.content_id).removeClass("opened")

    @carpet_header = new ROOM.CarpetHeaderView
      el: $('#' + ROOM.prefix + 'carpet-header')

    @carpet_sayings = new ROOM.CarpetSayingsView
      el: $('#' + ROOM.prefix + 'carpet-sayings')
      collection: @collection

    @entrance_popups = new ROOM.EntrancePopupsView
      el: $('#' + ROOM.prefix + 'entrance-popups')

    # TO DO something with this declarations
    sayings_list =  $("#" + ROOM.prefix + "carpet-sayings-list")
    sayings_container =  $("#" + ROOM.prefix + "carpet-sayings")
    form = $("#" + ROOM.prefix + "carpet-saying-form-container")
    @scroller_up = $("#" + ROOM.prefix + "carpet-sayings-list-scroller-up")
    @scroller_down = $("#" + ROOM.prefix + "carpet-sayings-list-scroller-down")
    header = $('#' + ROOM.prefix + 'carpet-header')

    # Make scrollers work
    self = @
    scrolling_timer = 0
    scrolling_direction = null
    there_is_something_to_load = true # показывает, есть ли у нас еще чего пагинировать

    top_is_reached = () ->
      if sayings_list.offset().top <= header.height()
        false
      else
        unless self.scroller_up.hasClass("loading")
          clearInterval(scrolling_timer)
          if ROOM.sayings.is_there_something_to_load
            # we have something to paginate
            self.scroller_up.addClass("loading")
            ROOM.app.socket.emit 'show_me_more', ROOM.sayings.first().toJSON()
            # start pagination
            # we don't forget to bring scroller to the inital condition after (remove class loading)
          else
            self.scroller_up.fadeOut()
        true

    bottom_is_reached = () ->
      if sayings_list.bottom() < 0
        false
      else
        self.scroller_up.fadeOut() unless self.scroller_up.hasClass("loading")
        clearInterval(scrolling_timer)
        true

    # Show scrollers 
    $("#" + ROOM.prefix + "carpet").mousemove (e) =>
      widget_middle = ($(window).height() / 2) - header.height()
      y = e.pageY - $(document).scrollTop()
      if y < header.height() or y > form.offset().top
        self.scroller_up.fadeOut() unless self.scroller_up.hasClass("loading")
        self.scroller_down.fadeOut()
      else
        if y < widget_middle
          self.scroller_down.fadeOut()
          self.scroller_up.show() unless top_is_reached()
        else
          self.scroller_up.fadeOut() unless self.scroller_up.hasClass("loading")
          self.scroller_down.show() unless bottom_is_reached()
          
    $("#" + ROOM.prefix + "carpet").scroll (e) =>
      ROOM.log("here")

    perform_animation = () ->
      bottom = sayings_list.bottom()
      if scrolling_direction is "up"
        bottom -= 1 unless top_is_reached()
      else if scrolling_direction is "down"
        bottom += 1 unless bottom_is_reached()
      sayings_list.css("bottom", bottom + "px")
      true

    start_animation = () ->
      clearInterval(scrolling_timer)
      scrolling_timer = setInterval(perform_animation, 4)
      true

    @scroller_up.mouseenter ->
      scrolling_direction = "up"
      start_animation()

    @scroller_down.mouseenter ->
      scrolling_direction = "down"
      start_animation()

    $(@el).find(".scroller").mouseleave ->
      clearInterval(scrolling_timer)

    @scroller_up.click ->
      offset_top = {top: header.height()}
      sayings_list.offset(offset_top)
      $(this).fadeOut()

    @scroller_down.click ->
      sayings_list.css("bottom", 0)
      $(this).fadeOut()

    @
  
  update_users_count: (count) ->
    count = 1 if count is 'undefined' or !count
    count -= 1 if count > 0
    @handler_user_counter = new ROOM.HandlerUserCounterView
      model: new Backbone.Model
        count: count
    $("#" + ROOM.prefix + "handler-user-counter").html @handler_user_counter.el

    @carpet_header_user_counter = new ROOM.CarpetHeaderUserCounterView
      model: new Backbone.Model
        count: count
    $("#" + ROOM.prefix + "carpet-header-user-counter").html @carpet_header_user_counter.el

