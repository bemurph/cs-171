
WorldLegend = function(_parentElement, _data, _colorScale){
    this.parentElement = _parentElement;
    this.data = _data;
    this.colorScale = _colorScale;
    this.selectedRegions = [];
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

    vis.projection = d3.geoEquirectangular().translate([vis.width/2, vis.height/2]).scale(0.16*vis.width);
    vis.path = d3.geoPath(vis.projection);

    vis.svg.selectAll('path')
        .data(vis.data.features)
        .enter().append('path')
        .attr('d', vis.path)
        .attr('fill', d => vis.colorScale(d.properties.CONTINENT))
        .classed('continent', true)
        .on('mouseover', function() {
            d3.select(this).classed('continent-hover', true);
        })
        .on('click', function(d) {
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
            if (isSelected) {
                vis.selectedRegions.push(d.properties.CONTINENT);
            }
            else {
                vis.selectedRegions.splice(vis.selectedRegions.indexOf(d.properties.CONTINENT), 1);
            }
            filterScatter();
        })
        .on('mouseout', function(d) {
            d3.select(this).classed('continent-hover', false);
            d3.select(this).attr('fill', d => vis.colorScale(d.properties.CONTINENT));
        });
};

WorldLegend.prototype.selectedRegionsText = function() {
    let vis = this;

    if (vis.selectedRegions.length === 0) {
        return 'around the world'
    }
    return vis.selectedRegions.join(', ')
}