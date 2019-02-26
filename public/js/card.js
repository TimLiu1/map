function closeCard() {

}
function hiddenCard() {
    $("#card-container").hide()
}
function renderCardLocation(city) {
    $('#location-title').text(city.city)
    $('#city-title').text(city.city)


}

function renderCard(city) {
    if (city.outBandwithRate == 'null') city.outBandwithRate = 0
    if (city.inBandwithRate == 'null') city.inBandwithRate = 0
    console.log('city', city);
    $('#bandwith').text('Bandwith: ' + Math.ceil(city.bandwith / 1024 / 1024 / 1024) + 'Gbps')
    $('#outBandwithRate').text('' + city.outBandwithRate + 'b/s')
    $('#inBandwithRate').text('' + city.inBandwithRate + 'b/s')
    $('#rate-title').text(city.city)
    $('#rate-title').text(city.mainCity)
    $('#rate-title-final').text(city.city)
    // rate-title-final
    $('#utilization').text('Utilization: ' + (city.outBandwithRate / city.bandwith) * 100 + '%')

}
function change() {
    console.log(23)
    $('#city-title').text('123')

}
setTimeout(() => {
    var initdata = {
        MainLatitude: 1.352083,
        MainLongitude: 103.819836,
        bandwith: 1000000000,
        city: "Shanghai, PRC",
        createdAt: "2019-02-22T08:49:18.000Z",
        device: "pvg0-wr04",
        id: 683246,
        inBandwith: 2286254843,
        inBandwithRate: 1102,
        key: "595",
        latitude: 31.2303904,
        longitude: 121.47370209999995,
        mainCity: "Singapore",
        mainDevice: "sin0-wr01",
        outBandwith: 533594090,
        outBandwithRate: 2656,
        updatedAt: "2019-02-22T08:49:18.000Z"
    }
    renderCard(initdata);
    renderCardLocation(initdata)

}, 1000)