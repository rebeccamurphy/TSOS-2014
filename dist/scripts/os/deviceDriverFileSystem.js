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
            _super.call(this, this.krnFileSystemDriverEntry, this.krnDiskInUse);
        }
        DeviceDriverFileSystem.prototype.krnFileSystemDriverEntry = function () {
            // Initialization routine for this, the kernel-mode Keyboard Device Driver.
            this.status = "File System Loaded";

            // More?
            this.init(false);
        };

        DeviceDriverFileSystem.prototype.init = function (format) {
            if ((sessionStorage.length === 0 && !format) || format) {
                //set the master boot record
                sessionStorage.setItem("000", "1---" + "001" + new Array(57).join('0'));
                for (var t = 0; t < this.tracks; t++) {
                    for (var s = 0; s < this.sectors; s++) {
                        for (var b = 0; b < this.blocks; b++) {
                            if ("" + t + "" + b + "" + s !== "000") {
                                try  {
                                    sessionStorage.setItem(t + "" + s + "" + b, new Array(this.dataBytes + this.metaData).join('0'));
                                } catch (e) {
                                    alert('Quota exceeded!');
                                }
                            }
                        }
                    }
                }
            }
        };

        DeviceDriverFileSystem.prototype.getBlock = function (tsb) {
            return sessionStorage.getItem(tsb);
        };

        DeviceDriverFileSystem.prototype.getMetaData = function (tsb) {
            return this.getBlock(tsb).substring(0, this.metaData);
        };

        DeviceDriverFileSystem.prototype.checkInUse = function (tsb) {
            return this.getMetaData(tsb).charAt(0) === '1';
        };

        DeviceDriverFileSystem.prototype.getNextTSB = function (tsb) {
            return this.getMetaData(tsb).substring(1, this.metaData);
        };

        DeviceDriverFileSystem.prototype.getDataBytes = function (tsb) {
            return this.getBlock(tsb).substring(this.metaData, this.metaData + this.dataBytes);
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
                                sessionStorage.setItem(t + "" + s + "" + b, "0" + sessionStorage.getItem(t + "" + s + "" + b).substring(1));
                            } catch (e) {
                                alert('Quota exceeded!');
                            }
                        }
                    }
                }
            }
        };
        DeviceDriverFileSystem.prototype.krnDiskInUse = function (diskAction, data) {
            DISK_IN_USE = true;
            switch (diskAction) {
                case 4 /* FullFormat */: {
                    this.fullFormatDisk();
                    break;
                }
                case 5 /* QuickFormat */: {
                    this.quickFormatDisk();
                    break;
                }
            }

            DISK_IN_USE = false;
        };
        return DeviceDriverFileSystem;
    })(TSOS.DeviceDriver);
    TSOS.DeviceDriverFileSystem = DeviceDriverFileSystem;
})(TSOS || (TSOS = {}));
