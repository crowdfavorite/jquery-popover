/*!
 * CF Popover
 * A lightweight framework for positioning iPad-style popover elements against triggers.
 *
 * Copyright 2011, Crowd Favorite (http://crowdfavorite.com)
 * Licensed under the MIT license.
 * http://www.opensource.org/licenses/mit-license.php
 */
;(function ($) {
	/* Proxy this once to save computation */
	var uiPosition = $.ui.position;
	
	/**
	 * Constructor function for popovers
	 */
	var Popover = function ($trigger, opts) {
		this.opts = $.extend({}, this.opts, opts);
		this.$trigger = $($trigger.get(0));
		
		this.$popover = $(this.$trigger.attr('href'));
		
		this.$popover
			.prepend('<span role="presentation" class="before"/>')
			.append('<span role="presentation" class="after"/>')
			.hide();
	};
	Popover.prototype = {
		timeout: null,
		$win: $(window),
		
		opts: {
			my: 'center bottom',
			at: 'center top',
			offset: '0 0',
			collision: 'flop flop'
		},
		
		/**
		 * Custom collision handling for popovers (access via "flop" keyword)
		 * Identical to "flip", but adds class to element being flipped to let
		 * you know when it has been changed from default position.
		 * Functions get bound to this.$popover in the constructor.
		 * Used as a monkey patch below.
		 */
		flop: {
			left: function (position, data) {
				var cPosition = data.collisionPosition,
					$popover = $(this),
					c = 'flopped-x',
					out;
				
				/* Run the original first -- it modifies position
				and data by reference. Store return value
				anyway, since we want to make sure if they do
				decide to return something in future the API
				isn't broken */
				out = uiPosition.flip.left(position, data);
				
				(cPosition.left !== position.left) ? $popover.addClass(c) : $popover.removeClass(c);
				
				return out;
			},
			top: function (position, data) {
				var cPosition = data.collisionPosition,
					$popover = $(this),
					c = 'flopped-y',
					out;

				/* Run the original first -- it modifies position
				and data by reference. Store return value
				anyway, since we want to make sure if they do
				decide to return something in future the API
				isn't broken */
				out = uiPosition.flip.top(position, data);

				(cPosition.top !== position.top) ? $popover.addClass(c) : $popover.removeClass(c);
				
				return out;
			}
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
		
		/* Calculate and position against trigger */
		pinToTarget: function () {
			var $popover = this.$popover,
				posOpts = $.extend({
					of: this.$trigger
				}, this.opts),
				
				/* Monkey-patch in our custom collision handling */
				flop = {
					/* Bind our custom collision handling to the popover element */
					left: $.proxy(this.flop.left, this.$popover),
					top: $.proxy(this.flop.top, this.$popover)
				};
			
			uiPosition.flop = flop;
			$popover.position(posOpts);
			uiPosition.flop = undefined;
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