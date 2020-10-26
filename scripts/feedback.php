<?php

include_once('functions.php');

connectToDatabase('localhost','jslide_user','<PASSWORD>','jslide');

if($_POST['content'] || $_POST['email']){

if(
	addtoDB('feedback',Array(
	'ip'=>$_SERVER['REMOTE_ADDR'],
	'time'=>time(),
	'email'=>$_POST['email'],
	'content'=>$_POST['content']
	))
)
$message = Array('Thank you','Your message has been submitted.<br /><br /><a href="/">&laquo; Back to Home</a>');
else $message = Array('Error','We\'re sorry, something went wrong. Please <a href="javascript:history.go(-1);">go back</a> and try again.');

}
else hardredirect('/');

?><!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
  <head>
    <meta name="description" content="Instantly install an image viewer and slideshow on your web page." />
    <meta name="keywords" content="images, slideshow, javascript, pictures, jquery, easy" />
    <meta http-equiv="Content-Type" content="text/html;charset=utf-8" />
    <link rel="shortcut icon" href="/icon.ico" />
	<link rel="stylesheet" type="text/css" href="/css.css" />
    <title>jSlide - javascript image viewer and slideshow</title>
  </head>
<body>

<div id="wrap">
<div id="innerwrap">
<div style="padding-top:100px;">
<p style="font-size:24pt;"><?php echo $message[0]; ?></p>
<p><?php echo $message[1]; ?></p>
</div>
</div>
</div>
</body>
</html>