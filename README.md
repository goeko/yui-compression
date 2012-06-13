YUI Compression
===============

JS, CSS Compress and Concat Sample with YUI compressor. The [original post](http://claude.betancourt.us/compress-javascript-and-css-as-part-of-your-build-process/ "Compress JavaScript and CSS as Part of your Build Process") is available here.

This file is merely an illustration of what's possible with YUI compressor
(http://bit.ly/yui-comp) and YUI compressor ant task (http://bit.ly/yui-comp-ant)
      
This example accomplishes the following:

1. Create a /build directory to store a compressed version of /js and /css
2. Compress all JS files into {original}-min.js files
3. Compress all CSS files into {original}-min.css files
4. Concatenate all compressed JS files into /js/all.js
5. Concatenate all compressed CSS files into /css/final_css
6. Delete /build

Of course, in real life you wouldn't just mix CSS files meant for screen and print into
the same output. In the case of JS files you must take care to include the files in the
proper order to avoid dependency issues, etc.

Requirements
------------

Apache Ant must be installed on your system. See http://ant.apache.org/ for details.

Set an environment variable, `COMPRESSOR_HOME`, that points to the /lib directory that
contains your copy of the YUI compressor and ant-task libraries. For example:

On Mac OSX and Linux, update ~/.profile and add:

    export COMPRESSOR_HOME=~/YourProjectDir/yui-compression-sample/lib

On Windows, right click My Computer and select properties. Then click the "Environment Variables"
button under the advanced tab. Add a new system variable, `COMPRESSOR_HOME`, and set its value to
your local path, for example:

    C:\Documents and Settings\username\Desktop\yui-compression-sample\lib

Usage
-----

Compressing and concatenating your project files is simple. From the command line, navigate to your
project folder (where the `build.xml` file is located) and type `ant <Enter>`

### Eclipse-based IDEs ###

You can right-click the `build.xml` file from an Eclipse-based IDE, like MotoDevStudio, Aptana
Studio or Adobe ColdFusion Builder. Just be sure to add the `COMPRESSOR_HOME` variable to it.

To do so, right-click the build.xml file and select Run As -> External Tools Configurations. Go
to the ENVIRONMENT tab and add the COMPRESSOR_HOME property there also, leave all other settings
alone.

Click to Apply and Run to test it.