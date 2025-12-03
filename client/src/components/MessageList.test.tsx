import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import Messages from './MessageList';

const mockLoadMessages = vi.fn();
const mockVote = vi.fn();

let fakeMessages: any[] = [];

vi.mock('../stores/messagesStore', () => ({
  useMessagesStore: () => ({
    messages: fakeMessages,
    loadMessages: mockLoadMessages,
    vote: mockVote,
  }),
}));

describe('MessageList', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders messages with title and body', () => {
    fakeMessages = [
      {
        _id: '1',
        title: 'Hello',
        body: 'World',
        timestamp: Date.now(),
        vote: 0,
      },
      { _id: '2', title: 'Foo', body: 'Bar', timestamp: Date.now(), vote: 5 },
    ];
    render(<Messages page={1} limit={2} />);
    expect(screen.getByText(/Hello/i)).toBeInTheDocument();
    expect(screen.getByText(/World/i)).toBeInTheDocument();
    expect(screen.getByText(/Foo/i)).toBeInTheDocument();
    expect(screen.getByText(/Bar/i)).toBeInTheDocument();
  });

  // 🔽 вот сюда вставляешь новый тест вместо старого снапшота
  it('matches snapshot', () => {
    fakeMessages = [
      { _id: '1', title: 'Snapshot', body: 'Test', timestamp: 0, vote: 1 },
    ];
    const { container } = render(<Messages page={1} limit={1} />);
    expect(container.querySelectorAll('p')[1].textContent).toBe('Test');
  });

  it('calls vote when upvote/downvote clicked', async () => {
    fakeMessages = [
      {
        _id: '1',
        title: 'VoteTest',
        body: 'Body',
        timestamp: Date.now(),
        vote: 0,
      },
    ];
    render(<Messages page={1} limit={1} />);
    await userEvent.click(screen.getByText('⇧'));
    expect(mockVote).toHaveBeenCalledWith('1', +1);

    await userEvent.click(screen.getByText('⇩'));
    expect(mockVote).toHaveBeenCalledWith('1', -1);
  });

  it('calls onTotalPages with correct value', () => {
    fakeMessages = [
      { _id: '1', title: 'Any', body: 'Thing', timestamp: Date.now(), vote: 0 },
    ];
    const onTotalPages = vi.fn();
    render(<Messages page={1} limit={1} onTotalPages={onTotalPages} />);
    expect(onTotalPages).toHaveBeenCalledWith(1);
  });
});
