import { Bot, Middleware } from 'mirai-js'
import { config } from './config'
import { ServiceFactory } from './service'

(async () => {
    const bot = new Bot();
    await bot.open({
        verifyKey: config.verifyKey,
        baseUrl: config.baseUrl,
        qq: config.qq,
    });

    bot.on('GroupMessage', new Middleware()
        .groupFilter(config.groupList, true)
        .atFilter([config.qq], true)
        .textProcessor()
        .done((ctx) => {
            ServiceFactory.createService(ctx.text)?.service(ctx);
        }))
})();