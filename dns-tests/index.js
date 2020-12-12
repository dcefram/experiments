const dns = require('dns');
const dig = require('node-dig-dns');
const fetch = require('node-fetch');
const https = require('https');
const axios = require('axios');

const DOMAIN = 'eriehousing.com';
const EXPECTED = 'https://www.eriehousing.com'

async function getNSIP() {
  const result = await dig([DOMAIN, 'ns']);

  if (!result.answer || result.answer.length === 0) return;
  const { value: ns } = result.answer[0];

  return new Promise(resolve => {
    dns.lookup(ns, (err, address) => {
      resolve(address);
    });
  });
}

async function follow(protocol, domain, ip) {
  try {
    console.log(`fetching ${protocol + domain}`, ip)

    const response = await axios.get(protocol + domain, {
      host: ip,
      maxRedirects: 0,
      validateStatus(status) {
        return status >= 301 && status <= 302;
      },  
      httpsAgent: new https.Agent({  
        rejectUnauthorized: false
      })
    });

    console.log('response headers', response.headers);
    console.log(`response status: ${response.status}`);

    if (response.headers.location.replace(/\/$/, '') === EXPECTED.replace(/\/$/, '')) {
      console.log('done!');
    } else {
      const [protocol, _domain] = response.headers.location.split('://');
      follow(`${protocol}://`, _domain.replace(/\/$/, ''), ip);
    }

  } catch (error) {
    if (error.response && error.response.status === 200) {
      console.error(`wut. it did not redirect to the expected URL, it went 200 somewhere: ${error.response}`)

      console.log(error.response)
    } else {
      console.log(error.response);
      console.error(error.message)
    }
  }
}

getNSIP().then(ip => follow('http://', DOMAIN, ip));
