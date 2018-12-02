BarChart = function(_parentElement, _data, _legendElement, _legendData) {
    this.parentElement = _parentElement;
    this.data = _data;
    this.filteredData = this.data;
    this.selectedCategory = 'overweight';
    this.transitionDuration = 500;
    this.reversed = false;
    this.textFriendlyCategories = {
        overweight: "being overweight",
        obese: "obesity",
        physicallyInactive: "physical inactivity"
    };
    this.mapLegend = new WorldLegend(_legendElement, _legendData, filterBar);

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
            return "<strong>Country:</strong> <span style='color: "+continentColor(d.region)+"'>" + d.country + "</span><br>" +
                   "<strong>Prevalence of "+ vis.textFriendlyCategories[vis.selectedCategory] +": <span style='color:red'>" + d[vis.selectedCategory] + "%" +  "</span><br>";
    });

    vis.svg.call(vis.tooltip);

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


BarChart.prototype.filterData = function() {
    let vis = this;
    vis.filteredData = vis.data.filter(d =>
        (vis.mapLegend.selectedRegions.length === 0 || vis.mapLegend.selectedRegions.includes(d.region))
    );
    vis.updateVis();
};