var marginC = {top: 60, right: 100, bottom: 20, left: 80},
    widthC = 800 - marginC.left - marginC.right,
    heightC = 600 - marginC.top - marginC.bottom;

//to do: define scales; initVis; enter, update, exit based on user selection
//sources of data: js/load_data_cholesterol.js
//generate line plots (male vs. female) for selected country over time

var parseYear = d3.timeParse("%Y");
var formatYear = d3.timeFormat("%Y");

var xC = d3.scaleTime()
    .range([0, widthC]);

var yC = d3.scaleLinear()
    .range([heightC, 0]);

var mean_cholesterol = [];
var raise_cholesterol5 = [];

// Define the line
var lineC = d3.line()
    .x(function(d) { return xC(+d.Year); })
    .y(function(d) { return yC(+d.Cholesterol); });

// Create the svg canvas in the "graph" div
var svgC = d3.select("#chart-area-6")
    .append("svg")
    .style("width", widthC + marginC.left + marginC.right + "px")
    .style("height", heightC + marginC.top + marginC.bottom + "px")
    .attr("width", widthC + marginC.left + marginC.right)
    .attr("height", heightC + marginC.top + marginC.bottom)
    .append("g")
    .attr("transform","translate(" + marginC.left + "," + marginC.top + ")")
    .attr("class", "svg");

// Import the CSV data
d3.csv("data/mean-total-blood-cholesterol-age-adjusted.csv", function(error, data) {
    if (error) throw error;

    // Format the data
    data.forEach(function(d) {
        d.Country = d.Country;
        d.Cholesterol = +d.Cholesterol;
        d.Gender = d.Gender;
        d.Year = (parseYear(+d.Year));
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
            var max = d3.max(leaves, function(d){
                return d.Cholesterol
            })
            var gender = d3.nest().key(function(d){
                return d.Gender
            })
                .entries(leaves);
            return {max:max, gender:gender};
        })
        .entries(mean_cholesterol);


    // Scale the range of the data
    xC.domain(d3.extent(mean_cholesterol, function(d) { return +d.Year; }));
    yC.domain([0, d3.max(mean_cholesterol, function(d) { return d.Cholesterol; })]);

    // Set up the x axis
    var xAxisC = svgC.append("g")
        .attr("transform", "translate(0," + heightC + ")")
        .attr("class", "x axis")
        .call(d3.axisBottom(xC)
            .tickSize(0, 0)
            .tickFormat(d3.timeFormat("%Y"))
            .tickSizeInner(0)
            .tickPadding(10));

    // Add the Y Axis
    var yAxisC = svgC.append("g")
        .attr("class", "y axis")
        .call(d3.axisLeft(yC)
            .ticks(5)
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

    // Create a dropdown for gender
    var genderMenu = d3.select("#gender");

    genderMenu
        .data(nest)
        .append("select")
        .selectAll("option")
        .data(function(d) { return d.value.gender; })
        .enter()
        .append("option")
        .attr("value", function(d){
            return d.key;
        })
        .text(function(d){
            return d.key;
        })


    // Function to create the initial graph
    var initialGraph = function(country){

        // Filter the data to include only country of interest
        var selectCountry = nest.filter(function(d){
            return d.key == country;
        });

        var selectCountryGroups = svgC.selectAll(".CountryGroups")
            .data(selectCountry, function(d){
                return d ? d.key : this.key;
            })
            .enter()
            .append("g")
            .attr("class", "CountryGroups")
            .each(function(d){
                yC.domain([0, d.value.max])
            });


        var initialPath = selectCountryGroups.selectAll(".line")
            .data(function(d) { return d.value.gender; })
            .enter()
            .append("path");

        initialPath
            .attr("d", function(d){
                return lineC(d.values)
            })
            .attr("class", "line")
            .style("stroke-dasharray", function(d){
                return (d.key == "Male") ? ("5, 5") : ("0, 0")});


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
            .style("color", function(d, i) { return i ? null : "red"; })
            .each(function(d){
                yC.domain([0, d.value.max])
            });

        // Select all the lines and transition to new positions
        selectCountryGroups.selectAll("path.line")
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
            .call(d3.axisLeft(yC)
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

    // Change color of selected line when year dropdown changes
    genderMenu.on('change', function(){

        // Find which year was selected
        var selectedGender = d3.select(this)
            .select("select")
            .property("value")

        // Change the class of the matching line to "selected"
        var selLine = svg.selectAll(".line")
        // de-select all the lines
            .classed(".selected", false)
            .filter(function(d) {
                return +d.key === +selectedGender
            })
            // Set class to selected for matching line
            .classed(".selected", true)
    })

});