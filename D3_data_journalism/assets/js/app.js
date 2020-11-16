var svgWidth = 960;
var svgHeight = 500;

var margin = {
  top: 20,
  right: 40,
  bottom: 100,
  left: 100
};

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

// Create an SVG wrapper, append an SVG group that will hold our chart,
// and shift the latter by left and top margins.
var svg = d3
  .select("#scatter")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);

// Append an SVG group
var chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Initial Params
var chosenXAxis = "poverty";
var chosenYAxis = "healthcare";

// function used for updating x-scale var upon click on axis label
function xScale(data, chosenXAxis) {
  // create scales
  var xLinearScale = d3.scaleLinear()
    .domain([d3.min(data, d => d[chosenXAxis]) * 0.8,
      d3.max(data, d => d[chosenXAxis]) * 1.2
    ])
    .range([0, width]);

  return xLinearScale;

}

// function used for updating y-scale var upon click on axis label
function yScale(data, chosenYAxis) {
    // create scales
    var yLinearScale = d3.scaleLinear()
      .domain([d3.min(data, d => d[chosenYAxis]) * 0.8,
        d3.max(data, d => d[chosenYAxis]) * 1.2
      ])
      .range([0, width]);
  
    return yLinearScale;
  }

// function used for updating xAxis var upon click on axis label
function renderAxisX(newXScale, xAxis) {
  var bottomAxis = d3.axisBottom(newXScale);

  xAxis.transition()
    .duration(1000)
    .call(bottomAxis);

  return xAxis;
}

// function used for updating yAxis var upon click on axis label
function renderAxisY(newYScale, yAxis) {
    var leftAxis = d3.axisLeft(newYScale);
  
    yAxis.transition()
      .duration(1000)
      .call(leftAxis);
  
    return yAxis;
  }

// function used for updating circles group with a transition to
// new circles
function renderCirclesX(circlesGroup, newXScale, chosenXAxis) {

  circlesGroup.transition()
    .duration(1000)
    .attr("cx", d => newXScale(d[chosenXAxis]))
    .attr("cy", d => newYScale(d[chosenYAxis]));

  return circlesGroup;
}

function renderCirclesY(circlesGroup, newYScale, chosenYAxis) {

    circlesGroup.transition()
      .duration(1000)
      .attr("cy", d => newYScale(d[chosenYAxis]));
  
    return circlesGroup;
  }

// function used for updating circles group with new tooltip
function updateToolTipX(chosenXAxis, circlesGroup) {

    var labelX;

    labelX = `${chosenXAxis}:`

    // if (chosenXAxis === "poverty") {
    // labelX = "Poverty %:";
    // }
    // else {
    // labelX = ":";
    // }

    var toolTipX = d3.tip()
    .attr("class", "tooltip")
    .offset([80, -60])
    .html(function(d) {
        return (`${d[chosenXAxis]}<br>${labelX} ${d[chosenXAxis]}`);
    });

    circlesGroup.call(toolTipX);

    circlesGroup.on("mouseover", function(data) {
        toolTipX.show(data);
    })

    // onmouseout event
    .on("mouseout", function(data, index) {
      toolTipX.hide(data);
    });

  return circlesGroup;
}

function updateToolTipY(chosenYAxis, circlesGroup) {

    var labelY;

    if (chosenYAxis === "healthcare") {
        labelY = "Healthcare %:";
    }
    else {
        labelY = "Healthcare2 %:";
    }

    var toolTipY = d3.tip()
    .attr("class", "tooltip")
    .offset([80, -60])
    .html(function(d) {
      return (`${d.healthcare}<br>${labelY} ${d[chosenYAxis]}`);
    });



    circlesGroup.call(toolTipY);

    circlesGroup.on("mouseover", function(data) {
        toolTipY.show(data);
    })

    // onmouseout event
    .on("mouseout", function(data, index) {
      toolTipY.hide(data);
    });

  return circlesGroup;
}

