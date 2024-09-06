import { Composer } from "grammy";
import commands from "../commands";

const commandsHandler = new Composer();

commandsHandler.command("start", commands.start);
commandsHandler.command("deadlines", commands.deadlines);

export default commandsHandler;
