var margin = {top: 60, right: 100, bottom: 20, left: 80},
    width = 850 - margin.left - margin.right,
    height = 370 - margin.top - margin.bottom;

//to do: define scales; initVis; enter, update, exit based on user selection
//sources of data: js/load_data_cholesterol.js
//generate line plots (male vs. female) for selected country over time

var parseYear = d3.timeParse("%Y");
var formatYear = d3.timeFormat("%Y");

var x = d3.scaleTime()
    .range([0, width]);

var y = d3.scaleLinear()
    .range([height, 0]);

var mean_cholesterol = [];
var raise_cholesterol5 = [];
var raise_cholesterol6 = [];

// Define the line
var line = d3.line()
    .x(function(d) { return x(+d.Year); })
    .y(function(d) { return y(+d.Cholesterol); });

// Create the svg canvas in the "graph" div
var svgC = d3.select("#chart-area-6")
    .append("svg")
    .style("width", width + margin.left + margin.right + "px")
    .style("height", height + margin.top + margin.bottom + "px")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform","translate(" + margin.left + "," + margin.top + ")")
    .attr("class", "svg");

//define an array to use for cholesterol_gauge.js
var countrySelect = [];

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

    var nest = d3.nest()
        .key(function(d){
            return d.Country;
        })
        .key(function(d){
            return +d.Year;
        })
        .entries(mean_cholesterol);

    // Scale the range of the data
    x.domain(d3.extent(mean_cholesterol, function(d) { return +d.Year; }));
    y.domain([0, d3.max(mean_cholesterol, function(d) { return d.Cholesterol; })]);

    // Set up the x axis
    var xAxis = svgC.append("g")
        .attr("transform", "translate(0," + height + ")")
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
            .ticks(5)
            .tickSizeInner(0)
            .tickPadding(6)
            .tickSize(0, 0));

    // Add a label to the y axis
    svgC.append("text")
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
            return d.key == country;
        });

        var selectCountryGroups = svgC.selectAll(".CountryGroups")
            .data(selectCountry, function(d){
                return d ? d.key : this.key;
            })
            .enter()
            .append("g")
            .attr("class", "CountryGroups");

        var initialPath = selectCountryGroups.selectAll(".line")
            .data(function(d) { return d.values; })
            .enter()
            .append("path");

        initialPath
            .attr("d", function(d){
                return line(d.values)
            })
            .attr("class", "line");

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
            .data(selectCountry);

        // Select all the lines and transition to new positions
        selectCountryGroups.selectAll("path.line")
            .data(function(d){
                return (d.values);
            })
            .transition()
            .duration(1000)
            .attr("d", function(d){
                return line(d.values);
            })



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

//gauge

var processraisedcholesterolRow = function(d) {
    return {
        Country: d.Country,
        ["Both sexes"]: +d["Both sexes"],
        Male: +d.Male,
        Female: +d.Female
    }
};



d3.csv("data/raised-total-cholesterol-adult-5plus-2008.csv", processraisedcholesterolRow, function(data) {
    raise_cholesterol5 = data;
    // console.log(data);
});

d3.csv("data/raised-total-cholesterol-adult-6plus-2008.csv", processraisedcholesterolRow, function(data) {
    raise_cholesterol6 = data;
    // console.log(data);
});

