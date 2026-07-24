import { Client, GatewayIntentBits } from 'discord.js';
import { fork } from 'child_process';

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

let processInstance = null;

client.on('ready', () => {
  console.log(`🤖 Discord bot active: ${client.user.tag}`);
});

client.on('messageCreate', (message) => {
  if (message.author.bot) return;

  if (message.content === '!start') {
    if (processInstance) {
      return message.reply('⚠️ السكربت يعمل بالفعل!');
    }

    // تشغيل الملف الرئيسي للسكربت (تأكد من اسم الملف الرئيسي للمشروع مثل index.js)
    processInstance = fork('./index.js');

    message.reply('🚀 تم تشغيل السكربت بنجاح!');

    processInstance.on('exit', (code) => {
      console.log(`Script finished/exited with code: ${code}`);
      processInstance = null;
    });
  }

  if (message.content === '!stop') {
    if (!processInstance) {
      return message.reply('❌ السكربت متوقف حالياً.');
    }

    processInstance.kill();
    processInstance = null;
    message.reply('🛑 تم إيقاف السكربت.');
  }
});

client.login(process.env.DISCORD_TOKEN);

