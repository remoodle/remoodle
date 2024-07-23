import { startApi } from "./services/api/api";
import { startCrawler } from "./services/crawler/crawler";
import { startNotifier } from "./services/notifier/notifier";

startApi();
startCrawler();
startNotifier();
