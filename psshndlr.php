<?php 
  ob_start(); 
 
 //htmlspecialchars($_POST['name']);
  // Define $myusername and $mypassword 
  $title = $_POST['title'];
  $user = $_POST['user'];
  $body = $_POST['body'];
  $image = $_POST['image'];
  $published = $_POST['published'];
  $remoteID = $_POST['remoteID'];
  
  $title = "";
  $user = "";
  $body = "";
  $image ="";
  $published = "";
  $remoteID = "";
  
  $date = date('Y-m-d H:i:s'); 
  
  // Connect to the database server 
	  $dbcnx = @mysql_connect("mysql15.powweb.com","cdsuperuser", "ainfo10c");
     if (!$dbcnx) 
	 {    echo( "<PA>Unable to connect to the database server at this time.</PA>" );
	     exit();  }
    // Select the database
    if (! @mysql_select_db("aegeus") )
	 {    echo( "<PA>Database is syncing at this time. Try again later. </PA>" );
	     exit();  }
 	   
  $sql="INSERT INTO  `pwd` (  `title` ,  `user` ,  `body`,`image`,`published`,`remoteID` ) 
VALUES ('$title' , '$user',  '$body', '$image', '$published','$remoteID');"; 
  $result = mysql_query($sql); 
   
  // Mysql_num_row is counting table row 
  $count = mysql_num_rows($result); 
  // If result matched $myusername and $mypassword, table row must be 1 row 
  
 
  if($result) { 
     //echo "success"; 
  } else { 
       header("HTTP/1.0 500 Internal Server Error");  
  } 
   
  ob_end_flush(); 
?>