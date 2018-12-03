//Margins for the line graph

var marginC = {top: 20, right: 80, bottom: 20, left: 80},
    widthC = 850 - marginC.left - marginC.right,
    heightC = 400 - marginC.top - marginC.bottom;

var parseYear = d3.timeParse("%Y");
var formatYear = d3.timeFormat("%Y");

var x = d3.scaleTime()
    .range([0, widthC]);

var y = d3.scaleLinear()
    .range([heightC, marginC.top]);

var mean_cholesterol = [];

// Define the line
var lineC = d3.line()
    .x(function(d) { return x(+d.Year); })
    .y(function(d) { return y(+d.Cholesterol); });

var lineTL = d3.line()
    .x(function(d){ return x(d.Year); })
    .y(function(d){ return y(+d.Threshold); });

var lineTH = d3.line()
    .x(function(d){ return x(d.Year); })
    .y(function(d){ return y(+d.High); });

// Create the svg canvas and color scheme in the "graph" div
var svgC = d3.select("#chart-area-7")
    .append("svg")
    .style("width", widthC + marginC.left + marginC.right)
    .style("height", heightC + marginC.top + marginC.bottom)
    .attr("width", widthC + marginC.left + marginC.right)
    .attr("height", heightC + marginC.top + marginC.bottom)
    .style("margin-left", "auto")
    .style("margin-right", "auto")
    .style("display", "block")
    .append("g")
    .attr("transform","translate(" + marginC.left + "," + marginC.top + ")")
    .attr("class", "svg");

var color = d3.scaleOrdinal()
    .domain(["Male", "Female"])
    .range(["#4071FF", "#FE57FF"]);

// append the tooltip DOM element
var tooltip = d3.select("body").append("div")
   // .attr("id", "tooltip")
    .attr("class", "d3-tip")
    .style("position", "absolute")
    .style("opacity", 0);


