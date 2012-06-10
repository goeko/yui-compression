/**
 * Solution to challenge posted at http://forum.lessthandot.com/viewtopic.php?f=102&t=2155
 * @author cbetancourt
 */
var pathArray = [
	'C:\\data\\old\\one.jpg',
	'C:\\data\\old\\one.two.jpg',
	'C:\\data\\new\\newer\\three.wav',
	'C:\\Documents and Settings\\My Music\\Amazon MP3\\The Doors\\Gloria.mp3'
];

//for each (var path in pathArray) {
for (var i=0; i<pathArray.length; i++) {
	
	var path = pathArray[i];
	var parts = path.split('\\');
	var file = parts[parts.length-1];
	var fileParts = file.split('.');
	
	var output = '<p class="output">'
		+ 'extension = ' + fileParts[fileParts.length-1]
		+ ' | nameOfFile = ' + fileParts[0]
		+ ' | totalPath = ' + path.substring(0,path.indexOf(file)).replace(/\\/g,'/')
		+ ' | numberOfFolders = ' + (parts.length-2)
		+ '</p>'
	;
	
	document.write(output);
}