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
var APP_NAME = "MysteriOS Bloop";
var APP_VERSION = "Uglyier Baby";

var CPU_CLOCK_INTERVAL = 100;

var TIMER_IRQ = 0;

// NOTE: The timer is different from hardware/host clock pulses. Don't confuse these.
var KEYBOARD_IRQ = 1;
var RUN_PROGRAM_IRQ = 2;
var UNKNOWN_OP_CODE = 3;
var SYS_OPCODE_IRQ = 4;
var CPU_BREAK_IRQ = 5;
var MEMORY_ACCESS_VIOLATION_IRQ = 6;

var CONSOLE_BGC = "#DFDBC3";
var CONSOLE_TEXT_COLOR = "black";
var CONSOLE_VIEWPORT_WIDTH = 500;
var CONSOLE_VIEWPORT_HEIGHT = 500;
var QUANTUM = 6;

window.onload = function () {
    //defines console original dimensions
    CONSOLE_VIEWPORT_WIDTH = parseInt(document.getElementById("display").getAttribute("width"));
    CONSOLE_VIEWPORT_HEIGHT = parseInt(document.getElementById("display").getAttribute("height"));
};

//
// Global Variables
//
var _CPU;
var _SingleStep = false;
var _Stepping = false;

//Memory Vars
var _MemoryManager;
var _Scheduler;
var _MemoryByteSize = 8;
var _ProgramSize = 256;
var _NumPrograms = 3;
var _MemorySize = _NumPrograms * _ProgramSize;
var _ProgramList = [];
var _CurrPID = 0;
var _ExecutingProgramPID;
var _ExecutingProgramPCB;
var _Assembly = "";
var _OSclock = 0;

var _Mode = 0;

var _Canvas = null;
var _DrawingContext = null;
var _DefaultFontFamily = "sans";
var _DefaultFontSize = 13;
var _FontHeightMargin = 6;
var _ConsoleScrollbar = null;

var _Trace = true;

// The OS Kernel and its queues.
var _Kernel;
var _KernelInterruptQueue = null;
var _KernelBuffers = null;
var _KernelInputQueue = null;

// Standard input and output
var _StdIn = null;
var _StdOut = null;

// UI
var _Console;
var _OsShell;

// At least this OS is not trying to kill you. (Yet.)
var _SarcasticMode = false;

// Global Device Driver Objects - page 12
var _krnKeyboardDriver = null;

var _hardwareClockID = null;

// For testing...
var _GLaDOS = null;
var Glados = null;

var onDocumentLoad = function () {
    TSOS.Control.hostInit();
};