// Import the CSV data
d3.csv("data/mean-total-blood-cholesterol-age-adjusted.csv", function(error, data) {
    if (error) throw error;

    // Format the data
    data.forEach(function (d) {
        d.Country = d.Country;
        d.Cholesterol = +d.Cholesterol;
        d.Gender = d.Gender;
        d.Year = (parseYear(+d.Year));
        d.Threshold = +d.Threshold;
        d.High = +d.High;
        d.Prevalence = d.Prevalence;
    });

    // console.log(data);
    mean_cholesterol = data;

    var nest = d3.nest()
        .key(function (d) {
            return d.Country;
        })
        .rollup(function (leaves) {
            var cholesterol = d3.max(leaves, function (d) {
                return d.Cholesterol
            })
            var gender = d3.nest().key(function (d) {
                return d.Gender
            })
 //           var prevalence = d3.nest().key(function (d) {
 //               return d.Prevalence
 //           })
                .entries(leaves);
 //           return {cholesterol: cholesterol, gender: gender, prevalence: prevalence};
            return {cholesterol: cholesterol, gender: gender};
        })
        .entries(mean_cholesterol);

    // Scale the range of the data
    x.domain(d3.extent(mean_cholesterol, function (d) {
        return +d.Year;
    })).nice();
    y.domain([d3.min(mean_cholesterol, function (d) {
        return +d.Cholesterol;
    }),
        0.2 + d3.max(mean_cholesterol, function (d) {
            return +d.Cholesterol;
        })]).nice();

    // Set up the x axis
    var xAxis = svgC.append("g")
        .attr("transform", "translate(0," + heightC + ")")
        .attr("class", "x axis")
        .call(d3.axisBottom(x)
            .tickSize(0, 0)
            .tickFormat(d3.timeFormat("%Y"))
            .tickSizeInner(0)
            .tickPadding(10));

    // Add the Y Axis
    var yAxis = svgC.append("g")
        .attr("class", "y axis")
        .call(d3.axisLeft(y)
            .ticks(10)
            .tickSizeInner(0)
            .tickPadding(6)
            .tickSize(0, 0));

    // Add a label to the y axis
    svgC.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - 60)
        .attr("x", 0 - (heightC / 2))
        .attr("dy", "0.71em")
        .style("text-anchor", "middle")
        .text("Average Cholesterol in mmol/L")
        .attr("class", "y axis label");

    svgC.append('g').classed('data-points', true);

    // Create a dropdown for countries
    var countryList = d3.select("#cholesterol");

    countryList
        .append("select")
        .selectAll("option")
        .data(nest)
        .enter()
        .append("option")
        .attr("value", function (d) {
            return d.key;
        })
        .text(function (d) {
            return d.key;
        });


    // Function to create the initial graph
    var initialGraph = function (country) {

        // Filter the data to include only country of interest
        var selectCountry = nest.filter(function (d) {
            return d.key == country;
        });

        //countrySelect = selectCountry;

        var selectCountryGroups = svgC.selectAll(".CountryGroups")
            .data(selectCountry, function (d) {
                return d ? d.key : this.key;
            })
            .enter()
            .append("g")
            .attr("class", "CountryGroups");


        var initialPath = selectCountryGroups.selectAll(".line")
            .data(function (d) {
                return d.value.gender;
            })
            .enter()
            .append("path");

        initialPath
            .attr("d", function (d) {
                return lineC(d.values)
            })
            .attr("class", "line")
            .attr('stroke', d => color(d.key));


        svgC.append("path")
            .data([mean_cholesterol])
            .attr("class", "line low_threshold")
            .style("stroke-dasharray", "30, 30")
            .attr("d", lineTL);

        svgC.append("path")
            .data([mean_cholesterol])
            .attr("class", "line high_threshold")
            .style("stroke-dasharray", "30, 30")
            .attr("d", lineTH);

        var legendRectSize = 10;
        var legendSpacing = 4;

        var legend = svgC.selectAll('.legend')
            .data(color.domain())
            .enter()
            .append("g")
            .attr("class", "legend")
            .attr('transform', function (d, i) {
                var heightL = legendRectSize + legendSpacing;
                var offset = heightL * color.domain().length / 2;
                var horz = -2 * legendRectSize + 725;
                var vert = i * heightL - offset +300;
                return 'translate(' + horz + ',' + vert + ')';
            });

        legend.append('rect')
            .attr('width', legendRectSize)
            .attr('height', legendRectSize)
            .style('fill', color)
            .style('stroke', color);

        legend.append('text')
            .attr('x', legendRectSize + legendSpacing)
            .attr('y', legendRectSize - legendSpacing)
            .attr("font-size", "10px")
            .text(function (d) {
                return d;
            });

        svgC.append("text")
            .attr("transform", "translate(" + (widthC - 40) + "," + y(mean_cholesterol[0].Threshold + 0.05) + ")")
            .attr("dy", ".35em")
            .attr("font-size", "12px")
            .attr("text-anchor", "start")
            .style("fill", "e41a1c")
            .text("Optimal Level");

        svgC.append("text")
            .attr("transform", "translate(" + (widthC - 40) + "," + y(mean_cholesterol[0].High + 0.05) + ")")
            .attr("dy", ".35em")
            .attr("font-size", "12px")
            .attr("text-anchor", "start")
            .style("fill", "9e1d35")
            .text("High Cholesterol");

        svgC.select('g.data-points').selectAll("dot")
            .data(data.filter(function(d) {
                return d.Country === country;
            }))
            .enter().append("circle").classed('dot', true)
            .attr("r", 3)
            .style("fill", "#fee0d2").style('stroke', '#000')
            .attr("cx", function(d) { return x(d.Year); })
            .attr("cy", function(d) { return y(+d.Cholesterol); })
            //attach mouse hover behaviour to the dots
            .on("mouseover", function(d) { // onMouseOver() - expand the circle, set and show the tooltip
                d3.select(this)
                    .style("opacity", 0.7);
                d3.select(this)
                    .attr("r", 5); /*    expand the point circle to be 5 pixels wide,
                                                        so slight movement of the mouse doesn't hide it again */
                // set the tooltip text
                tooltip.html('<strong>Year: </strong>' + formatYear(d.Year) + '<br/>' + "<strong>Average Cholesterol: </strong>" + d.Cholesterol + ' mmol/L' + '<br/>' +
                    "<strong>Prevalence of High Cholesterol: </strong>" + d.Prevalence + '% ')
                    .style("left", (d3.event.pageX) + "px")
                    .style("top", (d3.event.pageY - 50) + "px");
                // fadeIn the tooltip
                tooltip.transition()
                    .duration(500)
                    .style("opacity", 0.9)
            })
            .on("mouseout", function(d) { // onMouseOut() - shrink the circle, hide the tooltip
                //d3.select(this).style("opacity", 0);
                d3.select(this).attr("r", 3); // shrink point circle back to 5px
                tooltip.transition()
                    .duration(500)
                    .style("opacity", 0); // fadeOut the tooltip
                tooltip.style("left", "-9999") // move the tooltip off screen so that we don't obscure the graph circles
            });


    };

    // Create initial graph
    initialGraph("Afghanistan");

    // Update the data
    var updateGraph = function (country) {

        // Filter the data to include only country of interest
        var selectCountry = nest.filter(function (d) {
            return d.key == country;
        })

        // Select all of the grouped elements and update the data
        var selectCountryGroups = svgC.selectAll(".CountryGroups")
            .data(selectCountry)
            .style("color", function (d, i) {
                return i ? null : "red";
            });

        // Select all the lines and transition to new positions
        selectCountryGroups.selectAll(".line")
            .data(function (d) {
                    return d.value.gender;
                },
                function (d) {
                    return d.key;
                })
            .transition()
            .duration(1000)
            .attr("d", function (d) {
                return lineC(d.values);
            })


        // Update the Y-axis
        d3.select(".y")
            .transition()
            .duration(1500)
            .call(d3.axisLeft(y)
                .ticks(10)
                .tickSizeInner(0)
                .tickPadding(6)
                .tickSize(0, 0));

        var circles = svgC.select('g.data-points').selectAll(".dot")
            .data(data.filter(function(d) {
                return d.Country === country;
            }));

        circles
            .enter().append("circle")
            .merge(circles).classed('data-point', true)
            .attr("r", 3)
            .style("fill", "white").style('stroke', '#000')
            .transition().duration(1000)
            .attr("cx", function(d) { return x(d.Year); })
            .attr("cy", function(d) { return y(+d.Cholesterol); })

    }



    // Run update function when dropdown selection changes
    countryList.on('change', function () {

        // Find which country was selected from the dropdown
        var selectedCountry = d3.select(this)
            .select("select")
            .property("value");

        //console.log(selectedCountry);

        // Run update function with the selected fruit
        updateGraph(selectedCountry);

    });

    //gauge

});