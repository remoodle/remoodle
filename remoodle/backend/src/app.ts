import { startApi } from "./api";
import { startNotifier } from "./notifier";
import { startCrawler } from "./crawler";

startApi();
startCrawler();
startNotifier();
