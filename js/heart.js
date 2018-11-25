

/*
 * BeatingHeart - Object constructor function
 * @param _parentElement 	-- the HTML element in which to draw the visualization
 * @param _data				-- the data
 */

BeatingHeart = function(_parentElement, _data){
    this.parentElement = _parentElement;
    this.data = _data;
    this.iconSize = 40;
    this.transitionDuration = 3000;
    this.initVis();
};



/*
 * Initialize visualization (static content, e.g. SVG area or axes)
 */

BeatingHeart.prototype.initVis = function(){
    let vis = this;

    const boundingBox = d3.select(vis.parentElement).node().getBoundingClientRect();

    vis.margin = { top: vis.iconSize, right: vis.iconSize, bottom: vis.iconSize, left: vis.iconSize };

    vis.width = boundingBox.width - vis.margin.left - vis.margin.right;
    vis.height = boundingBox.height - vis.margin.top - vis.margin.bottom;

    // SVG drawing area
    vis.svg = d3.select(vis.parentElement).append("svg")
        .attr("width", vis.width + vis.margin.left + vis.margin.right)
        .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
        .append("g")
        .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");

    vis.radius = Math.min(vis.width, vis.height)/2;

    // TO-DO: (Filter, aggregate, modify data)
    vis.updateVis();
};


/*
 * The drawing function - should use the D3 update sequence (enter, update, exit)
 * Function parameters only needed if different kinds of updates are needed
 */

BeatingHeart.prototype.updateVis = function() {
    let vis = this;

    let risk_factors = vis.svg.selectAll('.risk-factor').data(vis.data);
    let risk_factors_enter = risk_factors.enter().append('g')
        .classed('risk-factor', true);
    let risk_factor_icons = risk_factors_enter.selectAll('image').data(d => d3.range(d.number).map(i => d.source))
        .enter().append('image')
        .attr('xlink:href', d => d)
        .attr('x', vis.width/2)
        .attr('y', vis.height/2)
        .attr('width', vis.iconSize)
        .attr('height', vis.iconSize);
    function loopTransition(){
        risk_factor_icons
            .attr('transform', 'translate(0,0)')
            .transition().duration(vis.transitionDuration)
            .attr('transform', function(){
                let angle = Math.random()*Math.PI*2;
                let newX = Math.cos(angle)*vis.radius;
                let newY = Math.sin(angle)*vis.radius;
                return 'translate('+newX+','+newY+')';
            })
            .on('end', loopTransition);
    }
    loopTransition();

};
