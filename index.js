// var width  = 950;
// var height = 800;
//
// var colors = { clickable: 'darkgrey', hover: 'grey', clicked: "red", clickhover: "darkred" };
//
// var cities =  [
//     { "type": "Feature", "properties": { "name": "Munich"  },
//         "geometry": { "type": "Point", "coordinates": [ 11.581981, 48.135125 ] } },
//     { "type": "Feature", "properties": { "name": "San Antonio"  },
//         "geometry": { "type": "Point", "coordinates": [ -98.5, 29.4167 ] } },
//     { "type": "Feature", "properties": { "name": "Melbourne"  },
//         "geometry": { "type": "Point", "coordinates": [ 144.963056, -37.813611,  ] } }
// ];
//
// var center = [width/2, height/2];
// // auto rotating
// var time = Date.now()
// var rotate = [0, 0];
// var velocity = [.015, -0];
//
// var projection = d3.geo.orthographic()
//     .scale(220)
//     .translate([width / 2, height / 2])
//     .clipAngle(90)
//     .precision(10);
//
// var sky = d3.geo.orthographic()
//     .scale(300)
//     .translate([width / 2, height / 2])
//     .clipAngle(90)
//     .precision(10);
//
// var scale0 = projection.scale();
// var circle = d3.geo.circle();
//
// var path = d3.geo.path()
//     .projection(projection)
//     .pointRadius(2);
//
// // var graticule = d3.geo.graticule();
// var swoosh = d3.svg.line()
//     .x(function(d) { return d[0] })
//     .y(function(d) { return d[1] })
//     .interpolate("cardinal")
//     .tension(.0);
//
// var map = d3.select("body").append("svg")
//     .attr("width", width)
//     .attr("height", height)
//     .attr("class", "map")
//     // .on("mousedown", mousedown)
//
//
// map.append("defs").append("path")
//     .datum({type: "Sphere"})
//     .attr("id", "sphere")
//     .attr("d", path);
//
// map.append("defs").append("path")
//     .datum({type: "Sphere"})
//     .attr("id", "sphere")
//     .attr("d", path);
//
// map.append("use")
//     .attr("class", "stroke")
//     .attr("xlink:href", "#sphere");
//
// map.append("use")
//     .attr("class", "fill")
//     .attr("xlink:href", "#sphere");
//
// map.append("path")
//     .attr("d", path);
//
// queue()
//     .defer(d3.json, "world-110m.json")
//     .defer(d3.tsv, "world-country-names.tsv")
//     .await(ready);
//
//
// function ready(error, world, names) {
//     if (error) throw error;
//
//     var globe = {type: "Sphere"},
//         land = topojson.feature(world, world.objects.land),
//         countries = topojson.feature(world, world.objects.countries).features,
//         borders = topojson.mesh(world, world.objects.countries, function(a, b) { return a !== b; });
//
//     countries = countries.filter(function(d) {
//         return names.some(function(n) {
//             if (d.id == n.id) return d.name = n.name;
//         });
//     }).sort(function(a, b) {
//         return a.name.localeCompare(b.name);
//     });
//
//     map.insert("path", ".graticule")
//         .datum(topojson.feature(world, world.objects.land))
//         .attr("class", "land")
//         .attr("d", path);
//
//     for(i = 0; i < names.length; i++) {
//         for (j = 0; j < countries.length; j++) {
//             if (countries[j].id == names[i].id) {
//                 map.insert("path", ".graticule")
//                     .datum(countries[j])
//                     .attr("fill", colors.clickable)
//                     .attr("d", path)
//                     .attr("class", "clickable")
//                     .attr("data-country-id", j)
//                     .on("click", function() {
//                         d3.selectAll(".clicked")
//                             .classed("clicked", false)
//                             .attr("fill", colors.clickable);
//                         d3.select(this)
//                             .classed("clicked", true)
//                             .attr("fill", colors.clicked);
//
//                         (function transition() {
//                             d3.select(".clicked").transition()
//                                 .duration(1000)
//                                 .tween("rotate", function() {
//                                     var p = d3.geo.centroid(countries[d3.select(this).attr("data-country-id")]),
//                                         r = d3.interpolate(projection.rotate(), [-p[0], -p[1]]);
//                                     return function (t) {
//                                         projection.rotate(r(t));
//                                         redraw()
//                                     }
//                                 });
//                         })();
//                     })
//                     .on("mousemove", function() {
//                         var c = d3.select(this);
//                         if (c.classed("clicked")) {
//                             c.attr("fill", colors.clickhover);
//                         } else {
//                             c.attr("fill", colors.hover);
//                         }
//                     })
//                     .on("mouseout", function() {
//                         var c = d3.select(this);
//                         if (c.classed("clicked")) {
//                             c.attr("fill", colors.clicked);
//                         } else {
//                             d3.select(this).attr("fill", colors.clickable);
//                         }
//                     });
//             }
//         }
//     }
//
//     map.insert("path", ".graticule")
//         .datum(topojson.mesh(world, world.objects.countries, function(a, b) { return a !== b; }))
//         .attr("class", "boundary")
//         .attr("d", path);
//
//     // cities point and line links!
//     var links = []
//     links.push({
//         type: "LineString",
//         coordinates: [
//             cities[0].geometry.coordinates,
//             cities[1].geometry.coordinates
//         ]
//     })
//
//     map.append('g')
//         .attr("class", "points")
//         .selectAll("path")
//         .data(cities)
//         .enter().append("path")
//         .attr("class", "cityPoint")
//         .attr("d", path);
//
//     map.append('g')
//         .selectAll(".arc")
//         .data(links)
//         .enter()
//         .append("path")
//         .attr("class","arc")
//         .style("fill","none")
//         .attr("d", function(d) {
//             return swoosh(flying_arc(d)) })
//         .style("stroke","#0000ff")
//         .style("stroke-width","2px")
//         .call(linetransition)
//
//     map.append('g')
//         .attr("class","labels")
//         .selectAll("text").data(cities)
//         .enter().append("text")
//         .attr("class", "label")
//         .attr("text-anchor", "start")
//         .text(function (d) {
//             console.log('dd',d.properties.name)
//             return d.properties.name
//         })
//     labels();
//
//     map.call(zoom)
//
//     //drag , Not good, need change the idea and method......?????
//     // d3.select(window)
//     //     .on("mousemove", mousemove)
//     //     .on("mouseup", mouseup);
//
// };
//
// // space
// var space = d3.geo.azimuthalEquidistant()
//     .translate([width / 2, height / 2]);
//
// space.scale(space.scale() * 3);
//
// var spacePath = d3.geo.path()
//     .projection(space)
//     .pointRadius(1);
//
// var starList = createStars(300);
//
// var stars = map.append("g")
//     .selectAll("g")
//     .data(starList)
//     .enter()
//     .append("path")
//     .attr("class", "star")
//     .attr("d", function(d){
//         spacePath.pointRadius(d.properties.radius);
//         return spacePath(d);
//     });
//
// function createStars(number){
//     var data = [];
//     for(var i = 0; i < number; i++){
//         data.push({
//             geometry: {
//                 type: 'Point',
//                 coordinates: randomLonLat()
//             },
//             type: 'Feature',
//             properties: {
//                 radius: Math.random() * 1.5
//             }
//         });
//     }
//     return data;
// }
//
// function randomLonLat(){
//     return [Math.random() * 360 - 180, Math.random() * 180 - 90];
// }
//
// $.ajax({
//     url:"http://lvs-hubou-001.corp.ebay.com/api/network/list",
//     method: 'GET',
//     dataType: 'json',
//     success: function (data) {
//         console.log('success get data')
//         // console.log('---data from api------',data)
//     },
//     error: function (req, error) {
//         // console.log('---req, and error----',req,error)
//     }
//
//
// })
//
// // var lineToLondon = function(d) {
// //     return path({"type": "LineString", "coordinates": [london, d.geometry.coordinates]});
// // }
//
// // zoom
// var zoom = d3.behavior.zoom()
//     .scale(projection.scale())
//     .scaleExtent([200, 800])
//     .on("zoom", zoomed);
// map.call(zoom);
// // functions for zooming
// function zoomed() {
//     var scale = d3.event.scale;
//     projection.scale(scale)
//     redraw();
// }
//
// // function zoomed() {
// //     map.append('g')
// //         .attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
// // }
//
// // var drag = d3.behavior.drag()
// //     .origin(function(d) { return d; })
// //     .on("dragstart", dragstarted)
// //     .on("drag", dragged)
// //     .on("dragend", dragended);
// //
// // function dragstarted() {
// //     d3.event.sourceEvent.stopPropagation();
// //     d3.select(this).classed("dragging", true);
// // }
// // function dragged() {
// //     d3.select(this).attr("cx", d.x = d3.event.x).attr("cy", d.y = d3.event.y);
// //
// // }
// // function dragended() {
// //     d3.select(this).classed("dragging", false);
// // }
//
// // drag
// var drag = d3.behavior.drag()
//     .origin(function () {
//         var r = projection.rotate();
//         return {x: r[0]/0.25, y:-r[1]/0.25}
//     })
//     .on("drag",function () {
//         var r = projection.rotate()
//         projection.rotate([d3.event.x * 0.25, -d3.event.y*0.25, r[2]])
//         //after update the projection, we need redraw the geo globe
//         redraw();
//     })
//
// map.call(drag)
//
// // redraw it when globe changed
// function redraw() {
//     stars.attr("d", function(d){
//         spacePath.pointRadius(d.properties.radius);
//         return spacePath(d);
//     });
//     map.selectAll("path").attr("d", path);
//     map.selectAll(".land").attr("d", path);
//     map.selectAll(".boundary").attr("d", path);
//     map.selectAll(".points").attr("d", path);
//
//     map.selectAll(".arc").attr("d", function(d) {
//         return swoosh(flying_arc(d))
//     }).attr("opacity",function (d) {
//         console.log('---the fade value--',d)
//         return fade(d)
//     })
//     labels();
//
// }
// //label position
// function labels () {
//     var centerPos = projection.invert([width/2,height/2]);
//     var arc = d3.geo.greatArc();
//
//     map.selectAll(".label")
//         .attr("transform", function(d) {
//             var loc = projection(d.geometry.coordinates),
//                 x = loc[0],
//                 y = loc[1];
//             var offset = 5;
//             return "translate(" + (x+offset) + "," + (y-2) + ")"
//         })
//         .style("display",function(d) {
//             var d = arc.distance({source: d.geometry.coordinates, target: centerPos});
//             return (d > 1.57) ? 'none' : 'inline';
//         });
// }
//
// //cities arc fly line
// function flying_arc(pts) {
//     var source = pts.coordinates[0],
//         target = pts.coordinates[1];
//     var mid = (d3.interpolate(source,target))(.5)
//     // console.log('-----the mid valu2----',mid)
//
//     var result = [ projection(source),
//         sky(mid),
//         projection(target)]
//     return result;
// }
//
// // line transition in two marker
// function linetransition(path) {
//     path.transition()
//         .duration(1000)
//         .attrTween("stroke-dasharray", function () {
//             var len = this.getTotalLength();
//             return function(t) {
//                 return (d3.interpolate('0,' + len, len + ',0'))(t)
//             };
//         })
// }
//
// function fade(d) {
//     var center = projection.invert([width/2,height/2]),
//         arc = d3.geo.greatArc(),
//         start, end;
//     start = d.coordinates[0];
//     end = d.coordinates[1];
//
//     var startDist = 1.57 - arc.distance({source: start, target: center}),
//         endDist = 1.57 - arc.distance({source: end, target: center});
//
//     var fa = d3.scale.linear().domain([-.1,0]).range([0,.1])
//     var dist = startDist < endDist ? startDist : endDist
//     return fa(dist)
// }
//
// //function for drag
// // var m0, o0;
// // function mousedown() {
// //     console.log('---there-----')
// //     m0 = [d3.event.pageX, d3.event.pageY];
// //     o0 = projection.rotate();
// //     d3.event.preventDefault();
// // }
// // // var
// // function mousemove() {
// //     if (m0) {
// //         var m1 = [d3.event.pageX, d3.event.pageY]
// //             , o1 = [o0[0] + (m1[0] - m0[0]) / 6, o0[1] + (m0[1] - m1[1]) / 6];
// //         o1[1] = o1[1] > 30  ? 30  :
// //             o1[1] < -30 ? -30 :
// //                 o1[1];
// //         projection.rotate(o1);
// //         map.selectAll("path").attr("d", path);
// //         // sky.rotate(o1);
// //
// //     }
// // }
// //
// // function mouseup() {
// //     if (m0) {
// //         mousemove();
// //         m0 = null;
// //     }
// // }
//
// d3.select(self.frameElement).style("height", height + "px");

