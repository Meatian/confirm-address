# Confirm-Address

Add-on release page on thunderbird.net is here: [en-US](https://addons.thunderbird.net/en-US/thunderbird/addon/confirm-address-5582/) [ja](https://addons.thunderbird.net/ja/thunderbird/addon/confirm-address-5582/)

# How to create the release package

## Build with [Apache Ant](https://ant.apache.org/)

- Rewrite release version

        build.properties on line 1:
        dist=release/confirm-address_x.y.z-tb.xpi

        confirm-address/manifest.json on line 5:
        "version": "x.y.z",

- Run Ant
- It will create a release package under the release folder

## Build manually

- zip all source files on `confirm-address` folder
- Rename created zip file as follows:  
  ex: `confirm-address.zip -> confirm-address_x.y.z-tb.xpi`  
  Note: If you trying to load a xpi file including `confirm-address` folder, it fails

# How to Develop

- Clone source files from GitHub
- Click [≡] -> [🧩 Add-ons and Themes] -> [⚙️] button, and select [Debug Add-ons]
- Click [Load Temporary Add-on...] and select `confirm-address/manifest.json`

Click [Inspect] button on Confirm-Address to open Toolbox Tab.

- To show "foo" in console, write to js source file like this:  
   `console.log("foo");`
- To show a variable "bar" contents in console, write to js source file like this:  
  `console.dir(bar);`

**_ Note: After rewrite the source file(s), please click [Reload] on the Debugger tab to take effect _**

## How to run/create an unit test

### How to run the test

- Open this HTML file to run unit tests:  
  `confirm-address/scripts/unittest/testRunner.html`
- When the test passes, it displays `OK ... (TEST NAME)` as green color
- When the test fails, it displays `NG ... (TEST NAME)` as red color, also it shows the message why it fails

### How to create the test

#### ex： Testing to /scripts/hello.js

- Create /scripts/unittest/hello-test.js as a test case js file
- Include two js files to testRunner.html:

        <head>
            <script type="text/javascript" src="../hello.js"></script>
            <script type="text/javascript" src="hello-test.js"></script>
            <!-- Tests start -->
            ...

- Please make test case name starting from "test"
- In hello-test.js, write test case(s) invoking function(s) from hello.js
- `assertEquals` function is available on the test case js file
