import { startServer } from "./services/server";
import { startNotifier } from "./services/notifier";
import { startCrawler } from "./services/crawler";

startServer();
startNotifier();
startCrawler();

//
