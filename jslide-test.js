// -----------------------------------------------------------------------------------
//
//		jSlide 0.9.1	http://jslide.com
//
//		Author: Cooper Labinger
//
//		Release Date: 2/28/2012
//
//		Licensed under the Creative Commons Attribution 3.0 License - http://creativecommons.org/licenses/by/3.0/
//		  	- Free for use in both personal and commercial projects
//				- Attribution requires leaving author name, author link, and the license info intact.
//
// -----------------------------------------------------------------------------------

(function () {

// ----------------- USER PREFERENCES START -----------------------

// On/Off Settings  (1 = on, 0 = off)
var clickToChange = 1; // Click slideshow image to move to next slide
var arrowsControl = 1; //Arrow keys to move between slides
var escControl = 1; //ESC to exit slideshow
var spaceControl = 1; //Spacebar to Play/Pause slideshow
var scrollToImage = 1; //Scroll to thumbnail of the last viewed slide when exiting slides
var slideShow = 1; //Slideshow enabled (automatic, timed moving between images, with Play/Pause Button)
var animateProgress = 1; //show animated progress bar during slideshow (next to Play/Pause button)
var showCaptions = 1; //show captions above slides (set to 2 for below slides)
var changeAddress = 1; //Change the URL when moving between pictures (this will allow the back button to be used to move backwards through pictures and in and out of the slide view, and give each image an address with which users can link directly to an image)
var stretchImage = 1; //Stretch the image to fill the screen even if smaller
var clickToClose = 0; //Click blank space on slide view to close
var clickToCloseSingle = 1; //Click directly on a single image (as well as on the last image of a set) to close slide view
var loopAround = 0; //Loop around while viewing image sets and during slideshows
var autoPlay = 1; //Start playing when slide show button is pressed

// Speed Settings
var animateSpeed = 0.4; //Image fade-in speed, in seconds. Set to 0 for no animation
var slideSpeed = 7; // duration of slides, in seconds.
var initialPreload = 3; //Number of Images to preload when the page is loaded (before entering slideshow). Can be set to 0.
var slidePreload = 5; //Number of Images to preload when slides are open (preloaded in the last direction of travel)
var backPreload = 2; //Number of Images to preload when slides are open in the other direction

//Style Settings
var font = "'Lucida Grande','Lucida Sans Unicode',Verdana,sans-serif"; //font of text in slide view
var fontWeight = 'normal'; //Boldness of text in slide view
var controlSize = '10pt'; //Size of text on control bar
var controlColor = '#888888'; //Color of text on control bar
var captionSize = '10pt'; //Size of text in caption
var captionColor = '#888888'; //Color of text in caption
var backgroundColor = 'black'; //Background color of slideshow
var imgBorder = 'padding:5px;border:1px solid #444444;'; //Set padding and border of slide image
var barWidth = '8px'; //Thickness (height) of animated progress bar
var barLength = '60px'; //Length of animated progress bar
var barColor = '#404040'; //Color of animated progress bar
var loadingColor = '#444444'; //Color of the "..." loading dots
var loadingSize = '60pt'; //Size of the "..." loading dots
var buttonColor = 'black'; //Background color of buttons (Play/Pause/Prev/Next, etc.)
var buttonBorderColor = '#888888'; //Color of button borders
var buttonTextColor = '#888888'; //Color of button text
var buttonHoverColor = 'black'; //Color of button background on hover
var buttonHoverBorderColor = '#cccccc'; //Color of button borders on hover
var buttonHoverTextColor = '#cccccc'; //Color of button text on hover
var disabledColor = '#444444'; //Color of button text when a button is disabled
var disabledBorder = '#444444'; //Color of button border when a button is disabled

// Text Settings
var closeText = '&laquo; Back to Pictures'; //Text of button that closes slides and goes back to the web page
var playText = 'Play'; // Text of Play Button
var replayText = 'Play Again'; // Text of Replay Button
var pauseText = 'Pause'; //Text of Pause Button
var prevText = '&laquo; Previous'; //Text of button that moves to previous slide
var nextText = 'Next &raquo;'; //Text of button that moves to next slide
var errorMessage = 'The image cannot be loaded.'; //Text that appears if an error occurs while downloading an image
var progressLabel = 'of' //Text that appears in "2 of 4" above images in slide view

// HTML Settings
var captionSource = ['caption','title']; //list of link attributes to check for caption. Will use the first one that is not empty. You might use the "caption" attribute if you want to use HTML tags for the slides but not have them show up in the "title" tooltips when you hover over the thumbnails
var relAttr = 'rel' //The HTML attribute that identifies image links to be used in the slides e.g. <a rel="slideshow[slides]" href="large-image.jpg">
var revAttr = 'rev' //The HTML attribute that will contain the id of a div to be linked (for HTML content)
var programId = 'jslide'; //used in the `rel` attribute (or whatever is set for relAttr) to identify images to be used in the script, e.g. <a rel="jslide[someset]"><img /></a>
var classAttr = 'class'; //The HTML attribute that identifies divs to hide so that they may be opened with jSlide


// -------------------- USER PREFERENCES END ----------------------

var nameitems = ['loadingClass','preloadClass','buttonClass','loadtest','thumbview','slideview','control','backlink','toggle','bar','progress','caption','bigimgdiv','bigimg','prevbutton','nextbutton','loadingwrap'];
var Objref = {};

var scroll = $(window).scrollTop();
var keepscroll = scroll;
var total = 1;
var clickimg = 0;
var loadwidth = 120;
var status=0;
var lastobj, director, advanceBar, toggle, openSlide, closeSlide, checkhash, userHtmlBorder, userHtmlPadding, userHtmlMargin, userBodyBorder, userBodyPadding, userBodyMargin;

var buttonStyle = 'padding:5px;color:'+buttonTextColor+';border:1px solid '+buttonBorderColor+';background-color:'+buttonColor+';cursor:pointer;text-decoration:none;';

$(function(){

for(var x in nameitems){
	var targetname = nameitems[x];
	while($('#'+targetname+', .'+targetname).size()>=1) targetname += 'a';
	Objref[nameitems[x]] = targetname;
}

var removeHash = function() { 
    if ("pushState" in history)
        history.pushState("", document.title, window.location.pathname);
    else
        window.location.hash = "";
}


$('body').append('<div id="'+Objref["loadtest"]+'" style="font-size:'+loadingSize+';margin:auto;text-align:left;cursor:default;visibility:hidden;position:absolute;top:-9999px;left:-9999px;">...</div>');
loadwidth = $('#'+Objref["loadtest"]).width();
$('#'+Objref["loadtest"]).remove();

var tl=setInterval(function(){
	if($('.'+Objref["loadingClass"])){
		$('.'+Objref["loadingClass"]).css('width',loadwidth);
		var content = $('.'+Objref["loadingClass"]).html();
		var length = content ? content.length : 0;
		if(length<3) $('.'+Objref["loadingClass"]).html(content+'.');
		else $('.'+Objref["loadingClass"]).html('');
	};
}, 200);

var test = window.location.hash; if(test=='' || test=='#'){
	$('a['+relAttr+']').slice(0, initialPreload).each(function(){
		if($(this).attr('href') && $(this).attr('href')!="#")
		$('body').append('<div class="'+Objref["preloadClass"]+'" '+relAttr+'="'+$(this).attr(relAttr)+'" num="'+$('a[href]['+relAttr+'="'+$(this).attr(relAttr)+'"]').index(this)+'" style="width:1px;height:1px;position:absolute;top:-9999px;left:-9999px;background:url(\''+$(this).attr('href').replace("'","\'")+'\');">');
	});
};

$(window).scroll(function(){
	scroll = $(window).scrollTop();
});

$('body').wrapInner('<div id="'+Objref["thumbview"]+'" />');
$('body').append('<div id="'+Objref["slideview"]+'" style="display:none;background:'+backgroundColor+';margin:0;position:fixed;width:100%;height:100%;padding:10px;font-weight:'+fontWeight+';font-family:'+font+';"><div id="'+Objref["control"]+'" style="font-size:'+controlSize+';padding:8px 5px 15px 5px;overflow:hidden;color:'+controlColor+';"><a class="'+Objref["buttonClass"]+'" id="'+Objref["backlink"]+'" style="position:relative;z-index:4;'+buttonStyle+'">'+closeText+'</a>'+(slideShow==1 ? '<a class="'+Objref["buttonClass"]+'" id="'+Objref["toggle"]+'" style="margin-left:20px;position:relative;z-index:4;'+buttonStyle+'">'+playText+'</a><div id="'+Objref["bar"]+'" style="background-color:'+barColor+';height:'+barWidth+';min-height:'+barWidth+';display:inline-block;margin-left:20px;"></div>':'')+'<div id="'+Objref["progress"]+'" style="display:block;text-align:center;float:center;position:relative;top:-16px;z-index:1;"></div></div>'+(showCaptions==1 ? '<p id="'+Objref["caption"]+'" style="margin-top:-11px;margin-bottom:18px;font-size:'+captionSize+';color:'+captionColor+';text-align:center;"></p>':'')+'<div id="'+Objref["bigimgdiv"]+'" style="padding-right:20px;text-align:center;"></div>'+(showCaptions==2 ? '<p id="'+Objref["caption"]+'" style="padding:0;font-size:'+captionSize+';color:'+captionColor+';text-align:center;"></p>':'')+'</div>');

if(clickToClose==1)
$('#'+Objref["slideview"]).off('click').on('click',function(event){ var x=event.target||event.srcElement; var tag = x.tagName.toLowerCase(); if(tag!="a" && tag!="img" && tag!="p" && x.id!=Objref["progress"] && x.id!=Objref["control"]) closeSlide(); });

$('#'+Objref["backlink"]).off('click').on('click',function(){ closeSlide(); });

$('#'+Objref["toggle"]).off('click').on('click',function(){ toggle(); });

var fitImage = function(last){
	$('#'+Objref["bigimg"]).css((stretchImage==1 ? '':'max-')+'height',$(window).height()-$('#'+Objref["control"]).height()-$('#'+Objref["caption"]).height()-(showCaptions==2 ? 90 : 70));
	
	if($('#'+Objref["bigimg"]).width() > $(window).width()-50)
		$('#'+Objref["bigimg"]).css('height','').css((stretchImage==1) ? 'width':'max-width', $(window).width()-50);
		
	$('#'+Objref["loadingwrap"]).remove();
	$('#'+Objref["bigimg"]).fadeIn(animateSpeed*1000);
	$('#'+Objref["caption"]).fadeTo(animateSpeed*800,1);
	if(clickToChange==1 && total>1 && (last!=1 || clickToCloseSingle==1)) $('#'+Objref["bigimg"]).css('cursor','pointer').off('click').on('click',function(){ openSlide(1,'click');  });
	else if(clickToCloseSingle==1) $('#'+Objref["bigimg"]).css('cursor','pointer').off('click').on('click',function(){ closeSlide();  });
	
};

advanceBar = function(){

if(animateProgress!=1) $('#'+Objref["bar"]).hide();

	$('#'+Objref["bar"]).stop().animate({'width':barLength},animateProgress*100,function(){
				$('#'+Objref["bar"]).animate({'width':0},slideSpeed*1000-animateProgress*100,'linear',function(){ openSlide(1,'auto'); });
			});
};

toggle = function(replay){

	if(slideShow!=1 || total<=1) return false;
	
	if(status==-1){
		status = 0;
		openSlide(1,'replay');
	}
	
	if(status==0){
		status=1;
		advanceBar();
		$('#'+Objref["toggle"]).html(pauseText);
	}else{
		status=0;
		$('#'+Objref["bar"]).stop().animate({'width':0},10);
		$('#'+Objref["toggle"]).html(replay==1 ? replayText : playText);
		if(replay==1) status = -1;
	}
	
};

openSlide = function(direction,cause){
	
	if($(this).is('a['+relAttr+']')){
		clickimg = 1;
		var relid = $(this).attr(relAttr);
		total = (relid==programId) ? 1 : $('a[href]['+relAttr+'="'+relid+'"]').add('a['+revAttr+']['+relAttr+'="'+relid+'"]').size();
		if($(this).attr('href') || $(this).attr(revAttr))
			var obj = $(this);
		else{
			var obj = $('a[href]['+relAttr+'="'+relid+'"]').add('a['+revAttr+']['+relAttr+'="'+relid+'"]').eq(0);
			if(autoPlay==1) toggle();
		}
		var pos = $('a[href]['+relAttr+'="'+relid+'"]').add('a['+revAttr+']['+relAttr+'="'+relid+'"]').index(obj) + 1;
	}else{
		var parse = changeAddress ? window.location.hash : director;
		var relid = programId+'['+parse.substr(1,parse.lastIndexOf('-')-1)+']';
		
		var pos = parse.substr(parse.lastIndexOf('-')+1);
		if(direction==1 || direction==-1) pos = (pos*1) + (direction*1);
		
		total = (relid==programId) ? 1 : $('a[href]['+relAttr+'="'+relid+'"]').add('a['+revAttr+']['+relAttr+'="'+relid+'"]').size();
		
		if(cause=='replay') pos = 1;
		
		if(pos>total){ 
			if(loopAround==1) pos = 1;
			else if((cause=='click') && clickToCloseSingle==1) closeSlide();
			else {
				if(cause=='auto') toggle(1);
				return false;
			}
		}else if(pos<1){ 
			if(loopAround==1) pos = total;
			else return false;
		}
		
		var obj = $('a[href]['+relAttr+'="'+relid+'"]').add('a['+revAttr+']['+relAttr+'="'+relid+'"]').eq(pos-1);
	};
	
	if(obj.size()==1){  //a thumbnail matched hash
	
	if($('#'+Objref["slideview"]).is(':visible') && lastobj && obj.length==lastobj.length && obj.length == obj.filter(lastobj).length) return false;
	
	if(status!=1){ $('#'+Objref["toggle"]).html(playText); status = 0;}
	
	$('.'+Objref["preloadClass"]).slice(0,$('.'+Objref["preloadClass"]).size()-4).remove(); //remove old preloaded images
	
	if(status==1) advanceBar();
	
	if(total>1)
	for(i=0;i<=slidePreload+backPreload;i++){
		var j=i;j-=backPreload;
		if(direction==-1) j *= -1; //preload going backwards
		var target = (pos*1)+(j*1) - 1; //-1 for 0 index
		
		if(target>=total) target -= total;
		else if(target<0) target += total;
		var newobj = $('a[href]['+relAttr+'="'+relid+'"]').add('a['+revAttr+']['+relAttr+'="'+relid+'"]').eq(target);
		
		if(newobj.attr('href') && newobj.attr('href')!="#")
		$('body').append('<div class="'+Objref["preloadClass"]+'" '+relAttr+'="'+newobj.attr(relAttr)+'" num="'+target+'" style="width:1px;height:1px;position:absolute;top:-9999px;left:-9999px;background:url(\''+newobj.attr('href').replace("'","\'")+'\');">');
	};
	
	$(document).off('keydown');
	$(document).keydown(function(e){
    if (e.keyCode == 37 && arrowsControl==1 && total>1) { 
		openSlide(-1);
       return false;
    }else if (e.keyCode == 39 && arrowsControl==1 && total>1) { 
		openSlide(1);
       return false;
    }else if (e.keyCode == 27 && escControl==1) { 
		closeSlide();
       return false;
    }else if (e.keyCode == 32 && spaceControl==1 && total>1) { 
		toggle();
       return false;
    }
	});

	$('#'+Objref["bigimg"]).remove();
	var src = obj.attr('href');
	var caption = '';
	
	for(var i=0;captionSource[i];i++){
		if(obj.attr(captionSource[i])){
			caption = obj.attr(captionSource[i]);
			break;
		}
	}
	
	var subrel = (relid+'').substr(programId.length+1);
	subrel = subrel.substr(0,subrel.length-1);
	if($('#'+Objref["slideview"]).is(':hidden')) 
		keepscroll = scroll;
	
	userHtmlBorder = $('html').css('border');
	userHtmlPadding = $('html').css('padding');
	userHtmlMargin = $('html').css('margin');
	userBodyBorder = $('body').css('border');
	userBodyPadding = $('body').css('padding');
	userBodyMargin = $('body').css('margin');
	$('html, body').css({'border':0,'padding':0,'margin':0});
	
	$('#'+Objref["thumbview"]).hide();
	$('#'+Objref["slideview"]).show();

	total = (relid==programId) ? 1 : $('a[href]['+relAttr+'="'+relid+'"]').add('a['+revAttr+']['+relAttr+'="'+relid+'"]').size();
	

	if(pos>=1 && total>1){
	$('#'+Objref["progress"]).html('<a id="'+Objref["prevbutton"]+'" class="'+Objref["buttonClass"]+'" style="margin-right:20px;'+buttonStyle+'">'+prevText+'</a>'+pos+' '+progressLabel+' '+total+'<a id="'+Objref["nextbutton"]+'" class="'+Objref["buttonClass"]+'" style="margin-left:20px;'+buttonStyle+'">'+nextText+'</a>');
	$('#'+Objref["toggle"]).show();
	}else $('#'+Objref["toggle"]).hide();
	
	$('#'+Objref["caption"]).fadeTo(0,0);
	$('#'+Objref["bigimgdiv"]).html('<div id="'+Objref["loadingwrap"]+'" style="text-align:center;"><div class="'+Objref["loadingClass"]+'" style="font-size:'+loadingSize+';color:'+loadingColor+';margin:auto;text-align:left;cursor:default;"></div></div><img id="'+Objref["bigimg"]+'" style="display:none;margin-left:auto;margin-right:auto;'+imgBorder+'" src="'+src+'" />');

	if(showCaptions>=1)
	$('#'+Objref["caption"]).html(caption);
	
	$('#'+Objref["bigimg"]).load(function(){ fitImage((pos==total) ? 1 : 0); }).error(function() { $('#'+Objref["loadingwrap"]).html(errorMessage); });
	
	$('.'+Objref["buttonClass"]+', .'+Objref["loadingClass"]).each(function(){
		var elem = this;
		elem.onselectstart = function() { return false; };
		elem.style.MozUserSelect = "none";
		elem.style.KhtmlUserSelect = "none";
		elem.unselectable = "on";
	});
	
	$('#'+Objref["prevbutton"]).off('click').on('click',function(){ if(loopAround==1 || pos>1) openSlide(-1); else return false; });
	$('#'+Objref["nextbutton"]).off('click').on('click',function(){ if(loopAround==1 || pos<total) openSlide(1); else return false; });
	
	$('.'+Objref["buttonClass"]).hover(function(){ $(this).css({'color':buttonHoverTextColor, 'background-color':buttonHoverColor, 'border-color':buttonHoverBorderColor}); },function(){ $(this).css({'color':buttonTextColor, 'background-color':buttonColor, 'border-color':buttonBorderColor}); });
	
	if(loopAround!=1 && pos==1) $('#'+Objref["prevbutton"]).off('hover').css({'cursor':'default','color':disabledColor,'border-color':disabledBorder});
	if(loopAround!=1 && pos==total) $('#'+Objref["nextbutton"]).off('hover').css({'cursor':'default','color':disabledColor,'border-color':disabledBorder});
	
	lastobj = obj;
	
	if(subrel!='' && pos > 0){
		if(changeAddress==1)
			window.location.hash = '#'+subrel+'-'+pos;
		else
			director = '#'+subrel+'-'+pos;
	}
	return false;
};
};

var closeSlide = function(){
	if(status==1) toggle();
	$(document).off('keydown');
	if(changeAddress==1)
		removeHash();
	$('#'+Objref["slideview"]).hide();
	$('html').css({'border':userHtmlBorder,'padding':userHtmlPadding,'margin':userHtmlMargin});
	$('body').css({'border':userBodyBorder,'padding':userBodyPadding,'margin':userBodyMargin});
	$('#'+Objref["bigimg"]).remove();
	$('.'+Objref["preloadClass"]).remove();
	$('#'+Objref["progress"]).html('');
	$('#'+Objref["thumbview"]).show();
	
	if(scrollToImage==1){
		if(lastobj){
			picture = lastobj.children('img');
			offset = picture.offset().top;
			height = picture.height();
			windowheight = $(window).height();
			
			if(offset<keepscroll) //off top of screen
				keepscroll = offset-20;
			else if(offset+height>keepscroll+windowheight) //off bottom of screen
				keepscroll = offset-windowheight+height+30;
		};
	}
			if(keepscroll<0) keepscroll = 0;
		$(window).scrollTop(keepscroll);
};

var checkhash = function () {
	var test = window.location.hash;
	if(test=='' || test=='#') closeSlide();
	else openSlide();
}

checkhash();

$('a['+relAttr+'^='+programId+']').off('click').on('click',openSlide);
//$('a['+relAttr+'='+programId+']').not('[href]').not('['+revAttr+']').add('[href="#"]').off('click').on('click',openSlide);
$('div['+classAttr+'^='+programId+']').hide();

$(window).bind('hashchange',function(){ checkhash(); });

});

})();