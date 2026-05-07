import { useNotifications } from '../api/hooks';

export default function NotificationsPage() {
  const { data, isLoading } = useNotifications();

  return (
    <div className="container">
      <h2 className="mb-3">Notifications</h2>
      {isLoading && <p>Loading...</p>}
      <div className="list-group">
        {(data ?? []).map((item: any) => (
          <div className="list-group-item" key={item.id}>
            <div className="d-flex justify-content-between">
              <strong>{item.title}</strong>
              <span className="badge text-bg-secondary">{item.is_read ? 'Read' : 'New'}</span>
            </div>
            <div className="text-muted">{item.message}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
