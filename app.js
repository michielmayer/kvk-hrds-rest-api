import DataServiceClient from './DataServiceClient';
import { promises as fsp } from 'fs';
import Koa from 'koa';
import Router from '@koa/router';
import logger from 'koa-logger';

const APP_PORT = 4040;

const app = new Koa();
var router = new Router();
app.use(logger());

router.get('/', (ctx, next) => {
  ctx.body = 'REST/JSON version of HR Dataservice';
});

router.get('/api/:kvkNummer', async (ctx, next) => {
  let args = {
    kvkNummer: ctx.params.kvkNummer, // '90004426', // '90000021'
    // klantreferentie: 'Mayer Software Developement',
  };
  try {
    ctx.body = await fsp.readFile(`./cache/${args.kvkNummer}.json`, 'utf8');
    return;
  } catch (error) {
    console.log('not in cache: ', args.kvkNummer);
  }

  try {
    let result = await DataServiceClient('ophalenInschrijving', args);
    // await fsp.writeFile('./tmp2.xml', result[3], 'utf8');
    // await fsp.writeFile('./tmp2.json', JSON.stringify(result[2]), 'utf8');
    if (result[0].meldingen.fout) {
      ctx.status = 404;
      ctx.body = { message: result[0].meldingen.fout[0].omschrijving };
      return;
    }
    if (result[0].meldingen.informatie[0].code !== 'IPD0000') {
      ctx.status = 404;
      ctx.body = { message: result[0].meldingen.informatie[0].omschrijving };
      return;
    }

    ctx.body = result[0].product.maatschappelijkeActiviteit;
    await fsp.writeFile(
      `./cache/${args.kvkNummer}.json`,
      JSON.stringify(result[0].product.maatschappelijkeActiviteit),
      'utf8'
    );
  } catch (error) {
    console.log(error.message);
    ctx.status = 500;
    ctx.body = error.message;
  }
});

app.use(router.routes()).use(router.allowedMethods());

app.listen(APP_PORT, () => {
  console.log(`App is now running on http://localhost:${APP_PORT}`);
});
