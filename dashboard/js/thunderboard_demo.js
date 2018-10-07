const deviceHID = "Your Device HID Here";
const gatewayHID = "Your Gateway HID Here";
// Gateway raw api key
const xAuthToken = "Your RAW API KEY HERE";
const requestURL = "https://api-a01.arrowconnect.io/api/v1/kronos/telemetries/devices/" + deviceHID + "/latest";
const sendCommandURL = "https://api-a01.arrowconnect.io/api/v1/kronos/gateways/" + gatewayHID + "/devices/" + deviceHID + "/actions/command";

var humiditySeries = new TimeSeries();
var temperatureSeries = new TimeSeries();
var c02Series = new TimeSeries();
var vocSeries = new TimeSeries();
var lightSeries = new TimeSeries();
var pressureSeries = new TimeSeries();
var uvLevelSeries = new TimeSeries();
var micLevelSeries = new TimeSeries();
const refreshDelay = 5000;
const scrollSpeed = 50;

var humidityChart;
var temperatureChart;
var c02Chart;
var vocChart;
var lightChart;
var pressureChart;
var uvLevelChart;
var micLevelChart;

$(document).ready( function() {
    window.setInterval(refresh, refreshDelay);

    $("#stream_enabled_check").change(onStreamCheckboxChange);

    $("#red_led_slider").mouseup(onSliderMouseUp);
    $("#blue_led_slider").mouseup(onSliderMouseUp);

    var chartOptions = {responsive: true,
                        millisPerPixel: scrollSpeed,
                        maxValueScale: 1.25,
                        minValueScale: 1.25};

    humidityChart = new SmoothieChart(chartOptions);
    humidityChart.streamTo(document.getElementById("humidity_canvas"), refreshDelay);
    humidityChart.addTimeSeries(humiditySeries);

    temperatureChart = new SmoothieChart(chartOptions);
    temperatureChart.streamTo(document.getElementById("temperature_canvas"), refreshDelay);
    temperatureChart.addTimeSeries(temperatureSeries);

    c02Chart = new SmoothieChart(chartOptions);
    c02Chart.streamTo(document.getElementById("c02_canvas"), refreshDelay);
    c02Chart.addTimeSeries(c02Series);

    vocChart = new SmoothieChart(chartOptions);
    vocChart.streamTo(document.getElementById("voc_canvas"), refreshDelay);
    vocChart.addTimeSeries(vocSeries);
    
    lightChart = new SmoothieChart(chartOptions);
    lightChart.streamTo(document.getElementById("light_canvas"), refreshDelay);
    lightChart.addTimeSeries(lightSeries);

    pressureChart = new SmoothieChart(chartOptions);
    pressureChart.streamTo(document.getElementById("pressure_canvas"), refreshDelay);
    pressureChart.addTimeSeries(pressureSeries);

    uvLevelChart = new SmoothieChart(chartOptions);
    uvLevelChart.streamTo(document.getElementById("uvLevel_canvas"), refreshDelay);
    uvLevelChart.addTimeSeries(uvLevelSeries);

    micLevelChart = new SmoothieChart(chartOptions);
    micLevelChart.streamTo(document.getElementById("micLevel_canvas"), refreshDelay);
    micLevelChart.addTimeSeries(micLevelSeries);
});

function draw3ColumnChart_negative(canvasId, x, y, z, maxValue) {
    var canvas = document.getElementById(canvasId);
    var ctx = canvas.getContext("2d");
    var columnHeight;
    
    var columnGap = 10;
    var columnWidth = (canvas.width - (4 * columnGap)) / 3.0;
    
    var bottomGap = 5;
    var topGap = 5;
    var textAreaHeight = 20;
    var textToColumnGap = 10;
    var columnTopOffset = (topGap + textAreaHeight + textToColumnGap);
    var columnMaxHeight = canvas.height - (bottomGap + columnTopOffset);

    // Draw background
    ctx.fillStyle = "#000000";
    ctx.fillRect(0,0,canvas.width,canvas.height);

    // Draw Column Labels
    ctx.fillStyle = "#FFFFFF";
    ctx.font = textAreaHeight + "px Arial";
    var labelWidth = ctx.measureText("X").width;
    var labelXPos = columnGap + (columnWidth / 2) - (labelWidth/2);
    ctx.fillText("X", labelXPos, topGap + textAreaHeight);
    var labelWidth = ctx.measureText("Y").width;
    var labelXPos = columnGap + (columnGap + columnWidth) + (columnWidth / 2) - (labelWidth/2);
    ctx.fillText("Y",labelXPos, topGap + textAreaHeight);
    var labelWidth = ctx.measureText("Z").width;
    var labelXPos = columnGap + (columnGap * 2 + columnWidth * 2) + (columnWidth / 2) - (labelWidth/2);
    ctx.fillText("Z",labelXPos, topGap + textAreaHeight);

    // Draw Columns
    columnHeight = (columnMaxHeight/2) * (x/maxValue);
    columnXPos = columnGap;
    ctx.fillStyle = "#9b4141";
    ctx.fillRect(columnXPos, columnTopOffset + (columnMaxHeight/2) - columnHeight, columnWidth, columnHeight);

    columnHeight = (columnMaxHeight/2) * (y/maxValue);
    columnXPos += (columnGap + columnWidth);
    ctx.fillStyle = "#419b4e";
    ctx.fillRect(columnXPos, columnTopOffset + (columnMaxHeight/2) - columnHeight, columnWidth, columnHeight);

    columnHeight = (columnMaxHeight/2) * (z/maxValue);
    columnXPos += (columnGap + columnWidth);
    ctx.fillStyle = "#41639b";
    ctx.fillRect(columnXPos, columnTopOffset + (columnMaxHeight/2) - columnHeight, columnWidth, columnHeight);

    // Draw Center Line
    ctx.strokeStyle = "#FFFFFF";
    ctx.beginPath();
    ctx.moveTo(5,columnTopOffset + (columnMaxHeight/2));
    ctx.lineTo(canvas.width-5,columnTopOffset + (columnMaxHeight/2));
    ctx.stroke();
}

