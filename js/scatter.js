ScatterPlot = function(_parentElement, _data) {
    this.parentElement = _parentElement;
    this.data = _data;
    this.filteredData = this.data;
    this.selectedGender = 'Male';
    this.selectedYear = 2000;
    this.textFriendlyGenders = {
        Male: 'men',
        Female: 'women',
    };
    this.initVis();
};

ScatterPlot.prototype.initVis = function() {
    let vis = this;

    vis.margin = {top: 30, right: 0, bottom: 40, left: 50};
    const boundingBox = d3.select(vis.parentElement).node().getBoundingClientRect();

    vis.width = boundingBox.width - vis.margin.left - vis.margin.right;
    vis.height = vis.width*3/4 - vis.margin.top - vis.margin.bottom;

    vis.svg = d3.select(vis.parentElement).append('svg')
        .attr("width", vis.width + vis.margin.left + vis.margin.right)
        .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
        .append("g")
        .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");

// The API for scales have changed in v4. There is a separate module d3-scale which can be used instead. The main change here is instead of d3.scale.linear, we have d3.scaleLinear.
    vis.xScale = d3.scaleLinear()
        .range([0, vis.width]);

    vis.yScale = d3.scaleLinear()
        .range([vis.height, 0]);

// square root scale.
    vis.radius = d3.scaleSqrt()
        .range([2, 10]);

// the axes are much cleaner and easier now. No need to rotate and orient the axis, just call axisBottom, axisLeft etc.
    vis.xAxis = d3.axisBottom()
        .scale(vis.xScale);

    // adding axes is also simpler now, just translate x-axis to (0,height) and it's already defined to be a bottom axis.
    vis.xAxisElement = vis.svg.append('g')
        .attr('transform', 'translate(0,' + vis.height + ')')
        .attr('class', 'x-axis');

    vis.xAxisLabel = vis.svg.append('text')
        .attr('x', vis.width)
        .attr('y', vis.height - 10)
        .attr('text-anchor', 'end')
        .attr('class', 'label')
        .text('Blood pressure');

    vis.yAxis = d3.axisLeft()
        .scale(vis.yScale);

    vis.yAxisElement = vis.svg.append('g')
        .attr('class', 'y-axis');

    vis.yAxisLabel = vis.svg.append('text')
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", ".71em")
        .style("text-anchor", "end")
        .attr('class', 'label')
        .text('Disability adjusted life years from Cardiovascular Disease');

    vis.continentColor = d3.scaleOrdinal()
        .range(['#e41a1c', '#ff7f00', '#4daf4a', '#377eb8', '#984ea3'])
        .domain(['Asia', 'Americas', 'Africa', 'Europe', 'Oceania']);


    vis.filterData();
};

ScatterPlot.prototype.filterData = function() {
    let vis = this;
    vis.filteredData = vis.data.filter(d => d.gender === vis.selectedGender && d.year === vis.selectedYear);
    vis.updateVis();
};

ScatterPlot.prototype.updateVis = function() {
    let vis = this;

    vis.xScale.domain(d3.extent(vis.filteredData, d => d.bloodPressure)).nice();
    vis.yScale.domain(d3.extent(vis.filteredData, d => d.CVD)).nice();
    vis.radius.domain(d3.extent(vis.filteredData, d => d.population)).nice();
    vis.yAxisElement.transition()
        .call(vis.xAxis);
    vis.yAxisElement.transition()
        .call(vis.yAxis);

    let bubbles = vis.svg.selectAll('.bubble')
        .data(vis.filteredData);

    bubbles.enter().append('circle')
            .classed('bubble', true)
            .attr('fill', d => vis.continentColor(d.region))
        .merge(bubbles).transition()
            .attr('cx', d => vis.xScale(d.bloodPressure))
            .attr('cy', d => vis.yScale(d.CVD))
            .attr('r', d => vis.radius(d.population));
    bubbles.exit().transition().remove();

    const cvdIncreaseValue = vis.calcLinear();
    const cvdIncreaseText = "For "+ vis.textFriendlyGenders[vis.selectedGender] + "in " + vis.selectedYear + ", every 1 mmHg increase in systolic blood pressure was associated with a " + cvdIncreaseValue + " unit increase in CVD DALYs*";

    d3.select('#cvd-increase-text').text(cvdIncreaseText);
};

