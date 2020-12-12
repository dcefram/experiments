const dig = require('node-dig-dns');
const DOMAIN = 'eriehousing.com';

async function digAll() {
  const result = await dig([DOMAIN, 'a']);
  console.log(result);
}

module.exports = digAll;