$.ajax({
    url:"http://lvs-hubou-001.corp.ebay.com/api/network/list",
    method: 'GET',
    dataType: 'json',
    success: function (data) {
        // console.log('---data from api------',data.data.length)
        var citiesData = []
        var cities = data.data;
        for(var i = 0; i < cities.length ; i++){
                if(cities[i].city !=null){
                    citiesData.push(
                    { "type": "Feature",
                        "properties": { "name": cities[i].city },
                        "geometry": { "type": "Point",
                            "coordinates": [ cities[i].longitude, cities[i].latitude ] } })
                }
            }
        ;(function(w, d3, undefined){
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
                var colors = { clickable: 'darkgrey', hover: 'blue', clicked: "red", clickhover: "darkred" };
                var countryTooltip = d3.select("body").append("div").attr("class","countryTooltip")
                //Add all of the countries to the globe
                d3.json("world-countries.json", function(collection) {
                    features = g.selectAll(".feature").data(collection.features);

                    features.enter().append("path")
                        .attr("class", "feature")
                        .attr("d", function(d){ return path(circle.clip(d)); })
                        .on("click",function () {
                            // console.log('------click- this ooo---',this)
                        //     d3.selectAll(".clicked")
                        //         .classed("clicked", false)
                        //         .attr("fill", colors.clickable);
                        // d3.select(this)
                        //     .classed("clicked", true)
                        //     .attr("fill", colors.clicked);

                        // (function transition() {
                        //     d3.select(".clicked").transition()
                        //         .duration(1000)
                        //         .tween("rotate", function() {
                        //             var p = d3.geo.centroid(countries[d3.select(this).attr("data-country-id")]),
                        //                 r = d3.interpolate(projection.rotate(), [-p[0], -p[1]]);
                        //             return function (t) {
                        //                 projection.rotate(r(t));
                        //                 redraw()
                        //             }
                        //         });
                        // })();
                        })
                        .on("mouseover",function (d) {
                            countryTooltip.text(d.properties.name)
                                .style("left", (d3.event.pageX + 7) + "px")
                                .style("top", (d3.event.pageY - 15) + "px")
                                .style("display", "block")
                                .style("opacity", 1);
                        })
                        .on("mousemove",function (d) {

                            d3.select(this).attr("fill", "darkgrey");

                            countryTooltip.style("left", (d3.event.pageX + 7) + "px")
                                .style("top", (d3.event.pageY - 15) + "px");

                        }).on("mouseout",function () {
                            d3.select(this).attr("fill", "#000000");
                            countryTooltip.style("opacity", 0)
                                .style("display", "none");
                        })
                });
                // cities marker
                devFeatures = point.selectAll(".dev")
                    .data(citiesData);
                devFeatures.enter()
                    .append("path")
                    .attr("class", "dev")
                    .attr("d", function(d) {
                        return path(circle.clip(d));
                    });

                // cities connection
                var linksData = []
                cities.forEach(function (e,i,value) {
                    if( e.city !== null){
                        linksData.push({
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
                    .attr("d",function (d) {
                        return path(circle.clip(d));
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
