
let rowComparer = new RowComparer();
let options = new SortingTableOptions(rowComparer, null, null);
var tbodys = document.getElementsByTagName("tbody");
for (var i = 0; i < tbodys.length; i++) {
    var st = new SortingTable(tbodys.item(i), options);
}