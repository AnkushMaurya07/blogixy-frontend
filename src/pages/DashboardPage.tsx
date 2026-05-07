import { useState } from 'react';
import { useAnalytics, useCreateBlog, useCreateShareLink, useUploadBlogMedia } from '../api/hooks';

export default function DashboardPage() {
  const [form, setForm] = useState({ title: '', content: '', is_published: true });
  const [mediaType, setMediaType] = useState<'image' | 'video'>('image');
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [shareUrl, setShareUrl] = useState('');
  const createBlogMutation = useCreateBlog();
  const uploadMediaMutation = useUploadBlogMedia();
  const shareMutation = useCreateShareLink();
  const analyticsQuery = useAnalytics();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const createdBlog = await createBlogMutation.mutateAsync(form);
    if (mediaFile) {
      await uploadMediaMutation.mutateAsync({
        blogId: createdBlog.id,
        file: mediaFile,
        mediaType,
      });
    }
    const share = await shareMutation.mutateAsync(createdBlog.slug);
    setShareUrl(share.public_url);
    setForm({ title: '', content: '', is_published: true });
    setMediaFile(null);
  };

  return (
    <div className="container" style={{ maxWidth: 720 }}>
      <h2 className="mb-3">Dashboard</h2>
      <div className="row g-2 mb-3">
        <div className="col-md-4">
          <div className="card card-body py-2">
            <small className="text-secondary">My Posts</small>
            <strong>{analyticsQuery.data?.total_posts ?? 0}</strong>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card card-body py-2">
            <small className="text-secondary">Total Views</small>
            <strong>{analyticsQuery.data?.total_views ?? 0}</strong>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card card-body py-2">
            <small className="text-secondary">Total Likes</small>
            <strong>{analyticsQuery.data?.total_likes ?? 0}</strong>
          </div>
        </div>
      </div>
      <div className="card card-body">
        <h5 className="mb-3">Create Blog</h5>
        <form onSubmit={submit}>
          <input
            className="form-control mb-2"
            placeholder="Blog title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />
          <textarea
            className="form-control mb-2"
            rows={5}
            placeholder="Blog content"
            value={form.content}
            onChange={(e) => setForm({ ...form, content: e.target.value })}
          />
          <div className="form-check mb-3">
            <input
              id="published"
              type="checkbox"
              className="form-check-input"
              checked={form.is_published}
              onChange={(e) => setForm({ ...form, is_published: e.target.checked })}
            />
            <label className="form-check-label" htmlFor="published">
              Publish immediately
            </label>
          </div>
          <select
            className="form-select mb-2"
            value={mediaType}
            onChange={(e) => setMediaType(e.target.value as 'image' | 'video')}
          >
            <option value="image">Image</option>
            <option value="video">Video</option>
          </select>
          <input
            type="file"
            className="form-control mb-3"
            onChange={(e) => setMediaFile(e.target.files?.[0] ?? null)}
          />
          <button className="btn btn-success" type="submit">
            Create Blog
          </button>
        </form>
        {shareUrl && (
          <div className="alert alert-info mt-3 mb-0">
            Share link: <a href={shareUrl}>{shareUrl}</a>
          </div>
        )}
      </div>
    </div>
  );
}
