import { v4 as uuidv4 } from 'uuid';
import soap from 'soap';
import fs from 'fs';

export default async function DataServiceClient(action, args) {
  let url = 'http://schemas.kvk.nl/contracts/kvk/dataservice/catalogus/2015/02/KVK-KvKDataservice.wsdl';

  let client = await soap.createClientAsync(url);

  let uu = uuidv4();

  client.setEndpoint('https://webservices.preprod.kvk.nl/postbus2'); // pre production
  // client.setEndpoint('https://webservices.kvk.nl/postbus2'); // production
  client.addSoapHeader(`<wsa:Action Id="_2">http://es.kvk.nl/${action}</wsa:Action>`);
  client.addSoapHeader(`<wsa:MessageID Id="_3">uuid:${uu}</wsa:MessageID>`);
  client.addSoapHeader(`<wsa:To Id="_4">http://es.kvk.nl/KVK-DataservicePP/2015/02</wsa:To>`); // pre production
  // client.addSoapHeader(`<wsa:To Id="_4">http://es.kvk.nl/KVK-Dataservice/2015/02</wsa:To>`); // production

  let privateKey = fs.readFileSync('./keys/server.key');
  let publicKey = fs.readFileSync('./keys/mayersoftwaredevelopment_nl.crt');
  let wsSecurity = new soap.WSSecurityCert(privateKey, publicKey);

  client.setSecurity(wsSecurity);

  client.setSSLSecurity(new soap.ClientSSLSecurity('./keys/server.key', './keys/mayersoftwaredevelopment_nl.crt'));

  let result = await client[`${action}Async`](args);
  return result;
}
