/*!
 * CF Popover
 * A lightweight framework for positioning iPad-style popover elements against triggers.
 *
 * Copyright 2011, Crowd Favorite (http://crowdfavorite.com)
 * Licensed under the MIT license.
 * http://www.opensource.org/licenses/mit-license.php
 */
;(function ($) {
	var Popover = function ($trigger, opts) {
		$.extend(this.opts, opts);
		this.$trigger = $($trigger.get(0));
		
		this.$popover = $(this.$trigger.attr('href'));
		this.$popover
			.prepend('<span role="presentation" class="before"/>')
			.append('<span role="presentation" class="after"/>');
		this.$popover.hide();
	};
	Popover.prototype = {
		timeout: null,
		$win: $(window),
		
		opts: {
			my: 'center bottom',
			at: 'center top',
			offset: '0 0'
		},
		
		bindEvents: function () {
			this.$trigger.click($.proxy(function (e) {
				if (this.$popover.is(':visible')) {
					this.hidePopover(e);
				}
				else {
					this.showPopover(e);
				};
			}, this));

			$('body').click($.proxy(this.hidePopover, this));

			this.$popover.click(function (e) {
				e.stopPropagation();
			});

			this.$win.resize($.proxy(this.pinToTargetDebounced, this));
		},
		
		showPopover: function (e) {
			this.$popover.fadeIn();
			this.pinToTarget();
			e.preventDefault();
			e.stopPropagation();
		},
		
		hidePopover: function (e) {
			this.$popover.fadeOut('fast');
			e.preventDefault();
			e.stopPropagation();
		},
		
		/* Calculate and position against trigger */
		pinToTarget: function () {
			var opts = this.opts;
			this.$popover.position({
				my: opts.my,
				at: opts.at,
				of: this.$trigger,
				offset: opts.offset
			});
		},
		
		/* Debounced to prevent hitting lots of times while resizing happens.
		Will fire a maximum of 20x per second. Useful for binding to the window
		resize event. */
		pinToTargetDebounced: function () {
			clearTimeout(this.timeout);
			this.timeout = setTimeout($.proxy(this.pinToTarget, this), 50);
		}
	};
	
	$.fn.popover = function (opts) {
		var Popover = $.fn.popover.Popover;

		this.each(function() {
			var $this = $(this);
			var popover = new Popover($this, opts);
			popover.bindEvents();
			
			/* Store Popover instance for easy method access.
			See: http://alexsexton.com/?p=51
			
			Example: $('.trigger').data('popover').hidePopover(); */
			$this.data('popover', popover);
		});
	};
	/* Expose constructor function for folks to duck-type when necessary */
	$.fn.popover.Popover = Popover;
})(jQuery);