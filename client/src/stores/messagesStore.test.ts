import { describe, it, expect } from "vitest";
import { useMessagesStore } from "./messagesStore";

describe("Messages Store", () => {
  it("initializes with default state", () => {
    const state = useMessagesStore.getState();
    expect(state.messages).toEqual([]);
    expect(state.cooldown).toBe(0);
  });
});