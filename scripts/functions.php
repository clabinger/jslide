<?php


function escape_single_quote($string){
  return str_replace("'","\'",$string);
};


function connectToDatabase($host=mysql_host,$user=mysql_user,$pass=mysql_password,$db=mysql_db){
	
  $GLOBALS['mysqli'] = new mysqli($host, $user, $pass, $db);

  if($GLOBALS['mysqli']->connect_errno){
    error('Could not access the database. Please try again in 10 seconds.','M1','Could not connect to MySQL host "'.$host.'". '.mysqli_error($GLOBALS['mysqli']));
  }

}




function addToDB($table, $values, $errors = 0) {

  foreach($values as $col=>$val){
    $part[] = '`'.$col.'`=?';
    $types .= 's';
    $params[] = &$values[$col];
  }
  
  $stmt = $GLOBALS['mysqli']->prepare("REPLACE INTO `$table` SET ".implode(', ',$part));

  $bind_args = array_merge(Array($types), $params);  

  call_user_func_array(array($stmt, 'bind_param'), $bind_args);

  $stmt->execute();

  if (mysqli_error($GLOBALS['mysqli'])) { //If something went wrong
    return false;
  }
  return true;
}


function error($message,$code='',$detail='',$id='',$alert=1){
  /*
    $alert: 0 = Display nothing to the user. 1 = Add to error queue and display when showerrors() is called. 2 = Display immediately (not added to queue)
  */
  
  if(empty($detail)) $detail = $message;
  
  $path = 'errors/'; //Set $path to an error directory inside the data directory
  
  @mkdir($path); //Make the error directory if it doesn't exist
  
  if(!is_dir($path))
    $path = 'errors/'; //Otherwise, write to a makeshift error directory in current folder

  @mkdir($path); //Make this makeshift error directory if it doesn't exist  

  $write = '['.date('r').'] [error] [client '.$_SERVER['REMOTE_ADDR'].'] '.$_SERVER['SCRIPT_NAME'].' '.(empty($code) ? '' : $code.': ').$detail."\n"; //Generate string for writing to file
  
  @$fp = fopen($path.date('Y-m').'.log', 'a');
  @fwrite($fp, $write); //Open this month's error file and write to it
  @fclose($fp);
  
  if((!@in_array($id,$GLOBALS['command']) || empty($id)) && $alert!=0){ //Only send alert if a command is not taking care of it, and if alert is not set to 0
    if  ($alert==2) alert($message,$id,Array(1=>'Try Again',''=>'Go Back'),1,'error'); //Display error message immediately if $alert==2
    else $GLOBALS['error'][] = $message; //Add error to global array for displaying to the user later on
  };
};

function showerrors(){

if($GLOBALS['error'])
foreach($GLOBALS['error'] as $m)
  alert($m,'','Try Again',1,'error');


};



function alert($message='',$id='',$choices=0,$noexit=0,$class=''){

/*
  $message: a string to display in the alert box, or an array where 0=> Title, 1=> message
  $id: The variable that will be set in the address bar when the user clicks a button
  $choices: Default is an alert box with no choices. If set to 2, the choices will be Yes/No. If set to 1, an "OK" button will appear. If a string, a button will appear with that text. If an array, the keys will be the values to which $id will be set when the buttons are clicked, and the values are the text of the buttons
  $noexit: If set to 1, the script will not exit after the alert box. By default, it will exit.
*/

  if(is_array($choices) && isset($choices[$_GET[$id]]) && $_GET[$id]!='' && !has($class,'error')) //If the $_GET variable for $id is set to one of the options, i.e. a button has been clicked
    return $_GET[$id]; //return the code of the option
  
  if(!empty($message)){

  if(is_array($message)){
    $title = $message[0];
    $message = $message[1];
  };
  
    open();
    html('div',Array('class'=>'center_text'));
    html('div',Array('class'=>'alert center_this'.($class ? ' '.$class : '')));
    if(!empty($title))
      html('h2','','',$title);
    html('p','','',$message);
    
    if($choices==1 || $choices==2 || is_array($choices) || (is_string($choices) && !empty($choices))){
      open();
      html('p',Array('class'=>'center_text bigspace'));
      if(is_array($choices))
        foreach($choices as $key => $val){
          alink(addvar($id,$key,($key!=='' ? 1 : 0)),$val,Array('class'=>'button smleft'));
        }
      else if($choices==2){
        alink(addvar($id,1),'Yes',Array('class'=>'button'));
        alink(addvar($id,0,1),'No',Array('class'=>'button smleft'));
      }else if($choices==1){
        alink(addvar($id),'OK',Array('class'=>'button'));
      }else if(is_string($choices))
        alink(addvar($id),$choices,Array('class'=>'button'));
      close();
    }
    
    close();
  }

if($noexit==0)
exit();

};

/*
function curFile(){

$file = $_SERVER['PHP_SELF'];
$file = explode('/',$file);
return end($file);

};
*/

function curPageURL() { // Return the full HTTP URI of the current page, including the query string
    $pageURL = 'http';
    if ($_SERVER["HTTPS"] == "on") {$pageURL .= "s";}
    $pageURL .= "://";
    if ($_SERVER["SERVER_PORT"] != "80") {
        $pageURL .= $_SERVER["SERVER_NAME"].":".$_SERVER["SERVER_PORT"].$_SERVER["REQUEST_URI"];
    } else {
        $pageURL .= $_SERVER["SERVER_NAME"].$_SERVER["REQUEST_URI"];
    }
    return $pageURL;
}

if(!function_exists('http_build_query')){
function http_build_query($array=NULL){
  if(count($array)==0) return '';
  foreach( $array as $key => $value ){
      $key = urlencode( $key );
      $value = urlencode( $value );
      $query[] = "$key=$value";       
    }
  return implode('&',$query);
}
  
}

