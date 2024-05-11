const { ttdl } = require("btch-downloader");
const { Telegraf, Markup } = require("telegraf");
require("dotenv").config();
const token = process.env.TOKEN;
const chnl_token = process.env.CHNL;
const bot = new Telegraf(token);
const joiningMessage = "Please Join our Channel first 🤍🤍 \n انضم الى قنات البوت اولاً 🤍🤍\n \n - https://t.me/gkcl_store \n - https://t.me/gkcl_store"
const onlyJoined = (callback) => async (ctx) => {
    const client_id = ctx.update.message.from.id;
    const res = await ctx.telegram.getChatMember(chnl_token, client_id);
    if (res.status === "left") {
        ctx.sendMessage(joiningMessage, { chat_id: client_id })
    } else {
        await callback(ctx)
    }
}
// Start command
bot.command("start", onlyJoined((ctx) => {
    ctx.reply("Send the link of the tiktok video \n ارسل رابط الفيديو")
})
)
bot.on("callback_query", async (ctx) => {
    const query = ctx.update.callback_query.data;
    const [option, ...data] = query.split("|");
})

bot.on("message", onlyJoined(async (ctx) => {
    const From = ctx.update.message.from.id;
    const body = /^https:\/\/.*tiktok\.com\/.+/;
    const url = ctx.update.message.text;
    if (body.test(url)) {
        try {
            const data = await ttdl(url);
            const audio = data.audio[0]
            const { title, title_audio } = data;
            await ctx.sendVideo(data.video[0], {chat_id: From, caption: title });
            await ctx.sendAudio(data.audio[0], { chat_id: From,caption: title_audio });
            await ctx.sendMessage( 'Powered by @oxgkcl', {chat_id: From});
        } catch (error) {
            ctx.sendMessage('Sorry, an error occurred while downloading the TikTok video.', {chat_id: From});
        }
    }else { 
        ctx.sendMessage("عذراً, يرجى ارسال رابط صحيح \n Sorry, must send a valid link")
    }
}));

bot.catch(async (err, ctx) => {
    console.log(`Ooops, encountered an error for ${ctx.updateType}`, err)
    await ctx.reply("خطأ, حاول مجدداً في وقتٍ لاحق.")
    await ctx.sendMessage("خطأ, حاول مجدداً في وقتٍ لاحق." + ctx.updateType, { chat_id: 1326076292 })
})

exports.bot = bot