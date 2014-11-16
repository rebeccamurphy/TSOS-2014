/* ------------
   Globals.ts

   Global CONSTANTS and _Variables.
   (Global over both the OS and Hardware Simulation / Host.)

   This code references page numbers in the text book:
   Operating System Concepts 8th edition by Silberschatz, Galvin, and Gagne.  ISBN 978-0-470-12872-5
   ------------ */

//
// Global "CONSTANTS" (There is currently no const or final or readonly type annotation in TypeScript.)
// TODO: Make a global object and use that instead of the "_" naming convention in the global namespace.
//
var APP_NAME: string    = "MysteriOS Bloop";   
var APP_VERSION: string = "Uglyier Baby";   

var CPU_CLOCK_INTERVAL: number = 100;   // This is in ms, or milliseconds, so 1000 = 1 second.

var TIMER_IRQ: number = 0;  // Pages 23 (timer), 9 (interrupts), and 561 (interrupt priority).
                            // NOTE: The timer is different from hardware/host clock pulses. Don't confuse these.
var KEYBOARD_IRQ: number = 1;
var RUN_PROGRAM_IRQ: number =2;
var UNKNOWN_OP_CODE: number =3;
var SYS_OPCODE_IRQ: number =4;
var CPU_BREAK_IRQ: number = 5;
var MEMORY_ACCESS_VIOLATION_IRQ: number = 6;
var PROCESS_KILLED_IRQ: number = 7;
var CONTEXT_SWITCH_IRQ: number = 8;
var CLEAR_MEMORY_IRQ: number = 9;
var SET_SCHEDULE_TYPE_IRQ: number = 10;


var CONSOLE_BGC: string = "#DFDBC3";		//default console background color
var CONSOLE_TEXT_COLOR: string = "black";	//default console text color
var CONSOLE_VIEWPORT_WIDTH :number = 500;
var CONSOLE_VIEWPORT_HEIGHT :number= 500;
var QUANTUM: number = 6;
var DEFAULT_PRIORITY:number =4;
var SCHEDULE_TYPE :scheduleType= scheduleType.rr; 

window.onload = function() {
	//defines console original dimensions 
    CONSOLE_VIEWPORT_WIDTH = parseInt(document.getElementById("display").getAttribute("width"));
    CONSOLE_VIEWPORT_HEIGHT= parseInt(document.getElementById("display").getAttribute("height"));
};

enum State {New,Running, Ready, Done, Killed};
var States =["New","Running","Ready","Done", "Killed"];

enum scheduleType {rr, fcfs, priority};
var scheduleTypes = ["Round Robin", "First Come First Served", "Priority"];

//
// Global Variables
//
var _CPU: TSOS.Cpu;  // Utilize TypeScript's type annotation system to ensure that _CPU is an instance of the Cpu class.
var _SingleStep= false;
var _Stepping = false;
//Memory Vars
var _MemoryManager: TSOS.MemoryManager;
var _Scheduler: TSOS.cpuScheduler;
var _MemoryByteSize = 8;
var _ProgramSize = 256;
var _NumPrograms = 3; 
var _MemorySize = _NumPrograms * _ProgramSize;
var _TerminatedPrograms =[];
var _CurrPID=0;
var _ExecutingProgramPID; //pid of excuting program
var _ExecutingProgramPCB; //pcb of excuting program
var _Assembly ="";
var _OSclock: number = 0;  // Page 23.

var _Mode: number = 0;     // (currently unused)  0 = Kernel Mode, 1 = User Mode.  See page 21.

var _Canvas: HTMLCanvasElement = null;  // Initialized in hostInit().
var _DrawingContext = null;             // Initialized in hostInit().
var _DefaultFontFamily = "sans";        // Ignored, I think. The was just a place-holder in 2008, but the HTML canvas may have use for it.
var _DefaultFontSize = 13;
var _FontHeightMargin = 6;              // Additional space added to font size when advancing a line.
var _ConsoleScrollbar = null;

var _Trace: boolean = true;  // Default the OS trace to be on.

// The OS Kernel and its queues.
var _Kernel: TSOS.Kernel;
var _KernelInterruptQueue = null;
var _KernelBuffers: any[] = null;
var _KernelInputQueue = null;

// Standard input and output
var _StdIn  = null;
var _StdOut = null;

// UI
var _Console: TSOS.Console;
var _OsShell: TSOS.Shell;

// At least this OS is not trying to kill you. (Yet.)
var _SarcasticMode: boolean = false;

// Global Device Driver Objects - page 12
var _krnKeyboardDriver = null;

var _hardwareClockID: number = null;


// For testing...
var _GLaDOS: any = null;
var Glados: any = null;

var onDocumentLoad = function() {
	TSOS.Control.hostInit();
};
