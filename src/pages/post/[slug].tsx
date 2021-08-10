/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { GetStaticPaths, GetStaticProps } from 'next';

import { getPrismicClient } from '../../services/prismic';
import Prismic from '@prismicio/client';

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';
import Header from '../../components/Header';
import { FiCalendar, FiClock, FiUser } from 'react-icons/fi';
import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import { useRouter } from 'next/router';
import { RichText } from 'prismic-dom';

interface Post {
  first_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  post: Post;
}

export default function Post({ post }: PostProps) {
  const { isFallback } = useRouter();

  if (isFallback) {
    return <div>Carregando...</div>;
  }

  return (
    <div>
      <Header />
      <div
        className={styles.postBanner}
        style={{
          background: `url(${post.data.banner.url})`,
          backgroundPosition: 'center center',
          backgroundSize: 'cover',
          backgroundRepeat: 'no-repeat',
        }}
      />
      <section className={`${commonStyles.container} ${styles.post}`}>
        <h1>{post.data.title}</h1>

        <div className={styles.postInfo}>
          <div className={styles.postInfoItem}>
            <FiCalendar />
            {post.first_publication_date}
          </div>
          <div className={styles.postInfoItem}>
            <FiUser />
            {post.data.author}
          </div>
          <div className={styles.postInfoItem}>
            <FiClock />6 min
          </div>
        </div>
      </section>
    </div>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient();
  await prismic.query([Prismic.predicates.at('document.type', 'posts')], {
    fetch: [
      'posts.title',
      'posts.subtitle',
      'posts.author',
      'posts.banner',
      'posts.content',
    ],
  });

  return {
    paths: [{ params: { slug: 'mapas-com-react-usando-leaflet' } }],
    fallback: 'blocking',
  };
};

export const getStaticProps: GetStaticProps = async ctx => {
  const prismic = getPrismicClient();
  const { slug } = ctx.params;

  const response = await prismic.getByUID('posts', String(slug), {});

  const post = {
    first_publication_date: format(
      new Date(response.first_publication_date),
      'd MMM yyyy',
      {
        locale: ptBR,
      }
    ),
    data: {
      title: response.data.title,
      banner: {
        url: response.data.banner.url,
      },
      author: response.data.author,
      content: [response.data.content],
    },
  };

  console.log(JSON.stringify(post, null, 2));

  return {
    props: { post },
  };
};
