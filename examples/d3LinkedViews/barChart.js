// An adaptation of the [D3 bar chart example](http://bl.ocks.org/mbostock/3885304)
// that uses `model.js`. This version, unlike the original example,
// is model driven and reactive. When a part of the model updates,
// only the parts of the visualization that depend on those parts
// of the model are updated. There are no redundant calls to visualization
// update code when multiple properties are changed simultaneously.
//
// Define the bar chart AMD module using the
// `define()` function provided by Require.js.
define(['d3', 'model'], function (d3, Model) {
  return function BarChart(div){
    var x = d3.scale.ordinal(),
        y = d3.scale.linear(),
        xAxis = d3.svg.axis().scale(x).orient('bottom'),
        yAxis = d3.svg.axis().scale(y).orient('left'),

        // Use absolute positioning so that CSS can be used
        // to position the div according to the model.
        svg = d3.select(div).append('svg').style('position', 'absolute'),
        g = svg.append('g'),
        xAxisG = g.append('g').attr('class', 'x axis'),
        yAxisG = g.append('g').attr('class', 'y axis'),
        yAxisLabel = yAxisG.append('text')
          .attr('transform', 'rotate(-90)')
          .attr('y', 6)
          .attr('dy', '.71em')
          .style('text-anchor', 'end'),
        model = Model();


    model.when('yLabel', yAxisLabel.text, yAxisLabel);

    model.when('margin', function (margin) {
      g.attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');
    });

    model.when('box', function (box) {
      svg.attr('width', box.width)
         .attr('height', box.height);

      // Set the CSS `left` and `top` properties
      // to move the SVG element to `(box.x, box.y)`
      // relative to the container div.
      svg
        .style('left', box.x + 'px')
        .style('top', box.y + 'px');
    });

    model.when(['box', 'margin'], function (box, margin) {
      model.width = box.width - margin.left - margin.right;
      model.height = box.height - margin.top - margin.bottom;
    });

    model.when('height', function (height) {
      xAxisG.attr('transform', 'translate(0,' + height + ')');
    });

    model.when(['width', 'height', 'data', 'barField', 'heightField'], function (width, height, data, barField, heightField) {
      var bars;

      x.domain(data.map(function(d) { return d[barField]; }));
      y.domain([0, d3.max(data, function(d) { return d[heightField]; })]);
      x.rangeRoundBands([0, width], .1);
      y.range([height, 0]);

      xAxisG.call(xAxis);
      yAxisG.call(yAxis);

      bars = g.selectAll('.bar').data(data);
      bars.enter().append('rect').attr('class', 'bar');
      bars.attr('x', function(d) { return x(d[barField]); })
          .attr('width', x.rangeBand())
          .attr('y', function(d) { return y(d[heightField]); })
          .attr('height', function(d) { return height - y(d[heightField]); });
      bars.exit().remove();
    });
    return model;
  }
});
