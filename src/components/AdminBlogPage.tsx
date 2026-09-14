import CMSPanel from '../features/blog-cms/CMSPanel';

export default function AdminBlogPage() {
  return <CMSPanel onBack={() => window.history.back()} />;
}
