BarChart = function(_parentElement, _data) {
    this.parentElement = _parentElement;
    this.data = _data;
    this.filteredData = this.data;
    this.selectedCategory = 'overweight';
    this.transitionDuration = 500;
    this.reversed = false;

    this.initVis();
};

BarChart.prototype.initVis = function () {
    let vis = this;

    vis.margin = {top: 40, right: 10, bottom: 60, left: 60};
    const boundingBox = d3.select(vis.parentElement).node().getBoundingClientRect();

    vis.width = boundingBox.width - vis.margin.left - vis.margin.right;
    vis.height = vis.width/2 - vis.margin.top - vis.margin.bottom;

    vis.svg = d3.select(vis.parentElement).append('svg')
        .attr("width", vis.width + vis.margin.left + vis.margin.right)
        .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
        .append("g")
        .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");

// The API for scales have changed in v4. There is a separate module d3-scale which can be used instead. The main change here is instead of d3.scale.linear, we have d3.scaleLinear.
    vis.xScale = d3.scaleBand()
        .range([0, vis.width])
        .paddingInner(0.1);

    vis.yScale = d3.scaleLinear()
        .range([vis.height, 0]);

// the axes are much cleaner and easier now. No need to rotate and orient the axis, just call axisBottom, axisLeft etc.
    vis.xAxis = d3.axisBottom()
        .scale(vis.xScale);

    // adding axes is also simpler now, just translate x-axis to (0,height) and it's already defined to be a bottom axis.
    vis.xAxisElement = vis.svg.append('g')
        .attr('transform', 'translate(0,' + vis.height + ')')
        .attr('class', 'x-axis axis');

    // vis.xAxisLabel = vis.svg.append('text')
    //     .attr('x', vis.width)
    //     .attr('y', vis.height)
    //     .attr('text-anchor', 'end')
    //     .attr('class', 'label')
    //     .text('Blood pressure (mmHg)');

    vis.yAxis = d3.axisLeft()
        .scale(vis.yScale);

    vis.yAxisElement = vis.svg.append('g')
        .attr('class', 'y-axis axis')
        .attr('transform', 'translate('+(-20)+',0)');

    vis.yAxisLabel = vis.svg.append('text')
        .attr("class", "axis-title")
        .attr("text-anchor", "middle")
        .attr("y", -10)
        .attr("x", 0);

    vis.tooltip = d3.tip()
        .attr('class', 'd3-tip')
        .offset([-10,0])
        .html(function(d) {
        return "<strong>Country:</strong> <span style='color:red'>" + d.country + "</span><br>" +
            "<strong>Prevalence to Physical Inactivity:</strong> <span style='color:red'>" + d.physicallyInactive + "%" +  "</span><br>" +
            "<strong>Prevalence to Overweight:</strong> <span style='color:red'>" + d.overweight + "%" +  "</span><br>" +
            "<strong>Prevalence to Obesity:</strong> <span style='color:red'>" + d.obese + "%" +  "</span>";
    });

    vis.updateVis();
};

BarChart.prototype.updateVis = function() {
    let vis = this;

    vis.filteredData.sort((a, b) => b[vis.selectedCategory] - a[vis.selectedCategory]);

    if (vis.reversed) {
        vis.filteredData.reverse();
    }

    vis.xScale.domain(vis.filteredData.map(d => d.country));
    vis.yScale.domain([0, d3.max(vis.filteredData, d => d[vis.selectedCategory])]);

    vis.svg.call(vis.tooltip);

    vis.bars = vis.svg.selectAll(".bar")
        .data(vis.filteredData, d => d.country);

    vis.bars.enter().append("rect")
        .attr("height",0)
        .attr("y", vis.height)
        .attr("class", "bar")
        .attr('fill', d => continentColor(d.region))
        .on('mouseover', function(d) {
            let thisElement = d3.select(this);
            vis.svg.selectAll('.bar').style('opacity', 0.25);
            thisElement.style('opacity', 1);
            vis.tooltip.show(d);
        })
        .on('mouseout', function(d) {
            vis.svg.selectAll('.bar').style('opacity', 1);
            vis.tooltip.hide(d);
        })

        // Update
        .merge(vis.bars)
            .transition().duration(vis.transitionDuration/2)
                .style("opacity", 0.25)
            .transition().duration(vis.transitionDuration)
                .attr("x", d => vis.xScale(d.country))
                .attr("y", d => vis.yScale(d[vis.selectedCategory]))
                .attr("width", vis.xScale.bandwidth())
                .attr("height", d => vis.height - vis.yScale(d[vis.selectedCategory]))
            .transition().duration(vis.transitionDuration/2)
                .style("opacity", 1);
    vis.bars.exit().transition().duration(vis.transitionDuration).remove();

    vis.yAxisElement.transition().duration(vis.transitionDuration).delay(vis.transitionDuration/2)
        .call(vis.yAxis);
};


BarChart.prototype.reverse = function() {
    let vis = this;

    vis.reversed = !vis.reversed;
    vis.updateVis();
};

BarChart.prototype.selectCategory = function(newCategory) {
    let vis = this;

    vis.selectedCategory = newCategory;
    vis.updateVis();
};

// SVG drawing area

// var marginP = {top: 40, right: 10, bottom: 60, left: 60};

