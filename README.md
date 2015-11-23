# 4chanImageViewer
A Tampermonkey script for 4chan.  It creates a simple image browser for threads.

##Features
This shows a button inside of 4chan threads that lets you open all of the images in the current thread into an image viewer.

* Buttons under a specific thumbnail open the viewer at that that point in the thread. 
* The main button in the lower right corner opens the viewer at the last viewed position of that thread (only remembers one thread at a time).
* Preloads the images as you browse.
* Use Left and right arrows to page through images.
* Hit Esc or click outside of image to close viewer.
* The mouse cursor will auto-hide over an image. When hidden, clicking will still cause the next image to show.
* Opens videos as well.  Videos auto-play and loop.
