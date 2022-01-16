import { Bot, Middleware } from 'mirai-js'
import { config } from './config'
import { ServiceFactory } from './service'

(async () => {
    try {
        const bot = new Bot()
        await bot.open({
            verifyKey: config.verifyKey,
            baseUrl: config.baseUrl,
            qq: config.qq,
        });

        bot.on('GroupMessage', new Middleware()
            .groupFilter(config.groupList, true)
            .atFilter([config.qq], true)
            .textProcessor()
            .done(async (ctx) => {
                try {
                    await ServiceFactory.createService(ctx.text)?.service(ctx)
                } catch (e) {
                    console.error(e)
                }
            }))
    } catch (e) {
        console.error(e)
    }
})();