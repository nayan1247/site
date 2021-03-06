const CIO = require('customerio-node')
const apiKey = process.env.CUSTOMER_IO_API_KEY
const siteId = process.env.CUSTOMER_IO_SITE
const cio = new CIO(siteId, apiKey);

module.exports.identify = function (event, context, callback) {
  const body = JSON.parse(event.body)

  console.log('identify body', body)

  if (!body.id) {
    return callback(new Error('[400] No id supplied'));
  }

  if (!body.email) {
    return callback(new Error('[400] No email supplied'));
  }

  let data = {}

  if (body.first_name) {
    data.first_name = body.first_name
  }

  if (body.last_name) {
    data.last_name = body.last_name
  }

  if (body.email) {
    data.email = body.email
  }

  if (body.created_at) {
    // must be unix timestamp
    data.created_at = body.created_at
  }

  if (body.trackingDisabled === true || body.trackingDisabled === false) {
    data.trackingDisabled = body.trackingDisabled
  }

  if (body.company){
    data.company = body.company
  }

  if (body.location){
    data.location = body.location
  }

  if (body.picture) {
    data.picture = body.picture
  }

  if (body.frameworkId) {
    data.frameworkId = body.frameworkId
  }

  cio.identify(body.id, data).then((d) => {
    console.log('[Identify]', body.id)
    console.log(data)
    return callback(null, {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*', // Required for CORS support to work
        'Access-Control-Allow-Credentials': true // Required for cookies, authorization headers with HTTPS
      },
      body: JSON.stringify(d),
    });
  }).catch(function(error) {
    // failure
    console.log(error)
  });
}

module.exports.track = function (event, context, callback) {
  let body
  // We need to support the API Gateway format and the SNS message format during the swap.
  if (event.Records && event.Records[0] && event.Records[0].Sns && event.Records[0].Sns.Message) {
    body = JSON.parse(event.Records[0].Sns.Message)
  } else if (event.body) {
    body = JSON.parse(event.body)
  }

  if (event.Records && event.Records[0]) {
    console.log('FROM SNS EVENT')
  }

  const email = body.email
  console.log('track body', body)

  if (!body.id) {
    return callback(new Error('[400] No id supplied'));
  }

  if (!body.email) {
    return callback(new Error('[400] No email supplied'));
  }

  if (!body.event) {
    return callback(new Error('[400] No event supplied'));
  }

  let customerIOData = {
    name: body.event,
  }

  if (body.data) {
    customerIOData.data = body.data
  }

  cio.track(body.id, customerIOData).then((d) => {
    console.log(`[${body.id}]: ${body.event}`, body.data)
    return callback(null, {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*', // Required for CORS support to work
        'Access-Control-Allow-Credentials': true // Required for cookies, authorization headers with HTTPS
      },
      body: JSON.stringify(d),
    });
  }).catch(function(error) {
    // failure
    console.log(error)
  });

}
