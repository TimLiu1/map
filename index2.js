var title = d3.select("h1");
var notesP = d3.select("#notes");
var notes = d3.select("h2");
var loadDevice = [];
let timers = 1
$("*").on("click", function () {
    timers = 1
});

$("*").on("mouseover", function () {
    stopGlobe()
    timers = 1
});
setInterval(() => {
    timers++
    if (timers === 20) {
        rotateGlobe();
    }
}, 1000);

function checkLoadDevice(device) {
    loadDevice.forEach((e) => {
        if (e === device) return true
    })
    return false
}

var height = window.innerHeight,
    width = window.innerWidth,
    margin = { top: 10, right: 10, bottom: 10, left: 10 },
    originalScale = height / 2.0,
    scale = originalScale,
    translation = [width / 2, height / 2],
    scaleChange,
    rotation;
var svg = d3.select("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.top + ", " + margin.left + ")");

var sphere = { type: "Sphere" };

var graticule = d3.geoGraticule();


var space = d3.geoAzimuthalEquidistant()
    .translate([width / 2, height / 2])


var spacePath = d3.geoPath()
    .projection(space)
    .pointRadius(1);

var active = d3.select(null);
// var starList = createStars(2000);

// var stars = svg.append("g")
//     .selectAll("g")
//     .data(starList)
//     .enter()
//     .append("path")
//     .attr("class", "star")
//     .attr("d", function (d) {
//         spacePath.pointRadius(d.properties.radius);
//         return spacePath(d);
//     });


function createStars(number) {
    var data = [];
    for (var i = 0; i < number; i++) {
        data.push({
            geometry: {
                type: 'Point',
                coordinates: randomLonLat()
            },
            type: 'Feature',
            properties: {
                radius: Math.random() * 1.5
            }
        });
    }
    return data;
}

function randomLonLat() {
    return [Math.random() * 360 - 180, Math.random() * 180 - 90];
}



// var projection = d3.geoOrthographic()
//     .scale(scale)
//     .translate(translation)
//     .clipAngle(90)
//     .rotate([-80, -35]);

var projection = d3.geoOrthographic()
    .scale(280)
    .translate(translation)
    .clipAngle(90)
    .rotate([-80, -35]);

// var curvePro = d3.geoOrthographic()
//     .translate(translation)
//     .clipAngle(90)
//     .scale(290)
//     .rotate([-80, -35]);

var path = d3.geoPath().projection(projection);

var swoosh = d3.line()
    .x(function (d) { return d[0] })
    .y(function (d) { return d[1] })
    .curve(d3.curveCardinal.tension(-1));


var velocity = .02;
var timer;

function rotateGlobe() {
    timer = d3.timer(function (elapsed) {
        projection.rotate([velocity * elapsed, 0]);
        // curvePro.rotate([velocity * elapsed, 0])
        reproject()
    });
}

rotateGlobe();
function stopGlobe() {
    timer.stop();
}

// setInterval(rotateGlobe(),60 * 1000)

var links = svg.append("g");
var circle = d3.geoCircle()

// function flying_arc(pts) {
//
//     var source = pts.geometry.coordinates[0],
//         target = pts.geometry.coordinates[1];
//
//     var mid = location_along_arc(source, target, .5);
//     var result = [ projection(source),
//         curvePro(mid),
//         projection(target) ]
//     return result;
// }
//
// function location_along_arc(start, end, loc) {
//     var interpolator = d3.geoInterpolate(start,end);
//     return interpolator(loc)
// }

function flying_arc(pts) {
    var source = pts.geometry.coordinates[0],
        target = pts.geometry.coordinates[1];

    var mid = projection(location_along_arc(source, target, .5));
    var ctr = projection.translate();

    // max length of a great circle arc is π,
    // so 0.3 means longest path "flies" 20% of radius above the globe
    var scale = 1 + 0.6 * d3.geoDistance(source, target) / Math.PI;

    mid[0] = ctr[0] + (mid[0] - ctr[0]) * scale;
    mid[1] = ctr[1] + (mid[1] - ctr[1]) * scale;

    var result = [projection(source), mid, projection(target)]
    return result;
}

