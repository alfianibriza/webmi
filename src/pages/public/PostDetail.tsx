import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Header from '../../components/Header';
import { getPost } from '../../api';
import { getStorageUrl } from '../../utils';
import type { Post } from '../../types/safe_types';
import Footer from '../../components/Footer';

export default function PostDetail() {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<Post | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!slug) return;

      try {
        const response = await getPost(slug);
        setPost(response.data);
      } catch (error) {
        console.error('Error fetching post:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [slug]);

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('id-ID', options);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-green-main"></div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen pb-10">
        <Header />
        <div className="w-full max-w-md mx-auto mt-6 px-4 text-center">
          <p className="text-gray-500">Berita tidak ditemukan.</p>
          <Link to="/post" className="text-brand-green-main hover:underline mt-4 inline-block">
            ← Kembali ke daftar berita
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen pb-10">
        <Header />

        <div className="w-full max-w-md mx-auto mt-6 px-4">
          {/* Back Button */}
          <Link to="/post" className="inline-flex items-center gap-2 text-brand-green-main hover:underline mb-4 text-sm">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
              <path fillRule="evenodd" d="M7.72 12.53a.75.75 0 0 1 0-1.06l7.5-7.5a.75.75 0 1 1 1.06 1.06L9.31 12l6.97 6.97a.75.75 0 1 1-1.06 1.06l-7.5-7.5Z" clipRule="evenodd" />
            </svg>
            Kembali
          </Link>

          {/* Article */}
          <article className="bg-white rounded-3xl shadow-lg overflow-hidden">
            {/* Image */}
            {post.image && (
              <div className="w-full aspect-video bg-gray-200">
                <img
                  src={getStorageUrl(post.image)}
                  alt={post.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* Content */}
            <div className="p-6">
              <h1 className="text-2xl font-bold text-brand-green-dark mb-2">{post.title}</h1>

              <div className="flex items-center gap-2 text-sm text-gray-400 mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                  <path fillRule="evenodd" d="M6.75 2.25A.75.75 0 0 1 7.5 3v1.5h9V3A.75.75 0 0 1 18 3v1.5h.75a3 3 0 0 1 3 3v11.25a3 3 0 0 1-3 3H5.25a3 3 0 0 1-3-3V7.5a3 3 0 0 1 3-3H6V3a.75.75 0 0 1 .75-.75Zm13.5 9a1.5 1.5 0 0 0-1.5-1.5H5.25a1.5 1.5 0 0 0-1.5 1.5v7.5a1.5 1.5 0 0 0 1.5 1.5h13.5a1.5 1.5 0 0 0 1.5-1.5v-7.5Z" clipRule="evenodd" />
                </svg>
                {formatDate(post.created_at)}
              </div>

              <div
                className="prose prose-sm max-w-none text-gray-700"
                dangerouslySetInnerHTML={{ __html: post.content }}
              />
            </div>
          </article>
        </div>

        <Footer />
      </div>
    </>
  );
}
