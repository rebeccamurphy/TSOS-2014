/* ------------
Queue.ts
A simple Queue, which is really just a dressed-up JavaScript Array.
See the Javascript Array documentation at
https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array
Look at the push and shift methods, as they are the least obvious here.
------------ */
var TSOS;
(function (TSOS) {
    var Queue = (function () {
        function Queue(q, ordered) {
            if (typeof q === "undefined") { q = new Array(); }
            if (typeof ordered === "undefined") { ordered = false; }
            this.q = q;
            this.ordered = ordered;
        }
        Queue.prototype.getSize = function () {
            return this.q.length;
        };

        Queue.prototype.isEmpty = function () {
            return (this.q.length == 0);
        };

        Queue.prototype.isOrdered = function () {
            return this.ordered;
        };

        Queue.prototype.enqueue = function (element) {
            this.q.push(element);
        };

        Queue.prototype.dequeue = function () {
            var retVal = null;
            if (this.q.length > 0) {
                retVal = this.q.shift();
            }
            return retVal;
        };

        Queue.prototype.get = function (i) {
            //gets pcb
            return this.q[i];
        };
        Queue.prototype.inQueue = function (pid) {
            for (var i = 0; i < this.q.length; i++) {
                if (this.q[i].pid === pid) {
                    return true;
                }
            }
            return false;
        };
        Queue.prototype.find = function (pid) {
            //returns pcb and removes it from the queue
            var retVal = null;
            for (var i = 0; i < this.q.length; i++) {
                if (this.q[i].pid === pid) {
                    retVal = this.q[i];
                    if (i > -1)
                        this.q.splice(i, 1);
                    return retVal;
                }
            }
        };
        Queue.prototype.priorityOrder = function () {
            this.q.sort(this.comparePriority);
            this.ordered = true;
        };
        Queue.prototype.order = function () {
            this.q.sort(this.compare);
            this.ordered = true;
        };
        Queue.prototype.compare = function (a, b) {
            if (a.pid < b.pid)
                return -1;
            if (a.pid > b.pid)
                return 1;
            return 0;
        };
        Queue.prototype.comparePriority = function (a, b) {
            if (a.priority < b.priority)
                return -1;
            if (a.priority > b.priority)
                return 1;
            return 0;
        };
        Queue.prototype.toString = function () {
            var retVal = "";
            for (var i in this.q) {
                retVal += "[" + this.q[i] + "] ";
            }
            return retVal;
        };
        return Queue;
    })();
    TSOS.Queue = Queue;
})(TSOS || (TSOS = {}));
