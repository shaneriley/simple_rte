;(function($) {

  $.fn.simpleRte = function(options) {
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
        })(),
        paragraph: (function() {
          return function() {
            var $p = simpleRte.events.defaults.wrapWithElement("p");
            $p.attr("contenteditable", true).focus();
            return false;
          }
        })(),
        ul: (function() {
          return function() {
            var $ul = simpleRte.events.defaults.wrapWithElement("ul");
            $("<li />", {
              contenteditable: true,
              text: $ul.text() }).appendTo($ul.empty()).focus();
            return false;
          }
        })(),
        ol: (function() {
          return function() {
            var $ol = simpleRte.events.defaults.wrapWithElement("ol");
            $("<li />", {
              contenteditable: true,
              text: $ol.text() }).appendTo($ol.empty()).focus();
            return false;
          }
        })()
      },
      events: {
        defaults: {
          "8": function(el, e) {
            // backspace
            var $e = this,
                $b = $e.prev(),
                range = getRange(),
                shiftText = function() {
                  $b.text($b.text() + $e.text());
                  $e.remove();
                };
            if ($e.text() === "") { $e.remove(); }
            else if ($e.closest("ul, ol").length) {
              if (!$e.closest("ul, ol").find("li").not(this).length) {
                console.log("!");
                $b = $e.closest("ul, ol").prev();
                $b.text($b.text() + $e.text());
                $e.closest("ul, ol").remove();
              }
              else { shiftText(); }
            }
            else if (range.startOffset === 0 && $b.length && !$b.is("." + opts.menu_class)) {
              shiftText();
            }
            $b.focus();
            e.preventDefault();
          },
          "13": function(el, e) {
            // return
            var offset = {},
                text = this.text(),
                range = getRange(this);
            offset.start = range.startOffset;
            offset.end = range.endOffset;
            this.text(text.substring(0, offset.start));
            text = text.substring(offset.end);
            $("<" + el + " />", {
              contenteditable: true,
              text: $.trim(text)
            }).insertAfter(this).focus();
            e.preventDefault();
          },
          wrapWithElement: function(el) {
            var range = getRange(),
                sel_obj = range.selection,
                additional_rules_for = {
                  p: function() {
                    if (!$wrapper.is(el)) { return false; }
                    var event = $.Event("keydown");
                    event.keyCode = 13;
                    $wrapper.trigger(event);
                    $e = $wrapper.next(el);
                  },
                  ul: function() {
                    var offset = {
                      start: range.startOffset,
                      end: range.endOffset
                    },
                      text = $wrapper.text();
                    $wrapper.text(text.substring(0, offset.start));
                    $e = $("<" + el + " />", {
                      contenteditable: false,
                      text: $.trim(text.substring(offset.end))
                    });
                    if (/inline/.test($wrapper.css("display")) || $wrapper.is("p")) {
                      $e.insertAfter($wrapper);
                    }
                    else { $e.appendTo($wrapper); }
                  }
                };
            additional_rules_for.ol = additional_rules_for.ul;
            if (!sel_obj.rangeCount) { return false; }
            var $wrapper = $(range.endContainer.parentNode),
                $e;
            if (sel_obj.rangeCount) {
              if (el in additional_rules_for) { additional_rules_for[el](); }
              else if ($wrapper.is(el)) { $wrapper.replaceWith($wrapper.text()); }
              else {
                $e = document.createElement(el);
                range.surroundContents($e);
                $e = $($e);
                $e.wrap(opts.editable_shim.clone()).attr("contenteditable", true);
                if ($e.css("display") !== "block") {
                  $e.closest("." + opts.editable_shim.attr("class")).css("display", "inline");
                }
              }
            }
            return $e;
          }
        }
      }
    },
        opts = $.extend({
          controls: {
            bold: true,
            italic: true,
            underline: true,
            paragraph: {
              label: "⁋"
            },
            ul: {
              label: "• …"
            },
            ol: {
              label: "1. …"
            }
          },
          menu_class: "rte_menu",
          editable_shim: $("<div />", { "class": "rte_shim", contenteditable: false })
        }, options);

    simpleRte.menu = function() {
      var $bar = $("<div />", { "class": opts.menu_class });
      for (var control in opts.controls) {
        if (opts.controls[control]) {
          $("<a />", {
            href: "#",
            text: (opts.controls[control].label) ? opts.controls[control].label : control,
            "class": control,
            click: simpleRte.controls[control]
          }).appendTo($bar);
        }
      }
      return $bar;
    };

    opts.selector = this.selector;
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

  function getRange(el) {
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
    range.selection = selection;
    return range;
  }

  function findBlockParent() {
    if (this.css("display") === "inline") {
      findBlockParent.apply(this.parent());
    }
    else { return this; }
  }
})(jQuery);
