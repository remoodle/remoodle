import { startApi } from "./services/api";
import { startNotifier } from "./services/notifier";
import { startCrawler } from "./services/crawler";

startApi();
startCrawler();
startNotifier();