var gauge = function(container, configuration) {
    var that = {};
    var config = {
        size						: 710,
        clipWidth					: 200,
        clipHeight					: 110,
        ringInset					: 20,
        ringWidth					: 20,

        pointerWidth				: 10,
        pointerTailLength			: 5,
        pointerHeadLengthPercent	: 0.9,

        minValue					: 0,
        maxValue					: 10,

        minAngle					: -90,
        maxAngle					: 90,

        transitionMs				: 750,

        majorTicks					: 5,
        labelFormat					: d3.format('d'),
        labelInset					: 10,

        arcColorFn					: d3.interpolateHsl(d3.rgb('#fee5d9'), d3.rgb('#a50f15'))
    };
    var range = undefined;
    var r = undefined;
    var pointerHeadLength = undefined;
    var value = 0;

    var svg = undefined;
    var arc = undefined;
    var scale = undefined;
    var ticks = undefined;
    var tickData = undefined;
    var pointer = undefined;

    var donut = d3.pie();

    function deg2rad(deg) {
        return deg * Math.PI / 180;
    }

    function newAngle(d) {
        var ratio = scale(d);
        var newAngle = config.minAngle + (ratio * range);
        return newAngle;
    }

    function configure(configuration) {
        var prop = undefined;
        for ( prop in configuration ) {
            config[prop] = configuration[prop];
        }

        range = config.maxAngle - config.minAngle;
        r = config.size / 2;
        pointerHeadLength = Math.round(r * config.pointerHeadLengthPercent);

        // a linear scale that maps domain values to a percent from 0..1
        scale = d3.scaleLinear()
            .range([0,1])
            .domain([config.minValue, config.maxValue]);

        ticks = scale.ticks(config.majorTicks);
        tickData = d3.range(config.majorTicks).map(function() {return 1/config.majorTicks;});

        arc = d3.arc()
            .innerRadius(r - config.ringWidth - config.ringInset)
            .outerRadius(r - config.ringInset)
            .startAngle(function(d, i) {
                var ratio = d * i;
                return deg2rad(config.minAngle + (ratio * range));
            })
            .endAngle(function(d, i) {
                var ratio = d * (i+1);
                return deg2rad(config.minAngle + (ratio * range));
            });
    }
    that.configure = configure;

    function centerTranslation() {
        return 'translate('+r +','+ r +')';
    }

    function isRendered() {
        return (svg !== undefined);
    }
    that.isRendered = isRendered;

    function render(newValue) {
        svg = d3.select(container)
            .append('svg:svg')
            .attr('class', 'gauge')
            .attr('width', config.clipWidth)
            .attr('height', config.clipHeight);

        var centerTx = centerTranslation();

        var arcs = svg.append('g')
            .attr('class', 'arc')
            .attr('transform', centerTx);

        arcs.selectAll('path')
            .data(tickData)
            .enter().append('path')
            .attr('fill', function(d, i) {
                return config.arcColorFn(d * i);
            })
            .attr('d', arc);

        var lg = svg.append('g')
            .attr('class', 'label')
            .attr('transform', centerTx);
        lg.selectAll('text')
            .data(ticks)
            .enter().append('text')
            .attr('transform', function(d) {
                var ratio = scale(d);
                var newAngle = config.minAngle + (ratio * range);
                return 'rotate(' +newAngle +') translate(0,' +(config.labelInset - r) +')';
            })
            .text(config.labelFormat);

        var lineData = [ [config.pointerWidth / 2, 0],
            [0, -pointerHeadLength],
            [-(config.pointerWidth / 2), 0],
            [0, config.pointerTailLength],
            [config.pointerWidth / 2, 0] ];
        var pointerLine = d3.line().curve(d3.curveLinear)
        var pg = svg.append('g').data([lineData])
            .attr('class', 'pointer')
            .attr('transform', centerTx);

        pointer = pg.append('path')
            .attr('d', pointerLine/*function(d) { return pointerLine(d) +'Z';}*/ )
            .attr('transform', 'rotate(' +config.minAngle +')');

        update(newValue === undefined ? 0 : newValue);
    }
    that.render = render;
    function update(newValue, newConfiguration) {
        if ( newConfiguration  !== undefined) {
            configure(newConfiguration);
        }
        var ratio = scale(newValue);
        var newAngle = config.minAngle + (ratio * range);
        pointer.transition()
            .duration(config.transitionMs)
            .ease(d3.easeElastic)
            .attr('transform', 'rotate(' +newAngle +')');
    }
    that.update = update;

    configure(configuration);

    return that;
};

function onDocumentReady() {
    var powerGauge = gauge('#chart-area-7', {
        size: 300,
        clipWidth: 300,
        clipHeight: 300,
        ringWidth: 60,
        maxValue: 100,
        transitionMs: 4000,
    });
    powerGauge.render();

    function updateReadings() {
        // just pump in random data here...
        powerGauge.update(Math.random() * 10);
    }

    // every few seconds update reading values
    updateReadings();
    setInterval(function() {
        updateReadings();
    }, 5 * 1000);
}

if ( !window.isLoaded ) {
    window.addEventListener("load", function() {
        onDocumentReady();
    }, false);
} else {
    onDocumentReady();
}