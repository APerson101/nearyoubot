"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendQuestion = sendQuestion;
// communicate with the
const axios_1 = __importDefault(require("axios"));
const grammy_1 = require("grammy");
const discord_js_1 = require("discord.js");
const commands = [
    new discord_js_1.SlashCommandBuilder()
        .setName('ask')
        .setDescription('ask anything about the near blockchain, nfts, accounts, etc')
        .addStringOption(option => option.setName('message-content').setRequired(true).setDescription('your NEAR blockchain question'))
];
const client = new discord_js_1.Client({
    intents: [discord_js_1.GatewayIntentBits.Guilds]
});
client.on('ready', () => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    console.log(`Logged in as ${(_a = client.user) === null || _a === void 0 ? void 0 : _a.tag}!`);
    yield ((_b = client === null || client === void 0 ? void 0 : client.application) === null || _b === void 0 ? void 0 : _b.commands.set(commands));
}));
client.on('interactionCreate', (interaction) => __awaiter(void 0, void 0, void 0, function* () {
    if (!interaction.isChatInputCommand())
        return;
    if (interaction.commandName === 'ask') {
        yield interaction.deferReply();
        const response = yield handleQuestionInteraction(interaction);
        yield interaction.followUp({ content: response, ephemeral: true });
    }
}));
client.login(process.env.DISCORD_TOKEN);
let agentURL = process.env.AGENT_URL;
const bot = new grammy_1.Bot(process.env.TELEGRAM_TOKEN);
bot.on("message", (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    console.log(ctx.msg.text);
    const response = yield sendQuestion(ctx.msg.text);
    ctx.reply(response !== null && response !== void 0 ? response : '');
}));
bot.start();
function sendQuestion(question) {
    return __awaiter(this, void 0, void 0, function* () {
        const response = yield axios_1.default.get(agentURL + `/${question}`);
        return response.data;
    });
}
function handleQuestionInteraction(interaction) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        const question = (_a = interaction.options.get('message-content')) === null || _a === void 0 ? void 0 : _a.value;
        if (!question) {
            return "invalid input";
        }
        else {
            return yield sendQuestion(question.toString());
        }
    });
}
