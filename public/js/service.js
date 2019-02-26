
let host = "http://localhost:8008";
// let host = "http://lvs-hubou-001.corp.ebay.com/api";
        // url:"http://lvs-hubou-001.corp.ebay.com/api/network/list",

function RequestGet(url, cb) {
    $.ajax({
        url: host + url,
        method: 'GET',
        dataType: 'json',
        success: function (data) {
            cb(null,data)
        }
    })
}