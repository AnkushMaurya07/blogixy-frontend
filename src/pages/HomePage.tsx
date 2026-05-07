import BlogCard from '../components/BlogCard';
import { useBlogs } from '../api/hooks';

export default function HomePage() {
  const { data, isLoading } = useBlogs();

  if (isLoading) {
    return <div className="container">Loading blogs...</div>;
  }

  return (
    <div className="container">
      <h2 className="mb-3">Home</h2>
      <div className="row g-3">
        {(data ?? []).map((blog: any) => (
          <div className="col-md-6 col-lg-4" key={blog.id}>
            <BlogCard title={blog.title} content={blog.content} authorName={blog.author_name} />
          </div>
        ))}
      </div>
    </div>
  );
}
