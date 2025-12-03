import { describe, it, expect, vi } from 'vitest';
import { useMessagesStore } from './messagesStore';

//checks accesability to the store (it exists, is accesible?)
/*
Access → You can read the Zustand store with useMessagesStore.getState().

Write → You can update the store directly with useMessagesStore.setState(...).

Update votes → Your voteUpdate test showed that you can replace an existing message and change its vote value.

Update list with new messages → Your newMessage test showed that you can prepend a new message, and your messagesUpdate test showed that you can replace the entire list.
*/
/*
Initialization

Store starts with default state (messages = [], cooldown = 0).

Socket listeners

newMessage → adds a new message to the front of the list.

voteUpdate → replaces the updated message in the list.

messagesUpdate → replaces the entire list of messages.

Async actions

loadMessages → fetches from backend and populates messages.

vote → sends the correct request payload (POST, JSON body with delta) to /api/messages/:id/vote.

postMessage →

Success path → sets cooldown = 10.

Error path
*/

describe('Messages Store', () => {
  it('initializes with default state', () => {
    const state = useMessagesStore.getState();
    expect(state.messages).toEqual([]);
    expect(state.cooldown).toBe(0);
  });

  it('handles newMessage socket event', () => {
    const fakeMessage = {
      _id: '1',
      title: 'Test title',
      body: 'Test body',
      timestamp: new Date().toISOString(),
      vote: -987654321,
    };
    //creates new test message - fakeMessage
    useMessagesStore.setState((state) => ({
      messages: [fakeMessage, ...state.messages],
    }));

    //checks - is message created and in store
    const state = useMessagesStore.getState();
    expect(state.messages[0]).toEqual(fakeMessage);
  });

  it('handles voteUpdate', () => {
    //original message
    const originalMessage = {
      _id: '1',
      title: 'Original',
      body: 'Before update',
      timestamp: new Date().toISOString(),
      vote: 0,
    };
    // put the original message into the store
    useMessagesStore.setState({ messages: [originalMessage] });

    //upd message
    const updatedMessage = {
      _id: '1', // same id
      title: 'Original',
      body: 'Before update',
      timestamp: originalMessage.timestamp,
      vote: 5, // changed vote
    };

    useMessagesStore.setState((state) => ({
      messages: state.messages.map((m) =>
        m._id === updatedMessage._id ? updatedMessage : m
      ),
    }));
    const state = useMessagesStore.getState();
    expect(state.messages[0].vote).toBe(5);
  });

  it('handles messagesUpdate socket event', () => {
    // put some initial messages into the store
    const oldMessages = [
      {
        _id: '1',
        title: 'Old',
        body: 'Old body',
        timestamp: new Date().toISOString(),
        vote: 0,
      },
    ];
    useMessagesStore.setState({ messages: oldMessages });

    // define new messages list
    const newMessages = [
      {
        _id: '2',
        title: 'New',
        body: 'New body',
        timestamp: new Date().toISOString(),
        vote: 10,
      },
      {
        _id: '3',
        title: 'Another',
        body: 'Another body',
        timestamp: new Date().toISOString(),
        vote: 20,
      },
    ];

    // simulate messagesUpdate event
    useMessagesStore.setState({ messages: newMessages });

    // check that the store now contains only the new messages
    const state = useMessagesStore.getState();
    expect(state.messages).toEqual(newMessages);
  });

  // functions in the store that talk to the backend using fetch
  it('loads messages from backend', async () => {
    // fake response data that the backend would normally return
    const fakeMessages = [
      {
        _id: '1',
        title: 'Loaded',
        body: 'From backend',
        timestamp: new Date().toISOString(),
        vote: 0,
      },
    ];

    // mock fetch so it returns our fakeMessages instead of calling the real backend
    globalThis.fetch = vi.fn(
      () =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(fakeMessages),
        }) as any
    );

    // call the async action in the store
    await useMessagesStore.getState().loadMessages();

    // verify that the store was updated with the fakeMessages
    const state = useMessagesStore.getState();
    expect(state.messages).toEqual(fakeMessages);
  });

  // Sends a request to the backend to update a message’s vote count.
  it('sends a vote request to the backend with correct payload', async () => {
    // put a message in the store so voting makes sense contextually
    useMessagesStore.setState({
      messages: [
        {
          _id: '1',
          title: 'Vote target',
          body: 'Body',
          timestamp: new Date().toISOString(),
          vote: 0,
        },
      ],
    });

    // desired vote change (e.g., +1 or -1)
    const messageId = '1';
    const delta = 1;

    // mock fetch to simulate a successful backend response
    const fetchMock = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      } as any)
    );
    globalThis.fetch = fetchMock;

    // call the async vote action (adjust signature if your store differs)
    await useMessagesStore.getState().vote(messageId, delta);

    // assert fetch was called
    expect(fetchMock).toHaveBeenCalledTimes(1);

    // inspect the call arguments
    const [url, options] = fetchMock.mock.calls[0] as unknown as [
      string,
      RequestInit,
    ];

    // check endpoint (adjusted to match actual store implementation)
    expect(url).toContain(`/api/messages/${messageId}/vote`);

    // verify that the request sets the Content-Type header to application/json
    // this line ensures your store is telling the backend “I’m sending JSON data”.
    expect(options.method).toBe('POST');
    expect((options.headers as Record<string, string>)['Content-Type']).toBe(
      'application/json'
    );

    // body should carry only delta, since id is in the URL
    const body = JSON.parse(options.body as string);
    expect(body).toEqual({ delta });
  });

  //successful test of send message
  it('sets cooldown to 10 on successful postMessage', async () => {
    // mock fetch to simulate a successful backend response (pretend server accepted the message)
    const fetchMock = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      } as any)
    );
    globalThis.fetch = fetchMock;

    // call postMessage with a fake title and body
    await useMessagesStore
      .getState()
      .postMessage('Test title. Hello world', 'Test body. This is the body');

    // after success, cooldown should be set to 10
    const state = useMessagesStore.getState();
    expect(state.cooldown).toBe(10);
  });

  //error test of send message
  it('sets cooldown to 5 on error postMessage', async () => {
    // mock fetch to simulate a failed backend response with "Please wait 5s" error
    const fetchMock = vi.fn(() =>
      Promise.resolve({
        ok: false,
        json: () => Promise.resolve({ error: 'Please wait 5s' }),
      } as any)
    );
    globalThis.fetch = fetchMock;

    // call postMessage with a fake title and body
    await useMessagesStore
      .getState()
      .postMessage('Test title. Hello world', 'Test body. This is the body');

    // store should parse error and set cooldown to 5
    const state = useMessagesStore.getState();
    expect(state.cooldown).toBe(5);
  });
});