ScatterPlot.prototype.calcLinear = function(){
    /////////
    //SLOPE//
    /////////

    let vis = this;
    const x = "bloodPressure",
          y = "CVD";
          // minX = d3.min(vis.filteredData,d => d.bloodPressure),
          // minY = d3.min(vis.filteredData, d => d.CVD);
    
    
    // Let n = the number of data points
    var n = vis.filteredData.length;

    // Get just the points
    var pts = [];
    vis.filteredData.forEach(function(d,i){
        var obj = {};
        obj.x = d[x];
        obj.y = d[y];
        obj.mult = obj.x*obj.y;
        pts.push(obj);
    });

    // Let a equal n times the summation of all x-values multiplied by their corresponding y-values
    // Let b equal the sum of all x-values times the sum of all y-values
    // Let c equal n times the sum of all squared x-values
    // Let d equal the squared sum of all x-values
    var sum = 0;
    var xSum = 0;
    var ySum = 0;
    var sumSq = 0;
    pts.forEach(function(pt){
        sum = sum + pt.mult;
        xSum = xSum + pt.x;
        ySum = ySum + pt.y;
        sumSq = sumSq + (pt.x * pt.x);
    });
    var a = sum * n;
    var b = xSum * ySum;
    var c = sumSq * n;
    var d = xSum * xSum;

    // Plug the values that you calculated for a, b, c, and d into the following equation to calculate the slope
    // slope = m = (a - b) / (c - d)
    var m = (a - b) / (c - d);

    /////////////
    //INTERCEPT//
    /////////////

    // Let e equal the sum of all y-values
    var e = ySum;

    // Let f equal the slope times the sum of all x-values
    var f = m * xSum;

    // Plug the values you have calculated for e and f into the following equation for the y-intercept
    // y-intercept = b = (e - f) / n
    var b = (e - f) / n;

    // Print the equation below the chart
    // document.getElementsByClassName("equation")[0].innerHTML = "For "+ xText.toLowerCase() + "s in " +yText+ ", every 1 mmHg increase in systolic blood pressure was associated with a " + Math.round(m) + " unit increase in CVD DALYs*";
    // return an object of two points
    // each point is an object with an x and y coordinate
    // return {
    //     ptA : {
    //         x: minX,
    //         y: m * minX + b
    //     },
    //     ptB : {
    //         y: minY,
    //         x: (minY - b) / m
    //     }
    // }
    return Math.round(m);
};

