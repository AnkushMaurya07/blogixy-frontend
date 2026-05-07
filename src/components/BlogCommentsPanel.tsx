import { useState } from 'react';
import { useBlogComments, useCreateComment } from '../api/hooks';

type BlogCommentsPanelProps = {
  slug: string;
};

export default function BlogCommentsPanel({ slug }: BlogCommentsPanelProps) {
  const [content, setContent] = useState('');
  const commentsQuery = useBlogComments(slug);
  const createComment = useCreateComment(slug);

  return (
    <div className="mt-3">
      <h6 className="mb-2">Comments</h6>
      <div className="mb-2">
        {(commentsQuery.data ?? []).slice(0, 3).map((comment: any) => (
          <div className="small border rounded p-2 mb-1" key={comment.id}>
            <strong>{comment.user_name}:</strong> {comment.content}
          </div>
        ))}
      </div>
      <div className="input-group input-group-sm">
        <input
          className="form-control"
          value={content}
          placeholder="Add comment"
          onChange={(e) => setContent(e.target.value)}
        />
        <button
          className="btn btn-outline-secondary"
          onClick={async () => {
            if (!content.trim()) {
              return;
            }
            await createComment.mutateAsync(content);
            setContent('');
          }}
        >
          Post
        </button>
      </div>
    </div>
  );
}
