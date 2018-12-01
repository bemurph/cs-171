
WorldLegend = function(_parentElement, _data){
    this.parentElement = _parentElement;
    this.data = _data;
    this.initVis();
};

WorldLegend.prototype.initVis = function() {
    let vis = this;

    vis.margin = {top: 0, bottom: 0, left: 0, right: 0};
    const boundingBox = d3.select(vis.parentElement).node().getBoundingClientRect();

    vis.width = boundingBox.width - vis.margin.left - vis.margin.right;
    vis.height = vis.width*3/4 - vis.margin.top - vis.margin.bottom;

    // SVG drawing area
    vis.svg = d3.select(vis.parentElement).append("svg")
        .attr("width", vis.width + vis.margin.left + vis.margin.right)
        .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
        .append("g")
        .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");

    vis.projection = d3.geoEquirectangular().translate([vis.width/2, vis.height/2]).scale(50);
    vis.path = d3.geoPath(vis.projection);

    vis.svg.selectAll('path')
        .data(vis.data.features)
        .enter().append('path')
        .attr('d', vis.path)
        .attr('fill', '')
        .on('mouseover', function() {
            d3.select(this).classed('continent-hover', true);
        })
        .on('click', function() {
            let thisElement = d3.select(this);
            const isSelected = !thisElement.classed('continent-selected');
            thisElement.classed('continent-selected', isSelected);
            thisElement.classed('continent-unselected', !isSelected);
            const numSelected = vis.svg.selectAll('.continent-selected').size();
            if (numSelected === 0) {
                vis.svg.selectAll('.continent-unselected').classed('continent-unselected', false);
            }
            else {
                vis.svg.selectAll('path:not(.continent-selected)').classed('continent-unselected', true);
            }
        })
        .on('mouseout', function() {
            d3.select(this).classed('continent-hover', false);
            d3.select(this).attr('fill', '');
        });

    // vis.updateVis();
};