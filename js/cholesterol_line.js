var margin = {top: 30, right: 50, bottom: 40, left:40};
var width = 960 - margin.left - margin.right;
var height = 500 - margin.top - margin.bottom;


//to do: define scales; initVis; enter, update, exit based on user selection
//sources of data: js/load_data_cholesterol.js
//generate line plots (male vs. female) for selected country over time

var formatYear = d3.timeFormat("%Y");
var parseYear = d3.timeParse("%Y");

var x = d3.scaleTime()
    .domain([1980, 2009])
    .range([0, width]);

var y = d3.scaleLinear()
    .range([height, 0]);

// Define the line
var line = d3.line()
    .x(function(d) { return x(d.Year); })
    .y(function(d) { return y(+d.Male); });

// Create the svg canvas in the "graph" div
var svg = d3.select("#chart-area-6")
    .append("svg")
    .style("width", width + margin.left + margin.right + "px")
    .style("height", height + margin.top + margin.bottom + "px")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform","translate(" + margin.left + "," + margin.top + ")")
    .attr("class", "svg");

var processcholesterolRow = function(d) {
    return {
        Country: d.Country,
        Year: +d.Year,
        Male: +d.Male,
        Female: +d.Female
    }
};


// Import the CSV data
d3.csv("data/mean-total-blood-cholesterol-age-adjusted.csv", processcholesterolRow, function(error, data) {
    if (error) throw error;

    console.log(data);

    var nest = d3.nest()
        .key(function(d){
            return d.Country;
        })
        .key(function(d){
            return d.Year;
        })
        .entries(data);

    // Scale the range of the data
    x.domain(d3.extent(data, function(d) { return d.Year; }));
    y.domain([0, d3.max(data, function(d) { return +d.Male; })]);

    // Set up the x axis
    var xaxis = svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .attr("class", "x axis")
        .call(d3.axisBottom(x)
        //.ticks(d3.timeMonth)
            .tickSize(0, 0)
            .tickFormat(d3.timeFormat("%B"))
            .tickSizeInner(0)
            .tickPadding(10));

    // Add the Y Axis
    var yaxis = svg.append("g")
        .attr("class", "y axis")
        .call(d3.axisLeft(y)
            .ticks(5)
            .tickSizeInner(0)
            .tickPadding(6)
            .tickSize(0, 0));

    // Add a label to the y axis
    svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - 60)
        .attr("x", 0 - (height / 2))
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .text("Average Cholesterol in mmol/L")
        .attr("class", "y axis label");

    // Create a dropdown
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

        // Filter the data to include only fruit of interest
        var selectCountry = nest.filter(function(d){
            return d.key = country;
        });

        var selectCountryGroups = svg.selectAll(".country-group")
            .data(selectCountry, function(d){
                return d ? d.key : this.key;
            })
            .enter()
            .append("g")
            .attr("class", "country-group");

        var initialPath = selectCountryGroups.selectAll(".line")
            .data(function(d) { return d.Male; })
            .enter()
            .append("path");

        initialPath
            .attr("d", function(d){
                return line(d.Male)
            })
            .attr("class", "line")

    };

    // Create initial graph
    initialGraph("Albania");


    // Update the data
    var updateGraph = function(country){

        // Filter the data to include only fruit of interest
        var selectCountry = nest.filter(function(d){
            return d.key = country;
        })

        // Select all of the grouped elements and update the data
        var selectCountry = svg.selectAll(".country-group")
            .data(selectCountry);

        // Select all the lines and transition to new positions
        selectCountry.selectAll("path.line")
            .data(function(d){
                return (d.Male);
            })
            .transition()
            .duration(1000)
            .attr("d", function(d){
                return line(d.Male)
            });


    };


    // Run update function when dropdown selection changes
    countryList.on('change', function(){

        // Find which fruit was selected from the dropdown
        var selectedCountry = d3.select(this)
            .select("select")
            .property("value");

        // Run update function with the selected fruit
        updateGraph(selectedCountry);


    });

})