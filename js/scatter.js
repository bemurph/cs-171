ScatterPlot = function(_parentElement, _data, _legendElement, _legendData) {
    this.parentElement = _parentElement;
    this.data = _data;
    this.filteredData = this.data;
    this.selectedGender = 'Male';
    this.selectedYear = 2000;
    this.transitionDuration = 1000;
    this.textFriendlyGenders = {
        Male: 'men',
        Female: 'women',
    };
    this.legendElement = _legendElement;
    this.legendData = _legendData;

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

    vis.yScale = d3.scaleLog()
        .range([vis.height, 0]);

// square root scale.
    vis.radius = d3.scaleSqrt()
        .range([5, 20]);

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
        .domain(['Asia', 'Americas', 'Africa', 'Europe', 'Oceania'])
        .range(['#e41a1c', '#ff7f00', '#4daf4a', '#377eb8', '#984ea3']);

    vis.mapLegend = new WorldLegend(vis.legendElement, vis.legendData, vis.continentColor);

    vis.filterData();
};

ScatterPlot.prototype.filterData = function() {
    let vis = this;
    vis.filteredData = vis.data.filter(d =>
        d.gender === vis.selectedGender &&
        d.year === vis.selectedYear &&
        (vis.mapLegend.selectedRegions.length === 0 || vis.mapLegend.selectedRegions.includes(d.region))
    );
    vis.updateVis();
};

ScatterPlot.prototype.updateVis = function() {
    let vis = this;

    vis.xScale.domain(d3.extent(vis.filteredData, d => d.bloodPressure)).nice();
    vis.yScale.domain(d3.extent(vis.filteredData, d => d.CVD)).nice();
    vis.radius.domain(d3.extent(vis.filteredData, d => d.population)).nice();
    vis.yAxisElement.transition().duration(vis.transitionDuration)
        .call(vis.xAxis);
    vis.yAxisElement.transition().duration(vis.transitionDuration)
        .call(vis.yAxis);

    let bubbles = vis.svg.selectAll('.bubble')
        .data(vis.filteredData, d => d.country);

    bubbles.enter().append('circle')
            .classed('bubble', true)
            .attr('fill', d => vis.continentColor(d.region))
        .merge(bubbles).transition().duration(vis.transitionDuration)
            .attr('cx', d => vis.xScale(d.bloodPressure))
            .attr('cy', d => vis.yScale(d.CVD))
            .style('opacity', 1)
            .attr('r', d => vis.radius(d.population));
    bubbles.exit()
        .style('opacity', 0);

    const cvdIncreaseValue = vis.calcLinear();
    const cvdIncreaseText = "For "+ vis.textFriendlyGenders[vis.selectedGender] + " in " + vis.selectedYear + ", every 1 mmHg increase in systolic blood pressure was associated with a " + cvdIncreaseValue + " unit increase in CVD DALYs*";

    d3.select('#cvd-increase-text').text(cvdIncreaseText);
};

ScatterPlot.prototype.setGender = function(gender) {
    let vis = this;
    vis.selectedGender = gender;
    vis.filterData();
};

ScatterPlot.prototype.setYear = function(year) {
    let vis = this;
    vis.selectedYear = year;
    vis.filterData();
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
