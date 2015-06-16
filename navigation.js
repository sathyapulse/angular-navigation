angular.module('navSlider', []);

angular.module('navSlider').directive('navSliderDir', ['$window', '$document', '$timeout', function($window, $document, $timeout) {
	return {
		restrict: 'EA',
		scope: {
			initOnLoad: '=',
			flipperData: '=',
			navigationControl: '=',
			startAt: '=',
			classPrefix: '='
		},
		link: function(scope, element, attributes) {
			var isInitialized,
				navSlides,
				ngWindow,
				noOfSlides = 0,
				eleWidth = 0,
				currentSlide = 0,
				previousSlide = 0,
				isAnimating = false,
				shakeOnEnd = true,
				pfx,
				classPrefix = '',
				loop = true,
				animationIndex,
				animEndEventNames = {
					'Webkit' : 'webkitAnimationEnd',
					'O' : 'oAnimationEnd',
					'Ms' : 'animationend',
					'Moz': 'animationend',
					'animation' : 'animationend'
				},
				classList = {
					activeClass: 'nav-active',
					pageClass: 'nav-page',
					wrapperClass: 'nav-wrapper'
				},
				// animation end event name
				animEndEventName;

			var prefix = (function () {
			  var styles = window.getComputedStyle(document.documentElement, ''),
			    pre = (Array.prototype.slice
			      .call(styles)
			      .join('') 
			      .match(/-(moz|webkit|ms)-/) || (styles.OLink === '' && ['', 'o'])
			    )[1],
			    dom = ('WebKit|Moz|MS|O').match(new RegExp('(' + pre + ')', 'i'))[1];
			  return {
			    dom: dom,
			    lowercase: pre,
			    css: '-' + pre + '-',
			    js: pre[0].toUpperCase() + pre.substr(1)
			  };
			})();

			var transitions = (function() {
          		var obj = document.createElement('div'),
              		props = ['perspectiveProperty', 'WebkitPerspective', 'MozPerspective', 'OPerspective', 'msPerspective'];
      			for (var i in props) {
        			if ( obj.style[ props[i] ] !== undefined ) {
          				pfx = "-" + props[i].replace('Perspective','').toLowerCase();
          				return true;
        			}
      			}
      			return false;
        	}());

			animEndEventName = animEndEventNames[ prefix['js'] ];

			var classPrefixer = function(className) {
				return classPrefix + className;
			};

			var getRandomNumber = function(min, max) {
			    return Math.floor(Math.random()*(max-min+1)+min);
			};

			var getAnimationClass = function(animation) {
				var outClass, 
					inClass;

				switch( animation ) {

					case 1:
						outClass = 'pt-page-moveToLeft';
						inClass = 'pt-page-moveFromRight';
						break;
					case 2:
						outClass = 'pt-page-moveToRight';
						inClass = 'pt-page-moveFromLeft';
						break;
					case 3:
						outClass = 'pt-page-moveToTop';
						inClass = 'pt-page-moveFromBottom';
						break;
					case 4:
						outClass = 'pt-page-moveToBottom';
						inClass = 'pt-page-moveFromTop';
						break;
					case 5:
						outClass = 'pt-page-fade';
						inClass = 'pt-page-moveFromRight pt-page-ontop';
						break;
					case 6:
						outClass = 'pt-page-fade';
						inClass = 'pt-page-moveFromLeft pt-page-ontop';
						break;
					case 7:
						outClass = 'pt-page-fade';
						inClass = 'pt-page-moveFromBottom pt-page-ontop';
						break;
					case 8:
						outClass = 'pt-page-fade';
						inClass = 'pt-page-moveFromTop pt-page-ontop';
						break;
					case 9:
						outClass = 'pt-page-moveToLeftFade';
						inClass = 'pt-page-moveFromRightFade';
						break;
					case 10:
						outClass = 'pt-page-moveToRightFade';
						inClass = 'pt-page-moveFromLeftFade';
						break;
					case 11:
						outClass = 'pt-page-moveToTopFade';
						inClass = 'pt-page-moveFromBottomFade';
						break;
					case 12:
						outClass = 'pt-page-moveToBottomFade';
						inClass = 'pt-page-moveFromTopFade';
						break;
					case 13:
						outClass = 'pt-page-moveToLeftEasing pt-page-ontop';
						inClass = 'pt-page-moveFromRight';
						break;
					case 14:
						outClass = 'pt-page-moveToRightEasing pt-page-ontop';
						inClass = 'pt-page-moveFromLeft';
						break;
					case 15:
						outClass = 'pt-page-moveToTopEasing pt-page-ontop';
						inClass = 'pt-page-moveFromBottom';
						break;
					case 16:
						outClass = 'pt-page-moveToBottomEasing pt-page-ontop';
						inClass = 'pt-page-moveFromTop';
						break;
					case 17:
						outClass = 'pt-page-scaleDown';
						inClass = 'pt-page-moveFromRight pt-page-ontop';
						break;
					case 18:
						outClass = 'pt-page-scaleDown';
						inClass = 'pt-page-moveFromLeft pt-page-ontop';
						break;
					case 19:
						outClass = 'pt-page-scaleDown';
						inClass = 'pt-page-moveFromBottom pt-page-ontop';
						break;
					case 20:
						outClass = 'pt-page-scaleDown';
						inClass = 'pt-page-moveFromTop pt-page-ontop';
						break;
					case 21:
						outClass = 'pt-page-scaleDown';
						inClass = 'pt-page-scaleUpDown pt-page-delay300';
						break;
					case 22:
						outClass = 'pt-page-scaleDownUp';
						inClass = 'pt-page-scaleUp pt-page-delay300';
						break;
					case 23:
						outClass = 'pt-page-moveToLeft pt-page-ontop';
						inClass = 'pt-page-scaleUp';
						break;
					case 24:
						outClass = 'pt-page-moveToRight pt-page-ontop';
						inClass = 'pt-page-scaleUp';
						break;
					case 25:
						outClass = 'pt-page-moveToTop pt-page-ontop';
						inClass = 'pt-page-scaleUp';
						break;
					case 26:
						outClass = 'pt-page-moveToBottom pt-page-ontop';
						inClass = 'pt-page-scaleUp';
						break;
					case 27:
						outClass = 'pt-page-scaleDownCenter';
						inClass = 'pt-page-scaleUpCenter pt-page-delay400';
						break;
					case 28:
						outClass = 'pt-page-rotateRightSideFirst';
						inClass = 'pt-page-moveFromRight pt-page-delay200 pt-page-ontop';
						break;
					case 29:
						outClass = 'pt-page-rotateLeftSideFirst';
						inClass = 'pt-page-moveFromLeft pt-page-delay200 pt-page-ontop';
						break;
					case 30:
						outClass = 'pt-page-rotateTopSideFirst';
						inClass = 'pt-page-moveFromTop pt-page-delay200 pt-page-ontop';
						break;
					case 31:
						outClass = 'pt-page-rotateBottomSideFirst';
						inClass = 'pt-page-moveFromBottom pt-page-delay200 pt-page-ontop';
						break;
					case 32:
						outClass = 'pt-page-flipOutRight';
						inClass = 'pt-page-flipInLeft pt-page-delay500';
						break;
					case 33:
						outClass = 'pt-page-flipOutLeft';
						inClass = 'pt-page-flipInRight pt-page-delay500';
						break;
					case 34:
						outClass = 'pt-page-flipOutTop';
						inClass = 'pt-page-flipInBottom pt-page-delay500';
						break;
					case 35:
						outClass = 'pt-page-flipOutBottom';
						inClass = 'pt-page-flipInTop pt-page-delay500';
						break;
					case 36:
						outClass = 'pt-page-rotateFall pt-page-ontop';
						inClass = 'pt-page-scaleUp';
						break;
					case 37:
						outClass = 'pt-page-rotateOutNewspaper';
						inClass = 'pt-page-rotateInNewspaper pt-page-delay500';
						break;
					case 38:
						outClass = 'pt-page-rotatePushLeft';
						inClass = 'pt-page-moveFromRight';
						break;
					case 39:
						outClass = 'pt-page-rotatePushRight';
						inClass = 'pt-page-moveFromLeft';
						break;
					case 40:
						outClass = 'pt-page-rotatePushTop';
						inClass = 'pt-page-moveFromBottom';
						break;
					case 41:
						outClass = 'pt-page-rotatePushBottom';
						inClass = 'pt-page-moveFromTop';
						break;
					case 42:
						outClass = 'pt-page-rotatePushLeft';
						inClass = 'pt-page-rotatePullRight pt-page-delay180';
						break;
					case 43:
						outClass = 'pt-page-rotatePushRight';
						inClass = 'pt-page-rotatePullLeft pt-page-delay180';
						break;
					case 44:
						outClass = 'pt-page-rotatePushTop';
						inClass = 'pt-page-rotatePullBottom pt-page-delay180';
						break;
					case 45:
						outClass = 'pt-page-rotatePushBottom';
						inClass = 'pt-page-rotatePullTop pt-page-delay180';
						break;
					case 46:
						outClass = 'pt-page-rotateFoldLeft';
						inClass = 'pt-page-moveFromRightFade';
						break;
					case 47:
						outClass = 'pt-page-rotateFoldRight';
						inClass = 'pt-page-moveFromLeftFade';
						break;
					case 48:
						outClass = 'pt-page-rotateFoldTop';
						inClass = 'pt-page-moveFromBottomFade';
						break;
					case 49:
						outClass = 'pt-page-rotateFoldBottom';
						inClass = 'pt-page-moveFromTopFade';
						break;
					case 50:
						outClass = 'pt-page-moveToRightFade';
						inClass = 'pt-page-rotateUnfoldLeft';
						break;
					case 51:
						outClass = 'pt-page-moveToLeftFade';
						inClass = 'pt-page-rotateUnfoldRight';
						break;
					case 52:
						outClass = 'pt-page-moveToBottomFade';
						inClass = 'pt-page-rotateUnfoldTop';
						break;
					case 53:
						outClass = 'pt-page-moveToTopFade';
						inClass = 'pt-page-rotateUnfoldBottom';
						break;
					case 54:
						outClass = 'pt-page-rotateRoomLeftOut pt-page-ontop';
						inClass = 'pt-page-rotateRoomLeftIn';
						break;
					case 55:
						outClass = 'pt-page-rotateRoomRightOut pt-page-ontop';
						inClass = 'pt-page-rotateRoomRightIn';
						break;
					case 56:
						outClass = 'pt-page-rotateRoomTopOut pt-page-ontop';
						inClass = 'pt-page-rotateRoomTopIn';
						break;
					case 57:
						outClass = 'pt-page-rotateRoomBottomOut pt-page-ontop';
						inClass = 'pt-page-rotateRoomBottomIn';
						break;
					case 58:
						outClass = 'pt-page-rotateCubeLeftOut pt-page-ontop';
						inClass = 'pt-page-rotateCubeLeftIn';
						break;
					case 59:
						outClass = 'pt-page-rotateCubeRightOut pt-page-ontop';
						inClass = 'pt-page-rotateCubeRightIn';
						break;
					case 60:
						outClass = 'pt-page-rotateCubeTopOut pt-page-ontop';
						inClass = 'pt-page-rotateCubeTopIn';
						break;
					case 61:
						outClass = 'pt-page-rotateCubeBottomOut pt-page-ontop';
						inClass = 'pt-page-rotateCubeBottomIn';
						break;
					case 62:
						outClass = 'pt-page-rotateCarouselLeftOut pt-page-ontop';
						inClass = 'pt-page-rotateCarouselLeftIn';
						break;
					case 63:
						outClass = 'pt-page-rotateCarouselRightOut pt-page-ontop';
						inClass = 'pt-page-rotateCarouselRightIn';
						break;
					case 64:
						outClass = 'pt-page-rotateCarouselTopOut pt-page-ontop';
						inClass = 'pt-page-rotateCarouselTopIn';
						break;
					case 65:
						outClass = 'pt-page-rotateCarouselBottomOut pt-page-ontop';
						inClass = 'pt-page-rotateCarouselBottomIn';
						break;
					case 66:
						outClass = 'pt-page-rotateSidesOut';
						inClass = 'pt-page-rotateSidesIn pt-page-delay200';
						break;
					case 67:
						outClass = 'pt-page-rotateSlideOut';
						inClass = 'pt-page-rotateSlideIn';
						break;
					default:
						outClass = 'pt-page-rotateSlideOut';
						inClass = 'pt-page-rotateSlideIn';
						break;		

				}

				return {
					inClass: inClass,
					outClass: outClass
				};
			};


			var resizeSlider = function() {

				if(angular.isDefined(scope.intNavigationControl) && angular.isDefined(scope.intNavigationControl.onSliderResize)) {
						scope.intNavigationControl.onSliderResize(navSlides, currentSlide, element);
					}	
			};

			var resetFlags = function() {

				if(angular.isDefined(scope.intNavigationControl.onAfter)) {
					scope.intNavigationControl.onAfter(navSlides, currentSlide, element, previousSlide);
				}

				isAnimating = false;

			};

			var shakePage = function() {
				if(transitions && shakeOnEnd) {
					element.addClass('shake-horizontal');
					setTimeout(function(){
						element.removeClass('shake-horizontal');
					}, 600);
				};
			};

			var initializeFlipper = function() {
				return $timeout(function() {

					ngWindow = angular.element($window);
					noOfSlides = element.children().length;
					navSlides = element.children();

					classPrefix = (angular.isDefined(scope.classPrefix)) ? scope.classPrefix : '';

					angular.forEach(classList, function(value, key) {
						classList[key] = classPrefixer(classList[key]);
					});

					currentSlide = (angular.isDefined(scope.startAt)) ? scope.startAt : 0;


					angular.element(element.children()).addClass(classList.pageClass);

					navSlides.eq(currentSlide).addClass(classList.activeClass);

					navSlides.on(animEndEventName, function(data){
						if(angular.element(data.target).hasClass(classList.pageClass)) {
							var animationClass = getAnimationClass(animationIndex);
							navSlides.removeClass(animationClass.outClass);
							navSlides.removeClass(animationClass.inClass);
							resetFlags();
						}
					});

					navSlides.css({
						'display': 'none'
					});

					navSlides.eq(currentSlide).css({
						'display': 'block'
					});

					if(angular.isDefined(scope.navigationControl)) {
						scope.intNavigationControl = scope.navigationControl;

						scope.intNavigationControl.next = function() {
							scope.moveSlider((currentSlide + 1));
						};

						scope.intNavigationControl.previous = function() {
							scope.moveSlider((currentSlide - 1));
						};

						scope.intNavigationControl.moveTo = function(index) {
							scope.moveSlider(index);
						};

						scope.intNavigationControl.resize = function() {
							resizeSlider();
						};

						scope.intNavigationControl.isAnimating = function() {
							return isAnimating;
						};


					}

					//Called when the navigation slider is initialized
					if(angular.isDefined(scope.intNavigationControl.onStart)) {
						scope.intNavigationControl.onStart(navSlides, currentSlide, element);
					}


				});
			};


			scope.moveSlider = function(animatingTo) {

				if(transitions && isAnimating) {
					return;
				}

				if(animatingTo === currentSlide) {
					return;
				}

				if(currentSlide == noOfSlides -1 && (animatingTo >= noOfSlides -1)) {
					shakePage();
					return;
				}
				else if(currentSlide == 0 && (animatingTo <= 0)) {
					shakePage();
					return;
				}

				previousSlide = currentSlide;
				currentSlide = animatingTo;


				navSlides.removeClass(classList.activeClass);

				if(transitions) {

					isAnimating = true;
					if(angular.isDefined(scope.intNavigationControl.onBefore)) {
						scope.intNavigationControl.onBefore(navSlides, previousSlide, element, animatingTo);
					}

					if(previousSlide < animatingTo) {
						animationIndex = 13;
					}
					else {
						animationIndex = 14;
					}

					var animationClass = getAnimationClass(animationIndex);

					navSlides.eq(previousSlide).addClass(animationClass.outClass);
					navSlides.eq(currentSlide).addClass(animationClass.inClass);

					navSlides.css({
						'display': 'none'
					});

					navSlides.eq(currentSlide).css({
						'display': 'block'
					});

					navSlides.eq(currentSlide).addClass(classList.activeClass);

				}

			};

			if (scope.initOnLoad) {
				isInitialized = false;
				return scope.$watch('flipperData', function (newVal, oldVal) {
					if (newVal != null && !isInitialized) {
						initializeFlipper();
						return isInitialized = true;
					}
				});
			} 
			else {
				return initializeFlipper();
			}

		}
	};
}]);