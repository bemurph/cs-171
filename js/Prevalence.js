
// SVG drawing area

var marginP = {top: 40, right: 10, bottom: 60, left: 60};

var widthP = 960 - marginP.left - marginP.right,
    heightP = 500 - marginP.top - marginP.bottom;

var svgP = d3.select("#chart-area-9").append("svg")
    .attr("width", widthP + marginP.left + marginP.right)
    .attr("height", heightP + marginP.top + marginP.bottom)
    .append("g")
    .attr("transform", "translate(" + marginP.left + "," + marginP.top + ")");


// Scales
var xP = d3.scaleBand()
    .range([0, widthP])
    .paddingInner(0.1);

var yP = d3.scaleLinear()
    .range([heightP, 0]);

// Tooltip

var regionColor = d3.scaleOrdinal()
    .domain(['Asia', 'Americas', 'Africa', 'Europe', 'Oceania'])
    .range(['#e41a1c', '#ff7f00', '#4daf4a', '#377eb8', '#984ea3']);

// Axis
var xAxisP = d3.axisBottom()
    .scale(xP);

var yAxisP = d3.axisLeft()
    .scale(yP);

//var xAxisGroup = svgP.append("g")
//    .attr("class", "x-axis axis")
//    .attr("transform", "translate(0," + heightP + ")")

var yAxisGroup = svgP.append("g")
    .attr("class", "y-axis axis");

var yAxisTitle = svgP.append("text")
    .attr("class", "axis-title")
    .attr("text-anchor", "middle")
    .attr("y", -10)
    .attr("x", 0);


// Initialize data
loadData();

// Create a 'data' property under the window object
// to store the coffee chain data
Object.defineProperty(window, 'data', {
    // data getter
    get: function() { return _data; },
    // data setter
    set: function(value) {
        _data = value;
        // update the visualization each time the data property is set by using the equal sign (e.g. data = [])
        updateVisualization()
    }
});

// Sort order
var reverse = false;

// Event Listener (ranking type)
var selectRankingType = d3.select("#ranking-type").on("change", updateVisualization);


// Event listener (reverse sort order)
var changeSortingOrder = d3.select("#change-sorting").on("click", function() {
    reverse = !reverse;
    updateVisualization();
});

// Load CSV file
function loadData() {
    d3.csv("data/prevalence-overweight-obese-physical-activity.csv", function(error, csv) {

        csv.forEach(function(d){
            d.Obese = +d.Obese;
            d.Overweight = +d.Overweight;
            d.Physical_inactivity = +d.Physical_inactivity;
            d.Region = d.Region;
        });

        // Store csv data in global variable
        data = csv;

        // updateVisualization gets automatically called within the data = csv call;
        // basically(whenever the data is set to a value using = operator);
        // see the definition above: Object.defineProperty(window, 'data', { ...
    });
}

// Render visualization
function updateVisualization() {
    // Get the selected ranking option
    var rankingType = selectRankingType.property("value");

    if(rankingType == "Overweight")
        yAxisTitle.text("Prevalence (%)");
    else if (rankingType == "Obese")
        yAxisTitle.text("Prevalence (%)");
    else
        yAxisTitle.text("Prevalence (%)");

    // Sort data
    data.sort(function(a, b) { return b[rankingType] - a[rankingType]; });

    if(reverse)
        data.reverse();

    // Update scales domains
    xP.domain(data.map(function(d) { return d.Country; }));
    yP.domain([0, d3.max(data, function(d) { return d[rankingType]; })]);

    var tip = d3.tip()
        .attr('class', 'd3-tip')
        .offset([-10, 100])
        .html(function(d) {
            return "<strong>Country:</strong> <span style='color:red'>" + d.Country + "</span><br>" +
                "<strong>Prevalence to Physical Inactivity:</strong> <span style='color:red'>" + d.Physical_inactivity + "%" +  "</span><br>" +
                "<strong>Prevalence to Overweight:</strong> <span style='color:red'>" + d.Overweight + "%" +  "</span><br>" +
                "<strong>Prevalence to Obesity:</strong> <span style='color:red'>" + d.Obese + "%" +  "</span>";
        });

    svgP.call(tip);

    // Data join
    var bars = svgP.selectAll(".bar")
        .data(data, function(d){ return d.Country; });

    // Enter
    bars.enter().append("rect")
        .attr("height",0)
        .attr("y",heightP)
        .attr("class", "bar")
        .attr('fill', d => regionColor(d.Region))

        // Update
        .merge(bars)
        .style("opacity", 0.5)
        .transition()
        .duration(1000)
        .style("opacity", 1)
        .attr("x", function(d) { return xP(d.Country); })
        .attr("y", function(d) { return yP(d[rankingType]); })
        .attr("width", xP.bandwidth())
        .attr("height", function(d) { return heightP - yP(d[rankingType]); });

    svgP.selectAll(".bar")
        .data(data)
        .enter().append("rect")
        .attr("x", function(d) { return xP(d.Country); })
        .attr("y", function(d) { return yP(d[rankingType]); })
        .attr("width", xP.bandwidth())
        .attr("height", function(d) { return heightP - yP(d[rankingType]); })
        .on('mouseover', tip.show)
        .on('mouseout', tip.hide);


    // Exit
    bars.exit().remove();

    // Draw Axes
    xAxisGroup = svgP.select(".x-axis")
        .attr("transform", "translate(0," + heightP + ")")
        .transition()
        .duration(1000)
        .call(xAxisP);

    yAxisGroup = svgP.select(".y-axis")
        .call(yAxisP);
}