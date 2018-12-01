var marginC = {top: 20, right: 80, bottom: 20, left: 80},
    widthC = 700 - marginC.left - marginC.right,
    heightC = 500 - marginC.top - marginC.bottom;

//to do: define scales; initVis; enter, update, exit based on user selection
//sources of data: js/load_data_cholesterol.js
//generate line plots (male vs. female) for selected country over time

var countrySelect = [];

var parseYear = d3.timeParse("%Y");
var formatYear = d3.timeFormat("%Y");

var x = d3.scaleTime()
    .range([0, widthC]);

var y = d3.scaleLinear()
    .range([heightC, marginC.top]);

var mean_cholesterol = [];
var raise_cholesterol5 = [];

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

// Create the svg canvas in the "graph" div
var svgC = d3.select("#chart-area-6")
    .append("svg")
    .style("width", widthC + marginC.left + marginC.right)
    .style("height", heightC + marginC.top + marginC.bottom)
    .attr("width", widthC + marginC.left + marginC.right)
    .attr("height", heightC + marginC.top + marginC.bottom)
    .append("g")
    .attr("transform","translate(" + marginC.left + "," + marginC.top + ")")
    .attr("class", "svg");

var color = d3.scaleOrdinal()
    .domain(["Male", "Female"])
    .range(["#4071FF", "#FE57FF"]);

// Define the div for the tooltip
var div = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

// Import the CSV data
d3.csv("data/mean-total-blood-cholesterol-age-adjusted.csv", function(error, data) {
    if (error) throw error;

    // Format the data
    data.forEach(function(d) {
        d.Country = d.Country;
        d.Cholesterol = +d.Cholesterol;
        d.Gender = d.Gender;
        d.Year = (parseYear(+d.Year));
        d.Threshold = +d.Threshold;
        d.High = +d.High;
    });

   // console.log(data);
    mean_cholesterol = data;

    var processraisedcholesterolRow = function(d) {
        return {
            Country: d.Country,
            ["Both sexes"]: +d["Both sexes"],
            Male: +d.Male,
            Female: +d.Female
        }
    }

    d3.csv("data/raised-total-cholesterol-adult-5plus-2008.csv", processraisedcholesterolRow, function(data2) {
        raise_cholesterol5 = data2;
        // console.log(data2);
    });

    var nest = d3.nest()
        .key(function(d){
            return d.Country;
        })
        .rollup(function(leaves){
            var cholesterol = d3.max(leaves, function(d){
                return d.Cholesterol
            })
            var gender = d3.nest().key(function(d){
                return d.Gender
            })
                .entries(leaves);
            return {cholesterol:cholesterol, gender:gender};
        })
        .entries(mean_cholesterol);

    // Scale the range of the data
    x.domain(d3.extent(mean_cholesterol, function(d) { return +d.Year; }));
    y.domain([d3.min(mean_cholesterol, function(d) { return +d.Cholesterol; }),
        0.5 + d3.max(mean_cholesterol, function(d) { return +d.Cholesterol; })]);

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
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .text("Average Cholesterol in mmol/L")
        .attr("class", "y axis label");

    // Create a dropdown for countries
    var countryList = d3.select("#cholesterol");

    countryList
        .append("select")
        .selectAll("option")
        .data(nest)
        .enter()
        .append("option")
        .attr("value", function(d){
            return d.key;
        })
        .text(function(d){
            return d.key;
        });


    // Function to create the initial graph
    var initialGraph = function(country){

        // Filter the data to include only country of interest
        var selectCountry = nest.filter(function(d){
            return d.key == country;
        });

        countrySelect = selectCountry;


        var selectCountryGroups = svgC.selectAll(".CountryGroups")
            .data(selectCountry, function(d){
                return d ? d.key : this.key;
            })
            .enter()
            .append("g")
            .attr("class", "CountryGroups");


        var initialPath = selectCountryGroups.selectAll(".line")
            .data(function(d) { return d.value.gender; })
            .enter()
            .append("path");

        initialPath
            .attr("d", function(d){
                return lineC(d.values)
            })
            .attr("class", "line")
            .attr('stroke', d => color(d.key));

        svgC.append("path")
            .data([mean_cholesterol])
            .attr("class", "line low_threshold")
            .attr("d", lineTL);

        svgC.append("path")
            .data([mean_cholesterol])
            .attr("class", "line high_threshold")
            .attr("d", lineTH);

        var legendRectSize = 10;
        var legendSpacing = 4;

        var legend = svgC.selectAll('.legend')
            .data(color.domain())
            .enter()
            .append("g")
            .attr("class", "legend")
            .attr('transform', function(d, i) {
                var heightL = legendRectSize + legendSpacing;
                var offset =  heightL * color.domain().length / 2;
                var horz = -2 * legendRectSize;
                var vert = i * heightL - offset;
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
            .text(function(d) { return d; });


        var dot = svgC.selectAll("dot")
            .data(mean_cholesterol)
            .enter().append("circle")
            .attr("r", 1);

        dot
            .attr("cx", function (d) {
                return x(d.Year);
            })
            .attr("cy", function (d) {
                return y(d.Cholesterol);
            })
            .on("mouseover", function (d) {
                div.transition()
                    .duration(200)
                    .style("opacity", .9);
                div.html("Year: " + formatYear(d.Year) + "<p>" + d.Cholesterol + "mmol/L </p>")
                    .style("left", (d3.event.pageX) + "px")
                    .style("top", (d3.event.pageY - 28) + "px");
            });


        //   document.getElementsByClassName("cholesterol-prevalence-1")[0].innerHTML = "In 2008, the prevalence of high " +
       //     "cholesterol for " + country + " is: "
    };

    // Create initial graph
    initialGraph("Afghanistan");


    // Update the data
    var updateGraph = function(country){

        // Filter the data to include only country of interest
        var selectCountry = nest.filter(function(d){
            return d.key == country;
        })

        // Select all of the grouped elements and update the data
        var selectCountryGroups = svgC.selectAll(".CountryGroups")
            .data(selectCountry)
            .style("color", function(d, i) { return i ? null : "red"; });

        // Select all the lines and transition to new positions
        selectCountryGroups.selectAll(".line")
            .data(function(d) { return d.value.gender; },
                function(d){ return d.key; })
            .transition()
            .duration(1000)
            .attr("d", function(d){
                return lineC(d.values);
            })

        // Update the Y-axis
        d3.select(".y")
            .transition()
            .duration(1500)
            .call(d3.axisLeft(y)
                .ticks(5)
                .tickSizeInner(0)
                .tickPadding(6)
                .tickSize(0, 0));



    }


    // Run update function when dropdown selection changes
    countryList.on('change', function(){

        // Find which country was selected from the dropdown
        var selectedCountry = d3.select(this)
            .select("select")
            .property("value");

        //console.log(selectedCountry);

        // Run update function with the selected fruit
        updateGraph(selectedCountry);

    });

});