var margin = {top: 30, right: 50, bottom: 40, left:40};
var width = 960 - margin.left - margin.right;
var height = 500 - margin.top - margin.bottom;

var svg = d3.select('#chart-area-6')
    .append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
    .append('g')
    .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

var xScale = d3.scaleLinear()
    .range([0, width]);

var yScale = d3.scaleLinear()
    .range([height, 0]);

//Define line generator
//var line = d3.line()
//    .x(function(d) { return xScale(d.date); })
//    .y(function(d) { return yScale(d.average); });