function draw3ColumnChart(canvasId, x, y, z, maxValue) {
    var canvas = document.getElementById(canvasId);
    var ctx = canvas.getContext("2d");
    var columnHeight;
    
    var columnGap = 10;
    var columnWidth = (canvas.width - (4 * columnGap)) / 3.0;
    
    var bottomGap = 5;
    var topGap = 5;
    var textAreaHeight = 20;
    var textToColumnGap = 10;
    var columnTopOffset = (topGap + textAreaHeight + textToColumnGap);
    var columnMaxHeight = canvas.height - (bottomGap + columnTopOffset);

    // Draw background
    ctx.fillStyle = "#000000";
    ctx.fillRect(0,0,canvas.width,canvas.height);

    // Draw Column Labels
    ctx.fillStyle = "#FFFFFF";
    ctx.font = textAreaHeight + "px Arial";
    var labelWidth = ctx.measureText("X").width;
    var labelXPos = columnGap + (columnWidth / 2) - (labelWidth/2);
    ctx.fillText("X", labelXPos, topGap + textAreaHeight);
    var labelWidth = ctx.measureText("Y").width;
    var labelXPos = columnGap + (columnGap + columnWidth) + (columnWidth / 2) - (labelWidth/2);
    ctx.fillText("Y",labelXPos, topGap + textAreaHeight);
    var labelWidth = ctx.measureText("Z").width;
    var labelXPos = columnGap + (columnGap * 2 + columnWidth * 2) + (columnWidth / 2) - (labelWidth/2);
    ctx.fillText("Z",labelXPos, topGap + textAreaHeight);

    // Draw Columns
    columnHeight = columnMaxHeight * (x/maxValue);
    columnXPos = columnGap;
    ctx.fillStyle = "#9b4141";
    ctx.fillRect(columnXPos, columnTopOffset + (columnMaxHeight - columnHeight), columnWidth, columnHeight);

    columnHeight = columnMaxHeight * (y/maxValue);
    columnXPos += (columnGap + columnWidth);
    ctx.fillStyle = "#419b4e";
    ctx.fillRect(columnXPos, columnTopOffset + (columnMaxHeight - columnHeight), columnWidth, columnHeight);

    columnHeight = columnMaxHeight * (z/maxValue);
    columnXPos += (columnGap + columnWidth);
    ctx.fillStyle = "#41639b";
    ctx.fillRect(columnXPos, columnTopOffset + (columnMaxHeight - columnHeight), columnWidth, columnHeight);
}

function drawLED(color, canvasId) {
    console.log(color);
    var canvas = document.getElementById(canvasId);
    var ctx = canvas.getContext("2d");

    // Draw background
    ctx.fillStyle = "#000000";
    ctx.fillRect(0,0,canvas.width,canvas.height);

    var centerX = canvas.width / 2;
    var centerY = canvas.height / 2;
    var radius = 0.8 * (canvas.height / 2);

    // Draw Circle
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI, false);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.lineWidth = 5;
    ctx.strokeStyle = '#666666';
    ctx.stroke();
}

function onSliderMouseUp(event) {
    var slider_value = $(this).val();

    switch (this.id) {
        case 'red_led_slider':
            setLEDLevel('red', slider_value);
        break;
        case 'blue_led_slider':
            setLEDLevel('blue', slider_value);
        break;
    }

    console.log(this.id + " value: " + slider_value);
}

function setLEDLevel(led_color, intensity) {
    pwm_freq = 0;
    pwm_duty = 0;

    command_data = JSON.stringify({
        command: "TE_command",
        deviceHid: deviceHID,
        payload: JSON.stringify({
            cmd_name: "LED_dim",
            color: led_color,
            pwm_freq: pwm_freq,
            pwm_duty: pwm_duty
        })
    });
    
    $.ajax({
        crossDomain: true,
        url: sendCommandURL,
        method: "POST",
        headers: {
            "x-auth-token": xAuthToken,
            "content-type": "application/json",
            "cache-control": "no-cache",
        },
        processData : false,
        data: command_data
    });
}

