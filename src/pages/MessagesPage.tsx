import { useState } from 'react';
import { useFollowUser, useMessages, useSendMessage, useUsers } from '../api/hooks';

export default function MessagesPage() {
  const [search, setSearch] = useState('');
  const [selectedUserId, setSelectedUserId] = useState<number | undefined>();
  const [message, setMessage] = useState('');

  const usersQuery = useUsers(search);
  const messagesQuery = useMessages(selectedUserId);
  const followMutation = useFollowUser();
  const sendMutation = useSendMessage();

  return (
    <div className="container">
      <h2 className="mb-3">Messages & Friends</h2>
      <div className="row g-3">
        <div className="col-md-4">
          <div className="card card-body">
            <input
              className="form-control mb-3"
              placeholder="Search users"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <div className="list-group">
              {(usersQuery.data ?? []).map((user: any) => (
                <button
                  key={user.id}
                  className="list-group-item list-group-item-action d-flex justify-content-between align-items-center"
                  onClick={() => setSelectedUserId(user.id)}
                >
                  <span>{user.username}</span>
                  <span
                    className="btn btn-outline-success btn-sm"
                    onClick={async (e) => {
                      e.stopPropagation();
                      await followMutation.mutateAsync(user.id);
                    }}
                  >
                    Follow
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="col-md-8">
          <div className="card card-body">
            <div className="mb-3" style={{ minHeight: 240 }}>
              {(messagesQuery.data ?? []).map((item: any) => (
                <div key={item.id} className="border rounded p-2 mb-2">
                  <strong>{item.sender_name}</strong>
                  <div>{item.content}</div>
                </div>
              ))}
            </div>
            <div className="input-group">
              <input
                className="form-control"
                value={message}
                placeholder="Type a message"
                onChange={(e) => setMessage(e.target.value)}
              />
              <button
                className="btn btn-primary"
                onClick={async () => {
                  if (!selectedUserId || !message.trim()) {
                    return;
                  }
                  await sendMutation.mutateAsync({ receiver: selectedUserId, content: message });
                  setMessage('');
                  messagesQuery.refetch();
                }}
              >
                Send
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
