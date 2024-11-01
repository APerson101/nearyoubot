// communicate with the
import axios from 'axios';
import { Bot, InlineKeyboard } from "grammy";

import {
    REST,
    Routes,
    GatewayIntentBits,
    Client,
    Interaction,
    BaseInteraction,
    ApplicationCommandOption,
    ChatInputCommandInteraction, ApplicationCommand, SlashCommandBuilder,
} from 'discord.js';

const commands = [
    new SlashCommandBuilder()
        .setName('ask')
        .setDescription('ask anything about the near blockchain, nfts, accounts, etc')
        .addStringOption(option=>option.setName('message-content').setRequired(true).setDescription('your NEAR blockchain question'))
    ];
const client = new Client({
    intents: [GatewayIntentBits.Guilds]
});

client.on('ready', async() => {
    console.log(`Logged in as ${client.user?.tag}!`);
    await client?.application?.commands.set(commands);
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;

    if (interaction.commandName === 'ask') {
        await interaction.deferReply();
        const response=await handleQuestionInteraction(interaction);
        await interaction.followUp({content:response, ephemeral: true});
    }
});

client.login(process.env.DISCORD_TOKEN);
let agentURL = process.env.AGENT_URL;


const bot = new Bot(process.env.TELEGRAM_TOKEN);
bot.on("message",async (ctx) => {
    console.log(ctx.msg.text)
    const response=await sendQuestion(ctx.msg.text)
    ctx.reply(response??'')});
bot.start();



export async function sendQuestion(question: string): Promise<string|undefined> {
    const response = await axios.get(agentURL + `/${question}`);
    return response.data
}

async function handleQuestionInteraction(interaction:ChatInputCommandInteraction) {
    const question = interaction.options.get('message-content')?.value;
    if (!question) {
        return "invalid input"
    } else {
        return await sendQuestion(question.toString())
    }
}