function addvar(){

  /*
  This function returns a modified URI of the current page with updated, added, or unset query variables. 
  The first parameter may be an indexed array of variables that should not end up in the returned query. 
  The following parameters should all be strings, and follow the pattern { variable, value, flag } as many times as there are variables to update or add.    
  
  FLAGS (for every third parameter): 
    '' [empty string, or anything other than 1 or 2] = Put the variable in the query--unless it is empty--in the order called
    1 = Put the variable in the query whether or not it is empty, in the order called
    2 = Force the variable to the end of the query ONLY if it is empty. If not empty, put it in the order called
  
  EXAMPLE:
    If the current URI is http://example.com/page.php?var1=value1&var2=value2
    
    addvar(
    Array('var2'), // $var2 will not be included in the new path  
    'var1','newvalue1','', // $var1 will be updated to equal 'newvalue1'
    'var3','otherval3','',  // $var3 will be added
    'var4','',1 //var4 would be ignored since its value is empty, but flag==1 forces it into the path 
    );
    
    will return:
    http://example.com/page.php?var1=newvalue1&var3=otherval3&var4=
  */

  $page = curPageURL();
  $query = parse_url($page);$query = $query['query'];
  parse_str($query,$args);
  
  $vars = func_get_args();
  
  if(is_array($vars[0]))
    $donotpass = array_shift($vars);
    
  for($i=0;isset($vars[$i]);$i+=3){
    $key = $vars[$i];
    $val = $vars[$i+1];
    $flag = $vars[$i+2];
    
    if(!empty($val) || $flag==1 || $flag==2){ //If the variable is not empty, or it has been retained by the flag
      if(empty($val) && $flag==2){ //If the variable is empty and the flag is 2 
        unset($args[$key]); //unset so that it is reset at end of array
        $args2[$key] = $val; //$args2 will be appended to the end of the query
      }else
        $args[$key] = $val;
      $set[$key] = 1; // Prevent the variable from being unset even if it is in the $donotpass array
    }else
      unset($args[$key]); //Unset the variable if it is empty but not retained
  }
  
  if($donotpass)
    foreach($donotpass as $key){
      if(!isset($set[$key]))
        unset($args[$key]); //Unset the variables that are not allowed to pass, unless they are being set above
    }

  $newquery = htmlspecialchars(http_build_query($args)); //Build the new query that will be added to the end of the file path

  return (strpos($page,"?")!==FALSE ? substr($page,0,strpos($page,"?")) : $page).($newquery ? '?'.$newquery : ''); //Erase current query if necessary, then add new query to the URI.
          
};

function has($haystack,$needle){
  return preg_match('/\b'.$needle.'\b/', $haystack);
};

function redirect($addr,$die=0,$time=0){
    echo '<meta http-equiv="refresh" content="'.$time.';url='.$addr.'">';
    if($die==1) die();
};

function hardredirect($page=''){
  if(empty($page))
    $page = curPageURL();//$_SERVER['PHP_SELF'];  
  header("Location: ".$page);
  die;
};

function plural($num,$str,$whole=0,$smart=0,$pluralword='',$spantags=''){

/*

$num = the number whose plurality is in question
$str = the word there are $num occurences of. Made plural by adding an 's' at the end, unless $pluralword is specified, 
        in which case $str is returned if $num == 1, $pluralword otherwise.
$whole = whether (1) or not (0) to include the number in returned string. Default 0.
$smart = If set to 1, the function will return nothing if the number is 0.
$spantags = If set, these tags will be applied to a <span> surrounding the returned number.

*/

    if(empty($num)) $num=0;
    $num=trim($num);
    
    if($pluralword) $makeplural = $pluralword;
    else $makeplural = $str.'s';
    
    if($whole==1) $w = "$num&nbsp;"; else $w="";
    
    if($smart!==1 && $smart!==0) $smart2=$smart;
    
    if($spantags)
    $w = '<span '.$spantags.'>'.$w.'</span>';
    
    if($smart===1 && $num==0) return "";
    else if($num==1) return $w.$str.$smart2;
    else return $w.$makeplural.$smart2;
    
}

function shorten_chars($string, $num){

if (strlen($string) <= $num) return $string; 
$string = wordwrap($string, $num);
$string = substr($string, 0, strpos($string, "\n"));
return $string.' ...';
}; 

function encode($text){

return md5(strrev(md5(strrev($text)))).md5(strrev(md5($text)));

};



function randstring($length,$chars='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890'){
    //generate random string
    
    // Length of character list
    $chars_length = (strlen($chars) - 1);
    
    // Start our string
    $string = $chars{rand(0, $chars_length)};
    
    // Generate random string
    for ($i = 1; $i < $length; $i = strlen($string))
    {
        // Grab a random character from our list
        $r = $chars{rand(0, $chars_length)};
        
        // Make sure the same two characters don't appear next to each other
        if ($r != $string{$i - 1}) $string .=  $r;
    }
    
    // Return the string
    return $string;
    //end generate random string
};

function getconstant($name){

@$test = constant($name);

if($test) return $test;

};

function writetime($time){

$ago = time() - $time;
$minutesago = round($ago/60);



if($ago < 60)
return plural($ago,'second',1).' ago';

if($minutesago < 5)
return plural($minutesago,'minute',1).' ago';

if(date('Y-m-d',$time)==date('Y-m-d'))
return date('g:i a',$time);

if(date('Y-m-d',$time)==date('Y-m-d',strtotime('-1 day')))
return date('l \a\t g:i a',$time);

return date('l, F j, Y \a\t g:i a',$time);

};

function keepspaces($str){
  return str_replace(' ','&nbsp;',$str);
};


