class ComparableRow {
    public readonly key: string;
    public readonly element: Element;
    constructor(key: string, element: Element) {
        this.key = key;
        this.element = element;
    }
}

interface SortingComparer<T> {
    Ascending(a: T, b: T): number;
    Descending(a: T, b: T): number;
}
enum OrderBy {
    Ascending,
    Descending,
}
class RowComparer implements SortingComparer<ComparableRow> {
    public Descending(a: ComparableRow, b: ComparableRow): number {
        let aNumber = Number(a.key);
        let bNumber = Number(b.key);

        if (!isNaN(aNumber) && !isNaN(bNumber)) {
            return aNumber - bNumber;
        }
        else {
            return a.key.toLowerCase().localeCompare(b.key.toLowerCase());
        }
    }

    public Ascending(a: ComparableRow, b: ComparableRow): number {
        let aNumber = Number(a.key);
        let bNumber = Number(b.key);
        if (!isNaN(aNumber) && !isNaN(bNumber)) {
            return bNumber - aNumber;
        }
        else {
            return b.key.toLowerCase().localeCompare(a.key.toLowerCase());
        }
    }
}
class SortingTableOptions {
    public readonly excludeColumns: string[];
    public readonly includeColumns: string[];
    public readonly descending: HTMLSpanElement;
    public readonly ascending: HTMLSpanElement;
    public comparer: SortingComparer<ComparableRow>;
    constructor(comparer: SortingComparer<ComparableRow>, excludeColumns?: string[], includeColums?: string[], descending?: HTMLSpanElement, ascending?: HTMLSpanElement) {
        if (excludeColumns != null && includeColums != null) {
            console.log("warning: setting both excludeColumns and includeColumns.")
        }
        if (descending == null) {
            var span = document.createElement("span");
            span.className = "glyphicon glyphicon-triangle-top";
            this.descending = span;
        } else {
            this.descending = descending;
        }
        if (ascending == null) {
            var span = document.createElement("span");
            span.className = "glyphicon glyphicon-triangle-bottom";
            this.ascending = span;
        } else {
            this.ascending = ascending;
        }
        this.excludeColumns = excludeColumns;
        this.includeColumns = includeColums;
        this.comparer = comparer;
    }
}
class SortingTable {
    readonly options: SortingTableOptions;
    readonly table: HTMLElement;
    readonly tbody: HTMLElement;
    readonly thead: Element;
    readonly headColumnNames: string[];
    readonly rows: Element[];
    readonly rowsBeginIndex: number;
    readonly hasThead: boolean;
    private orderedRows: Element[];
    constructor(table: HTMLElement, options: SortingTableOptions) {
        this.options = options;
        this.table = table;
        this.tbody = table.querySelector("tbody");
        let thead = table.querySelector("thead");
        if (thead == null) {
            this.thead = this.tbody.children.item(0);
            this.rowsBeginIndex = 1;
        } else {
            throw new TypeError("FATAL: do not support thead tag table.")
        }
        this.headColumnNames = this.getHeaderColumns();
        this.rows = this.getRows();
        this.addHeadColumnNamesToEachRow();
        this.bindThead();

    }
    private bindThead() {
        var ths = this.thead.children;
        for (var i = 0; i < ths.length; i++) {
            let column = ths[i];
            // do not bind for empty column
            if (column.textContent == "") {
                continue;
            }
            // checking excludeList
            if (this.options.excludeColumns != null && this.options.excludeColumns.indexOf(column.textContent.trim()) != -1) {
                continue;
            }

            // checking includeList
            if (this.options.includeColumns != null) {
                if (this.options.includeColumns.indexOf(column.textContent.trim()) != -1) {
                    this.setStyleAddEventListener(column);
                }
            } else {
                this.setStyleAddEventListener(column);
            }

        }
    }

    private setStyleAddEventListener(column: Element) {
        column.setAttribute("style", "cursor: pointer;");
        column.addEventListener("click", (e: Event) => {
            let ct = <Element>e.currentTarget;
            let columnName = ct.textContent.trim();
            this.toggleSorting(columnName);
        }, false);
    }

    private removeOrderingSapn(column: Element) {
        for (let i = 0; i < column.children.length; i++) {
            column.removeChild(column.children.item(i));
        }
    }
    private addElementToTheadColumn(column: Element, orderBy: OrderBy) {
        this.removeOrderingSapn(column);

        if (orderBy == OrderBy.Ascending) {
            column.appendChild(this.options.ascending);
        } else {
            column.appendChild(this.options.descending);
        }
    }
    private toggleSorting(columnName: string) {
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
            } else {
                column.removeAttribute("data-orderby");
                this.removeOrderingSapn(column);
            }
        }
    }
    public orderBy(columnName: string, orderBy: OrderBy) {
        var orderedRows = this.getOrderedRows(columnName, orderBy);
        this.tbody.innerHTML = "";
        this.tbody.appendChild(this.thead);
        for (var i = 0; i < orderedRows.length; i++) {
            this.tbody.appendChild(orderedRows[i]);
        }
    }

    private getOrderedRows(columnName: string, orderBy: OrderBy = OrderBy.Descending): Element[] {
        let orderedRows: Element[] = [];
        var unordered = this.getComparableRows(columnName);
        if (orderBy == OrderBy.Descending) {
            unordered.sort(this.options.comparer.Descending).forEach((row: ComparableRow) => {
                orderedRows.push(row.element);
            });
        }
        else {
            unordered.sort(this.options.comparer.Ascending).forEach((row: ComparableRow) => {
                orderedRows.push(row.element);
            });
        }
        return orderedRows;
    }
    private getComparableRows(columnName: string): ComparableRow[] {
        var map: ComparableRow[] = [];
        for (var i = 0; i < this.rows.length; i++) {
            var value = this.getSingleRowValue(this.rows[i], columnName);
            map.push(new ComparableRow(value, this.rows[i]));
        }
        return map;
    }
    private getSingleRowValue(row: Element, columnName: string): string {
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
    }
    private addHeadColumnNamesToEachRow() {
        for (var i = 0; i < this.rows.length; i++) {
            var row = this.rows[i];
            var rowChilds = row.children;
            for (var j = 0; j < rowChilds.length; j++) {
                var column = rowChilds[j];
                column.setAttribute("data-columnName", this.headColumnNames[j]);
            }
        }
    }
    private getRows(): Element[] {
        var allRowsIncludingHead = this.tbody.children;
        let elements: Element[] = [];
        for (var i = this.rowsBeginIndex; i < allRowsIncludingHead.length; i++) {
            let e = allRowsIncludingHead.item(i);
            elements.push(e);
        }
        return elements;
    }
    private getHeaderColumns(): string[] {
        let first = this.thead.children;
        var headerColumns: string[] = [];
        for (var i = 0; i < first.length; i++) {
            let e = first.item(i);
            headerColumns.push(e.textContent.trim());
        }
        return headerColumns;
    }
}


