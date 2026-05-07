import { useState } from 'react';
import { useExploreBlogs, useToggleLike } from '../api/hooks';
import BlogCommentsPanel from '../components/BlogCommentsPanel';

export default function ExplorePage() {
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<'latest' | 'ranking'>('ranking');
  const { data, isLoading, refetch } = useExploreBlogs({ search, sort });
  const toggleLike = useToggleLike();

  return (
    <div className="container">
      <h2 className="mb-3">Explore</h2>
      <div className="row g-2 mb-3">
        <div className="col-md-6">
          <input
            className="form-control"
            placeholder="Search posts"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="col-md-3">
          <select
            className="form-select"
            value={sort}
            onChange={(e) => setSort(e.target.value as 'latest' | 'ranking')}
          >
            <option value="ranking">Top ranked</option>
            <option value="latest">Latest</option>
          </select>
        </div>
        <div className="col-md-3">
          <button className="btn btn-primary w-100" onClick={() => refetch()}>
            Apply
          </button>
        </div>
      </div>
      {isLoading && <p>Loading posts...</p>}
      <div className="row g-3">
        {(data ?? []).map((blog: any) => (
          <div className="col-md-6" key={blog.id}>
            <div className="card h-100">
              <div className="card-body">
                <h5>{blog.title}</h5>
                <p className="text-muted mb-2">{blog.content}</p>
                <div className="small text-secondary mb-2">
                  By {blog.author_name} | Views: {blog.view_count} | Likes: {blog.likes_count} | Comments:{' '}
                  {blog.comments_count}
                </div>
                <button
                  className="btn btn-outline-primary btn-sm"
                  onClick={async () => {
                    await toggleLike.mutateAsync(blog.slug);
                    refetch();
                  }}
                >
                  Toggle Like
                </button>
                <BlogCommentsPanel slug={blog.slug} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
