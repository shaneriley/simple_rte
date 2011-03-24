;(function($) {

  $.fn.simpleRte = function(defaults) {
    var simpleRte = {
      controls: {
        bold: (function() {
          return function() {
            simpleRte.events.defaults.wrapWithElement("b");
            return false;
          };
        })(),
        italic: (function() {
          return function() {
            simpleRte.events.defaults.wrapWithElement("i");
            return false;
          };
        })(),
        underline: (function() {
          return function() {
            simpleRte.events.defaults.wrapWithElement("u");
            return false;
          };
        })()
      },
      events: {
        defaults: {
          "8": function(el, e) {
            // backspace
            var $b = this.prev(),
                range = getRange();
            if (this.text() === "") {
              this.remove();
              $b.focus();
              e.preventDefault();
            }
            else if (range.startOffset === 0) {
              $b.text($b.text() + this.text());
              this.remove();
            }
          },
          "13": function(el, e) {
            // return
            var offset = {},
                text = this.text(),
                range = getRange();
            offset.start = range.startOffset;
            offset.end = range.endOffset;
            this.text(text.substring(0, offset.start));
            text = text.substring(offset.end);
            if (offset.start === text.length) { text = ""; }
            $("<" + el + " />", {
              contenteditable: true,
              text: text
            }).insertAfter(this).focus();
            e.preventDefault();
          },
          wrapWithElement: function(el) {
            var sel_obj = window.getSelection(),
                selection = sel_obj.getRangeAt(0),
                $wrapper = $(selection.endContainer.parentNode);
            if (sel_obj.rangeCount) {
              if ($wrapper.is(el)) {
                $wrapper.replaceWith($wrapper.text());
              }
              else {
                selection.surroundContents(document.createElement(el));
              }
            }
            return false;
          }
        }
      }
    },
        opts = $.extend({
          controls: {
            bold: true,
            italic: true,
            underline: true
          }
        }, defaults);

    simpleRte.menu = function() {
      var $bar = $("<div />", { "class": "rte_menu"});
      for (var control in opts.controls) {
        $("<a />", {
          href: "#",
          text: control,
          "class": control,
          click: simpleRte.controls[control]
        }).appendTo($bar);
      }
      return $bar;
    };

    return this.each(function() {
      var $e = $(this),
          els = {
            p: $e.find("p"),
            li: $e.find("li")
          };
      for (var selector in els) {
        els[selector].attr("contenteditable", true);
        for (var event in simpleRte.events[selector]) {
          $e.delegate(selector, event, simpleRte.events[selector][event]);
        }
      }
      $e.prepend(simpleRte.menu());
      $e.keydown(function(e) {
        if (e.keyCode in simpleRte.events.defaults && !e.altKey) {
          simpleRte.events.defaults[e.keyCode].call($(e.target), e.target.localName, e);
        }
      });
    });
  };

  function getRange() {
    var selection, range;
    if (window.getSelection) {
      selection = window.getSelection();
      if (selection.getRangeAt && selection.rangeCount) {
          range = selection.getRangeAt(0);
      }
    }
    else if (document.selection && document.selection.createRange) {
        range = document.selection.createRange();
    }
    return range;
  }
})(jQuery);
