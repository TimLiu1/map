
$.ajax({
    url:"http://lvs-hubou-001.corp.ebay.com/api/network/list",
    // url:"http://localhost:8008/network/list",
    method: 'GET',
    dataType: 'json',
    success: function (data) {
        // console.log('---data from api------',data.data.length)
        var citiesData = []
        var cities = data.data;
        for (var i = 0; i < cities.length; i++) {
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
        ; (function (w, d3, undefined) {
            "use strict";

            var width, height;
            function getSize(){
                width = w.innerWidth,
                    height = w.innerHeight;

                if(width === 0 || height === 0){
                    setTimeout(function(){
                        getSize();
                    }, 100);
                }
                else {
                    init();
                }
            }

            function init(){

                //Setup path for outerspace
                var space = d3.geo.azimuthal()
                    .mode("equidistant")
                    .translate([width / 2, height / 2]);

                space.scale(space.scale() * 3);

                var spacePath = d3.geo.path()
                    .projection(space)
                    .pointRadius(1);

                //Setup path for globe
                var projection = d3.geo.azimuthal()
                    .mode("orthographic")
                    .translate([width / 2, height / 2]);

                var scale0 = projection.scale();

                var path = d3.geo.path()
                    .projection(projection)
                    .pointRadius(2);

                //Setup zoom behavior
                var zoom = d3.behavior.zoom(true)
                    .translate(projection.origin())
                    .scale(projection.scale())
                    .scaleExtent([300, 800])
                    .on("zoom", move);

                var circle = d3.geo.greatCircle();

                var svg = d3.select("body")
                    .append("svg")
                    .attr("width", width)
                    .attr("height", height)
                    .append("g")
                    .call(zoom)
                    .on("dblclick.zoom", null);

                //Create a list of random stars and add them to outerspace
                var starList = createStars(2000);

                var stars = svg.append("g")
                    .selectAll("g")
                    .data(starList)
                    .enter()
                    .append("path")
                    .attr("class", "star")
                    .attr("d", function(d){
                        spacePath.pointRadius(d.properties.radius);
                        return spacePath(d);
                    });


                svg.append("rect")
                    .attr("class", "frame")
                    .attr("width", width)
                    .attr("height", height);

                //Create the base globe
                var backgroundCircle = svg.append("circle")
                    .attr('cx', width / 2)
                    .attr('cy', height / 2)
                    .attr('r', projection.scale())
                    .attr('class', 'globe')
                    .attr("filter", "url(#glow)")
                    .attr("fill", "url(#gradBlue)");

                var g = svg.append("g"),
                    features;
                var point = svg.append("g"),
                    devFeatures;

                var label = svg.append("g"),
                    lableFeatures;

                var links = svg.append("g"),
                    linksFeatures;

                //Add all of the countries to the globe
                d3.json("world-countries.json", function(collection) {
                    features = g.selectAll(".feature").data(collection.features);

                    features.enter().append("path")
                        .attr("class", "feature")
                        .attr("d", function(d){ return path(circle.clip(d)); });
                });
                // cities marker
                devFeatures = point.selectAll(".dev")
                    .data(citiesData);
                devFeatures.enter()
                    .append("path")
                    .attr("class", "dev")
                    .on('click', function () {//选择所有的点添加点击事件
                        var id = $(this).attr('id');
                        cities.forEach((city)=>{
                            if(id == city.id){
                                renderCardLocation(city)
                            }
                        })
                    })
                    .attr("d", function (d) {
                        return path(circle.clip(d));
                    }).attr("id", function (d) {
                        return d.id
                    });;

                // cities connection
                var linksData = []
                cities.forEach(function (e,i,value) {
                    if( e.city !== null){
                        linksData.push({
                            "id": e.id,
                            "type": "Feature",
                            "geometry": { "type": "LineString",
                                "coordinates": [[e.longitude,e.latitude],[e.MainLongitude,e.MainLatitude]] }})
                    }
                })
                linksFeatures = links.selectAll("path")
                    .data(linksData)
                linksFeatures.enter()
                    .append("path")
                    .attr("class","arcs")
                    .on('mouseover',() =>{
                        console.log('hello')
                    })
                    .attr("d",function (d) {
                        return path(circle.clip(d));
                    })
                    .on('mouseover', function () {//选择所有的点添加点击事件
                        var id = $(this).attr('id');
                        cities.forEach((city)=>{
                            if(id == city.id){
                                renderCard(city)
                            }
                        })
                    }).attr("id", function (d) {
                        return d.id
                    })
                    .call(linetransition)

                function linetransition(path) {
                path.transition()
                    .duration(1000)
                    .attrTween("stroke-dasharray", function () {
                    var len = this.getTotalLength();
                    return function(t) {
                        return (d3.interpolate('0,' + len, len + ',0'))(t)
                        };
                    })
                }
                //cities label
                lableFeatures = label.selectAll("text")
                    .data(citiesData)

                lableFeatures.enter()
                    .append("text")
                    .attr("class","label")
                    .text(function (d) {
                        return d.properties.name
                    })
                labels()
                function labels () {
                    var centerPos = projection.invert([width/2,height/2]);
                    var arc = d3.geo.greatArc();
                    lableFeatures
                        .attr("transform", function(d) {
                            var loc = projection(d.geometry.coordinates),
                                x = loc[0],
                                y = loc[1];
                            var offset = 5;
                            return "translate(" + (x+offset) + "," + (y-3) + ")"
                        })
                        .style("display",function(d) {
                            var d = arc.distance({source: d.geometry.coordinates, target: centerPos});
                            return (d > 1.57) ? 'none' : 'inline';
                            return 'inline';
                        });
                }
                //Redraw all items with new projections
                function redraw(){
                    features.attr("d", function(d){
                        return path(circle.clip(d));
                    });
                    devFeatures.attr("d", function(d) {
                        return path(circle.clip(d));
                    });
                    lableFeatures.attr("d",function (d) {
                        return path(circle.clip(d));
                    })
                    linksFeatures.attr("d",function (d) {
                        return path(circle.clip(d));
                    })
                    stars.attr("d", function(d){
                        spacePath.pointRadius(d.properties.radius);
                        return spacePath(d);
                    });
                    labels()
                }


                function move() {
                    if(d3.event){
                        var scale = d3.event.scale;
                        var origin = [d3.event.translate[0] * -1, d3.event.translate[1]];

                        projection.scale(scale);
                        space.scale(scale * 3);
                        backgroundCircle.attr('r', scale);
                        path.pointRadius(2 * scale / scale0);

                        projection.origin(origin);
                        circle.origin(origin);

                        //globe and stars spin in the opposite direction because of the projection mode
                        var spaceOrigin = [origin[0] * -1, origin[1] * -1];
                        space.origin(spaceOrigin);
                        redraw();
                    }
                }


                function createStars(number){
                    var data = [];
                    for(var i = 0; i < number; i++){
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

                function randomLonLat(){
                    return [Math.random() * 360 - 180, Math.random() * 180 - 90];
                }
            }

            getSize();

        }(window, d3));
        // return citiesData;
    },
    error: function (req, error) {
        // console.log('---req, and error----',req,error)
        // return []
    }
})
// ;(function(w, d3, undefined){
//     "use strict";
//
//     var width, height;
//     function getSize(){
//         width = w.innerWidth,
//             height = w.innerHeight;
//
//         if(width === 0 || height === 0){
//             setTimeout(function(){
//                 getSize();
//             }, 100);
//         }
//         else {
//             init();
//         }
//     }
//
//     function init(){
//
//         //Setup path for outerspace
//         var space = d3.geo.azimuthal()
//             .mode("equidistant")
//             .translate([width / 2, height / 2]);
//
//         space.scale(space.scale() * 3);
//
//         var spacePath = d3.geo.path()
//             .projection(space)
//             .pointRadius(1);
//
//         //Setup path for globe
//         var projection = d3.geo.azimuthal()
//             .mode("orthographic")
//             .translate([width / 2, height / 2]);
//
//         var scale0 = projection.scale();
//
//         var path = d3.geo.path()
//             .projection(projection)
//             .pointRadius(2);
//
//         //Setup zoom behavior
//         var zoom = d3.behavior.zoom(true)
//             .translate(projection.origin())
//             .scale(projection.scale())
//             .scaleExtent([200, 800])
//             .on("zoom", move);
//
//         var circle = d3.geo.greatCircle();
//
//         var svg = d3.select("body")
//             .append("svg")
//             .attr("width", width)
//             .attr("height", height)
//             .append("g")
//             .call(zoom)
//             .on("dblclick.zoom", null);
//
//         //Create a list of random stars and add them to outerspace
//         var starList = createStars(300);
//
//         var stars = svg.append("g")
//             .selectAll("g")
//             .data(starList)
//             .enter()
//             .append("path")
//             .attr("class", "star")
//             .attr("d", function(d){
//                 spacePath.pointRadius(d.properties.radius);
//                 return spacePath(d);
//             });
//
//
//         svg.append("rect")
//             .attr("class", "frame")
//             .attr("width", width)
//             .attr("height", height);
//
//         //Create the base globe
//         var backgroundCircle = svg.append("circle")
//             .attr('cx', width / 2)
//             .attr('cy', height / 2)
//             .attr('r', projection.scale())
//             .attr('class', 'globe')
//             .attr("filter", "url(#glow)")
//             .attr("fill", "url(#gradBlue)");
//
//         var g = svg.append("g"),
//             features;
//         var point = svg.append('g')
//         // function networkApi() {
//         //     $.ajax({
//         //         url:"http://lvs-hubou-001.corp.ebay.com/api/network/list",
//         //         method: 'GET',
//         //         dataType: 'json',
//         //         success: function (data) {
//         //             console.log('---data from api------',data.data.length)
//         //             var citiesData = []
//         //             var cities = data.data;
//         //             console.log('-------cc ',cities)
//         //             for(var i = 0; i < cities.length ; i++){
//         //                 citiesData.push(
//         //                     { "type": "Feature",
//         //                         "properties": { "name": cities[i].city },
//         //                         "geometry": { "type": "Point",
//         //                                         "coordinates": [ cities[i].longitude, cities[i].latitude ] } }
//         //                 )
//         //             }
//         //             point
//         //             .attr("class", "points")
//         //             .selectAll("path")
//         //             .data(citiesData)
//         //             .enter().append("path")
//         //              .attr("class", "cityPoint")
//         //             .attr("d", function (d) {
//         //                       return path(circle.clip(d));
//         //             });
//         //
//         //
//         //             // return citiesData;
//         //         },
//         //         error: function (req, error) {
//         //             // console.log('---req, and error----',req,error)
//         //             // return []
//         //         }
//         //     })
//         // }
//
//
//         //Add all of the countries to the globe
//         d3.json("world-countries.json", function(collection) {
//             // networkApi()
//             features = g.selectAll(".feature").data(collection.features);
//
//             features.enter().append("path")
//                 .attr("class", "feature")
//                 .attr("d", function(d){ return path(circle.clip(d)); });
//         });
//
//         //Redraw all items with new projections
//         function redraw(){
//             features.attr("d", function(d){
//                 return path(circle.clip(d));
//             });
//             point.attr("d", function (d) {
//                 return path(circle.clip(d));
//             });
//
//             stars.attr("d", function(d){
//                 spacePath.pointRadius(d.properties.radius);
//                 return spacePath(d);
//             });
//         }
//
//
//         function move() {
//             if(d3.event){
//                 var scale = d3.event.scale;
//                 var origin = [d3.event.translate[0] * -1, d3.event.translate[1]];
//
//                 projection.scale(scale);
//                 space.scale(scale * 3);
//                 backgroundCircle.attr('r', scale);
//                 path.pointRadius(2 * scale / scale0);
//
//                 projection.origin(origin);
//                 circle.origin(origin);
//
//                 //globe and stars spin in the opposite direction because of the projection mode
//                 var spaceOrigin = [origin[0] * -1, origin[1] * -1];
//                 space.origin(spaceOrigin);
//                 redraw();
//             }
//         }
//
//
//         function createStars(number){
//             var data = [];
//             for(var i = 0; i < number; i++){
//                 data.push({
//                     geometry: {
//                         type: 'Point',
//                         coordinates: randomLonLat()
//                     },
//                     type: 'Feature',
//                     properties: {
//                         radius: Math.random() * 1.5
//                     }
//                 });
//             }
//             return data;
//         }
//
//         function randomLonLat(){
//             return [Math.random() * 360 - 180, Math.random() * 180 - 90];
//         }
//     }
//
//     getSize();
//
// }(window, d3));
