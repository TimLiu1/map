var title = d3.select("h1");
var notesP = d3.select("#notes");
var notes = d3.select("h2");

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

var sphere = {type: "Sphere"};

var graticule = d3.geoGraticule();





        var space = d3.geoAzimuthalEquidistant()
            .translate([width / 2, height / 2])


        var spacePath = d3.geoPath()
            .projection(space)
            .pointRadius(1);

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

var curvePro = d3.geoOrthographic()
    .translate(translation)
    .clipAngle(90)
    .scale(300)
    .rotate([-80, -35]);

var path = d3.geoPath()
    .projection(projection);

var swoosh = d3.line()
    .x(function(d) { return d[0] })
    .y(function(d) { return d[1] })
    .curve(d3.curveCardinal);

function flying_arc(pts) {
    var source = pts.geometry.coordinates[0],
        target = pts.geometry.coordinates[1];

    var mid = projection(location_along_arc(source, target, .5));
    var ctr = projection.translate();

    // max length of a great circle arc is π,
    // so 0.3 means longest path "flies" 20% of radius above the globe
    var scale = 1 + 0.3 * d3.geoDistance(source,target) / Math.PI;

    mid[0] = ctr[0] + (mid[0]-ctr[0])*scale;
    mid[1] = ctr[1] + (mid[1]-ctr[1])*scale;

    var result = [ projection(source), mid, projection(target) ]
    return result;
}

function location_along_arc(start, end, loc) {
    var interpolator = d3.geoInterpolate(start,end);
    return interpolator(loc)
}

