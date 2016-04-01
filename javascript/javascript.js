var canvas_html = '<canvas id="graph" class="graph"></canvas><div class="chart-legend"></div>';
var timesToRunDefault = 10000;
var outputsDefault = 80;

var throughputArray = [];               // array to hold throughput values
var delayArray = [];                    // array to hold delay values
var timesToRun = timesToRunDefault;     // number of times to run simulation
var outputs = outputsDefault;           // output percentage

$(document).ready(function() {
  // create simulation slider
  $("#simulation-slider").slider({
    range: "min",
    value: timesToRunDefault,
    max: 99999,
    slide: function(event, ui) {
      if (ui.value == 0) {
        $("#simulation-slider-label").html(ui.value + 1 + " simulation");
      } else {
        $("#simulation-slider-label").html(ui.value + 1 + " simulations");
      }
      timesToRun = ui.value + 1;
    }
  });
  $("#simulation-slider-label").html($("#simulation-slider").slider("value") + " simulations");

  // create output slider
  $("#output-slider").slider({
    range: "min",
    value: outputsDefault,
    max: 100,
    slide: function(event, ui) {
      $("#output-slider-label").html(ui.value + "% chance");
      outputs = ui.value + 1;
    }
  });
  $("#output-slider-label").html($("#output-slider").slider("value") + "% chance");

  // attach listener to rerun simulations button
  $(".rerun-button").click(function() {
    initializeArrays();
    simulate();
    initCanvas();
  })

  // attach listener to reset defaults button
  $(".defaults-button").click(function() {
    $("#simulation-slider").slider("value", timesToRunDefault);
    $("#simulation-slider-label").html(timesToRunDefault + " simulations");
    timesToRun = timesToRunDefault;

    $("#output-slider").slider("value", outputsDefault);
    $("#output-slider-label").html(outputsDefault + " outputs");
    outputs = outputsDefault;
  })

  // make sure at least one checkbox is checked
  $('input:checkbox').change(function() {
    if ($(".checkbox input:checked").length == 0) {
      $(this).prop('checked', true);
      $(".select-one-error").show();
    } else {
      $(".select-one-error").hide();
    }
  })

  // run simulation
  initializeArrays();
  simulate();
  initCanvas();

});

var initCanvas = function() {
  $(".canvas-container").html(canvas_html);
  // determine which lines to show
  var datasetsObj = [];
  if ($("#delay-toggle").is(':checked')) {
    datasetsObj.push({
      label: "Delay",
      fillColor: "rgba(39, 82, 162, 0.2)",
      strokeColor: "rgba(19, 60, 136, 1)",
      pointColor: "rgba(10, 44, 107, 1)",
      pointStrokeColor: "white",
      pointHighlightFill: "white",
      pointHighlightStroke: "rgba(66, 104, 173, 1)",
      data: delayArray
    });
  }
  if ($("#throughput-toggle").is(':checked')) {
    datasetsObj.push({
      label: "Throughput",
      fillColor: "rgba(71, 188, 46, 0.2)",
      strokeColor: "rgba(43, 159, 19, 1)",
      pointColor: "rgba(25, 127, 4, 1)",
      pointStrokeColor: "white",
      pointHighlightFill: "white",
      pointHighlightStroke: "rgba(100, 207, 78, 1)",
      data: throughputArray
    });
  }

  // initialize graph data
  var data = {
    labels: getIntervals(),
    datasets: datasetsObj
  };

  // graph options
  var options = {
    responsive: true
  };

  // create graph
  var ctx = $("#graph").get(0).getContext("2d");
  var chart = new Chart(ctx).Line(data, options);

  // generate legend
  $(".chart-legend").html(chart.generateLegend());
}

var simulate = function() {
  // simulate for each probability, from p = 0 to p = 1, in steps of 0.02
  for (var i = 0; i <= 50; i++) {
    var queue = [];
    var totalDelay = 0;
    var numServicedPackets = 0;
    // run timesToRun simulations
    for (var j = 0; j < timesToRun; j++) {

      // departure of packet at end of queue
      if (Math.random() < outputs / 100 && queue.length > 0) {
        numServicedPackets++;
        totalDelay += (j - queue.shift().arrivalTime);
      }

      // arrival of new packet at end of queue
      if (Math.random() < i / 50 && queue.length < 5) {
        queue.push(new Packet(j));
      }
    }

    // calculate average delay and throughput
    delayArray[i] = (numServicedPackets != 0) ? totalDelay / numServicedPackets : 0;
    throughputArray[i] = (timesToRun != 0) ? numServicedPackets / timesToRun : 0;
  }
}

function Packet(arrivalTime) {
  this.arrivalTime = arrivalTime;
}

var getIntervals = function() {
  var array = [];
  for (var i = 0; i <= 100; i += 2) {
    array.push(i / 100);
  }
  return array;
}

var initializeArrays = function() {
  throughputArray = [];
  delayArray = [];
  for (var i = 0; i <= 50; i++) {
    throughputArray.push(0);
    delayArray.push(0);
  }
}
