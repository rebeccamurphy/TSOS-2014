///<reference path="deviceDriver.ts" />
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
/* ----------------------------------
DeviceDriverFileSystem.ts
Requires deviceDriver.ts
The Kernel File System Device Driver.
---------------------------------- */
var TSOS;
(function (TSOS) {
    // Extends DeviceDriver
    var DeviceDriverFileSystem = (function (_super) {
        __extends(DeviceDriverFileSystem, _super);
        function DeviceDriverFileSystem() {
            // Override the base method pointers.
            this.tracks = 4;
            this.sectors = 8;
            this.blocks = 8;
            this.metaData = 4;
            this.dataBytes = 60;
            this.diskFull = false;
            this.fileTFull = false;
            _super.call(this, this.krnFileSystemDriverEntry, this.krnDiskInUse);
            SWAP_FILE_START_CHAR = TSOS.Utils.str2hex('.');
            //001-077 is for file names
            //100-377 is for data
            //swap files begin with .
        }
        DeviceDriverFileSystem.prototype.krnFileSystemDriverEntry = function () {
            _FileNames = new TSOS.Queue();
            _Trash = new TSOS.Queue();

            // Initialization routine for this, the kernel-mode Keyboard Device Driver.
            this.status = "File System Loaded";

            // More?
            this.init(false);
        };

        DeviceDriverFileSystem.prototype.init = function (format) {
            if ((sessionStorage.length === 0 && !format) || format) {
                //set the master boot record
                //first 3 spots of data is next available file name
                //next 3 spots are for the next available datablock
                sessionStorage.setItem("000", "1---" + TSOS.Utils.str2hex("001100") + new Array(54).join('0'));
                for (var t = 0; t < this.tracks; t++) {
                    for (var s = 0; s < this.sectors; s++) {
                        for (var b = 0; b < this.blocks; b++) {
                            if ("" + t + "" + s + "" + b !== "000") {
                                try  {
                                    //debugger;
                                    var blankBlock = new Array(this.dataBytes + this.metaData + 1).join('0');
                                    sessionStorage.setItem(t + "" + s + "" + b, blankBlock);
                                } catch (e) {
                                    alert('Quota exceeded!');
                                }
                            }
                        }
                    }
                }
            } else {
                for (var t = 0; t <= 0; t++) {
                    for (var s = 0; s <= 7; s++) {
                        for (var b = 0; b <= 7; b++) {
                            if ("" + t + "" + s + "" + b !== "000") {
                                var tempName = this.getFileName(t + "" + s + "" + b);
                                if (tempName !== "" && tempName.indexOf(SWAP_FILE_START_CHAR) === -1 && this.InUse(t + "" + s + "" + b))
                                    //makes sure swap files are not added to the file list
                                    _FileNames.enqueue(tempName);
                            }
                        }
                    }
                }
            }
        };

        DeviceDriverFileSystem.prototype.getFileName = function (tsb) {
            debugger;
            var temp = this.getDataBytes(tsb);

            //remove trailing 0s
            temp = temp.replace(/0+$/g, "");
            if (temp.length % 2 !== 0)
                temp += '0'; //accidentally removed an important hex 0.
            if (temp === "")
                return "";
            return TSOS.Utils.hex2str(temp);
        };
        DeviceDriverFileSystem.prototype.getBlock = function (tsb) {
            return sessionStorage.getItem(tsb);
        };

        DeviceDriverFileSystem.prototype.getMetaData = function (tsb) {
            return this.getBlock(tsb).substring(0, this.metaData);
        };

        DeviceDriverFileSystem.prototype.InUse = function (tsb) {
            return this.getMetaData(tsb).charAt(0) === '1';
        };

        DeviceDriverFileSystem.prototype.getNextTSB = function (tsb) {
            debugger;
            return this.getMetaData(tsb).substring(1, this.metaData);
        };

        DeviceDriverFileSystem.prototype.getDataBytes = function (tsb) {
            return this.getBlock(tsb).substring(this.metaData, this.metaData + this.dataBytes);
        };

        DeviceDriverFileSystem.prototype.getNextAvailbleFileTSB = function () {
            return TSOS.Utils.hex2str(this.getDataBytes("000").substring(0, 6));
        };
        DeviceDriverFileSystem.prototype.getNextAvailbleDataTSB = function () {
            return TSOS.Utils.hex2str(this.getDataBytes("000").substring(6, 12));
        };
        DeviceDriverFileSystem.prototype.setNextAvailbleTSB = function (type) {
            if (type === "file") {
                var startTSB = this.getNextAvailbleFileTSB();
                var tmax = 0;
                var smax = 7;
                var bmax = 7;
            } else if (type === "data") {
                var startTSB = this.getNextAvailbleDataTSB();
                var tmax = 3;
                var smax = 7;
                var bmax = 7;
            }

            //parse the current availbe tsb
            var currt = parseInt(startTSB.charAt(0));
            var currs = parseInt(startTSB.charAt(1));
            var currb = parseInt(startTSB.charAt(2));

            for (var t = currt; t < tmax + 1; t++) {
                for (var s = currs; s < smax + 1; s++) {
                    for (var b = currb; b < bmax + 1; b++) {
                        if ("" + t + "" + s + "" + b !== "000") {
                            if (!this.InUse(t + "" + s + "" + b) && (t + "" + s + "" + b !== currt + "" + currs + "" + currb)) {
                                var newMBRData = sessionStorage.getItem("000");
                                newMBRData = newMBRData.replace(TSOS.Utils.str2hex(startTSB), TSOS.Utils.str2hex(t + "" + s + "" + b));
                                sessionStorage.setItem("000", newMBRData);
                                this.diskFull = false;
                                return;
                            }
                        }
                    }
                }
            }

            for (var t = 0; t < currt; t++) {
                for (var s = 0; s < currs; s++) {
                    for (var b = 0; b < currb; b++) {
                        if ("" + t + "" + s + "" + b !== "000") {
                            if (!this.InUse(t + "" + s + "" + b) && (t + "" + s + "" + b !== currt + "" + currs + "" + currb)) {
                                var newMBRData = sessionStorage.getItem("000");
                                newMBRData = newMBRData.replace(TSOS.Utils.str2hex(startTSB), TSOS.Utils.str2hex(t + "" + s + "" + b));
                                sessionStorage.setItem("000", newMBRData);
                                this.diskFull = false;
                                return;
                            }
                        }
                    }
                }
            }
            if (type === 'data') {
                //if neither prove fruitful make the disk as full
                this.diskFull = true;
            } else if (type === 'file') {
                //fileNames full
                this.fileTFull = true;
            }
        };
        DeviceDriverFileSystem.prototype.fullFormatDisk = function () {
            this.init(true);
        };
        DeviceDriverFileSystem.prototype.quickFormatDisk = function () {
            for (var t = 0; t < this.tracks; t++) {
                for (var s = 0; s < this.sectors; s++) {
                    for (var b = 0; b < this.blocks; b++) {
                        if ("" + t + "" + b + "" + s !== "000") {
                            try  {
                                //set all items except the master boot record as not in use
                                this.markBlockAsAvail(t + "" + s + "" + b);
                            } catch (e) {
                                alert('Quota exceeded!');
                            }
                        }
                    }
                }
            }
        };
        DeviceDriverFileSystem.prototype.markBlockAsAvail = function (tsb) {
            sessionStorage.setItem(tsb, "0" + sessionStorage.getItem(tsb).substring(1));
        };
        DeviceDriverFileSystem.prototype.markBlockAsUnAvail = function (tsb) {
            sessionStorage.setItem(tsb, "1" + sessionStorage.getItem(tsb).substring(1));
        };
        DeviceDriverFileSystem.prototype.deleteFile = function (tsb) {
            //sets file name and all data as available
            var tempTSB = tsb;

            //delete the file name
            this.markBlockAsAvail(tempTSB);

            //delete the data
            this.deleteFileData(tempTSB);

            //remove the last block associate with that file
            this.markBlockAsAvail(tempTSB);
        };
        DeviceDriverFileSystem.prototype.deleteFileData = function (tsb) {
            debugger;

            //skip deleting the file Unreadname
            var tempTSB = this.getNextTSB(tsb);
            while (tempTSB !== "000") {
                this.markBlockAsAvail(tempTSB);
                tempTSB = this.getNextTSB(tempTSB);
            }
        };
        DeviceDriverFileSystem.prototype.findFile = function (name, recover) {
            debugger;
            var hexName = TSOS.Utils.str2hex(name);
            var swapFile1Chr = TSOS.Utils.str2hex(".");
            for (var t = 0; t <= 0; t++) {
                for (var s = 0; s <= 7; s++) {
                    for (var b = 0; b <= 7; b++) {
                        var tempData = this.getDataBytes(t + "" + s + "" + b);
                        if (tempData.substring(0, hexName.length) === hexName) {
                            if (!recover && this.InUse(t + "" + s + "" + b)) {
                                if (tempData.indexOf(swapFile1Chr) === tempData.indexOf(hexName)) {
                                    //scheduler finding a swap file
                                    //TODO
                                } else {
                                    //user creating a file
                                    return t + "" + s + "" + b;
                                }
                            } else {
                                //TODO
                                //recovering file data
                            }
                        }
                    }
                }
            }
            return null;
        };
        DeviceDriverFileSystem.prototype.createFile = function (force, fileName) {
            if (force) {
                //find previous file
                var tsb = this.findFile(fileName, false);

                //delete its data
                this.deleteFileData(tsb);

                //update next available block if disk is full
                if (this.diskFull) {
                    this.setNextAvailbleTSB('data');
                }

                //return true that creation of file was successfull heh
                return true;
            } else {
                debugger;

                //just create the file
                var tsb = this.getNextAvailbleFileTSB();
                var hexName = TSOS.Utils.str2hex(fileName);
                var newData = "";
                var nextTSB;

                //if the name is longet than 60 chars
                /*while(hexName.length >60){
                newData = hexName.substring(0, 60);
                this.setNextAvailbleTSB('file');
                if (this.diskFull){
                //TODO
                //disk file space interrupt error
                }
                
                nextTSB = this.getNextAvailbleFileTSB();
                sessionStorage.setItem(tsb, "1" + nextTSB + newData);
                hexName.replace(newData, '');
                tsb =nextTSB;
                }*/
                this.setNextAvailbleTSB('file');
                newData = hexName + new Array(65 - hexName.length - this.metaData).join("0");
                sessionStorage.setItem(tsb, '1' + "000" + newData);
            }
        };
        DeviceDriverFileSystem.prototype.krnDiskInUse = function (params) {
            debugger;
            var diskAction = params[0];
            var fileName = params[1];
            var data = params[2];
            DISK_IN_USE = true;
            switch (diskAction) {
                case 6 /* FullFormat */: {
                    this.fullFormatDisk();
                    _FileNames = new TSOS.Queue();
                    _Trash = new TSOS.Queue();
                    break;
                }
                case 7 /* QuickFormat */: {
                    this.quickFormatDisk();
                    _Trash = _FileNames;
                    _FileNames = new TSOS.Queue();
                    break;
                }
                case 0 /* Create */: {
                    if (this.fileTFull === false)
                        this.createFile(false, fileName);
                    else {
                        _StdOut.advanceLine();
                        _StdOut.putText("File name track full, please empty trash.");
                    }
                    break;
                }
                case 1 /* CreateForce */: {
                    this.createFile(true, fileName);
                    break;
                }
                case 4 /* Delete */: {
                    this.deleteFile(this.findFile(fileName, false));
                    _Trash.enqueue(fileName);
                    _FileNames.getAndRemove(fileName);
                    break;
                }
                case 5 /* DeleteAll */: {
                    _Trash = _FileNames;
                    _FileNames = new TSOS.Queue();
                    break;
                }
                case 3 /* Write */: {
                    //TODO
                    if (this.fileTFull === false) {
                        //this.writeFile(false, fileName, data);
                    } else {
                        _StdOut.advanceLine();
                        _StdOut.putText("File name track full, please empty trash.");
                    }
                    break;
                }
            }

            DISK_IN_USE = false;
            TSOS.Control.updateFileSystemDisplay();
        };
        return DeviceDriverFileSystem;
    })(TSOS.DeviceDriver);
    TSOS.DeviceDriverFileSystem = DeviceDriverFileSystem;
})(TSOS || (TSOS = {}));
