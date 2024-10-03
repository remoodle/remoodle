import { register } from "./admin-handlers";
import { Composer } from "grammy";
import { ContextWithSession } from "..";
import commands from "./command-handlers";
import callbacks from "./callback-handlers";

const baseHandler = new Composer<ContextWithSession>();

const commandHandler = new Composer<ContextWithSession>();
commandHandler.command("start", commands.start);

const callbackHandler = new Composer<ContextWithSession>();
callbackHandler.callbackQuery("something", callbacks.something);
callbackHandler.callbackQuery("registerFromGroup", callbacks.registerFromGroup);

const registerHandler = new Composer<ContextWithSession>();
registerHandler.command("register", register);

baseHandler.use(registerHandler);
baseHandler.use(commandHandler);
baseHandler.use(callbackHandler);

export default baseHandler;
