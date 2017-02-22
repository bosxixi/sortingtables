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
var SortingTableOptions = (function () {
    function SortingTableOptions(comparer, excludeColumns, includeColums, descending, ascending) {
        if (excludeColumns != null && includeColums != null) {
            console.log("warning: setting both excludeColumns and includeColumns.");
        }
        if (descending == null) {
            var span = document.createElement("span");
            span.className = "glyphicon glyphicon-triangle-top";
            this.descending = span;
        }
        else {
            this.descending = descending;
        }
        if (ascending == null) {
            var span = document.createElement("span");
            span.className = "glyphicon glyphicon-triangle-bottom";
            this.ascending = span;
        }
        else {
            this.ascending = ascending;
        }
        this.excludeColumns = excludeColumns;
        this.includeColumns = includeColums;
        this.comparer = comparer;
    }
    return SortingTableOptions;
}());
var SortingTable = (function () {
    function SortingTable(table, options) {
        this.rowsBeginIndex = 1;
        if (table.getAttribute("data-ignore") != "true") {
            this.options = options;
            this.table = table;
            this.tbody = table.querySelector("tbody");
            var thead = table.querySelector("thead");
            if (thead == null) {
                this.hasThead = false;
                this.theadEmulate = this.tbody.children.item(0);
            }
            else {
                this.removeTheadTagFromTable();
                this.theadEmulate = this.tbody.children.item(0);
            }
            this.headColumnNames = this.getHeaderColumns();
            this.rows = this.getRows();
            this.addHeadColumnNamesToEachRow();
            this.bindThead();
        }
    }
    SortingTable.prototype.removeTheadTagFromTable = function () {
        this.hasThead = true;
        var theThead = this.table.children.item(0);
        this.theadClone = theThead.cloneNode();
        var theTheadTrClone = theThead.children.item(0).cloneNode(true);
        this.table.removeChild(theThead);
        this.table.children.item(0).insertBefore(theTheadTrClone, this.table.children.item(0).children.item(0));
    };
    SortingTable.prototype.bindThead = function () {
        var ths = this.theadEmulate.children;
        for (var i = 0; i < ths.length; i++) {
            var column = ths[i];
            if (column.textContent == "") {
                continue;
            }
            if (this.options.excludeColumns != null && this.options.excludeColumns.indexOf(column.textContent.trim()) != -1) {
                continue;
            }
            if (this.options.includeColumns != null) {
                if (this.options.includeColumns.indexOf(column.textContent.trim()) != -1) {
                    this.setStyleAddEventListener(column);
                }
            }
            else {
                this.setStyleAddEventListener(column);
            }
        }
    };
    SortingTable.prototype.bringBackTheadToTable = function () {
        this.theadClone.appendChild(this.tbody.children.item(0));
        this.table.insertBefore(this.theadClone, this.table.children.item(0));
    };
    SortingTable.prototype.setStyleAddEventListener = function (column) {
        var _this = this;
        column.setAttribute("style", "cursor: pointer;");
        column.addEventListener("click", function (e) {
            var ct = e.currentTarget;
            var columnName = ct.textContent.trim();
            _this.toggleSorting(columnName);
        }, false);
    };
    SortingTable.prototype.removeOrderingSapn = function (column) {
        for (var i_1 = 0; i_1 < column.children.length; i_1++) {
            column.removeChild(column.children.item(i_1));
        }
    };
    SortingTable.prototype.addElementToTheadColumn = function (column, orderBy) {
        this.removeOrderingSapn(column);
        if (orderBy == OrderBy.Ascending) {
            column.appendChild(this.options.ascending);
        }
        else {
            column.appendChild(this.options.descending);
        }
    };
    SortingTable.prototype.toggleSorting = function (columnName) {
        var ths = this.theadEmulate.children;
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
        this.tbody.appendChild(this.theadEmulate);
        for (var i = 0; i < orderedRows.length; i++) {
            this.tbody.appendChild(orderedRows[i]);
        }
        if (this.hasThead) {
            this.bringBackTheadToTable();
        }
    };
    SortingTable.prototype.getOrderedRows = function (columnName, orderBy) {
        if (orderBy === void 0) { orderBy = OrderBy.Descending; }
        var orderedRows = [];
        var unordered = this.getComparableRows(columnName);
        if (orderBy == OrderBy.Descending) {
            unordered.sort(this.options.comparer.Descending).forEach(function (row) {
                orderedRows.push(row.element);
            });
        }
        else {
            unordered.sort(this.options.comparer.Ascending).forEach(function (row) {
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
                if (column.getAttribute("data-value") != null) {
                    return column.getAttribute("data-value");
                }
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
        for (var i = this.rowsBeginIndex; i < allRowsIncludingHead.length; i++) {
            var e = allRowsIncludingHead.item(i);
            elements.push(e);
        }
        return elements;
    };
    SortingTable.prototype.getHeaderColumns = function () {
        var first = this.theadEmulate.children;
        var headerColumns = [];
        for (var i = 0; i < first.length; i++) {
            var e = first.item(i);
            headerColumns.push(e.textContent.trim());
        }
        return headerColumns;
    };
    return SortingTable;
}());
//# sourceMappingURL=sortingtables.js.map