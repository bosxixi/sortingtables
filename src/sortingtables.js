var ComparableRow = (function () {
    function ComparableRow(key, element) {
        this.key = key;
        this.element = element;
    }
    return ComparableRow;
}());
var OrderBy;
(function (OrderBy) {
    OrderBy[OrderBy["Ascending"] = 0] = "Ascending";
    OrderBy[OrderBy["Descending"] = 1] = "Descending";
})(OrderBy || (OrderBy = {}));
var RowComparer = (function () {
    function RowComparer() {
    }
    RowComparer.prototype.Descending = function (a, b) {
        var aNumber = Number(a.key);
        var bNumber = Number(b.key);
        if (!isNaN(aNumber) && !isNaN(bNumber)) {
            return aNumber - bNumber;
        }
        else {
            return a.key.toLowerCase().localeCompare(b.key.toLowerCase());
        }
    };
    RowComparer.prototype.Ascending = function (a, b) {
        var aNumber = Number(a.key);
        var bNumber = Number(b.key);
        if (!isNaN(aNumber) && !isNaN(bNumber)) {
            return bNumber - aNumber;
        }
        else {
            return b.key.toLowerCase().localeCompare(a.key.toLowerCase());
        }
    };
    return RowComparer;
}());
var SortingTable = (function () {
    function SortingTable(tbody, comparer) {
        this.comparer = comparer;
        this.tbody = tbody;
        this.thead = this.tbody.children.item(0);
        this.headColumnNames = this.getHeaderColumns();
        this.rows = this.getRows();
        this.addHeadColumnNamesToEachRow();
        this.addCursorStyleTheadColumn();
        this.bindThead();
    }
    SortingTable.prototype.bindThead = function () {
        var _this = this;
        var ths = this.thead.children;
        for (var i = 0; i < ths.length; i++) {
            if (ths[i].textContent == "") {
                continue;
            }
            ths[i].addEventListener("click", function (e) {
                var et = e.currentTarget;
                var columnName = et.textContent.trim();
                _this.toggleSorting(columnName);
            }, false);
        }
    };
    SortingTable.prototype.removeOrderingSapn = function (column) {
        for (var i_1 = 0; i_1 < column.children.length; i_1++) {
            column.removeChild(column.children.item(i_1));
        }
    };
    SortingTable.prototype.addCursorStyleTheadColumn = function () {
        var ths = this.thead.children;
        for (var i = 0; i < ths.length; i++) {
            var column = ths[i];
            if (column.textContent == "") {
                continue;
            }
            column.setAttribute("style", "cursor: pointer;");
        }
    };
    SortingTable.prototype.addElementToTheadColumn = function (column, orderBy) {
        this.removeOrderingSapn(column);
        var span = document.createElement("span");
        if (orderBy == OrderBy.Ascending) {
            span.className = "glyphicon glyphicon-triangle-top";
            column.appendChild(span);
        }
        else {
            span.className = "glyphicon glyphicon-triangle-bottom";
            column.appendChild(span);
        }
    };
    SortingTable.prototype.toggleSorting = function (columnName) {
        var ths = this.thead.children;
        for (var i = 0; i < ths.length; i++) {
            var column = ths[i];
            if (column.textContent.trim() === columnName) {
                var orderby = column.getAttribute("data-orderby");
                if (orderby == OrderBy.Ascending.toString()) {
                    column.setAttribute("data-orderby", OrderBy.Descending.toString());
                    this.addElementToTheadColumn(column, OrderBy.Descending);
                    this.orderBy(columnName, OrderBy.Descending);
                }
                else {
                    column.setAttribute("data-orderby", OrderBy.Ascending.toString());
                    this.addElementToTheadColumn(column, OrderBy.Ascending);
                    this.orderBy(columnName, OrderBy.Ascending);
                }
            }
            else {
                column.removeAttribute("data-orderby");
                this.removeOrderingSapn(column);
            }
        }
    };
    SortingTable.prototype.orderBy = function (columnName, orderBy) {
        var orderedRows = this.getOrderedRows(columnName, orderBy);
        this.tbody.innerHTML = "";
        this.tbody.appendChild(this.thead);
        for (var i = 0; i < orderedRows.length; i++) {
            this.tbody.appendChild(orderedRows[i]);
        }
    };
    SortingTable.prototype.getOrderedRows = function (columnName, orderBy) {
        if (orderBy === void 0) { orderBy = OrderBy.Descending; }
        var orderedRows = [];
        var unordered = this.getComparableRows(columnName);
        if (orderBy == OrderBy.Descending) {
            unordered.sort(this.comparer.Descending).forEach(function (row) {
                orderedRows.push(row.element);
            });
        }
        else {
            unordered.sort(this.comparer.Ascending).forEach(function (row) {
                orderedRows.push(row.element);
            });
        }
        return orderedRows;
    };
    SortingTable.prototype.getComparableRows = function (columnName) {
        var map = [];
        for (var i = 0; i < this.rows.length; i++) {
            var value = this.getSingleRowValue(this.rows[i], columnName);
            map.push(new ComparableRow(value, this.rows[i]));
        }
        return map;
    };
    SortingTable.prototype.getSingleRowValue = function (row, columnName) {
        var columns = row.children;
        for (var i = 0; i < columns.length; i++) {
            var column = columns[i];
            if (column.getAttribute("data-columnName") === columnName) {
                return column.textContent.trim();
            }
        }
    };
    SortingTable.prototype.addHeadColumnNamesToEachRow = function () {
        for (var i = 0; i < this.rows.length; i++) {
            var row = this.rows[i];
            var rowChilds = row.children;
            for (var j = 0; j < rowChilds.length; j++) {
                var column = rowChilds[j];
                column.setAttribute("data-columnName", this.headColumnNames[j]);
            }
        }
    };
    SortingTable.prototype.getRows = function () {
        var allRowsIncludingHead = this.tbody.children;
        var elements = [];
        for (var i = 1; i < allRowsIncludingHead.length; i++) {
            var e = allRowsIncludingHead.item(i);
            elements.push(e);
        }
        return elements;
    };
    SortingTable.prototype.getHeaderColumns = function () {
        var first = this.thead.children;
        var headerColumns = [];
        for (var i = 0; i < first.length; i++) {
            var e = first.item(i);
            headerColumns.push(e.textContent.trim());
        }
        return headerColumns;
    };
    return SortingTable;
}());
var tbodys = document.getElementsByTagName("tbody");
for (var i = 0; i < tbodys.length; i++) {
    var st = new SortingTable(tbodys.item(i), new RowComparer());
}
//# sourceMappingURL=sortingtables.js.map