function onStreamCheckboxChange() {
    if ($('#stream_enabled_check').is(':checked')) {
        humidityChart.start();
        temperatureChart.start();
        c02Chart.start();
        vocChart.start();
        lightChart.start();
        voltChart.start();
    } else {
        humidityChart.stop();
        temperatureChart.stop();
        c02Chart.stop();
        vocChart.stop();
        lightChart.stop();
        voltChart.stop();
    }
}

function refresh() {
        
    $.ajax({
        crossDomain: true,
        url: requestURL,
        method: "GET",
        headers: {
            "x-auth-token": xAuthToken, 
            "cache-control": "no-cache",
        },
        success: function(response) {
            updateDisplayValues(response.data);
        } 
    });

}

function leftPad(val) {
    if (val.length == 2) {
        return val;
    }
    return "0" + val;
}

function updateDisplayValues(dataList) {
    dataList.forEach(function(sensorValue) {
        switch (sensorValue.name) {
            case "light":
                light = sensorValue.floatValue;
                lightSeries.append(new Date().getTime(), light);
                $('#light_text_span').text(light.toFixed(0) + ' lux');
                break;
            case "co2Level":
                co2 = sensorValue.floatValue;
                c02Series.append(new Date().getTime(), co2);
                $("#c02_text_span").text(co2.toFixed(0) + ' ppm');
                break;
            case "vocLevel":
                voc = sensorValue.floatValue;
                vocSeries.append(new Date().getTime(), voc);
                $('#voc_text_span').text(voc.toFixed(0) + ' ppb');
                break;
            case "temperature":
                temperature = sensorValue.floatValue;
                temperatureSeries.append(new Date().getTime(), temperature);
                $("#temperature_text_span").text(temperature.toFixed(2) + ' \u00B0F');
                break;
            case "humidity":
                humidity = sensorValue.floatValue;
                humiditySeries.append(new Date().getTime(), humidity);
                $("#humidity_text_span").text(humidity.toFixed(2) + ' %');
                break;
            case "accelerometerXYZ":
                console.log(sensorValue);
                values = sensorValue.floatCubeValue.split("|")
                x_val = parseFloat(values[0]);
                y_val = parseFloat(values[1]);
                z_val = parseFloat(values[2]);
                draw3ColumnChart_negative("accelerometer_canvas", x_val, y_val, z_val, 1);
                document.getElementById('accel_x_td').innerHTML = x_val.toFixed(2);
                document.getElementById('accel_y_td').innerHTML = y_val.toFixed(2);
                document.getElementById('accel_z_td').innerHTML = z_val.toFixed(2);
                break;
            case "orientationXYZ":
                console.log(sensorValue);
                values = sensorValue.floatCubeValue.split("|")
                x_val = parseFloat(values[0]);
                y_val = parseFloat(values[1]);
                z_val = parseFloat(values[2]);
                draw3ColumnChart_negative("orientation_canvas", x_val, y_val, z_val, 200);
                document.getElementById('orient_x_td').innerHTML = x_val.toFixed(2);
                document.getElementById('orient_y_td').innerHTML = y_val.toFixed(2);
                document.getElementById('orient_z_td').innerHTML = z_val.toFixed(2);
                break;
            case "uvLevel":
                uvLevel = sensorValue.strValue;
                pressureSeries.append(new Date().getTime(), parseInt(uvLevel));
                $("#uvLevel_text_span").text(uvLevel);
                break;
            case "micLevel":
                micLevel = sensorValue.floatValue;
                micLevelSeries.append(new Date().getTime(), micLevel);
                $("#micLevel_text_span").text(Math.trunc(micLevel) + '');
                break;
            case "pressure":
                pressure = sensorValue.floatValue;
                pressureSeries.append(new Date().getTime(), pressure);
                $("#pressure_text_span").text(Math.trunc(pressure) + ' hPa');
                break;
            case "ledstatuscolor":
                values = sensorValue.intSqrValue.split("|");
                brightness = parseInt(values[0]);
                color = parseInt(values[1]);
                color += 4294967296;
                color &= 0xFFFFFF;
                red   = (color & 0xFF0000) >> 16;
                green = (color & 0x00FF00) >> 8;
                blue  = (color & 0x0000FF);

                led_color_string = "#";
                led_color_string += leftPad(red.toString(16));
                led_color_string += leftPad(green.toString(16));
                led_color_string += leftPad(blue.toString(16));

                drawLED(led_color_string, "led_canvas");

                document.getElementById('led_red_td').innerHTML = red;
                document.getElementById('led_green_td').innerHTML = green;
                document.getElementById('led_blue_td').innerHTML = blue;
                break;
            case "orientationZ":
            case "orientationY":
            case "orientationX":
            case "accelerometerZ":
            case "accelerometerY":
            case "accelerometerX":
                break;
            default:
                console.log("UNKOWN SENSOR: " + sensorValue.name);
                console.log(sensorValue);
                console.log("----------------------------------");
        }
    });
}
