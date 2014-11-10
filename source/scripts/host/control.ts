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
module TSOS {

    export class Control {

        public static hostInit(): void {
            // Get a global reference to the canvas.  TODO: Move this stuff into a Display Device Driver, maybe?
            _Canvas = <HTMLCanvasElement>document.getElementById('display');
            // Get a global reference to the drawing context.
            _DrawingContext = _Canvas.getContext('2d');
            _ConsoleScrollbar= document.getElementById("divConsole");
            // Enable the added-in canvas text functions (see canvastext.ts for provenance and details).
            CanvasTextFunctions.enable(_DrawingContext);   // Text functionality is now built in to the HTML5 canvas. But this is old-school, and fun.

            // Clear the log text box.
            // Use the TypeScript cast to HTMLInputElement
            (<HTMLInputElement> document.getElementById("taHostLog")).value="";

            // Set focus on the start button.
            // Use the TypeScript cast to HTMLInputElement
            (<HTMLInputElement> document.getElementById("btnStartOS")).focus();

            // Check for our testing and enrichment core.
            if (typeof Glados === "function") {
                _GLaDOS = new Glados();
                _GLaDOS.init();
            }
        }

        public static hostLog(msg: string, source: string = "?"): void {
            // Note the OS CLOCK.
            var clock: number = _OSclock;

            // Note the REAL clock in milliseconds since January 1, 1970.
            var date = new Date();
            var now = String(date.getMonth()+1) +"/" + String(date.getDate()) + "/" +String(date.getFullYear()).slice(-2) + " "
                + String(date.getHours()) + ":"+ String(date.getMinutes())+ ":"  + String(date.getSeconds());

            // Build the log string.
            var str: string = "({ clock:" + clock + ", source:" + source + ", msg:" + msg + ", now:" + now  + " })"  + "\n";

            // Update the log console.
            var taLog = <HTMLInputElement> document.getElementById("taHostLog");
            taLog.value = str + taLog.value;
            // Optionally update a log database or some streaming service.

            //start clock display
            this.updateClockDisplay();
        }


        // Host Events
        //
        public static hostBtnStartOS_click(btn): void {
            // Disable the (passed-in) start button...
            btn.disabled = true;
            //window onload added to prevent resource loading error
            ///window.onload =function(){
            var readyStateCheckInterval = setInterval(function() {
                if (document.readyState === "complete") {
                     // .. enable the Halt and Reset buttons ...
                    document.getElementById("btnHaltOS").disabled = false;
                    document.getElementById("btnReset").disabled = false;
                    document.getElementById("btnSingleStep").disabled = false;

                    // .. set focus on the OS console display ...
                    document.getElementById("display").focus();

                    // ... Create and initialize the CPU (because it's part of the hardware)  ...
                    _CPU = new Cpu();
                    _CPU.init();

                    // Initialize Memory Manager
                    _MemoryManager= new MemoryManager();
                    _MemoryManager.init();

                    _Scheduler = new cpuScheduler();

                    // ... then set the host clock pulse ...
                    _hardwareClockID = setInterval(Devices.hostClockPulse, CPU_CLOCK_INTERVAL);
                    // .. and call the OS Kernel Bootstrap routine.
                    _Kernel = new Kernel();
                    _Kernel.krnBootstrap();

                    clearInterval(readyStateCheckInterval);
                }
            }, 10);
           
        }

        public static hostBtnHaltOS_click(btn): void {
            Control.hostLog("Emergency halt", "host");
            Control.hostLog("Attempting Kernel shutdown.", "host");
            // Call the OS shutdown routine.
            _Kernel.krnShutdown();
            // Stop the interval that's simulating our clock pulse.
            clearInterval(_hardwareClockID);
            // TODO: Is there anything else we need to do here?
        }

        public static hostBtnReset_click(btn): void {
            // The easiest and most thorough way to do this is to reload (not refresh) the document.
            location.reload(true);
            // That boolean parameter is the 'forceget' flag. When it is true it causes the page to always
            // be reloaded from the server. If it is false or not specified the browser may reload the
            // page from its cache, which is not what we want.
        }
        public static hostBtnSingleStep_click(btn):void{
            //TODO add message or kernal thing to say entering single step mode
            if (_SingleStep ===false){
                _SingleStep = true;
                btn.innerHTML = "Single Step On"
                 document.getElementById("btnStep").disabled = false;
            }
            else {
                _SingleStep = false;
                btn.innerHTML = "Single Step Off";
                 document.getElementById("btnStep").disabled = true;

            }
        }

        public static hostBtnStep_click(btn):void{
            //probably need to update the kernal here too

                //clear the interval of the clock pulse
                //clearInterval(_hardwareClockID);
            _Stepping=true;
            _Kernel.krnOnCPUClockPulse();
            _Stepping=false;
        }
        public static getUserProgram() :string {
            return (<HTMLInputElement>document.getElementById("taProgramInput")).value.trim();
        }
        public static displayUserProgram(code):void{
            (<HTMLInputElement>document.getElementById("taProgramInput")).value =code;
        }
        public static displayUserStatus(msg):void {
            document.getElementById("statusDisplay").innerHTML = msg;

        }

