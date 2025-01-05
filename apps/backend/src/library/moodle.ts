import { MoodleClient } from "moodle-api";
import type { FunctionDefinition } from "moodle-api";
import { z } from "zod";
import { config } from "../config";

export class Moodle {
  private client: MoodleClient;

  constructor(token: string) {
    this.client = new MoodleClient(config.moodle.url, token);
  }

  static zCourseType = z.enum(["inprogress", "past", "future"]);

  async call<F extends keyof FunctionDefinition | (string & {})>(
    func: F,
    ...params: F extends keyof FunctionDefinition
      ? [FunctionDefinition[F][0]] | []
      : [Record<string, unknown>]
  ): Promise<
    | [
        F extends keyof FunctionDefinition ? FunctionDefinition[F][1] : unknown,
        null,
      ]
    | [null, { message: string }]
  > {
    try {
      const res = await this.client.call(
        func,
        ...(params as F extends keyof FunctionDefinition
          ? Record<never, never> extends FunctionDefinition[F][0]
            ? []
            : [FunctionDefinition[F][0]]
          : [Record<string, unknown>]),
      );

      return [
        res as F extends keyof FunctionDefinition
          ? FunctionDefinition[F][1]
          : unknown,
        null,
      ];
    } catch (err: any) {
      return [null, { message: err.message }];
    }
  }
}
