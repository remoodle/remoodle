import adminCommands from "./admin-handlers";
import { Composer } from "grammy";
import { ContextWithSession } from "..";
import commands from "./command-handlers";
import callbacks from "./callback-handlers";
import { isAdmin } from "../middlewares/isAdmin";
import { isUser } from "../middlewares/isUser";


const baseHandler = new Composer<ContextWithSession>();

const commandHandler = new Composer<ContextWithSession>();
commandHandler.command("start", commands.start);
commandHandler.command("connect",isUser, commands.connect);

const callbackHandler = new Composer<ContextWithSession>();
callbackHandler.callbackQuery("registerFromGroup", callbacks.registerFromGroup);

const adminHandler = new Composer<ContextWithSession>();

adminHandler.command("register",isAdmin, adminCommands.register);

baseHandler.use(adminHandler);
baseHandler.use(commandHandler);
baseHandler.use(callbackHandler);

export default baseHandler;