d3.csv('assets/data/data.csv').then(function(stateData, err){
    if (err) throw err;

    stateData.forEach(function(data) {
        // console.log(data);
        data.poverty = +data.poverty;
        data.healthcare = +data.healthcare;
    })

    // xLinearScale function above csv import
  var xLinearScale = xScale(stateData, chosenXAxis);

  // Create y scale function
  var yLinearScale = yScale(stateData, chosenYAxis);

  // Create initial axis functions
  var bottomAxis = d3.axisBottom(xLinearScale);
  var leftAxis = d3.axisLeft(yLinearScale);

    // append x axis
    var xAxis = chartGroup.append("g")
        .classed("x-axis", true)
        .attr("transform", `translate(0, ${height})`)
        .call(bottomAxis);

    // append x axis
    var yAxis = chartGroup.append("g")
        .classed("y-axis", true)
        .attr("transform", `translate(0, 0)`)
        .call(leftAxis);

    // append initial circles
    var circlesGroup = chartGroup.selectAll("circle")
        .data(stateData)
        .enter()
        .append("circle")
        .attr("cx", d => xLinearScale(d[chosenXAxis]))
        .attr("cy", d => yLinearScale(d[chosenYAxis]))
        .attr("r", 20)
        .attr("fill", "blue")
        .attr("opacity", ".5");

  // Create group for three x-axis labels
    var labelsGroupX = chartGroup.append("g")
        .attr("transform", `translate(${width / 2}, ${height + 20})`);

        var povertyLabel = labelsGroupX.append("text")
            .attr("x", 0)
            .attr("y", 20)
            .attr("valueX", "poverty") // value to grab for event listener
            .classed("active", true)
            .text("In Poverty (%)");

        var ageLabel = labelsGroupX.append("text")
            .attr("x", 0)
            .attr("y", 40)
            .attr("valueX", "age") // value to grab for event listener
            .classed("inactive", true)
            .text("Age (Median)");

        var incomeLabel = labelsGroupX.append("text")
            .attr("x", 0)
            .attr("y", 60)
            .attr("valueX", "income") // value to grab for event listener
            .classed("inactive", true)
            .text("Household Income (Median)");

  // append y axis
    var labelsGroupY = chartGroup.append("g")
        .attr("transform", `translate(0, 0)`);

        var heathcareLabel = labelsGroupY.append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 60 - margin.left)
            .attr("x", 0 - (height / 2))
            .attr("valueY", "healthcare")
            .classed("active", true)
            .text("Lacks Healthcare (%)");

        var smokerLabel = labelsGroupY.append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 40 - margin.left)
            .attr("x", 0 - (height / 2))
            .attr("valueY", "smokes")
            .classed("inactive", true)
            .text("Smoker (%)");

        var obesityLabel = labelsGroupY.append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 20 - margin.left)
            .attr("x", 0 - (height / 2))
            .attr("valueY", "obesity")
            .classed("inactive", true)
            .text("Obesity (%)");

  // updateToolTip function above csv import
  var circlesGroup = updateToolTipX(chosenXAxis, circlesGroup);
  var circlesGroup = updateToolTipY(chosenYAxis, circlesGroup);

  // x axis labels event listener
    labelsGroupX.selectAll("text")
        .on("click", function() {

      // get x value of selection
      var valueX = d3.select(this).attr("valueX");

      if (valueX !== chosenXAxis) {

        // replaces chosenXAxis with value
        chosenXAxis = valueX;

        console.log(`x-axis: ${chosenXAxis}`)

        // functions here found above csv import
        // updates x scale for new data
        xLinearScale = xScale(stateData, chosenXAxis);

        // updates x axis with transition
        xAxis = renderAxisX(xLinearScale, xAxis);

        // updates circles with new x values
        circlesGroup = renderCirclesX(circlesGroup, xLinearScale, chosenXAxis);

        // updates tooltips with new info
        circlesGroup = updateToolTipX(chosenXAxis, circlesGroup);

        // changes classes to change bold text for x axis
        if (chosenXAxis === "poverty") {
            povertyLabel
                .classed("active", true)
                .classed("inactive", false);
            ageLabel
                .classed("active", false)
                .classed("inactive", true);
            incomeLabel
                .classed("active", false)
                .classed("inactive", true);
        }
        else if (chosenXAxis === "age") {
            povertyLabel
                .classed("active", false)
                .classed("inactive", true);
            ageLabel
                .classed("active", true)
                .classed("inactive", false);
            incomeLabel
                .classed("active", false)
                .classed("inactive", true);
        }
        else {
            povertyLabel
                .classed("active", false)
                .classed("inactive", true);
            ageLabel
                .classed("active", false)
                .classed("inactive", true);
            incomeLabel
                .classed("active", true)
                .classed("inactive", false);
        }
      }
    });

    // y axis labels event listener
    labelsGroupY.selectAll("text")
        .on("click", function() {

    // get value of selection
    var valueY = d3.select(this).attr("valueY");

    if (valueY !== chosenYAxis) {

      // replaces chosenXAxis with value
      chosenYAxis = valueY;

      console.log(`y-axis: ${chosenYAxis}`)

      // functions here found above csv import
      // updates y scale for new data
      yLinearScale = yScale(stateData, chosenYAxis);

      // updates y axis with transition
      yAxis = renderAxisY(yLinearScale, yAxis);

      // updates circles with new y values
      circlesGroup = renderCirclesY(circlesGroup, yLinearScale, chosenYAxis);

      // updates tooltips with new info
      circlesGroup = updateToolTipY(chosenYAxis, circlesGroup);

      // changes classes to change bold text for y axis
      if (chosenYAxis === "healthcare") {
          heathcareLabel
              .classed("active", true)
              .classed("inactive", false);
          smokerLabel
              .classed("active", false)
              .classed("inactive", true);
          obesityLabel
              .classed("active", false)
              .classed("inactive", true);
      }
      else if (valueY === "smokes") {
          heathcareLabel
              .classed("active", false)
              .classed("inactive", true);
          smokerLabel
              .classed("active", true)
              .classed("inactive", false);
          obesityLabel
              .classed("active", false)
              .classed("inactive", true);
      }
      else {
          heathcareLabel
              .classed("active", false)
              .classed("inactive", true);
          smokerLabel
              .classed("active", false)
              .classed("inactive", true);
          obesityLabel
              .classed("active", true)
              .classed("inactive", false);
      }
    }
  });
}).catch(function(error) {
  console.log(error);
});