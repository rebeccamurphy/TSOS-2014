/* ------------
   Globals.ts

   Global CONSTANTS and _Variables.
   (Global over both the OS and Hardware Simulation / Host.)

   This code references page numbers in the text book:
   Operating System Concepts 8th edition by Silberschatz, Galvin, and Gagne.  ISBN 978-0-470-12872-5
   ------------ */
var APP_NAME = "MysteriOS Bloop";
var APP_VERSION = "The Ugliest Baby";
var CPU_CLOCK_INTERVAL = 100; // This is in ms, or milliseconds, so 1000 = 1 second.
var TIMER_IRQ = 0; // Pages 23 (timer), 9 (interrupts), and 561 (interrupt priority).
// NOTE: The timer is different from hardware/host clock pulses. Don't confuse these.
var KEYBOARD_IRQ = 1;
var RUN_PROGRAM_IRQ = 2;
var UNKNOWN_OP_CODE = 3;
var SYS_OPCODE_IRQ = 4;
var CPU_BREAK_IRQ = 5;
var MEMORY_ACCESS_VIOLATION_IRQ = 6;
var PROCESS_KILLED_IRQ = 7;
var CONTEXT_SWITCH_IRQ = 8;
var CLEAR_MEMORY_IRQ = 9;
var SET_SCHEDULE_TYPE_IRQ = 10;
var FILESYSTEM_IRQ = 11;
var SWAPFILE_IRQ = 12;
var CONSOLE_BGC = "#DFDBC3"; //default console background color
var CONSOLE_TEXT_COLOR = "black"; //default console text color
var CONSOLE_VIEWPORT_WIDTH = 500;
var CONSOLE_VIEWPORT_HEIGHT = 500;
var QUANTUM = 6;
var DEFAULT_PRIORITY = 4;
var scheduleType;
(function (scheduleType) {
    scheduleType[scheduleType["rr"] = 0] = "rr";
    scheduleType[scheduleType["fcfs"] = 1] = "fcfs";
    scheduleType[scheduleType["priority"] = 2] = "priority";
})(scheduleType || (scheduleType = {}));
;
var scheduleTypes = ["Round Robin", "First Come First Served", "Priority"];
var SCHEDULE_TYPE = scheduleType.rr;
var PREVIOUS_MESSAGE = "";
var DISK_IN_USE = false;
var SWAP_FILE_START_CHAR = ".";
var SWAP_FILE_START_CHAR_HEX;
var PUT_PROMPT = true;
window.onload = function () {
    //defines console original dimensions 
    CONSOLE_VIEWPORT_WIDTH = parseInt(document.getElementById("display").getAttribute("width"));
    CONSOLE_VIEWPORT_HEIGHT = parseInt(document.getElementById("display").getAttribute("height"));
};
var State;
(function (State) {
    State[State["New"] = 0] = "New";
    State[State["Running"] = 1] = "Running";
    State[State["Ready"] = 2] = "Ready";
    State[State["Done"] = 3] = "Done";
    State[State["Killed"] = 4] = "Killed";
})(State || (State = {}));
;
var States = ["New", "Running", "Ready", "Ran", "Killed"];
var Locations;
(function (Locations) {
    Locations[Locations["Memory"] = 0] = "Memory";
    Locations[Locations["Disk"] = 1] = "Disk";
})(Locations || (Locations = {}));
;
var LocationsStr = ["Memory", "Disk"];
var DiskAction;
(function (DiskAction) {
    DiskAction[DiskAction["Create"] = 0] = "Create";
    DiskAction[DiskAction["CreateForce"] = 1] = "CreateForce";
    DiskAction[DiskAction["Read"] = 2] = "Read";
    DiskAction[DiskAction["ReadSwap"] = 3] = "ReadSwap";
    DiskAction[DiskAction["Write"] = 4] = "Write";
    DiskAction[DiskAction["AppendWrite"] = 5] = "AppendWrite";
    DiskAction[DiskAction["Delete"] = 6] = "Delete";
    DiskAction[DiskAction["DeleteForce"] = 7] = "DeleteForce";
    DiskAction[DiskAction["DeleteAll"] = 8] = "DeleteAll";
    DiskAction[DiskAction["FullFormat"] = 9] = "FullFormat";
    DiskAction[DiskAction["QuickFormat"] = 10] = "QuickFormat";
    DiskAction[DiskAction["EmptyTrash"] = 11] = "EmptyTrash";
    DiskAction[DiskAction["Recover"] = 12] = "Recover";
    DiskAction[DiskAction["RecoverAll"] = 13] = "RecoverAll";
})(DiskAction || (DiskAction = {}));
;
var DiskActions = ['creating', 'force creating', 'reading', 'reading swap file', 'writing', 'appending', 'deleting', 'force deleting', 'deleting all', 'full formatting', 'quick formatting', 'emptying trash', 'recovering', 'recovering all'];
var _FileNames = null;
var _Trash = null;
//
// Global Variables
//
var _CPU; // Utilize TypeScript's type annotation system to ensure that _CPU is an instance of the Cpu class.
var _SingleStep = false;
var _Stepping = false;
var _StartUp = true;
var _StartUpTime = 10000; //10secs
//Memory Vars
var _MemoryManager;
var _Scheduler;
var _MemoryByteSize = 8;
var _ProgramSize = 256;
var _NumPrograms = 3;
var _MemorySize = _NumPrograms * _ProgramSize;
var _TerminatedPrograms = [];
var _CurrPID = 0;
var _ExecutingProgramPID; //pid of excuting program
var _ExecutingProgramPCB; //pcb of excuting program
var _ExecutingProgram = null; //the program data of the executing program
var _Assembly = "";
var _OSclock = 0; // Page 23.
var _Mode = 0; // (currently unused)  0 = Kernel Mode, 1 = User Mode.  See page 21.
var _Canvas = null; // Initialized in hostInit().
var _DrawingContext = null; // Initialized in hostInit().
var _DefaultFontFamily = "sans"; // Ignored, I think. The was just a place-holder in 2008, but the HTML canvas may have use for it.
var _DefaultFontSize = 13;
var _FontHeightMargin = 6; // Additional space added to font size when advancing a line.
var _ConsoleScrollbar = null;
var _Trace = true; // Default the OS trace to be on.
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
var _krnFileSystemDriver = null;
var _hardwareClockID = null;
// For testing...
var _GLaDOS = null;
var Glados = null;
var onDocumentLoad = function () {
    TSOS.Control.hostInit();
};