function linetransition(path) {
    path.transition()
        .duration(5000)
        .attrTween("stroke-dasharray", function () {
            var len = this.getTotalLength();
            return function(t) {
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
    return function(i) {
        return function(t) {
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
    .defer(d3.request,"http://lvs-hubou-001.corp.ebay.com/api/network/list")
    .await(load);


function load(error, bases, lilypads, usfunded, world, request) {
    if (error) throw error;

    var data = JSON.parse(request.response);
    var cities = data.data;
    var citiesData = [];
    // console.log('===========',cities.data)
    for (var i = 0; i < cities.length; i++) {
        // console.log('there------',cities[i])
        if (cities[i].city != null) {
            citiesData.push(
                {
                    "id": cities[i].id,
                    "type": "Feature",
                    "properties": { "name": cities[i].city },
                    "geometry": {
                        "type": "Point",
                        "coordinates": [cities[i].longitude, cities[i].latitude]
                    }
                })
        }
    }

    var linksData = [];
    cities.forEach(function (e,i,value) {
        if( e.city !== null){
            linksData.push({
                "id": e.id,
                "type": "Feature",
                "geometry": { "type": "LineString",
                    "coordinates": [[e.longitude,e.latitude],[e.MainLongitude,e.MainLatitude]] }})
        }
    })
    var countries = topojson.feature(world, world.objects.countries).features;
    // grid = graticule();

    // var swoosh = d3.line()
    //     .x(function(d) { return d[0] })
    //     .y(function(d) { return d[1] })
    //     .curve()
    //     .tension(.0);

    // var swoosh = d3.line()
    //     .x(function(d) { return d[0] })
    //     .y(function(d) { return d[1] })
    //     .curve(d3.curveCardinal)
    //     .tension(.0);

    //globe world
    svg.append("g")
        .attr("id", "globegroup")
        .append("path")
        .datum(sphere)
        .attr("class", "world")
        .attr("id", "sphere")
        .attr("fill", "url(#gradBlue)")
        .attr("stroke", "green")
        .attr("stroke-width", 30)
        .attr("stroke-opacity",0.01)
        .attr("z-index", 100)


    

    //city
    svg.selectAll(".country")
        .data(countries)
        .enter().insert("path")
        .attr("class", "countries")
        .attr("class", "world")
        .attr("id", function (d) { return d.id; })
        .attr("fill", "#000")
        .attr("stroke", "#3c3c3c")
        .attr("stroke-width","3px")
        .append("title")
        .text(function(d) {
            // console.log(d);
        }); //return countrycodesDict[d.id];

    // var swoosh = d3.svg.line()
    //     .x(function(d) { return d[0] })
    //     .y(function(d) { return d[1] })
    //     .interpolate("cardinal")
    //     .tension(.0);

    // var swoosh = d3.line()
    //     .x(function(d) { return d[0] })
    //     .y(function(d) { return d[1] })
    //     .curve(d3.curveCardinal);

    //city connection
    svg.append("g").attr("class","flyers")
        .selectAll("path").data(linksData)
        .enter().append("path")
        .attr("class","flyer")
        // .attr("d", path)
        .attr("d", function(d) {return swoosh(flying_arc(d))})
        .call(linetransition)

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

    // svg.selectAll(".lilypad")
    //     .data(lilypads)
    //     .enter().append("circle")
    //     .attr("fill", "red")
    //     .attr("r", 4)
    //     .append("title")
    //     .text(function(d) { return "Lilypad: " + d.name });

    //city marker
    svg.selectAll(".usfunded")
        .data(citiesData)
        .enter().append("circle")
        .attr("fill", "red")
        .attr("r", 2.5)
        .append("title")
        .on('click', function () {//选择所有的点添加点击事件
            console.log(12)
            var id = $(this).attr('id');
            cities.forEach((city)=>{
                if(id == city.id){
                    renderCardLocation(city)
                }
            })
        })
        .text(function(d) { return "US Funded: " + d.name });

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

    // svg.selectAll("circle")
    //     .on("click", function(d) {
    //         title.html(d.name + ", " + d.country);
    //         notes.html("Notes");
    //         notesP.html(d.notes);
    //
    //     })

    reproject();

    // Zoom and pan set-up

    var zoom = d3.zoom()
        .scaleExtent([0.5, 4])
        .on("zoom", zoomed)

    d3.select("svg").call(zoom);

    var previousScaleFactor = 1;

    function zoomed() {
        // var dx = d3.event.sourceEvent.movementX;
        // var dy = d3.event.sourceEvent.movementY;
        console.log('------haa------',d3.event)
        var event = d3.event.sourceEvent.type;

        if (event === "wheel") {

            scaleFactor = d3.event.transform.k;
            scaleChange = scaleFactor - previousScaleFactor;
            scale = scale + scaleChange * originalScale;
            projection.scale(scale);
            previousScaleFactor = scaleFactor;

        }

        reproject();

    } // zoomed()

} // load()

d3.geoInertiaDrag(svg, reproject);

function reproject() {
    var c = projection.rotate().slice(0,2).map(d => -d)

    d3.selectAll("circle")
        .attr("transform", function(d) {
            var lon = d.geometry.coordinates[0];
            var lat = d.geometry.coordinates[1] ;
            return "translate(" + projection([lon,lat]) + ")";})
        .attr("opacity", function(d){
            // clipAngle(90)
            var lon = d.geometry.coordinates[0];
            var lat = d.geometry.coordinates[1] ;
            return d3.geoDistance([+lon,+lat], c) < Math.PI/2 ? 1 : 0;
        })

    d3.selectAll(".world").attr("d", path);

    d3.selectAll(".flyer")
        .attr("d", function(d) {return swoosh(flying_arc(d))})
        .attr("opacity", function(d) {
            var centerPos = projection.invert([width/2,height/2]);
            var coord1 = d.geometry.coordinates[0];
            var coord2 = d.geometry.coordinates[1];

            var start_dist = 1.57 - d3.geoDistance(coord1, centerPos);
            var end_dist = 1.57 - d3.geoDistance(coord2, centerPos);
            var fade = d3.scaleLinear().domain([-.1,0]).range([0,.1])
            var dist = start_dist < end_dist ? start_dist : end_dist;

            return fade(dist)
    })
    // d3.selectAll(".flyer").attr("d", path)
}
var velocity = .02;

d3.timer(function(elapsed) {
    projection.rotate([velocity * elapsed, 0]);
    reproject()
});


// d3.timer(function () {
// })
