function drawGraph(xText, yText) {
    $('svg').remove();
    var margin = {top: 30, right: 200, bottom: 40, left: 50};

    var width = 960 - margin.left - margin.right;
    var height = 500 - margin.top - margin.bottom;

    var svg = d3.select('#chart-area-5')
        .append('svg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
        .append('g')
        .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');


// The API for scales have changed in v4. There is a separate module d3-scale which can be used instead. The main change here is instead of d3.scale.linear, we have d3.scaleLinear.
    var xScale = d3.scaleLinear()
        .range([0, width]);

    var yScale = d3.scaleLinear()
        .range([height, 0]);

// square root scale.
    var radius = d3.scaleSqrt()
        .range([2, 5]);

// the axes are much cleaner and easier now. No need to rotate and orient the axis, just call axisBottom, axisLeft etc.
    var xAxis = d3.axisBottom()
        .scale(xScale);

    var yAxis = d3.axisLeft()
        .scale(yScale);

// again scaleOrdinal
    var color = d3.scaleOrdinal(d3.schemeCategory20);

    d3.csv('data/data_bp_combined.csv', function (error, data) {
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
        svg.append('g')
            .attr('transform', 'translate(0,' + height + ')')
            .attr('class', 'x axis')
            .call(xAxis);

        // y-axis is translated to (0,0)
        svg.append('g')
            .attr('transform', 'translate(0,0)')
            .attr('class', 'y axis')
            .call(yAxis);


        var bubble = svg.selectAll('.bubble')

            .data(data)
            .enter().append('circle')
            .attr('class', 'bubble')
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
            });

        bubble.append('title')
            .attr('x', function (d) {
                return radius(d.population);
            })
            .text(function (d) {
                return d.country;
            });

        // adding label. For x-axis, it's at (10, 10), and for y-axis at (width, height-10).
        svg.append('text')

          .attr("transform", "rotate(-90)")
            .attr("y", 6)
            .attr("dy", ".71em")
            .style("text-anchor", "end")

           // .attr('x', 10)
           // .attr('y', 10)
            .attr('class', 'label')
            .text('Disability adjusted life years from Cardiovascular Disease');


        svg.append('text')
            .attr('x', width)
            .attr('y', height - 10)
            .attr('text-anchor', 'end')
            .attr('class', 'label')
            .text('Blood pressure');

        // I feel I understand legends much better now.
        // define a group element for each color i, and translate it to (0, i * 20).

        svg.selectAll("title_text")
            .data(["Region"])
            .enter()
            .append("text")
            .attr("x", 700)
            .attr("y", 1)
            .attr('class', 'legend')
//            .style("font-family", "sans-serif")
  //          .style("font-size", "10px")
    //        .style("color", "Black")
            .text(function (d) { return d; });

        var legend = svg.selectAll('legend')

            .data(color.domain())
            .enter().append('g')
            .attr('class', 'legend')

            .attr('transform', function (d, i) {
                return 'translate(0,' + i * 40 + ')';
            });

        // give x value equal to the legend elements.
        // no need to define a function for fill, this is automatically fill by color.
        legend.append('rect')
            .attr('x', width)
            .attr('width', 18)
            .attr('height', 18)
            .style('fill', color);

        // add text to the legend elements.
        // rects are defined at x value equal to width, we define text at width - 6, this will print name of the legends before the rects.
        legend.append('text')
            .attr('x', width - 6)
            .attr('y', 9)
            .attr('dy', '.35em')
            .style('text-anchor', 'end')
            .text(function (d) {
                return d;
            });


        // d3 has a filter fnction similar to filter function in JS. Here it is used to filter d3 components.
        legend.on('click', function (type) {
            d3.selectAll('.bubble')
                .style('opacity', 0.15)
                .filter(function (d) {
                    return d.country == type;
                })
                .style('opacity', 1);
        })


    })

}
drawGraph('Male', '2000');

function setGraph() {
    drawGraph($('#x-value').val(), $('#y-value').val());
}