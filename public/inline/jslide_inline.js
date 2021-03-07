function jslide(id){

	var wrap;

	if(typeof id=='undefined')
		return null;

	if(typeof id=='string'){
		wrap = $('#'+id);
		
		if(!wrap.length)
			wrap = $('#jslide_'+id);
		
		if(!wrap.length)
			wrap = $('<div style="display:none;position:absolute;top:0;left:0;width:100%;height:100%;" id="jslide_overlay_'+id+'"></div>').appendTo('body');
	
	}else if(typeof id=='object')
		wrap = id;
	
	if(!wrap.data('jslide'))
		wrap.data('jslide',new jslide_obj(wrap));

	return wrap.data('jslide');

	function jslide_obj(wrap){

		obj = this;

		var settings,
		target,
		type = wrap.attr('id').substring(0,15)=='jslide_overlay_' ? 'overlay':'page',
		status = {},
		timeout,
		reference = wrap.parent(),

		// main divs
		caption_wrap, old_caption_wrap, control_wrap, buttons, click_captures,

		// shortcuts
		newDiv = '<div style="position:absolute;width:100%;height:100%;"></div>';

		function percentConvert(input, reference){
			if(input && typeof input=='string' && input.indexOf('%')>0) // input is set and is a string containing '%'
				return 0.01*parseInt(input)*reference; // calculate that percent of the reference value
			else
				return parseFloat(input);
		}

		function atLeast(value, minimum){
			if(value<minimum)
				return minimum;
			else
				return value;
		}

		function animateSettings(opacity, left){
			
			var result = {}

			if(settings.slide!==false)
				result.left = left;
			if(settings.fade!==false)
				result.opacity = opacity;

			return result;
		}

		function refresh(){
			settings.images = [];
			var count=0;
			wrap.data('jslide_links').each(function(){
				settings.images[count] = [$(this).attr('href'),$(this).attr('title')];
				$(this).data('image',count);
				count++;
			})
		}

		obj.setup = function(params) {
			
			settings = params;

			wrap.empty();

			$(document).keydown(function(e){

			    if (e.keyCode == 37 && settings.arrows!==false) { 
					obj.moveImage(-1);
			    	return false;
			    }else if (e.keyCode == 39 && settings.arrows!==false) { 
					obj.moveImage(1);
			    	return false;
			    }else if (e.keyCode == 27 && settings.esc!==false) {
					obj.close();
			    	return false;
			    }else if (e.keyCode == 32 && spaceControl==1 && total>1) { 
					toggle();
			    	return false;
			    }
			});

			if(type=='overlay'){
				overlay_back = $('<div style="position:absolute;width:100%;height:100%;background-color:black;"></div>').appendTo(wrap);
				overlay_back.css('opacity',0.9);

				wrap.data('jslide_links',$('a[rel="'+id+'"]'));

				refresh();

				wrap.data('jslide_links').off('click').on('click',function(){ 
					obj.changeImage($(this));
					return false;
				});
			}


			target = $('<div style="overflow:hidden;position:relative;display:inline-block;width:100%;"></div>').appendTo(wrap);
			//target.attr('id','target'); // for testing

			//// VALIDATE USER INPUT / SET DEFAULTS

			// Main settings
			if((settings.height = percentConvert(settings.height,reference.height()))>0) ; else settings.height = null;

			if((settings.width = percentConvert(settings.width,reference.width()))>0) ; else settings.width = reference.width();

			if(settings.speed>0) ; else settings.speed = 5000; // cannot be 0

			if(settings.transition>=0) ; else settings.transition = 400; // can be 0

			if(settings.transition>settings.speed)
				settings.transition = settings.speed

			// Caption settings
			if(!settings.captions)
				settings.captions = {};

			if((settings.captions.padding=parseInt(settings.captions.padding))>=0) ; else settings.captions.padding = 8;

			if((settings.captions.width = percentConvert(settings.captions.width,settings.width))>0) ; else settings.captions.width = settings.width;

			if((settings.captions.shrink_width = percentConvert(settings.captions.shrink_width,settings.width))>=0) ; else settings.captions.shrink_width = settings.captions.width;

			settings.captions.width = atLeast(settings.captions.width, 2*settings.captions.padding);
			settings.captions.shrink_width = atLeast(settings.captions.shrink_width, 2*settings.captions.padding);

			settings.captions.opacity = percentConvert(settings.captions.opacity,1);
			if(settings.captions.opacity>=0 && settings.captions.opacity<=1) ; else settings.captions.opacity = 0.5;

			if((settings.captions.rounded=parseInt(settings.captions.rounded))>=0) ; else settings.captions.rounded = 0;
			
			if(!settings.captions.color) settings.captions.color = 'white';
			if(!settings.captions.background) settings.captions.background = 'black';
			if(!settings.captions.font) settings.captions.font = 'Arial, Helvetica, sans-serif';
			if(settings.captions.text_align!=='left' && settings.captions.text_align!=='right') settings.captions.text_align = 'center';

			if((settings.captions.size=parseInt(settings.captions.size))>0)
				settings.captions.size += 'pt';
			else
				settings.captions.size = 'medium';

			// Control settings
			if(!settings.controls)
				settings.controls = {};

			if((settings.controls.width=parseInt(settings.controls.width))>0) ; else settings.controls.width = 46;
			if((settings.controls.height=parseInt(settings.controls.height))>0) ; else settings.controls.height = 100;
			if((settings.controls.padding=parseInt(settings.controls.padding))>=0) ; else settings.controls.padding = 15;

			if((settings.controls.rounded=parseInt(settings.controls.rounded))>=0) ; else settings.controls.rounded = 0;

			settings.controls.opacity = percentConvert(settings.controls.opacity,1);
			if(settings.controls.opacity>=0 && settings.controls.opacity<=1) ; else settings.controls.opacity = 0.5;

			if(!settings.controls.color) settings.controls.color = 'white';
			if(!settings.controls.background) settings.controls.background = 'black';

			// Click Area settings
			if(settings.click!==false){
				if((settings.click = percentConvert(settings.click, settings.width))>=0) ; 
				else{ 
					settings.click = 150;
					if(settings.click/settings.width>0.25)
						settings.click = 0.25*settings.width; // default 150, but not more than 25%
				}
			}
			

			//// ADJUST SETTINGS TO ACCOUNT FOR PADDING, TRANSITION TIME, ETC.

			// Main
			settings.speed -= settings.transition; // adjust speed to account for transition time

			// Captions
			settings.captions.width -= 2*settings.captions.padding; // maybe not do this here because of dynamic caption widths?
			settings.captions.shrink_width -= 2*settings.captions.padding; // ????

			// Controls
			settings.controls.width = atLeast(settings.controls.width, 2*settings.controls.padding+5); // width must be at least 5px plus padding on both sides
			settings.controls.height = atLeast(settings.controls.height, 2*settings.controls.padding+10); // height must be at least 10px plus padding on both sides

			settings.controls.width -= 2*settings.controls.padding;
			settings.controls.height -= 2*settings.controls.padding;

			var size_by_width = settings.controls.width,
			size_by_height = settings.controls.height/2,

			triangle_size = size_by_width<size_by_height ? size_by_width : size_by_height, // use smaller of the two

			// position triangle at center of button
			triangle_top = settings.controls.height/2-triangle_size+settings.controls.padding,
			triangle_left = settings.controls.width/2-triangle_size/2+settings.controls.padding;


			//// CREATE MAIN DIVS
			target.css('width',settings.width);

			if(settings.height)
				target.css('height',settings.height);

			$(newDiv).appendTo(target); // image container
			caption_wrap = $(newDiv).appendTo(target);
			control_wrap = $(newDiv).appendTo(target);
			click_captures = $('<div></div><div></div>').appendTo(control_wrap);

			if(settings.background)
		    	target.css({'background-color':settings.background});
			
			//// SET UP CONTROLS
			
			if(settings.controls.disabled!==true){

				// will be faded/slid in and out as controls become un/available
				buttons_wrap = $(newDiv+newDiv).appendTo(control_wrap).attr('rel','buttons_wrap');
				// this variable will be attached to two separate divs...
				
				
				if(settings.fade!==false)
					buttons_wrap.css('opacity',0); // ...so things like this apply to both divs

				// the background div, and the one with the onclick event
				buttons = $(newDiv).appendTo(buttons_wrap).attr('rel','buttons');
				

				// the div that makes the triangle
				$(newDiv).appendTo(buttons).attr('rel','triangle');

	 
				// configure both left and right buttons
				buttons_wrap
				.css({ 'width':settings.controls.width, 'height':settings.controls.height });

				if(settings.slide!==false){
					buttons_wrap.first().css('left',-(settings.controls.width+2*settings.controls.padding));
					buttons_wrap.last().css('left',settings.width/*-settings.controls.width-2*settings.controls.padding*/);
				}else{
					buttons_wrap.first().css('left',0);
					buttons_wrap.last().css('left',settings.width-settings.controls.width-2*settings.controls.padding);
				}

				buttons
				.css({	
					'cursor': 'pointer',
					'background-color':settings.controls.background,
					'opacity':settings.controls.opacity,
					'padding':settings.controls.padding
				})
				.on('mouseover',function(){ $(this).stop().animate({'opacity':1},60); })
				.on('mouseout',function(){ $(this).stop().animate({'opacity':settings.controls.opacity},60); })
				.children().css({
					'position':'absolute',
					'top':triangle_top,
					'left':triangle_left,
					'border-style':'solid',
					'border-width':triangle_size,
					'width':0,
					'height':0
				})

				// configure left button
				buttons.first()
				.css({
					'border-radius':'0 '+settings.controls.rounded+'px '+settings.controls.rounded+'px 0'
				})
				.children().css({
					'border-color':'transparent '+settings.controls.color+' transparent transparent',
					'margin-left':'-'+triangle_size+'px'
				});

				// configure right button
				buttons.last()
				.css({
					'border-radius': settings.controls.rounded+'px 0 0 '+settings.controls.rounded+'px'
				})
				.children().css({
					'border-color':'transparent transparent transparent '+settings.controls.color,
					'margin-right':'-'+triangle_size+'px'
				});

			}
			

			//// CREATE CLICK AREAS FOR MOVING IMAGES IN EITHER DIRECTION

			if(settings.click!==false){

			    click_captures
			    .off()
			    .css({
			    	'position':'absolute',
			    	'top':0,
			    	'height': '100%'
			    })

			    click_captures.first().css({
			    	'left':0,
			    	'width': settings.click
			    })
				.on('mouseover',function(){ buttons.first().stop().animate({'opacity':1},60); })
				.on('mouseout',function(){ buttons.first().stop().animate({'opacity':settings.controls.opacity},60); });
			    
			    click_captures.last().css({
			    	'left': settings.click,
			    	'width': settings.width-settings.click
			    })
			    .on('mouseover',function(){ buttons.last().stop().animate({'opacity':1},60); })
				.on('mouseout',function(){ buttons.last().stop().animate({'opacity':settings.controls.opacity},60); });
				
		    }

		    if(type!='overlay' && settings.images && settings.images[0])
				obj.changeImage(0); // show first image

		} // function setup()

		obj.moveImage = function(direction){

			var next = (direction===-1) ? status.image-1: status.image+1;	
			obj.changeImage(next);

		}

		obj.changeImage = function(which, easing){
			
			if(type=='overlay'){
				refresh();
				if(typeof which!='number')
					which = which.data('image');
				if(wrap.is(':hidden')){
					$('body').css('overflow','hidden');
					target.css('top',($(window).height()-target.height())/2);
					wrap.fadeIn(settings.transition);
				}
			}

			// determine actual image
			if(!settings.images[which]){
				while(which<0)
					which+=settings.images.length;
				
				while(which>=settings.images.length)
					which-=settings.images.length;
			}

			if(status.image!=which){ // don't do anything if the target image is already the current image

				// determine which direction to move in
				var direction = (status.image>which || typeof status.image=='undefined')
				? ( status.image-which <= which+settings.images.length-status.image ? -1 : 1 ) // if equal, move left
				: ( which-status.image <= status.image+settings.images.length-which ? 1 : -1 ); // if equal, move right

				doChange(which, direction, easing);
			}
		}

		function doChange(which, direction, easing){
			
			if(status.changing){
				target.add(target.find('*')).stop(true,true);
				easing = 'easeOutCubic';
			}

			status.changing = true;
			
			var image = settings.images[which];
			
			var old_container = target.children('div').first();
			var container = $(newDiv).insertAfter(old_container); // create a div for the next image
			
			if(settings.fade!==false)
				container.css('opacity',0); // so the first image can fade in
			
			loadImage(container, image, old_container, direction, easing);

			status.image = which;
			clearTimeout(obj.timeout); // cancel any scheduled picture change (it will be rescheduled by loadImage();
			
		}

		function loadImage(container, properties, old_container, direction, easing){

			var src, caption, img_width, img_height;

			status.slide = settings.slide;

			//status.slide = false;


			//status.slide = !direction ? false : status.slide!==false;

			//status.transition = settings.transition; // keep this in case the transition time should be different within one setup() call. otherwise, just change all settings.transition to settings.transition and remove this line

			if(settings.fade===false && status.slide===false) // the user wants no transitions, so don't bother them with transition time
				settings.transition = 0;

			if(!easing)
				easing = 'easeInOutCubic';

			if(typeof properties=='object'){
				src = properties[0];
				if(properties[1])
					caption = properties[1];
			}else
				src = properties;

			$("<img />").attr("src", src) // load image into memory
		    .load(function() {

		    	//// ENABLE/DISABLE LEFT/RIGHT CONTROLS
		    	if(settings.loop===false || settings.images.length==1){ // if there's only one image, disable controls
					status.left = (status.image!=0); // it's the first image--disable left control
					status.right = (status.image!=settings.images.length-1); // it's the last image--disable right control
				}else{ // both left and right controls enabled
					status.left=1;
					status.right=1;
				}

				//// CALCULATE IMAGE DIMENSIONS
		    	img_width = this.width;
		        img_height = this.height;

				var div_height = settings.height ? settings.height : img_height,
				
				// compare proportions of image vs. container
				ratio = (img_width/img_height)>(settings.width/div_height) ? 1 : 0, // 1 = image too wide; 0 = image too tall

				// give the container the same proportions as the image (if this modified height is applied to the container)
				modified_height = Math.floor(settings.width*(img_height/img_width)), 

				background_align,
				background_size = 'auto';

				// Calculate background_size
				if(settings.scale=='fill'){

		    		if(!settings.height){ // height not set--stretch image to fit width of div and then set height of div to that of image
						background_align = 'width';
						div_height = modified_height;
		    		}else if(!ratio) // not wide enough--stretch image to fit width of div
		    			background_align = 'width';
		    		else // not tall enough--stretch image to fit height of div
		    			background_align = 'height';
		    	
		    	}else if(settings.scale=='fit'){

		    		if(!settings.height && ratio){ // height not set AND image is too wide if div_height is same as img_height--stretch image to fit width of div and then set height of div to that of image
						background_align = 'width';
						div_height = modified_height;
					}else if(ratio) // too wide--shrink image to fit width of div
		    			background_align = 'width';
		    		else // too tall--shrink image to fit height of div
		    			background_align = 'height';
		    	
		    	}else{ // never enlarge image

		    		if(ratio && img_width>settings.width){ // image is too wide if div_height is same as img_height AND image is already wider than div
						background_align = 'width'; // shrink div to fit width of div
						if(!settings.height)
							div_height = modified_height; // if height is not set, shrink div to match height of shrunk image
		    		}else if(settings.height && !ratio && img_height>div_height) // height IS set AND image is too tall proportionally AND image is already taller than div
		    			background_align = 'height'; // shrink image to fit height of div

				}

				if(background_align=='width')
					background_size = settings.width+'px auto';
				else if(background_align=='height')
					background_size = 'auto '+div_height+'px'


				//// GET EVERYTHING READY FOR THE TRANSITION
				
				// start with default cursor and no onclick events
				buttons.css('cursor','default').off('click');
				click_captures.css('cursor','default').off('click');

				// show/hide controls, and add add pointer cursor and onclick events, as necessary
				if(status.left){
					buttons_wrap.first().animate(animateSettings(1,0), settings.transition, easing);
					buttons.first().css('cursor','pointer').on('click',function(){ obj.moveImage(-1); });
					click_captures.first().css('cursor','pointer').on('click',function(){ obj.moveImage(-1); });
				}else{
					buttons_wrap.first().animate(animateSettings(0,-(settings.controls.width+2*settings.controls.padding)), settings.transition, easing);
				}

				if(status.right){
					buttons_wrap.last().animate(animateSettings(1,settings.width-settings.controls.width-2*settings.controls.padding), settings.transition, easing);
					buttons.last().css('cursor','pointer').on('click',function(){ obj.moveImage(1); });
					click_captures.last().css('cursor','pointer').on('click',function(){ obj.moveImage(1); });
				}else{
					buttons_wrap.last().animate(animateSettings(0,settings.width), settings.transition, easing);
				}
		

				// smoothly change height of container to fit image
				
				animate_settings = {height: div_height};

				if(type=='overlay'){
					animate_settings.top = ($(window).height()-div_height)/2; 
					animate_settings.left = ($(window).width()-settings.width)/2; 
				}
					
				target.animate(animate_settings, settings.transition, easing);
				
				// move controls depending on height of container
				control_wrap.animate({
					'padding-top': ((div_height-buttons.height())/2 - settings.controls.padding)
				}, settings.transition, easing);

				// apply the background image to the container
		    	container.css({
		    		'background-size':background_size,
		    		'background-repeat':'no-repeat',
		    		'background-position':'center center',
		    		'background-image':'url('+src+')' 
		    	});

		    	// move the container out of frame so it can slide in
		    	if(status.slide!==false)
		    		container.css('left', direction*settings.width);


		    	//// SET UP CAPTION

				if(settings.captions.disabled!==true){
					
					old_caption_wrap = caption_wrap;
					caption_wrap = $(newDiv).insertAfter(caption_wrap);
					
					if(settings.fade!==false) 
						caption_wrap.css('opacity',0); // hide if going to be faded in

					if(caption){ // the current image has a caption
					
						var caption_back = $('<div style="position:absolute;"></div>').appendTo(caption_wrap);
						var caption_text = $('<div style="position:absolute;">'+caption+'</div>').appendTo(caption_wrap);
						var caption_elements = caption_back.add(caption_text);

						var caption_width = settings.captions.width;

						caption_text.css({
							'color': settings.captions.color,
							'font-family': settings.captions.font,
							'padding': settings.captions.padding,
							'text-align': settings.captions.text_align,
							'font-size': settings.captions.size
						});
						
						// shrink caption box to fit text if requested
						if(settings.captions.shrink_width>=0){
							var test_width = caption_text.width();
							
							if(test_width<settings.captions.shrink_width)
								caption_width = settings.captions.shrink_width; // give caption minimum width of shrink_width
							else if(test_width<settings.captions.width)
								caption_width = test_width; // shrink caption to fit text
						}

						// set width of caption elements
						caption_elements.css('width',caption_width);

						// set up background
						caption_back.css({
							'opacity': settings.captions.opacity,
							'padding': settings.captions.padding,
							'height': caption_text.height(),
							'background-color': settings.captions.background=='none' ? '':settings.captions.background
						});

						// align caption box horizontally
						if(settings.captions.align=='left')
							caption_elements.css('left',0);
						else if(settings.captions.align=='right')
							caption_elements.css('right',0);
						else
							caption_elements.css('left',(settings.width-caption_width-2*settings.captions.padding)/2);

						// align caption box vertically
						if(settings.captions.position=='top')
							caption_back.add(caption_text).css('top',0);
						else
							caption_back.add(caption_text).css('bottom',0);
						/*.each(function(){
								$(this).css('top',$(this).position().top);
							})
						*/

						// add rounded corner(s)
						if(caption_width+2*settings.captions.padding<settings.width){ // if caption box is not full width
							if(settings.captions.position=='top')
								caption_back.css('border-radius','0 0 '+(settings.captions.align=='right' ? 0:settings.captions.rounded)+'px '+(settings.captions.align=='left' ? 0:settings.captions.rounded)+'px');
							else
								caption_back.css('border-radius',(settings.captions.align=='left' ? 0:settings.captions.rounded)+'px '+(settings.captions.align=='right' ? 0:settings.captions.rounded)+'px 0 0');
						}

						// get ready to slide the caption box in
						if(status.slide!==false)
							caption_wrap.css('left',caption_wrap.position().left+ direction*settings.width);

						// transition in new caption		
						caption_wrap.animate(animateSettings(1,caption_wrap.position().left-(direction*settings.width)), settings.transition, easing);
					}

					// transition out old caption
					old_caption_wrap.animate(animateSettings(0,old_caption_wrap.position().left-(direction*settings.width)),settings.transition, easing, function(){ old_caption_wrap.remove(); });	
				}


				// transition in new slide
		    	container.animate(animateSettings(1,0),settings.transition, easing, function(){
			    	
			    	if(settings.autoplay==true)
						obj.timeout = setTimeout(function(){ obj.moveImage(); },settings.speed);

					status.changing = false;
					direction = null;
		    	});
		    	

		    	// transition out old slide
		    	old_container.animate(animateSettings(0,-(direction*settings.width)),settings.transition, easing, function(){
		    		old_container.remove();
		    	});

			});

		} // function loadImage()

		obj.close = function(){
			if(type=='overlay'){
				wrap.fadeOut(settings.transition);
				
			}
		}

	} // function jslide_slider_obj()

}