//
// function drawGraph(xText, yText) {
//     $('svg').remove();
//
//     d3.csv('data/data_bp_combined_excl_china_india_russia_USA_smlpop.csv', function (error, data) {
//         data.forEach(function (d) {
//             xValue=xText+'_'+yText;
//             yValue=xText+'_'+yText+'_CVD';
//             popValue=xText+'_'+yText+'_Population';
//           // console.log("printing1",d[yValue]);
//           //  console.log("printing2",yValue);
//           //  console.log("printing3",xText);
//           //  console.log("printing4",yText);
//             d.bloodPressure = +d[xValue];
//             d.CVD = +d[yValue];
//             d.population = +d[popValue];
//             d.region = d.region;
//         });
//
//         // bubble.append('title')
//         //     .attr('x', function (d) {
//         //         return radius(d.population);
//         //     })
//         //     .text(function (d) {
//         //         return d.country + " has a " +yText+" "+xText+ " population of "+ d.population;
//         //     });
//
//         // adding label. For x-axis, it's at (10, 10), and for y-axis at (width, height-10).
//
//
//
//         // I feel I understand legends much better now.
//         // define a group element for each color i, and translate it to (0, i * 20).
// //         function toggleDataPoints(colorClass) {
// //             g
// //                 .selectAll('circle.${colorClass}')
// //                 .data(data)
// //                 .classed('hidden', function() {  // toggle "hidden" class
// //                     return !d3.select(this).classed('hidden');
// //                 });
// //         }
// //         svg.selectAll("title_text")
// //             .data(["Region"])
// //             .enter()
// //             .append("text")
// //             .attr("x", 700)
// //             .attr("y", 1)
// //             .attr('class', 'legend')
// // //            .style("font-family", "sans-serif")
// //   //          .style("font-size", "10px")
// //     //        .style("color", "Black")
// //             .text(function (d) { return d; })
// //             .on('cellclick', function(d) {
// //                 toggleDataPoints(d);
// //                 const legendCell = d3.select(this);
// //                 legendCell.classed('hidden', !legendCell.classed('hidden'));  // toggle opacity of legend item
// //             })
// //             ;
//
//
//
//         // var legend = svg.selectAll('legend')
//         //
//         //     .data(color.domain())
//         //     .enter().append('g')
//         //     .attr('class', 'legend')
//         //
//         //     .attr('transform', function (d, i) {
//         //         return 'translate(0,' + i * 40 + ')';
//         //     });
//         //
//         // // give x value equal to the legend elements.
//         // // no need to define a function for fill, this is automatically fill by color.
//         // legend.append('rect')
//         //     .attr('x', width)
//         //     .attr('width', 18)
//         //     .attr('height', 18)
//         //     .style('fill', color)
//         //     .on('cellclick', function(d) {
//         //         toggleDataPoints(d);
//         //         const legendCell = d3.select(this);
//         //         legendCell.classed('hidden', !legendCell.classed('hidden'));  // toggle opacity of legend item
//         //     })
//         // ;
//
//
//
//         // add text to the legend elements.
//         // rects are defined at x value equal to width, we define text at width - 6, this will print name of the legends before the rects.
//         // legend.append('text')
//         //     .attr('x', width - 6)
//         //     .attr('y', 9)
//         //     .attr('dy', '.35em')
//         //     .style('text-anchor', 'end')
//         //     .text(function (d) {
//         //         return d;
//         //     })
//         // // ;
//         // const colorScale = d3.scaleOrdinal()
//         //     .range(d3.schemeCategory10);
//         //
//         // const colorLegend = d3.legendColor()
//         //     .scale(colorScale)
//         //     .shape('circle')
//         //     .shapeRadius(7)
//         //     .on('cellclick', function(d) {
//         //         toggleDataPoints(d);
//         //         const legendCell = d3.select(this);
//         //         legendCell.classed('hidden', !legendCell.classed('hidden'));  // toggle opacity of legend item
//         //     });
//
//         // add circles representing the data
//
//
//         // add color legend
//
//         // colorLegendG.call(colorLegend);
//
//
//         var lg =
//      // console.log(lg);
//        // svg.append("line")
//          //   .attr("class", "chart")
//            // .attr("x1", x(lg.ptA.x))
//       //      .attr("y1", y(lg.ptA.y))
//         //    .attr("x2", x(lg.ptB.x))
//           //  .attr("y2", y(lg.ptB.y));
//
//
//         // function types(d){
//         //     d.x = +d.bloodPressure;
//         //     d.y = +d.CVD;
//         //     console.log(d.x);
//         //     return d;
//         // }
//         // Calculate a linear regression from the data
//
//         // Takes 5 parameters:
//         // (1) Your data
//         // (2) The column of data plotted on your x-axis
//         // (3) The column of data plotted on your y-axis
//         // (4) The minimum value of your x-axis
//         // (5) The minimum value of your y-axis
//
//         // Returns an object with two points, where each point is an object with an x and y coordinate
//
//
//     })
//
// }
// drawGraph('Male', '2000');
//
// function setGraph() {
//     drawGraph($('#x-value').val(), $('#y-value').val());
// }


