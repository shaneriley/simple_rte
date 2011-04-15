;(function($) {

  $.fn.simpleRte = function(options) {
    var simpleRte = {
      controls: {
        bold: function() {
          simpleRte.events.defaults.wrapWithElement("b");
          return false;
        },
        italic: function() {
          simpleRte.events.defaults.wrapWithElement("i");
          return false;
        },
        underline: function() {
          simpleRte.events.defaults.wrapWithElement("u");
          return false;
        },
        paragraph: function() {
          var $p = simpleRte.events.defaults.wrapWithElement("p");
          if ($p) {
            if ($p.attr("data-end_append")) {
              $(this).closest(opts.selector).append($p.removeAttr("data-end_append"));
            }
            $p.attr("contenteditable", true).focus();
          }
          return false;
        },
        ul: function() {
          var $ul = simpleRte.events.defaults.wrapWithElement("ul");
          if ($ul.attr("data-end_append")) {
            $(this).closest(opts.selector).append($ul.removeAttr("data-end_append"));
          }
          $("<li />", {
            contenteditable: true,
            text: $ul.text() }).appendTo($ul.empty()).focus();
          return false;
        },
        ol: function() {
          var $ol = simpleRte.events.defaults.wrapWithElement("ol");
          if ($ol.attr("data-end_append")) {
            $(this).closest(opts.selector).append($ol.removeAttr("data-end_append"));
          }
          $("<li />", {
            contenteditable: true,
            text: $ol.text() }).appendTo($ol.empty()).focus();
          return false;
        },
        image: function() {
          var $img,
              img_src = prompt("Enter an image URL");
          if (img_src) {
            $img = simpleRte.events.defaults.wrapWithElement("img");
            if ($img) {
              $img[0].src = img_src;
              $img.text("").unwrap("." + opts.editable_shim.attr("class"));
            }
          }
          return false;
        },
        anchor: function() {
          if (getRange().collapsed) { return false; }
          var $a,
              href = prompt("Enter an address");
          if (href) {
            $a = simpleRte.events.defaults.wrapWithElement("a");
            if ($a) {
              href = (/^http:\/\//i.test(href)) ? href : "http://" + href;
              $a[0].href = href;
              $a.unwrap("." + opts.editable_shim.attr("class"));
            }
          }
          return false;
        },
        h1: function() {
          simpleRte.events.defaults.wrapWithElement("h1");
          return false;
        },
        h2: function() {
          simpleRte.events.defaults.wrapWithElement("h2");
          return false;
        },
        h3: function() {
          simpleRte.events.defaults.wrapWithElement("h3");
          return false;
        }
      },
      fireMenuAction: function(e, action) {
        if (e.ctrlKey && action in simpleRte.controls) {
          simpleRte.controls[action]();
        }
      },
      events: {
        defaults: {
          "8": function(el, e) {
            // backspace
            var $e = this,
                $b = $e.prev(),
                range = getRange(),
                shiftText = function() {
                  $b.html($b.html() + $e.html());
                  $e.remove();
                },
                preventDefault = function() {
                  $b.focus();
                  e.preventDefault();
                };
            if (range.endOffset - range.startOffset < range.startContainer.length && range.endOffset) { return; }
            if ($.trim($e.text()) === "") {
              if ($e.is("li")) {
                if ($e.closest("ul, ol").find("li").length < 2) {
                  $e.closest("ul, ol").remove();
                }
              }
              $e.remove();
              preventDefault();
            }
            else if ($e.is("li")) {
              if (!$e.closest("ul, ol").find("li").not(this).length) {
                $b = $e.closest("ul, ol").prev();
                $b.text($b.text() + $e.text());
                $e.closest("ul, ol").remove();
              }
              else { shiftText(); }
              preventDefault();
            }
            else if (range.startOffset === 0 && $b.length && !$b.is("." + opts.menu_class)) {
              var p = $(range.startContainer.parentElement).text().indexOf(range.startContainer.data);
              if (!p) {
                shiftText();
                preventDefault();
              }
            }
          },
          "13": function(el, e) {
            // return
            var offset = {},
                text = this.text(),
                range = getRange(this);
            offset.start = range.startOffset;
            offset.end = range.endOffset;
            if (!e.altKey) {
              this.text(text.substring(0, offset.start));
              text = text.substring(offset.end);
              $("<" + el + " />", {
                contenteditable: true,
                text: $.trim(text)
              }).insertAfter(this).focus();
            }
            else {
              this.html(text.substring(0, offset.start) + "<br />" + text.substring(offset.end));
            }
            e.preventDefault();
          },
          "66": function(el, e) { simpleRte.fireMenuAction(e, "bold"); },
          "73": function(el, e) { simpleRte.fireMenuAction(e, "italic"); },
          "85": function(el, e) { simpleRte.fireMenuAction(e, "underline"); },
          wrapWithElement: function(el) {
            var range = getRange(),
                sel_obj = range.selection,
                additional_rules_for = {
                  p: function() {
                    var offset = {
                      start: range.startOffset,
                      end: range.endOffset
                    };
                    if (!offset.start) { $wrapper = $(range.endContainer); }
                    if (offset.start) {
                      if (range.endOffset === 1 && range.startOffset) {
                        $wrapper = $(range.endContainer);
                      }
                      if ($wrapper.is("ul, ol, li")) { return false; }
                      if (!$wrapper.is(el)) {
                        var text = $wrapper.text();
                        $wrapper.text(text.substring(0, offset.start));
                        $e = $("<" + el + " />", {
                          text: $.trim(text.substring(offset.end))
                        });
                        $e.insertAfter($wrapper);
                      }
                      else {
                        var event = $.Event("keydown");
                        event.keyCode = 13;
                        $wrapper.trigger(event);
                        $e = $wrapper.next(el);
                      }
                    }
                    else {
                      $e = $("<" + el + " />", { contenteditable: true })
                            .insertBefore($(range.endContainer));
                    }
                  },
                  ul: function() {
                    var offset = {
                      start: range.startOffset,
                      end: range.endOffset
                    },
                      text = "",
                      remainder = "";
                    $wrapper = $(range.endContainer);
                    text = $wrapper.text();
                    $wrapper.text((offset.start) ? text.substring(0, offset.start) : " ");
                    $e = $("<" + el + " />", {
                      contenteditable: false,
                      text: $.trim((offset.end === 1) ? text.substring(offset.start) : text.substring(offset.end))
                    });
                    if (/inline/.test($wrapper.css("display")) || $wrapper.is("p")) {
                      $e.insertAfter($wrapper);
                    }
                    else { $e.appendTo($wrapper); }
                  },
                  h1: function() {
                    if (range.endOffset === 1 && range.startOffset) {
                      $wrapper = $(range.endContainer);
                    }
                    var offset = {
                      start: range.startOffset,
                      end: range.endOffset
                    },
                      text = $wrapper.text(),
                      remainder = "";
                    if (!offset.start) { $wrapper = $(range.endContainer); }
                    if (offset.start) {
                      $wrapper.text(text.substring(0, offset.start));
                      if (offset.end > offset.start) {
                        remainder = text.substring(offset.end);
                        text = text.substring(offset.start, offset.end);
                      }
                      else if (offset.end === 1) {
                        remainder = text.substring(offset.start);
                        text = "";
                      }
                      else { text = text.substring(offset.end); }
                      $e = $("<" + el + " />", {
                        contenteditable: true,
                        text: $.trim(text)
                      });
                      if (/inline/.test($wrapper.css("display")) || $wrapper.is("p")) {
                        $e.insertAfter($wrapper);
                        $wrapper.clone().text($.trim(remainder)).insertAfter($e);
                      }
                      else {
                        $e.appendTo($wrapper);
                        $wrapper.clone().text($.trim(remainder)).insertAfter($wrapper);
                      }
                    }
                    else {
                      $e = $("<" + el + " />", { contenteditable: true })
                            .insertBefore($(range.endContainer));
                    }
                    $e.focus();
                  }
                };
            additional_rules_for.ol = additional_rules_for.ul;
            additional_rules_for.h2 = additional_rules_for.h3 = additional_rules_for.h1;
            if (range.collapsed) {
              range.insertNode($("<span />", { id: "caret" })[0]);
              var $caret = $("#caret");
              if ($caret.closest("." + opts.menu_class).length) {
                $caret.remove();
                return $("<" + el + " />", { "data-end_append": true });
              }
              $caret.remove();
            }
            if (!sel_obj.rangeCount) {
              if (el in additional_rules_for) {
                return $("<" + el + " />", { "data-end_append": true });
              }
              return false;
            }
            var $wrapper = $(range.endContainer.parentNode),
                $e;
            if (sel_obj.rangeCount) {
              if (el in additional_rules_for) { additional_rules_for[el](); }
              else if ($wrapper.is(el)) {
                $wrapper.closest("." + opts.editable_shim.attr("class")).replaceWith($wrapper.text());
              }
              else if (range.endOffset > 1 && range.startOffset) {
                $e = document.createElement(el);
                range.surroundContents($e);
                $e = $($e).attr("contenteditable", true);
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
            },
            anchor: {
              label: "<# />"
            },
            image: true,
            h1: true,
            h2: true,
            h3: true
          },
          menu_class: "rte_menu",
          editable_shim: $("<span />", { "class": "rte_shim", contenteditable: false })
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
        if (e.keyCode in simpleRte.events.defaults) {
          simpleRte.events.defaults[e.keyCode].call($(e.target), e.target.localName, e);
        }
      });
    });
  };

  function getRange(el) {
    var selection, range = {};
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
