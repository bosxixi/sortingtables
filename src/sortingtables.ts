class ComparableRow {
    public readonly key: string;
    public readonly element: Element;
    constructor(key: string, element: Element) {
        this.key = key;
        this.element = element;
    }
}

interface ValueComparer<T> {
    Ascending(a: T, b: T): number;
    Descending(a: T, b: T): number;
}
enum OrderBy {
    Ascending,
    Descending,
}
class RowComparer implements ValueComparer<ComparableRow> {
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
class SortingTable {
    public comparer: ValueComparer<ComparableRow>;
    readonly tbody: HTMLElement;
    readonly thead: Element;
    readonly headColumnNames: string[];
    readonly rows: Element[];
    private orderedRows: Element[];
    private comparableRows: ComparableRow[];
    constructor(tbody: HTMLElement, comparer: ValueComparer<ComparableRow>) {
        this.comparer = comparer;
        this.tbody = tbody;
        this.thead = this.tbody.children.item(0);
        this.headColumnNames = this.getHeaderColumns();
        this.rows = this.getRows();
        this.addHeadColumnNamesToEachRow();
        this.bindThead();

    }
    private bindThead() {
        var ths = this.thead.children;
        for (var i = 0; i < ths.length; i++) {
            // do not bind for empty column
            if (ths[i].textContent == "") {
                continue;
            }
            ths[i].addEventListener("click", (e: Event) => {
                let et = <Element>e.currentTarget;
                let columnName = et.textContent.trim();
                this.toggleSorting(columnName);
            }, false);
        }
    }
    private removeOrderingSapn(column: Element) {
        for (let i = 0; i < column.children.length; i++) {
            column.removeChild(column.children.item(i));
        }
    }
    private addElementToTheadColumn(column: Element, orderBy: OrderBy) {
        this.removeOrderingSapn(column);
        var span = document.createElement("span");
        if (orderBy == OrderBy.Ascending) {
            span.className = "glyphicon glyphicon-triangle-top";
            column.appendChild(span);
        } else {
            span.className = "glyphicon glyphicon-triangle-bottom";
            column.appendChild(span);
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
            unordered.sort(this.comparer.Descending).forEach(function (row: ComparableRow) {
                orderedRows.push(row.element);
            });
        }
        else {
            unordered.sort(this.comparer.Ascending).forEach(function (row: ComparableRow) {
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
        for (var i = 1; i < allRowsIncludingHead.length; i++) {
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

var tbodys = document.getElementsByTagName("tbody");
for (var i = 0; i < tbodys.length; i++) {
    var st = new SortingTable(tbodys.item(i), new RowComparer());
}

