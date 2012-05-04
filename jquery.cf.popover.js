/*!
 * CF Popover v1.1
 * A lightweight framework for positioning iPad-style popover elements against triggers.
 *
 * Copyright 2011-2012, Crowd Favorite (http://crowdfavorite.com)
 * Released under the MIT license.
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
		
		this.$popover = $(( this.opts.popover || this.$trigger.attr('href') ));
		this.$popover = $(this.$popover.get(0));
		
		if (!this.$popover.hasClass('popover-before-after-applied')) {
			this.$popover.addClass('popover-before-after-applied')
				.prepend('<span role="presentation" class="before"/>')
				.append('<span role="presentation" class="after"/>')
				.hide();
		}
	};
	
	Popover.prototype = {
		timeout: null,
		$win: $(window),
		
		opts: {
			my: 'center bottom',
			at: 'center top',
			offset: '0 0',
			collision: 'flop flop',
			popover: null,
			thereCanBeOnlyOne: true
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
				if (this.popoverIsOpen()) {
					this.hidePopover(e);
				}
				else {
					this.showPopover(e);
				};
				if (this.opts.thereCanBeOnlyOne) {
					$('body').trigger('popover-hide-all');
				};
			}, this));
			
			$('body').click($.proxy(function (e) {
				if (this.popoverIsOpen()) {
					if (!$(this.$popover).has($(e.target)).size() && !$(this.$popover).filter($(e.target)).size()) {
						this.hide();
					}
				};
			}, this)).bind('popover-hide-all', $.proxy(function() {
				if (this.popoverIsOpen() && !this.currentTrigger()) {
					this.hide(true);
				};
			}, this));
			
			this.$win.resize($.proxy(this.pinToTargetDebounced, this));
		},
		
		/* is the popover the this trigger open? */
		popoverIsOpen: function() {
			var opener = (this.$trigger.length == this.$trigger.filter(this.$popover.data('opener')).length);
			return (this.$popover.is(':visible') && opener);
		},
		
		/* is this trigger the last trigger clicked? */
		currentTrigger: function() {
			return (this.$trigger.length == this.$trigger.filter($.fn.popover.lastTrigger).length);
		},
		
		/* Method for showing the popover */
		show: function (e) {
			$.fn.popover.lastTrigger = this.$trigger;
			this.$popover.fadeIn('medium', $.proxy(function () {
				this.$trigger.trigger('popover-show-animation-complete');
			}, this)).data('opener', this.$trigger);
			this.pinToTarget();
			this.$trigger.trigger('popover-show');
		},
		
		/* Method for hiding the popover */
		hide: function (immediate) {
			var callback = $.proxy(function () {
				this.$trigger.trigger('popover-hide-animation-complete');
			}, this);
			if (immediate) {
				this.$popover.hide(0, callback);
			}
			else {
				this.$popover.fadeOut('fast', callback);
			};
			this.$trigger.trigger('popover-hide');
		},

		toggle: function(immediate) {
			if (this.popoverIsOpen()) {
				this.hide(immediate);
			}
			else {
				this.show();
			}
		},
		
		/* Event handler for showing popover */
		showPopover: function (e) {
			e.preventDefault();
			e.stopPropagation();
			this.show(e);
		},
		
		/* Event handler for hiding popover */
		hidePopover: function (e) {
			e.preventDefault();
			e.stopPropagation();
			this.hide();
		},
		
		/* Calculate and position against trigger */
		pinToTarget: function () {
			if (!this.popoverIsOpen()) {
				return;
			}
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
	
	var fn = $.fn;
	
	fn.popover = function (opts) {
		var Popover = fn.popover.Popover;
		
		this.each(function() {
			var $this = $(this);
			var popover = new Popover($this, opts);
			popover.bindEvents();
			
			/* Store Popover instance for easy method access.
			See: http://alexsexton.com/?p=51
			
			Example: $('.trigger').data('popover').hidePopover(); */
			$this.data('popover', popover);
		});
		
		return this;
	};
	
	fn.popover.lastTrigger = null;
	
	/* Expose constructor function for folks to duck-type when necessary */
	fn.popover.Popover = Popover;
})(jQuery);
