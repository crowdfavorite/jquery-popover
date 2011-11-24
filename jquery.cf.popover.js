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
		this.opts = $.extend({}, this.opts, opts);
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
		flippedX: false,
		
		opts: {
			my: 'center bottom',
			at: 'center top',
			offset: '0 0',
			collision: 'flip flip'
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

			$('body').click($.proxy(function () {
				this.$popover.fadeOut('fast');
			}, this));

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
		
		/* Monkey-patched wrapper for UI Position's
		$.fn.position function. Adds a hook for us to be able
		to tell when something has been flipped using
		collision detection. */
		position: function ($el, opts) {
			var that = this,
				uiPositionFlip = $.ui.position.flip,
				/* Keep a copy of this function around for restoration
				after we're finished monkey-patching it. */
				uiPositionFlipLeft = uiPositionFlip.left,
				
				monkeyFlipLeft = function (position, data) {
					var collisionPos = data.collisionPosition,
						/* Run the original first -- it modifies position
						and data by reference. Store return value
						anyway, since we want to make sure if they do
						decide to return something in future the API
						isn't broken */
						out = uiPositionFlipLeft(position, data);

					// Now that these are populated, we can test to see if we're flipped
					if (collisionPos['left'] !== position['left']) {
						that.flippedX = true;
					}
					else {
						that.flippedX = false;
					};

					// Return value of original collision function
					return out;
				};

			uiPositionFlip.left = monkeyFlipLeft;
			$el.position(opts);
			/* Leave things behind as we found them. */
			uiPositionFlip.left = uiPositionFlipLeft;
		},
		
		/* Calculate and position against trigger */
		pinToTarget: function () {
			var $popover = this.$popover,
				opts = this.opts,
				defaultPosOpts = {
					of: this.$trigger
				},
				posOpts = $.extend(defaultPosOpts, opts);
			
			this.position(this.$popover, posOpts);
			
			if (this.flippedX) {
				$popover.addClass('flipped-x');
			}
			else {
				$popover.removeClass('flipped-x');
			};
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