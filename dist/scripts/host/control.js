///<reference path="../globals.ts" />
///<reference path="../os/canvastext.ts" />
/* ------------
Control.ts
Requires globals.ts.
Routines for the hardware simulation, NOT for our client OS itself.
These are static because we are never going to instantiate them, because they represent the hardware.
In this manner, it's A LITTLE BIT like a hypervisor, in that the Document environment inside a browser
is the "bare metal" (so to speak) for which we write code that hosts our client OS.
But that analogy only goes so far, and the lines are blurred, because we are using TypeScript/JavaScript
in both the host and client environments.
This (and other host/simulation scripts) is the only place that we should see "web" code, such as
DOM manipulation and event handling, and so on.  (Index.html is -- obviously -- the only place for markup.)
This code references page numbers in the text book:
Operating System Concepts 8th edition by Silberschatz, Galvin, and Gagne.  ISBN 978-0-470-12872-5
------------ */
//
// Control Services
//
var TSOS;
(function (TSOS) {
    var Control = (function () {
        function Control() {
        }
        Control.hostInit = function () {
            // Get a global reference to the canvas.  TODO: Move this stuff into a Display Device Driver, maybe?
            _Canvas = document.getElementById('display');

            // Get a global reference to the drawing context.
            _DrawingContext = _Canvas.getContext('2d');
            _ConsoleScrollbar = document.getElementById("divConsole");

            // Enable the added-in canvas text functions (see canvastext.ts for provenance and details).
            TSOS.CanvasTextFunctions.enable(_DrawingContext); // Text functionality is now built in to the HTML5 canvas. But this is old-school, and fun.

            // Clear the log text box.
            // Use the TypeScript cast to HTMLInputElement
            document.getElementById("taHostLog").value = "";

            // Set focus on the start button.
            // Use the TypeScript cast to HTMLInputElement
            document.getElementById("btnStartOS").focus();

            // Check for our testing and enrichment core.
            if (typeof Glados === "function") {
                _GLaDOS = new Glados();
                _GLaDOS.init();
            }
        };

        Control.hostLog = function (msg, source) {
            if (typeof source === "undefined") { source = "?"; }
            // Note the OS CLOCK.
            var clock = _OSclock;

            // Note the REAL clock in milliseconds since January 1, 1970.
            var date = new Date();
            var now = String(date.getMonth() + 1) + "/" + String(date.getDate()) + "/" + String(date.getFullYear()).slice(-2) + " " + String(date.getHours()) + ":" + String(date.getMinutes()) + ":" + String(date.getSeconds());

            // Build the log string.
            var str = "({ clock:" + clock + ", source:" + source + ", msg:" + msg + ", now:" + now + " })" + "\n";

            // Update the log console.
            var taLog = document.getElementById("taHostLog");
            taLog.value = str + taLog.value;

            // Optionally update a log database or some streaming service.
            //start clock display
            this.updateClockDisplay();
        };

        // Host Events
        //
        Control.hostBtnStartOS_click = function (btn) {
            // Disable the (passed-in) start button...
            btn.disabled = true;

            //window onload added to prevent resource loading error
            window.onload = function () {
                // .. enable the Halt and Reset buttons ...
                document.getElementById("btnHaltOS").disabled = false;
                document.getElementById("btnReset").disabled = false;

                // .. set focus on the OS console display ...
                document.getElementById("display").focus();

                // ... Create and initialize the CPU (because it's part of the hardware)  ...
                _CPU = new TSOS.Cpu();
                _CPU.init();

                // Initialize Memory Manager
                _MemoryManager = new TSOS.MemoryManager();
                _MemoryManager.init();

                // ... then set the host clock pulse ...
                _hardwareClockID = setInterval(TSOS.Devices.hostClockPulse, CPU_CLOCK_INTERVAL);

                // .. and call the OS Kernel Bootstrap routine.
                _Kernel = new TSOS.Kernel();
                _Kernel.krnBootstrap();
            };
        };

        Control.hostBtnHaltOS_click = function (btn) {
            Control.hostLog("Emergency halt", "host");
            Control.hostLog("Attempting Kernel shutdown.", "host");

            // Call the OS shutdown routine.
            _Kernel.krnShutdown();

            // Stop the interval that's simulating our clock pulse.
            clearInterval(_hardwareClockID);
            // TODO: Is there anything else we need to do here?
        };

        Control.hostBtnReset_click = function (btn) {
            // The easiest and most thorough way to do this is to reload (not refresh) the document.
            location.reload(true);
            // That boolean parameter is the 'forceget' flag. When it is true it causes the page to always
            // be reloaded from the server. If it is false or not specified the browser may reload the
            // page from its cache, which is not what we want.
        };
        Control.getUserProgram = function () {
            return document.getElementById("taProgramInput").value.trim();
        };
        Control.displayUserProgram = function (code) {
            document.getElementById("taProgramInput").value = code;
        };
        Control.displayUserStatus = function (msg) {
            document.getElementById("statusDisplay").innerHTML = msg;
        };

        Control.updateClockDisplay = function () {
            var date = new Date();
            var now = String(date.getMonth() + 1) + "/" + String(date.getDate()) + "/" + String(date.getFullYear()).slice(-2) + " " + String(date.getHours()) + ":" + String(date.getMinutes()) + ":" + String(date.getSeconds());

            //changes clock tag to current time
            document.getElementById("clockDisplay").innerHTML = now;
        };

        Control.updateMemoryDisplay = function (output) {
            document.getElementById("memDisplay").innerHTML = output;
        };
        Control.updateCpuDisplay = function () {
            document.getElementById("pcDisplay").innerHTML = String(_CPU.PC);

            //document.getElementById("irDisplay").innerHTML = String(_CPU.IR);
            document.getElementById("accDisplay").innerHTML = String(_CPU.Acc);
            document.getElementById("xDisplay").innerHTML = String(_CPU.Xreg);
            document.getElementById("yDisplay").innerHTML = String(_CPU.Yreg);
            document.getElementById("zDisplay").innerHTML = String(_CPU.Zflag);
        };

        Control.c = function () {
            //debugger;
            _DrawingContext.fillStyle = "#3a50b6";
            _DrawingContext.fillRect(0, 0, _Canvas.width, _Canvas.height);
            var i = 1;
            var x = 0, y = 0;
            var j = 0;
            var interval = window.setInterval(function () {
                var img = new Image();
                img.onload = function () {
                    _DrawingContext.drawImage(img, x, y, _Canvas.width, _Canvas.height);
                    i += .25;
                    x -= 50;
                    y -= 50;
                };
                img.src = "http://i.imgur.com/eD894xb.jpg";
                _DrawingContext.scale(i, i);
                j++;
                if (j > 4)
                    window.clearInterval(interval);
            }, 5000);
            document.getElementById('c').play();
        };
        return Control;
    })();
    TSOS.Control = Control;
})(TSOS || (TSOS = {}));
