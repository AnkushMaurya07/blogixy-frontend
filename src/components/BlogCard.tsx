type BlogCardProps = {
  title: string;
  content: string;
  authorName: string;
};

export default function BlogCard({ title, content, authorName }: BlogCardProps) {
  return (
    <div className="card h-100 shadow-sm">
      <div className="card-body">
        <h5 className="card-title">{title}</h5>
        <p className="card-text text-muted">{content}</p>
      </div>
      <div className="card-footer bg-white">
        <small className="text-secondary">By {authorName}</small>
      </div>
    </div>
  );
}