// var widthP = 960 - marginP.left - marginP.right,
//     heightP = 500 - marginP.top - marginP.bottom;

// var svgP = d3.select("#chart-area-9").append("svg")
//     .attr("width", widthP + marginP.left + marginP.right)
//     .attr("height", heightP + marginP.top + marginP.bottom)
//     .append("g")
//     .attr("transform", "translate(" + marginP.left + "," + marginP.top + ")");


// Scales
// var xP = d3.scaleBand()
//     .range([0, widthP])
//     .paddingInner(0.1);

// var yP = d3.scaleLinear()
//     .range([heightP, 0]);

// Tooltip

// var regionColor = d3.scaleOrdinal()
//     .domain(['Asia', 'Americas', 'Africa', 'Europe', 'Oceania'])
//     .range(['#e41a1c', '#ff7f00', '#4daf4a', '#377eb8', '#984ea3']);

// Axis
// var xAxisP = d3.axisBottom()
//     .scale(xP);
//
// var yAxisP = d3.axisLeft()
//     .scale(yP);

//var xAxisGroup = svgP.append("g")
//    .attr("class", "x-axis axis")
//    .attr("transform", "translate(0," + heightP + ")")

// var yAxisGroup = svgP.append("g")
//     .attr("class", "y-axis axis");
//
// var yAxisTitle = svgP.append("text")
//     .attr("class", "axis-title")
//     .attr("text-anchor", "middle")
//     .attr("y", -10)
//     .attr("x", 0);


// Initialize data
// loadData();
//
// // Create a 'data' property under the window object
// // to store the coffee chain data
// Object.defineProperty(window, 'data', {
//     // data getter
//     get: function() { return _data; },
//     // data setter
//     set: function(value) {
//         _data = value;
//         // update the visualization each time the data property is set by using the equal sign (e.g. data = [])
//         updateVisualization()
//     }
// });

// Sort order
// var reverse = false;

// Event Listener (ranking type)
// var selectRankingType = d3.select("#ranking-type").on("change", updateVisualization);


// Event listener (reverse sort order)
// var changeSortingOrder = d3.select("#change-sorting").on("click", function() {
//     reverse = !reverse;
//     updateVisualization();
// });

// Load CSV file
// function loadData() {
//     d3.csv("data/prevalence-overweight-obese-physical-activity.csv", function(error, csv) {
//
//         csv.forEach(function(d){
//             d.Obese = +d.Obese;
//             d.Overweight = +d.Overweight;
//             d.Physical_inactivity = +d.Physical_inactivity;
//             d.Region = d.Region;
//         });
//
//         // Store csv data in global variable
//         // data = csv;
//
//         // updateVisualization gets automatically called within the data = csv call;
//         // basically(whenever the data is set to a value using = operator);
//         // see the definition above: Object.defineProperty(window, 'data', { ...
//     });
// }

// Render visualization
function updateVisualization() {
    // Get the selected ranking option
    // var rankingType = selectRankingType.property("value");
    //
    // if(rankingType == "Overweight")
    //     yAxisTitle.text("Prevalence (%)");
    // else if (rankingType == "Obese")
    //     yAxisTitle.text("Prevalence (%)");
    // else
    //     yAxisTitle.text("Prevalence (%)");
    //
    // // Sort data
    // data.sort(function(a, b) { return b[rankingType] - a[rankingType]; });
    //
    // if(reverse)
    //     data.reverse();

    // Update scales domains
    // xP.domain(data.map(function(d) { return d.Country; }));
    // yP.domain([0, d3.max(data, function(d) { return d[rankingType]; })]);

    // var tip = d3.tip()
    //     .attr('class', 'd3-tip')
    //     .offset([-10, 100

    // svgP.call(tip);

    // Data join
    // var bars = svgP.selectAll(".bar")
    //     .data(data, function(d){ return d.Country; });

    // Enter
    // bars.enter().append("rect")
    //     .attr("height",0)
    //     .attr("y",heightP)
    //     .attr("class", "bar")
    //     .attr('fill', d => regionColor(d.Region))
    //
    //     // Update
    //     .merge(bars)
    //     .style("opacity", 0.5)
    //     .transition()
    //     .duration(1000)
    //     .style("opacity", 1)
    //     .attr("x", function(d) { return xP(d.Country); })
    //     .attr("y", function(d) { return yP(d[rankingType]); })
    //     .attr("width", xP.bandwidth())
    //     .attr("height", function(d) { return heightP - yP(d[rankingType]); });

    // svgP.selectAll(".bar")
    //     .data(data)
    //     .enter().append("rect")
    //     .attr("x", function(d) { return xP(d.Country); })
    //     .attr("y", function(d) { return yP(d[rankingType]); })
    //     .attr("width", xP.bandwidth())
    //     .attr("height", function(d) { return heightP - yP(d[rankingType]); })
    //     .on('mouseover', tip.show)
    //     .on('mouseout', tip.hide);


    // Exit
    // bars.exit().remove();

    // Draw Axes
    // xAxisGroup = svgP.select(".x-axis")
    //     .attr("transform", "translate(0," + heightP + ")")
    //     .transition()
    //     .duration(1000)
    //     .call(xAxisP);
    //
    // yAxisGroup = svgP.select(".y-axis")
    //     .call(yAxisP);
}