        public static updateClockDisplay():void{
            var date = new Date();
            var now = String(date.getMonth()+1) +"/" + String(date.getDate()) + "/" +String(date.getFullYear()).slice(-2) + " "
                + String(date.getHours()) + ":"+ String(date.getMinutes())+ ":"  + String(date.getSeconds());
            //changes clock tag to current time
            document.getElementById("clockDisplay").innerHTML = now;

        }

        public static updateMemoryDisplay(output){
            document.getElementById("memDisplay").innerHTML = output;


        }
        public static updateCpuDisplay(){
            document.getElementById("pcDisplay").innerHTML = String(_CPU.PC);
            document.getElementById("irDisplay").innerHTML = String(_CPU.IR);
            document.getElementById("accDisplay").innerHTML = String(_CPU.Acc);
            document.getElementById("xDisplay").innerHTML = String(_CPU.Xreg);
            document.getElementById("yDisplay").innerHTML = String(_CPU.Yreg);
            document.getElementById("zDisplay").innerHTML = String(_CPU.Zflag);
            document.getElementById("instructID").innerHTML = _Assembly;
        }
        public static updatePCBDisplay(){
            /*
            document.getElementById("PCBPIDDisplay").innerHTML = String(_ExecutingProgramPCB.pid);
            document.getElementById("PCBPCDisplay").innerHTML = String(_ExecutingProgramPCB.PC);
            document.getElementById("PCBIRDisplay").innerHTML = String(_ExecutingProgramPCB.IR);
            document.getElementById("PCBACCDisplay").innerHTML = String(_ExecutingProgramPCB.Acc);
            document.getElementById("PCBXDisplay").innerHTML = String(_ExecutingProgramPCB.Xreg);
            document.getElementById("PCBYDisplay").innerHTML = String(_ExecutingProgramPCB.Yreg);
            document.getElementById("PCBZDisplay").innerHTML = String(_ExecutingProgramPCB.Zflag);
            */
        }
        public static startPCBDisplay(){
            /*
            document.getElementById("PCBPIDDisplay").innerHTML = "0";
            document.getElementById("PCBPCDisplay").innerHTML ="0";
            document.getElementById("PCBIRDisplay").innerHTML = "0";
            document.getElementById("PCBACCDisplay").innerHTML = "0";
            document.getElementById("PCBXDisplay").innerHTML = "0";
            document.getElementById("PCBYDisplay").innerHTML = "0";
            document.getElementById("PCBZDisplay").innerHTML = "0";
            */
        }

        public static updateRQDisplay(){
            var output = "<tr>";
            output += "<td> "+_ExecutingProgramPCB.pid+"</td>";
            output += "<td> "+ _ExecutingProgramPCB.PC+"</td>";
            output += "<td> "+_ExecutingProgramPCB.IR+"</td>";
            output += "<td> "+_ExecutingProgramPCB.Acc+"</td>";
            output += "<td> "+_ExecutingProgramPCB.Xreg+"</td>";
            output += "<td> "+_ExecutingProgramPCB.Yreg+"</td>";
            output += "<td> "+_ExecutingProgramPCB.Zflag+"</td>";
            output += "<td> "+_ExecutingProgramPCB.priority+"</td>";
            output += "<td> "+States[_ExecutingProgramPCB.state]+"</td>";
            output += "<td> "+_ExecutingProgramPCB.location+"</td>";
            output += "</tr>";

            for (var i=0; i<_Scheduler.readyQueue.getSize(); i++){
                output += "<tr>";
                output += "<td> "+_Scheduler.readyQueue.get(i).pid+"</td>";
                output += "<td> "+ _Scheduler.readyQueue.get(i).PC+"</td>";
                output += "<td> "+_Scheduler.readyQueue.get(i).IR+"</td>";
                output += "<td> "+_Scheduler.readyQueue.get(i).Acc+"</td>";
                output += "<td> "+_Scheduler.readyQueue.get(i).Xreg+"</td>";
                output += "<td> "+_Scheduler.readyQueue.get(i).Yreg+"</td>";
                output += "<td> "+_Scheduler.readyQueue.get(i).Zflag+"</td>";
                output += "<td> "+_Scheduler.readyQueue.get(i).priority+"</td>";
                output += "<td> "+States[_Scheduler.readyQueue.get(i).state]+"</td>";
                output += "<td> "+_Scheduler.readyQueue.get(i).location+"</td>";
                output += "</tr>";
            }
            document.getElementById("ReadyQueueDisplay").innerHTML = output;
        }
        public static c(){
            _DrawingContext.fillStyle="#3a50b6";
            _DrawingContext.fillRect(0, 0, _Canvas.width, _Canvas.height);
            var i =1;
            var x=0, y=0;
            var j =0;
            var interval = window.setInterval(function(){
            var img = new Image();
            img.onload = function() {
                _DrawingContext.drawImage(img, x, y, _Canvas.width, _Canvas.height);
                i+=.25;
                x-=50;
                y-=50;
            };
            img.src ="http://i.imgur.com/eD894xb.jpg";
            _DrawingContext.scale(i,i);
            j++;
            if (j>4)
                window.clearInterval(interval);
            }, 5000);
            (<HTMLAudioElement>document.getElementById('c')).play();

        }

    }
}