function location_along_arc(start, end, loc) {
    var interpolator = d3.geoInterpolate(start, end);
    return interpolator(loc)
}

function linetransition(path) {
    path.transition()
        .duration(5000)
        .attrTween("stroke-dasharray", function () {
            var len = this.getTotalLength();
            return function (t) {
                return (d3.interpolate('0,' + len, len + ',0'))(t)
            };
        })
}



function transition(plane, route) {
    var l = route.node().getTotalLength();
    plane.transition()
        .duration(5000)
        .attrTween("transform", delta(route.node()));
}

function delta(path) {
    var l = path.getTotalLength();
    return function (i) {
        return function (t) {
            var p = path.getPointAtLength(t * l);
            return "translate(" + p.x + "," + p.y + ")";
        }
    }
}

d3.queue()
    .defer(d3.csv, "./new-data/bases.csv")
    .defer(d3.csv, "./new-data/lilypads.csv")
    .defer(d3.csv, "./new-data/usfunded.csv")
    .defer(d3.json, "https://unpkg.com/world-atlas@1/world/110m.json")
    .defer(d3.request, "http://lvs-hubou-001.corp.ebay.com/api/network/list")
    // .defer(d3.request, "http://localhost:8008/network/list")
    .await(load);


function load(error, bases, lilypads, usfunded, world, request) {
    if (error) throw error;

    var data = JSON.parse(request.response);
    var cities = data.data;
    var citiesData = getCityData(cities)
    // console.log('===========',cities.data)
    var linksData = getLineData(cities)
    var countries = topojson.feature(world, world.objects.countries).features;

    //globe world
    svg.append("g")
        .attr("id", "globegroup")
        .append("path")
        .datum(sphere)
        .attr("class", "world")
        .attr("id", "sphere")
        .attr("fill", "url(#gradient)")
        .attr("stroke-opacity", 0.01)
        .attr("z-index", 100)
        .on("click", function () {
            stopGlobe()
        })

    //city
    svg.selectAll(".country")
        .data(countries)
        .enter().insert("path")
        .attr("class", "countries")
        .attr("class", "world")
        .attr("id", function (d) { return d.id; })
        .attr("fill", "#000")
        .attr("filter", "url(#sofGlow)")
        .attr("stroke", "#3c3c3c")
        .attr("stroke-width", "3px")
        .on("click", function (d) {
            (function transition() {
                stopGlobe()
                // if (active.node() === this) return reset();
                // active.classed("active", false);
                // active = d3.select(this).classed("active", true);
                var currentScale = projection.scale();
                var b = path.bounds(d);
                var nextScale = currentScale * 1 / Math.max((b[1][0] - b[0][0]) / (width / 2), (b[1][1] - b[0][1]) / (height / 2));

                d3.transition()
                    .duration(2500)
                    .tween("rotate", function () {
                        // console.log('---daaddada')
                        var p = d3.geoCentroid(d)
                        var r = d3.interpolate(projection.rotate(), [-p[0], -p[1]]);
                        var s = d3.interpolate(currentScale, nextScale);

                        return function (t) {
                            projection.rotate(r(t))
                                .scale(currentScale > nextScale ? s(Math.pow(t, 0.1)) : s(Math.pow(t, 2)));
                            reproject()
                        };
                    })
            })();
        })
    //return countrycodesDict[d.id];


    svg.append("g").attr("class", "flyers")
        .selectAll("path").data(linksData)
        .enter().append("path")
        .attr("class", "flyer")
        .attr("d", function (d) { return swoosh(flying_arc(d)) })
        .attr("id", function (d) {
            // console.log(22)
            return d.id
        })
        // .call(linetransition)
        .transition()
        .duration(0)
        .on("start", function repeat() {
            d3.active(this)
                .transition()
                .duration(5000)
                .attrTween("stroke-dasharray", function () {

                    // stroke-dasharray
                    // console.log('------dd-node----',this.parentNode.getElementsByTagName("path")[0])
                    var len = this.getTotalLength();
                    return function (t) {
                        return d3.interpolateString("0," + len, len + "," + len)(t)
                    };
                    // var path = this.parentNode.getElementsByTagName("path")[0];
                    // var l = path.getTotalLength();
                    // return function(t) {
                    //     var p = path.getPointAtLength(t * l);
                    //     return "translate(" + p.x + "," + p.y + ")";
                    // };

                })
                .on("start", repeat)
        })

    svg.selectAll("path").on('mouseover', (e) => {
        var id = e.id
        cities.forEach((city) => {
            if (id == city.id) {
                renderCard(city)
            }
        })
    })


    //city marker
    svg.selectAll(".usfunded")
        .data(citiesData)
        .enter().append("circle")
        .attr("fill", "url(#image)")
        .attr("r", 10)
        .attr("id", function (d) {
            return d.id
        })

    svg.append("g").selectAll("text")
        .data(citiesData)
        .enter()
        .append("text")
        .attr("class", "label")
        .text(function (d) {
            return d.properties.name
        })
    labels()
    // svg.selectAll(".base")
    //     .data(bases)
    //     .enter().append("circle")
    //     .attr("stroke", "red")
    //     .attr("fill", "#fff")
    //     .attr("r", 5.5)
    //     .append("title")
    //     .text(function(d) { return "Base: " + d.name });

    // svg.select("#USA")
    //     .attr("stroke", "#000")
    //     .attr("stroke-width", 2);

    // var scaleChangeTest = 1
        function zoomClick(){
            zoom.scaleBy(svg, 1.1); // 执行该方法后 会触发zoom事件
            let tran = d3.zoomTransform(svg.node());
            svg.attr("transform", `translate(${tran.x},${tran.y}),scale(${tran.k})`); // 您可以手动地更新
         
        }



    $("*").on("dblclick", function () {
        zoom.scaleBy(svg, 0.9); // 执行该方法后 会触发zoom事件
        let tran = d3.zoomTransform(svg.node());
        svg.attr("transform", `translate(${tran.x},${tran.y}),scale(${tran.k})`); // 您可以手动地更新
     
        // console.log('1212', zoom)
        // if (scale > 600) {
        //     scaleChangeTest =-1
        // }
        // if (scale < -1500) {
        //     scaleChangeTest =1
        //      scale = 0;
        // }
        // else{
        //     scale = scale + scaleChangeTest * originalScale;
        // }
        // scale = 4000
        // console.log('scale', scale)
        // projection.scale(scale);
        // previousScaleFactor =  scaleFactor = d3.event.transform.k;
        // console.log(323)
         // console.log(tran);
    });


    function clickEvent(d) {

        zoomClick();

        var id = d.id;
        console.log('i...d', id)
        let tempCity
        cities.forEach((city) => {
            if (id == city.id) {
                tempCity = city;
                renderCardLocation(city)
            }
        })
        if (checkLoadDevice(tempCity.id)) return
        loadDevice.push(tempCity.id)
        RequestGet('/network/list?mainDevice=' + tempCity.device, (err, result) => {
            var data = result.data;
            cities = cities.concat(data)
            svg.selectAll(".usfunded")
                .data(getCityData(data))
                .enter().append("circle")
                .attr("fill", "url(#image)")
                .attr("r", 8)
                .attr("id", function (d) {
                    return d.id
                })
                .append("title")
                .text(function (d) { return "US Funded: " + d.name });

            var routes = getLineData(data);
            svg.selectAll("circle")
                .on("click", function (d) {
                    // console.log('')
                    clickEvent(d)
                })

            svg.append("g").selectAll("text")
                .data(getCityData(data))
                .enter()
                .append("text")
                .attr("class", "label cityName")
                .text(function (d) {
                    return d.properties.name
                })

            // console.log(result)
            svg.append("g").attr("class", "flyers")
            var routes = getLineData(data);
            // console.log(routes)

            // console.log(result)
            svg.append("g").attr("class", "flyers")
                .selectAll("path").data(routes)
                .enter().append("path")
                .attr("class", "flyer")
                .attr("d", function (d) { return swoosh(flying_arc(d)) })
                .attr("id", function (d) {
                    return d.id
                }).on('mouseover', (e) => {
                    var id = e.id
                    // console.log('id', id)
                    cities.forEach((city) => {
                        if (id == city.id) {
                            renderCard(city)
                        }
                    })
                })
                .call(linetransition)
            reproject()
        })
    }




    PointEvent();
    function PointEvent() {
        svg.selectAll("circle")
            .on("click", function (d) {
                clickEvent(d)
            })
    }



    reproject();

    // Zoom and pan set-up

    var zoom = d3.zoom()
        .scaleExtent([0.5, 4])
        .on("zoom", zoomed)

    d3.select("svg").call(zoom);

    var previousScaleFactor = 1;

    function zoomed() {
        if (d3.event.sourceEvent) {
            var event = d3.event.sourceEvent.type;
            if (event === "wheel") {

                scaleFactor = d3.event.transform.k;
                scaleChange = scaleFactor - previousScaleFactor;
                scale = scale + scaleChange * originalScale;
                console.log('scale', scale)
                projection.scale(scale);
                previousScaleFactor = scaleFactor;

            }
            reproject();
        }

    }

}

