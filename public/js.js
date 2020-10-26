
$(function(){

$('.hide').hide();//css('color','red');
$('.hidden').show();

function fitcontent(){
	$('#sidebar').css('min-height',$(window).height());
	$('#main').css('min-height',$(window).height());
};
fitcontent();

function removeHash() {
    if ("pushState" in history)
        history.pushState("", document.title, window.location.pathname);
    else
        window.location.hash = "";
}

$("a[href$='.js']").on('click',function(){
	_gaq.push(['_trackEvent', 'Downloads', 'Click', $(this).attr('href')]);
});

$('#title a').on('click',function(){ $('html, body').animate({scrollTop:0}, 250); removeHash(); return false; })

$('a[href^=#]').on('click',function(){ $('html, body').animate({scrollTop: $('a[name="'+($(this).attr('href')).substr(1)+'"]').offset().top}, 250); return false; });

$(window).resize(fitcontent);

$('#morefeatures').on('click',function(){ 
	if ($('#featurelist .hide').is(':hidden')) $('#featurelist .hide').slideDown(250); 
	else $('#featurelist .hide').slideUp(250); 
})

$('ul li.morelink').on('click',function(){ 
	$(this).siblings('li.hide').slideDown(250); 
	$(this).remove();
	
})




$('#morefeatures').each(function(){
	var elem = this;
	elem.onselectstart = function() { return false; };
	elem.style.MozUserSelect = "none";
	elem.style.KhtmlUserSelect = "none";
	elem.unselectable = "on";
});

});
