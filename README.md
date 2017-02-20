# What is for ?
automate add client side sorting table function to your web page.
of cause you can customize for your needs.

# How to use it ?
simple. add two lines of code to your web page. to be aware that *sortingtables.automatic.js* should be in the bottom of inside **body** tag.
```html
<script type="text/javascript" src="https://bosxixi.com/cdn/sortingtables-1.0.0.js"></script>
<script type="text/javascript" src="https://bosxixi.com/cdn/sortingtables.automatic-1.0.0.js"></script>
```

# How to customize for your needs ?

### about comparer values

the row comparer current support for string and number compare. 
when your value is Date or TimeSpan datatype. please put the Date's Unix Time Milliseconds/Ticks to row's td tag's custom attribute called *data-value* like below
, the data-value has higher priority than td tag's textContent.

*Example:*

```html
<td class="right" data-value="1485682553280">Jan 29</td>
```


### about SortingTableOptions Object.

excludeColumns/includeColumns:

> you can implement your own row comparer.
> specify what columns you want to exclude/include.
> if both exclude & include are specify, include rules.


```typescript
class SortingTableOptions {
    public readonly excludeColumns: string[];
    public readonly includeColumns: string[];
    public readonly descending: HTMLSpanElement;
    public readonly ascending: HTMLSpanElement;
    public comparer: SortingComparer<ComparableRow>;
}
```

ascending:

> if not supply for this argument bootstrap span is apply.

```html
<span class="glyphicon glyphicon-triangle-top"></span>
```

descending:

> if not supply for this argument bootstrap span is apply.

```html
<span class="glyphicon glyphicon-triangle-bottom"></span>
```
