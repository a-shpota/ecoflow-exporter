const {RestClient} = require('@ecoflow-api/rest-client');

const { createServer } = require('node:http');

async function getMetricsResponse(params) {
    const client = new RestClient({
        accessKey: params.accessKey,
        secretKey: params.secretKey,
        host: params.host
    })

    const plainDevices = await client.getDevicesPlain();

    let response = '';

    /**
     * metric names with type counter
     */
    const counter = [];

    for (const devicePlain of plainDevices.data) {
        const metrics = {
            ecoflow_online: devicePlain.online,
        };

        const props = (await client.getDevicePropertiesPlain(devicePlain.sn)).data;

        Object.entries(props).filter(([propName, value]) => {
            return typeof value === 'number'
        }).forEach(([propName, value]) => {
            metrics[`ecoflow_${transformName(propName)}`] = value;
        });

        response += Object.entries(metrics).reduce((res, [metricName, metricValue]) => {
            return res
                + `\n# TYPE ${metricName} ` + (counter.includes(metricName) ? 'counter' : 'gauge')
                + `\n${metricName}{device="${devicePlain.sn}"} ${metricValue}`;
        }, '')
    }

    return response;
}

function transformName(ecoflowName) {
    return ecoflowName.split('.').map(val => val.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`)).join('_');
}


const hostname = '0.0.0.0';
const port = process.env.EXPORTER_PORT || 9091;
const params = {
    accessKey: process.env.EXPORTER_ACCESS_KEY,
    secretKey: process.env.EXPORTER_SECRET_KEY,
    host: process.env.EXPORTER_HOST || "https://api-e.ecoflow.com"
};
const server = createServer((req, res) => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/plain');
    getMetricsResponse(params).then((response) => {
        res.end(response);
    })

});
server.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
});



