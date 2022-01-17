import { Bot, Message } from "mirai-js";
import { ChatBot, ChatBotFactory } from "./chat"; './chat'
import { config } from './config'
import fs from 'fs/promises'
import path from 'path'

interface MiraiJSContext {
    bot: Bot
}

export abstract class Service {
    protected constructor() { }
    abstract getStartWith(): string
    abstract service(data: MiraiJSContext | any): Promise<void>

}

class ImageService extends Service {
    protected constructor() { super() }
    static instance: Service | null = null;
    private get miraiconsoleImageRoot(): string {
        return config.miraiconsoleImageRoot
    }
    private get processImageRoot(): string {
        return config.processImageRoot
    }
    static getInstance(): Service {
        if (!ImageService.instance) {
            ImageService.instance = new ImageService()
        }
        return ImageService.instance
    }
    getStartWith(): string {
        return "涩图"
    }

    async service(data: MiraiJSContext | any): Promise<void> {
        const imageList = await fs.readdir(this.processImageRoot)
        const image = imageList[Math.floor(Math.random() * imageList.length)]

        await data.bot.sendMessage({
            group: data.sender?.group?.id,
            message: new Message().addImagePath(path.join(this.miraiconsoleImageRoot, image))
        })

    }
}


class ChatService extends Service {
    protected constructor() { super() }
    static instance: Service | null = null
    private chatBot: ChatBot | null = ChatBotFactory.createChatBot(config.whichBot as 'Turing' | 'MoLi')
    static getInstance(): Service {
        if (!ChatService.instance) {
            ChatService.instance = new ChatService()
        }
        return ChatService.instance
    }

    getStartWith(): string {
        return ""
    }

    async service(data: MiraiJSContext | any): Promise<void> {
        await data.bot.sendMessage({
            group: data.sender?.group?.id,
            message: await this.chatBot?.chat(data.text, data.sender?.id)
        })
    }

    checkBot(which: 'MoLi' | 'Turing'): void {
        if (which == 'MoLi') {
            this.chatBot = ChatBotFactory.createChatBot('MoLi')
        } else if (which == 'Turing') {
            this.chatBot = ChatBotFactory.createChatBot('Turing')
        } else {
            throw new Error('不支持的机器人')
        }
    }

}

class checkBotService extends Service {
    protected constructor() { super() }
    static instance: Service | null = null
    static getInstance(): Service {
        if (!checkBotService.instance) {
            checkBotService.instance = new checkBotService()
        }
        return checkBotService.instance
    }
    getStartWith(): string {
        return "/check"
    }
    async service(data: MiraiJSContext | any): Promise<void> {
        try {

            const which = data.text.trim().match(/^\/check\s+(\w+)/)?.[1]
                ;
            (ChatService.getInstance() as ChatService).checkBot(which as 'MoLi' | 'Turing')
            await data.bot.sendMessage({
                group: data.sender?.group?.id,
                message: new Message().addText(`已切换至 ${which}`)
            })
        } catch (e) {
            await data.bot.sendMessage({
                group: data.sender?.group?.id,
                message: new Message().addText('不支持的机器人')
            })
        }
    }
}

export class ServiceFactory {
    private static serviceList: Service[] = [checkBotService.getInstance(), ImageService.getInstance(), ChatService.getInstance()]
    static createService(text: string): Service | null {
        for (let service of this.serviceList) {
            if (text.trim().startsWith(service.getStartWith().trim())) {
                return service
            }
        }
        return null;
    }
}