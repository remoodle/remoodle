import { db } from "./database";
import { startApi } from "./services/api/api";
import { startCrawler } from "./services/crawler/crawler";
import { startNotifier } from "./services/notifier/notifier";

startApi(db.messageStream);
startCrawler(db.messageStream);
startNotifier(db.messageStream);
