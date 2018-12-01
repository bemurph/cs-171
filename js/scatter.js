var margin = {top: 30, right: 200, bottom: 40, left: 50};

var width = 960 - margin.left - margin.right;
var height = 470 - margin.top - margin.bottom;
var svgscatter;

// set initial values
var currentKeyX = "Male";
var currentKeyY = "2000";

const tooltip = d3.select('body').append('div')
    .attr('class', 'tooltip')
    .style('opacity', 0);


function drawGraph(xText, yText) {
// The API for scales have changed in v4. There is a separate module d3-scale which can be used instead. The main change here is instead of d3.scale.linear, we have d3.scaleLinear.
    var xScale = d3.scaleLinear()
        .range([0, width]);

    var yScale = d3.scaleLinear()
        .range([height, 0]);

// square root scale.
    var radius = d3.scaleSqrt()
        .range([2, 10]);

// the axes are much cleaner and easier now. No need to rotate and orient the axis, just call axisBottom, axisLeft etc.
    var xAxis = d3.axisBottom()
        .scale(xScale);

    var yAxis = d3.axisLeft()
        .scale(yScale);

// again scaleOrdinal
    var color = d3.scaleOrdinal(d3.schemeCategory10);
    var symbols = d3.scaleOrdinal(d3.symbols);

// creates a generator for symbols
    var symbol = d3.symbol().size(100);
    const g = svgscatter
        .append('g')
        .attr('transform', `translate(${margin.left}, ${margin.top})`);

   // const colorLegendG = g
     //   .append('g')
       // .attr('transform', 'translate(${innerWidth + 50}, 0)');

    const colorValue = d => d.dataset;
    const colorClass = d => {
        return colorLegendKeys
            .find(item => item.key === colorValue(d))
            .className;
    };
    d3.csv('data/data_bp_combined_excl_china_india_russia_USA_smlpop.csv', function (error, data) {
        svgscatter.selectAll("*").remove();
        data.forEach(function (d) {
            xValue=xText+'_'+yText;
            yValue=xText+'_'+yText+'_CVD';
            popValue=xText+'_'+yText+'_Population';
          // console.log("printing1",d[yValue]);
          //  console.log("printing2",yValue);
          //  console.log("printing3",xText);
          //  console.log("printing4",yText);
            d.bloodPressure = +d[xValue];
            d.CVD = +d[yValue];
            d.population = +d[popValue];
            d.region = d.region;
        });

        xScale.domain(d3.extent(data, function (d) {
            return d.bloodPressure;
        })).nice();

        yScale.domain(d3.extent(data, function (d) {
            return d.CVD;
        })).nice();

        radius.domain(d3.extent(data, function (d) {
            return d.population;
        })).nice();

        // adding axes is also simpler now, just translate x-axis to (0,height) and it's alread defined to be a bottom axis.
        svgscatter.append('g')
            .attr('transform', 'translate(0,' + height + ')')
            .attr('class', 'x axis')
            .call(xAxis);

        // y-axis is translated to (0,0)
        svgscatter.append('g')
            .attr('transform', 'translate(0,0)')
            .attr('class', 'y axis')
            .call(yAxis);

       var bubble = svgscatter.selectAll('.bubble')
            .data(data);

        //EXIT
        bubble.exit()
            .style("fill", "#b26745")
            .transition(t)
            .attr("r", 1e-6)
            .remove();

        //UPDATE
        bubble
            .transition(t)
            .style("fill", "#3a403d")
            .attr("r", function(d){ return d.r })
            .attr("cx", function(d){ return d.x; })
            .attr("cy", function(d){ return d.y; });

        bubble.enter()
            .append('circle')
            .on("mouseover", function(d){
                tooltip.transition()
                    .duration(200)
                    .style("opacity", .9);
                tooltip.html("In " +yText+ ", "+ d.country + " had a "+xText+ " population of "+ d.population +".")
                    .style("left", (d3.event.pageX) + "px")
                    .style("top", (d3.event.pageY - 28) + "px");
            })
            .on("mouseout", function(d) {
                tooltip.transition()
                    .duration(500)
                    .style("opacity", 0);
            })
            .transition(t)
            .attr('class', 'bubble')
            .attr("id", "redLine")

            .attr('cx', function (d) {
                return xScale(d.bloodPressure);
            })
            .attr('cy', function (d) {
                return yScale(d.CVD);
            })
            .attr('r', function (d) {
                return radius(d.population);
            })
            .style('fill', function (d) {
                return color(d.region);
            })




   /*     text.enter().append("text")
            .attr("opacity", 1e-6)
            .attr("x", function(d){ return radius(d.population); })
            .attr("y", function(d){ return d.y; })
            .text(function(d){ return d.country + " has a " +yText+" "+xText+ " population of "+ d.population; })
            .transition(t)
            .attr("opacity", 1);*/

/*        bubble.append('title')
            .attr('x', function (d) {
                return radius(d.population);
            })
            .text(function (d) {
                return d.country + " has a " +yText+" "+xText+ " population of "+ d.population;
            });*/

        // adding label. For x-axis, it's at (10, 10), and for y-axis at (width, height-10).
        svgscatter.append('text')
          .attr("transform", "rotate(-90)")
            .attr("y", 6)
            .attr("dy", ".71em")
            .style("text-anchor", "end")

           // .attr('x', 10)
           // .attr('y', 10)
            .attr('class', 'label')
            .text('Disability adjusted life years from Cardiovascular Disease');

        svgscatter.append('text')
            .attr('x', width)
            .attr('y', height - 10)
            .attr('text-anchor', 'end')
            .attr('class', 'label')
            .text('Blood pressure');

        // define a group element for each color i, and translate it to (0, i * 20).
        function toggleDataPoints(colorClass) {
            g
                .selectAll('circle.${colorClass}')
                .data(data)
                .classed('hidden', function() {  // toggle "hidden" class
                    return !d3.select(this).classed('hidden');
                });
        }
        svgscatter.selectAll("title_text")
            .data(["Region"])
            .enter()
            .append("text")
            .attr("x", 700)
            .attr("y", -10)
            .attr('class', 'legend')
//            .style("font-family", "sans-serif")
  //          .style("font-size", "10px")
    //        .style("color", "Black")
            .text(function (d) { return d; })

            ;

        var legend = svgscatter.selectAll('legend')

            .data(color.domain())
            //.selectAll('g').remove()
            .enter().append('g')
            .attr('class', 'legend')

            .attr('transform', function (d, i) {
                return 'translate(0,' + i * 40 + ')';
            })
            .on("click", function(){
                // determine if current line is visible
                var active   = redLine.active ? false : true,
                    newOpacity = active ? 0 : 1;
                // hide or show the elements
                d3.select("#redLine").style("opacity", newOpacity);
                // update whether or not the elements are active
                redLine.active = active;
            });

        // give x value equal to the legend elements.
        // no need to define a function for fill, this is automatically fill by color.
        legend.append('rect')
            .attr('x', width)
            .attr('width', 18)
            .attr('height', 18)
            .style('fill', color)
        ;

        // add text to the legend elements.
        // rects are defined at x value equal to width, we define text at width - 6, this will print name of the legends before the rects.
        legend.append('text')
            .attr('x', width )
            .attr('y', 9)
            .attr('dy', '.35em')
            .style('text-anchor', 'end')
            .text(function (d) {
                return d;
            })
            .on("click", function(){
                // determine if current line is visible
                var active   = redLine.active ? false : true,
                    newOpacity = active ? 0 : 1;
                // hide or show the elements
                d3.select("#redLine").style("opacity", newOpacity);
                // update whether or not the elements are active
                redLine.active = active;
            })
        ;
        const colorScale = d3.scaleOrdinal()
            .range(d3.schemeCategory10);

        const colorLegend = d3.legendColor()
            .scale(colorScale)
            .shape('circle')
            .shapeRadius(7)
            .on('cellclick', function(d) {
                toggleDataPoints(d);
                const legendCell = d3.select(this);
                legendCell.classed('hidden', !legendCell.classed('hidden'));  // toggle opacity of legend item
            });

        // add circles representing the data
     //   d3.selectAll('bubble') // move the circles

         //   .attr('cy',function (d) { return yScale(d[value]) })


        // add color legend

       // colorLegendG.call(colorLegend);


        var lg = calcLinear(data, "bloodPressure", "CVD", d3.min(data, function(d){ return d.bloodPressure}), d3.min(data, function(d){ return d.CVD}));
     // console.log(lg);
       // svg.append("line")
         //   .attr("class", "chart")
           // .attr("x1", x(lg.ptA.x))
      //      .attr("y1", y(lg.ptA.y))
        //    .attr("x2", x(lg.ptB.x))
          //  .attr("y2", y(lg.ptB.y));


        function types(d){
            d.x = +d.bloodPressure;
            d.y = +d.CVD;
            console.log(d.x);
            return d;
        }
        // Calculate a linear regression from the data

        // Takes 5 parameters:
        // (1) Your data
        // (2) The column of data plotted on your x-axis
        // (3) The column of data plotted on your y-axis
        // (4) The minimum value of your x-axis
        // (5) The minimum value of your y-axis

        // Returns an object with two points, where each point is an object with an x and y coordinate

        function calcLinear(data, x, y, minX, minY){
            /////////
            //SLOPE//
            /////////

            // Let n = the number of data points
            var n = data.length;

            // Get just the points
            var pts = [];
            data.forEach(function(d,i){
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


                    document.getElementsByClassName("equation1")[0].innerHTML = xText.toLowerCase() + "s in " +yText +":";
                                document.getElementsByClassName("equation0")[0].innerHTML = " every 1 mmHg increase in";
            document.getElementsByClassName("equation0")[1].innerHTML = "systolic blood pressure was";
            document.getElementsByClassName("equation0")[2].innerHTML = "associated with a";
            document.getElementsByClassName("equation1")[1].innerHTML = Math.round(m) + " unit increase in CVD";
            document.getElementsByClassName("equation1")[2].innerHTML = "DALYs*";
            // return an object of two points
            // each point is an object with an x and y coordinate
            return {
                ptA : {
                    x: minX,
                    y: m * minX + b
                },
                ptB : {
                    y: minY,
                    x: (minY - b) / m
                }
            }

        }






    })

}

var t = d3.transition()
    .delay(1000)
    .duration(500)
    .ease(d3.easeBounceIn);

// event handlers for changning views
d3.select('#x-value').on('change', function(a) {
    // Change the current key and call the function to update the colors.
    currentKeyX = d3.select(this).property('value');
    console.log(currentKeyX);
    drawGraph(currentKeyX, currentKeyY);
});

d3.select('#y-value').on('change', function(a) {
    // Change the current key and call the function to update the colors.
    currentKeyY = d3.select(this).property('value');
    console.log(currentKeyY);
    drawGraph(currentKeyX, currentKeyY);
});

function setupGraph() {
    svgscatter = d3.select('#chart-area-5')
    // .selectAll('svg').remove()
        .append('svg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
        .append('g')
        .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');
};

// set initial value
setupGraph();
drawGraph(currentKeyX, currentKeyY);
