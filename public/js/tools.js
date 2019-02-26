function getCityData(cities) {
    let result = []
    for (var i = 0; i < cities.length; i++) {
        if (cities[i].city != null) {
            result.push(
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
    return result;
}

function getLineData(cities) {
    let result = [];
    cities.forEach(function (e, i, value) {
        if (e.city !== null) {
            result.push({
                "id": e.id,
                "type": "Feature",
                "geometry": {
                    "type": "LineString",
                    "coordinates": [[e.longitude, e.latitude], [e.MainLongitude, e.MainLatitude]]
                }
            })
        }
    })
    return result;
}