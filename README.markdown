# CF Popover

A lightweight framework for positioning popovers against triggers links. It's a pretty thin wrapper for jQuery UI Position, which does most of the heavy lifting.

JavaScript

	$('.trigger').popover();

HTML:

	<a class="trigger" href="#popover1">Open Popover</a>
	<div id="popover1">Popover FTW!</div>

CSS:

	#popover1 {
		position:absolute;
	}

## Requirements

- jQuery 1.6+
- jQuery UI 1.8+

It would probably work with earlier versions, but we haven't tested that.

## What it Does

- Visually positions the popover against the trigger element, regardless of where they are in the source order.
- Toggles the Popover with a fade effect when you click the trigger
- When clicking outside of the popover area, hides the popover.
- Repositions the popover after a window resize to make sure it stays pinned to the right place.
- Adds `.before` and `.after` empty elements to the popover. You can use these to create comic-bubble pointers using background images, or that type of thing.

## How to Use It

Include the script and it's requirements.

Popover markup consist of two parts:

- The popover element which must have an ID
- A trigger link, with an anchor to the ID of the popover element.

Sample markup:

	<a class="trigger" href="#popover1">Open Popover</a>
	<div id="popover1">Popover FTW!</div>

The popover element can live anywhere on the page. The script will automatically position the popover against the trigger.

You will also typically want to add `position: absolute;` to your popover element, otherwise jQuery UI Position will try to use relative positioning.

	#popover1 {
		position: absolute;
	}

Or better yet, use a generic class:

	.popover {
		position: absolute;
	}

Invoke the script on the trigger elements:

	$('.trigger').popover();

The popover script will find the associated popover for a trigger by looking at the value of the `href` attribute.

You can also pass options. This would make the popover appear at the right-top edge of the trigger:

	$('.trigger').popover({
		my: 'left bottom', // of popover
		at: 'right top', // of trigger
	});

### Options

- `my`: position of popover. Accepts [anything jQuery UI Position accepts](http://jqueryui.com/demos/position/).
- `at`: position of popover against trigger . Accepts [anything jQuery UI Position accepts](http://jqueryui.com/demos/position/).
- `offset`: any tweaks you would like to make to the position. Accepts [anything jQuery UI Position accepts](http://jqueryui.com/demos/position/).

### Advanced Use

You can access methods and data for a popover after it's been initialized via the data API.

	$('.trigger').data('popover').hidePopover();
	$('.trigger').data('popover').opts.my // value of 'my' option for this instance

Duck-typing the constructor function for popovers is possible by changing:

	$.fn.popover.Popover