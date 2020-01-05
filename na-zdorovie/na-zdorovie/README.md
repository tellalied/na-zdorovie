# PMA Cry


PMA Cry  (Pattern Matching Analysis Cryptojacking) is a browser extension that focuses on blocking web browser-based cryptocurrency miners all over the web.


# How it works
The extension uses two different approaches to block miners. The first one is based on blocking requests/scripts loaded from a blacklist with pattern matching, this is the traditional approach adopted by most ad-blockers and other mining blockers. The other approach is detecting potential mining behaviour anomaly that is CPU Usage over 99% on the focused tab and kills them immediately. This makes the extension able to block inline scripts as well as miners running through proxies.

## Installation

* Open Google Chrome and navigate to chrome://flags
* Enable Experimental API's
* Open Google Chrome and navigate to chrome://extensions.
* Enable Developer Mode by clicking the checkbox in the top right corner.
* Click the 'Load unpacked extension' button and select manifest.json from the directory .
* Enable the extension.

### Todos

 - A lot


