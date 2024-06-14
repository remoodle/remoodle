import Redis from "ioredis";
import { config } from "../../config";

Redis.Command.setArgumentTransformer("xadd", (args: any[]) => {
  if (args.length === 3) {
    const argArray = [];

    argArray.push(args[0], args[1]); // Key Name & ID.

    // Transform object into array of field name then value.
    const fieldNameValuePairs = args[2];

    for (const fieldName in fieldNameValuePairs) {
      argArray.push(fieldName, fieldNameValuePairs[fieldName]);
    }

    return argArray;
  }

  return args;
});

const eventsReducer = (result: any[]): Record<string, any>[] => {
  const newResult: Record<string, any>[] = [];
  for (const event of result) {
    const obj: Record<string, any> = {
      id: event[0],
    };

    const fieldNamesValues: any[] = event[1];

    for (let n = 0; n < fieldNamesValues.length; n += 2) {
      obj[fieldNamesValues[n]] = fieldNamesValues[n + 1];
    }

    newResult.push(obj);
  }
  return newResult;
};

Redis.Command.setReplyTransformer("xrange", (result: any) =>
  Array.isArray(result) ? eventsReducer(result) : result
);

Redis.Command.setReplyTransformer("xautoclaim", (result: any) =>
  Array.isArray(result) ? eventsReducer(result[1]) : result
);

Redis.Command.setReplyTransformer("xclaim", (result: any) =>
  Array.isArray(result) ? eventsReducer(result) : result
);

Redis.Command.setReplyTransformer("xreadgroup", (result: any) =>
  Array.isArray(result)
    ? result.reduce(
        (res: Record<string, any>[], stream: any) => [
          // biome-ignore lint/performance/noAccumulatingSpread: <explanation>
          ...res,
          ...eventsReducer(stream[1]).map((event: Record<string, any>) =>
            Object.assign(event, { stream: stream[0] })
          ),
        ],
        []
      )
    : result
);

const redisClient = new Redis(config.redis.uri);

export default redisClient;
