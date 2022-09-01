const {InfluxDB} = require('@influxdata/influxdb-client')

// You can generate an API token from the "API Tokens Tab" in the UI
const token = 'hjQeXDby05aSNIYIVhftwABuqgXGTUbLNYUqwYLls_PPT447-m489Lo9uM39fGpwxIh8VT0W3L2LurLo7oZD8g=='
const org = 'MrSinghPersonal'
const bucket = 'sentics'

const client = new InfluxDB({url: 'http://localhost:8086', token: token})

