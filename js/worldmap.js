//GLOBAL VARIABLES AND DATA LOAD
var mapData;
var countryData={};

//SIZE VARIABLES
var mapWidth = 600,
    mapHeight = 500,
    barMargin ={top:20, right:60, bottom:20, left:60},
    barWidth = 600 - barMargin.left - barMargin.right,
    barHeight = 300 - barMargin.top - barMargin.bottom;

//FORMAT SETTINGS   
var ratioFormat = d3.format(".0%");

//BAR CHART
var barSVG = d3.select(".bar-area")
                .append("svg")
                .attr("width", barWidth + barMargin.left + barMargin.right)
                .attr("height", barHeight + barMargin.top + barMargin.bottom)
                .attr("class","world-data-bar")
                .append("g")
                .attr("transform", "translate(" + barMargin.left + "," + barMargin.top + ")");

var barXScale = d3.scaleBand()
    .range([0, barWidth])
    .paddingInner(0.1);

var barYScale  = d3.scaleLinear()
    .range([barHeight, 0]);

//Bar CHART AXIS (X AXIS WILL BE BE IMPLEMENTED - SETTINGS ARE PLACEHOLDER)
var xAxisBar = d3.axisBottom()
    .scale(barXScale);

var yAxisBar = d3.axisLeft()
    .scale(barYScale);

var xAxisGroupBar = barSVG.append("g")
    .attr("class", "x-axis-bar axis")
    .attr("transform", "translate(0," + barHeight + ")")

var yAxisGroupBar = barSVG.append("g")
    .attr("class", "y-axis-bar axis")

var yAxisTitleBar = barSVG.append("text")
    .attr("class", "axis-title-bar")
    .attr("text-anchor", "middle")
    .attr("y", -10)
    .attr("x", 0);

// LOADING DATA
queue()
  .defer(d3.json, "//www.cs171.org/2018/assets/scripts/lab7/world-110m.json")
  .defer(d3.csv, "data/merged_worldmap.csv")
  .await(function(error, mapTopJson, countryDataCSV){
    
    // PROCESSING DATA
    mapData = mapTopJson;


    countryDataCSV.forEach(function(d){  
      
      if(typeof(countryData[d.id])=='undefined'){
        countryData[d.id]={};
      };
      countryData[d.id][d["Year"]] = d;

        countryData[d.id][d["Year"]].All_Causes_Total = +countryData[d.id][d["Year"]].All_Causes_Total;
        countryData[d.id][d["Year"]].Population_Total = +countryData[d.id][d["Year"]].Population_Total;
        countryData[d.id][d["Year"]].Communicable_Total = +countryData[d.id][d["Year"]].Communicable_Total;
        countryData[d.id][d["Year"]].Noncommunicable_Total = +countryData[d.id][d["Year"]].Noncommunicable_Total;
        countryData[d.id][d["Year"]].Injuries_Total = +countryData[d.id][d["Year"]].Injuries_Total;
        countryData[d.id][d["Year"]].Cardiovascular_Total = +countryData[d.id][d["Year"]].Cardiovascular_Total;
        countryData[d.id][d["Year"]].ratio_Total = countryData[d.id][d["Year"]].Cardiovascular_Total / countryData[d.id][d["Year"]].All_Causes_Total;  
        countryData[d.id][d["Year"]].Population_Total = +countryData[d.id][d["Year"]].Population_Total; 
        countryData[d.id][d["Year"]].Infectious_Total = +countryData[d.id][d["Year"]].Infectious_Total; 
        countryData[d.id][d["Year"]].Malignant_Total = +countryData[d.id][d["Year"]].Malignant_Total; 
        countryData[d.id][d["Year"]].Mental_Total = +countryData[d.id][d["Year"]].Mental_Total; 
        countryData[d.id][d["Year"]].Neurological_Total = +countryData[d.id][d["Year"]].Neurological_Total; 
        countryData[d.id][d["Year"]].Sense_Total = +countryData[d.id][d["Year"]].Sense_Total; 
        countryData[d.id][d["Year"]].Cardiovascular_Total = +countryData[d.id][d["Year"]].Cardiovascular_Total; 
        countryData[d.id][d["Year"]].Respiratory_Total = +countryData[d.id][d["Year"]].Respiratory_Total; 
        countryData[d.id][d["Year"]].Musculoskeletal_Total = +countryData[d.id][d["Year"]].Musculoskeletal_Total; 
        countryData[d.id][d["Year"]].Unintentional_Total = +countryData[d.id][d["Year"]].Unintentional_Total; 
        countryData[d.id][d["Year"]].Intentional_Total = +countryData[d.id][d["Year"]].Intentional_Total; 

        countryData[d.id][d["Year"]].All_Causes_Male = +countryData[d.id][d["Year"]].All_Causes_Male;
        countryData[d.id][d["Year"]].Cardiovascular_Male = +countryData[d.id][d["Year"]].Cardiovascular_Male;
        countryData[d.id][d["Year"]].ratio_Male = countryData[d.id][d["Year"]].Cardiovascular_Male / countryData[d.id][d["Year"]].All_Causes_Male;  

        countryData[d.id][d["Year"]].All_Causes_Female = +countryData[d.id][d["Year"]].All_Causes_Female;
        countryData[d.id][d["Year"]].Cardiovascular_Female = +countryData[d.id][d["Year"]].Cardiovascular_Female;
        countryData[d.id][d["Year"]].ratio_Female = countryData[d.id][d["Year"]].Cardiovascular_Female / countryData[d.id][d["Year"]].All_Causes_Female;    
  
    })
   
    vis_corophlet();

  });