function labels() {
    var centerPos = projection.invert([width / 2, height / 2]);
    // var arc = d3.geo.greatArc();
    svg.selectAll("text")
        .attr("transform", function (d) {
            var loc = projection(d.geometry.coordinates),
                x = loc[0],
                y = loc[1];
            var offset = 5;
            return "translate(" + (x + offset) + "," + (y - 3) + ")"
        })
        .style("display", function (d) {
            var lon = d.geometry.coordinates[0]
            var lat = d.geometry.coordinates[1]
            var d = d3.geoDistance([lon, lat], centerPos);
            return (d > 1.57) ? 'none' : 'inline';
        });
}


d3.geoInertiaDrag(svg, reproject);

function reproject() {
    var c = projection.rotate().slice(0, 2).map(d => -d)

    d3.selectAll("circle")
        .attr("transform", function (d) {
            var lon = d.geometry.coordinates[0];
            var lat = d.geometry.coordinates[1];
            return "translate(" + projection([lon, lat]) + ")";
        })
        .attr("opacity", function (d) {
            // clipAngle(90)
            var lon = d.geometry.coordinates[0];
            var lat = d.geometry.coordinates[1];
            return d3.geoDistance([+lon, +lat], c) < Math.PI / 2 ? 1 : 0;
        })

    d3.selectAll(".world").attr("d", path);

    d3.selectAll(".flyer")
        .attr("d", function (d) { return swoosh(flying_arc(d)) })
        .attr("opacity", function (d) {
            var centerPos = projection.invert([width / 2, height / 2]);
            var coord1 = d.geometry.coordinates[0];
            var coord2 = d.geometry.coordinates[1];

            var start_dist = 1.57 - d3.geoDistance(coord1, centerPos);
            var end_dist = 1.57 - d3.geoDistance(coord2, centerPos);
            var fade = d3.scaleLinear().domain([-.1, 0]).range([0, .1])
            var dist = start_dist < end_dist ? start_dist : end_dist;

            return fade(dist)
        })
    // .call(linetransition)
    labels()
    // d3.selectAll(".flyer").attr("d", path)
}


