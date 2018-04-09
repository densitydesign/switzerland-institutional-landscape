$(document).ready(function() {

	let windowSize = $(window).width();

	/* Start - Hamburger Navigation */

	var scrollTop = 0;
	var scrollBarWidth = getScrollBarWidth();
	$(document).on('click', '.hamburger', function() {
		if ($('.navigation-container').hasClass('active')) {
			$('.navigation-container').removeClass('active').css({'top': ''});
			setTimeout(function() {
				$('.navigation-container').css({'visibility': 'hidden'});
				$('html').css({'overflow': ''});
				$('.home-image-down').css({'marginLeft': ''});
				$('.home-box').css({'marginRight': ''});
				$('.menu').css({'right': ''});
				$('article.fixed').css({'paddingRight': ''});
				if (windowSize  > 767) {
					$('body').css({'top': '', 'overflow': '', 'paddingRight': ''});
				} else {
					$('body').css({'position': '', 'top': '', 'overflow': '', 'paddingRight': ''});
				}
				$('html,body').scrollTop(scrollTop);
			}, 500);
		} else {
			scrollTop = $(document).scrollTop();
			if (windowSize  > 767) {
				$('body').css({'overflow': 'hidden', 'top': '-' + scrollTop + 'px', 'paddingRight': scrollBarWidth + 'px'});
			} else {
				$('body').css({'position': 'fixed', 'overflow': 'hidden', 'top': '-' + scrollTop + 'px', 'paddingRight': scrollBarWidth + 'px'});
			}
			$('article.fixed').css({'paddingRight': scrollBarWidth + 'px'});
			$('.home-image-down').css({'marginLeft': '-=' + (scrollBarWidth / 2)});
			$('.home-box').css({'marginRight': '+=' + (scrollBarWidth / 2)});
			$('header .menu').css({'right': '+=' + scrollBarWidth});
			$('html').css({'overflow': 'hidden'});
			$('.navigation-container').addClass('active').css({'visibility': 'visible', 'top': scrollTop + 'px'});
		}
	});

	/* End - Hamburger Navigation */

	/* Start - Upper */

	$(document).on('click', 'img.up', function() {
		$("html,body").animate({scrollTop: 0});
	});

	/* End - Upper */

	/* Start - Language Selection */

	// desktop
	$(document).on('click', '.current-language', function() {
		$(".other-languages").toggleClass('active');
	});

	// mobile
	var current_language = $('.current-language').html();
	$(document).on('change', '.language-wheel select', function() {
		var selected_option = $("option:selected", this);
		var selected_value = this.value;
		if (current_language != selected_value) {
			window.location.href = $(selected_option).data('href');
		}
	});

	/* End - Language Selection */

   	/* Start - Enforce Full Height on mobile devices */

   	var prev_windowInnerHeight = 0;
   	function enforceFullHeight() {
   		/*$('.home-image').css({'height': window.innerHeight + 'px'});
   		$('.home-image-down').css({'top': (window.innerHeight - (window.innerWidth > 767 ? 110 : 70)) + 'px'});*/
   		if (!$('.navigation-container').hasClass('active')) {
   			$('.navigation-container').css({'height': window.innerHeight + 'px', 'top': '-' + (window.innerHeight + 5) + 'px'});
   		} else {
   			$('.navigation-container').css({'height': window.innerHeight + 'px'});
   		}
		$('.navigation-wrapper').css({'minHeight': (window.innerHeight - (window.innerWidth / 10) - 55) + 'px'});
		if (Math.abs(window.innerHeight - prev_windowInnerHeight) > 100) {
			prev_windowInnerHeight = window.innerHeight;
			$('.home-image').css({'height': window.innerHeight + 'px'});
   			$('.home-image-down').css({'top': (window.innerHeight - (window.innerWidth > 767 ? 110 : 70)) + 'px'});
			$('article.home').not('.fixed').css({'paddingTop': (window.innerWidth > 767 ? (window.innerHeight + 80) : (window.innerHeight + 10 * window.innerWidth / 100)) + 'px'});
		}
   	}
   	if ($('body').hasClass('mobile')) {
		enforceFullHeight();
		$(window).on('scroll resize orientationchange', function() {
			(debounce(function() {
				enforceFullHeight();
			}, 100))();
		});
   	}

   	/* End - Enforce Full Height on mobile devices */

	/* Start - Helper Functions */

	function getScrollBarWidth () {
		var inner = document.createElement('p');
		inner.style.width = "100%";
		inner.style.height = "200px";
		var outer = document.createElement('div');
		outer.style.position = "absolute";
		outer.style.top = "0px";
		outer.style.left = "0px";
		outer.style.visibility = "hidden";
		outer.style.width = "200px";
		outer.style.height = "150px";
		outer.style.overflow = "hidden";
		outer.appendChild (inner);
		document.body.appendChild (outer);
		var w1 = inner.offsetWidth;
		outer.style.overflow = 'scroll';
		var w2 = inner.offsetWidth;
		if (w1 == w2) {
			w2 = outer.clientWidth;
		}
		document.body.removeChild(outer);
		return (w1 - w2);
	};

	function debounce(func, wait, immediate) {
		var timeout;
		return function() {
			var context = this, args = arguments;
			var later = function() {
				timeout = null;
				if (!immediate) func.apply(context, args);
			};
			var callNow = immediate && !timeout;
			clearTimeout(timeout);
			timeout = setTimeout(later, wait);
			if (callNow) func.apply(context, args);
		};
	};

	/* End - Helper Functions */
});