var vis_corophlet = function(){

  //MAP LEGEND AS PLACE HOLDER - WAITING FOR FEEDBACK

    // //Create Legend Svg
    // var legendSVG = d3.select(".worldmap-legend")
    // .append("svg")
    // .attr("width", 180)
    // .attr("height", 100)
    // .append("g")
    // .attr("transform","translate(30,30)");

    // legendSVG.append("text")
    // .attr("y", 5)
    // .attr("x",20)
    // .style("text-anchor", "middle")
    // .attr("class","colorText_first");

    // legendSVG.append("text")
    // .attr("y", 5)
    // .attr("x",120)
    // .style("text-anchor", "middle")
    // .attr("class","colorText_second");

    // CREATING SVG MAP
    var mapSVG = d3.select("#chart-area-3")
    .append("svg")
    .attr("width", mapWidth)
    .attr("height", mapHeight)
    .append("g");

    // SET PROJECTIONS
    var projection = d3.geoMercator()
    .scale(95)
    .translate( [mapWidth / 2, mapHeight / 1.5]);

    //CREATING PATH
    var path = d3.geoPath()
    .projection(projection);

    
    
      d3.select("#select-box-rank").on("change", updateChoropleth);
      d3.select("#select-box-year").on("change", updateChoropleth);
    
      updateChoropleth();

      function updateChoropleth() {
        
      //Select dropdown value
      var selectValue = d3.select("#map-ranking-type").property("value");
      var selectYear = d3.select("#map-year-type").property("value");


      // Color Scales
      var colorRatio = d3.scaleThreshold()
                              .domain([0.01,0.05,0.1,0.15,0.2,0.25,0.3,0.35,0.4,0.45,0.5])
                              .range(["#f4d8dc","#ecbec4","#e5a3ac","#dd8994","#d56f7c","#ce5464","#c63a4c","#ac3242","#922a38","#78222e","#5d1b23"]);

      var colorMaleRatio = d3.scaleThreshold()
                              .domain([0.01,0.05,0.1,0.15,0.2,0.25,0.3,0.35,0.4,0.45,0.5])
                              .range(["#f0f7f4","#daece3","#c4e0d3","#add5c2","#97c9b1","#80bea1","#6ab290","#55a57f","#4a8e6e","#3e785d","#"]);
                  
      var colorFemaleRatio = d3.scaleThreshold()
                              .domain([0.01,0.05,0.1,0.15,0.2,0.25,0.3,0.35,0.4,0.45,0.5])
                              .range(["#f3f2f7","#deddeb","#cac8de","#b5b3d1","#a19dc5","#8c88b8","#7773ab","#645e9e","#565289","#494573","#3b385e"]);

      var colorScales = {"ratio_Total":colorRatio,"ratio_Male":colorMaleRatio, "ratio_Female":colorFemaleRatio};

      var fillColor = function(d){

        if(countryData[d.id]){
         
          return colorScales[selectValue](countryData[d.id][selectYear][selectValue]);
        }
        return "#CCCCCC"        
      }

    // Convert TopoJSON to GeoJSON
    var world = topojson.feature(mapData, mapData.objects.countries).features
      
    // Create Paths
        var newPath = mapSVG.selectAll("path")
                          .data(world);
    
        newPath.enter()
              .append("path")
              .attr("d", path)
              .attr("stroke", "white")
              .attr("fill",fillColor)
              .on("click", function(d) {
                
                $(".info-on-demand").hide();

                d3.select(this).style("stroke-width", 4);
                $(".world-data-bar").css("opacity",1);
                $(".compare").css("display","block");
                $(".bar-area-name").html("Country: "+ countryData[d.id][selectYear].Country);
                $(".bar-area-population").html("Population: "+ countryData[d.id][selectYear].Population_Total+"K");
                $(".bar-area-ratio").html("Cardiovascular Diseases Ratio: "+ ratioFormat(countryData[d.id][selectYear].ratio_Total));

                  if (countryData[d.id]){                      
                 var bardata = [{name:"Cardiovascular diseases", rank: countryData[d.id][selectYear].Cardiovascular_Total}, {name:"Infectious and parasitic diseases", rank: countryData[d.id][selectYear].Infectious_Total},{name: "Malignant neoplasms", rank: countryData[d.id][selectYear].Malignant_Total},{name: "Mental and substance use disorders", rank: countryData[d.id][selectYear].Mental_Total},{name: "Neurological conditions", rank: countryData[d.id][selectYear].Neurological_Total},{name: "Sense Organ Diseases", rank: countryData[d.id][selectYear].Sense_Total},{name: "Respiratory Diseases", rank: countryData[d.id][selectYear].Respiratory_Total},{name: "Musculoskeletal Diseases", rank: countryData[d.id][selectYear].Musculoskeletal_Total},{name: "Unintentional Injuries", rank: countryData[d.id][selectYear].Unintentional_Total},{name: "Intentional Injuries", rank: countryData[d.id][selectYear].Intentional_Total}];
                 barXScale.domain(bardata.map(function(d){return d.name}));
                 barYScale.domain([0,d3.max(bardata,function(d){return d.rank})]);
                 console.log(bardata);

                 var barChart = barSVG.selectAll("rect")
                                .data(bardata);
                  
                barChart.enter()
                          .append("rect")
                          .attr("height",0)
                          .attr("y",barHeight)
                          .on("mouseover",function(d){
                            $(".tooltip-bar").html(d.name);
                            $(".tooltip-bar").css("left", (d3.event.pageX + 10) + "px");
                            $(".tooltip-bar").css("top", (d3.event.pageY + 10) + "px");
                            $(".tooltip-bar").css("display","block");
                          })
                          .on("mouseout",function(d){
                            $(".tooltip-bar").css("display","none");
                          })

                .merge(barChart)
                    .transition()
                    .duration(1000)        
                    .attr("x", function(d) { return barXScale(d.name); })
                    .attr("y", function(d) { return barYScale(d.rank); })
                    .attr("width", barXScale.bandwidth())
                    .attr("height",function(d){return barHeight - barYScale(d.rank)})
                    .attr("fill",function(d){
                      if (d.name == "Cardiovascular diseases"){
                        return "#d72748"
                      }
                      else{
                        return "#b9b4b5"
                      }
                    });
                    

                barChart.exit().remove(); 
                
                // xAxisGroupBar = barSVG.select(".x-axis-bar")
                // .attr("transform", "translate(0," + barHeight + ")")
                // .transition()
                // .duration(1000)
                // .call(xAxisBar);
            
              yAxisGroupBar = barSVG.select(".y-axis-bar")
                .call(yAxisBar);
                
                  }
                  else{
                    console.log("else");
                  $(".tooltip-map").html("No Information")
                  .css("left", (d3.event.pageX + 10) + "px")
                  .css("top", (d3.event.pageY + 10) + "px")
                  .css("display","block");
                  }  
                
                })
              .on("mouseout", function(d) {
                $(".tooltip-map").css("display", "none");
                // $(".world-data-bar").css("opacity",0);
                d3.select(this).style("stroke-width", 1);
                });              

              newPath.attr("fill", fillColor);

    //Create Legend
    //   var legend = legendSVG.selectAll("rect")
    //                         .data(colorData[selectValue])

    //       legend.enter()
    //             .append("rect")
    //             .attr("height", 15)
    //             .attr("width", 30)
    //             .attr("fill", function(d){return d})
    //             .attr("x",function(d,i){return (i*30)+10 })
    //             .attr("y", 10);

    //     legend.attr("fill", function(d){return d});


    // if (selectValue == "Improved_Water_2015" || selectValue == "Improved_Sanitation_2015"){
    //     legendSVG.select(".colorText_first").text(parseInt(d3.extent(Object.keys(countryData).map(function(d){return countryData[d][selectValue]}))[0])+"%"); 
    //     legendSVG.select(".colorText_second").text(parseInt(d3.extent(Object.keys(countryData).map(function(d){return countryData[d][selectValue]}))[1])+"%"); 
    // }

    // else{
    //   legendSVG.select(".colorText_first").text(parseInt(d3.extent(Object.keys(countryData).map(function(d){return countryData[d][selectValue]}))[0])); 
    //     legendSVG.select(".colorText_second").text(parseInt(d3.extent(Object.keys(countryData).map(function(d){return countryData[d][selectValue]}))[1]));
    // }



    }

  }