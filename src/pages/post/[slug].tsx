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

  const postContent = post.data.content;
  const postBody = postContent.map(item => RichText.asText(item.body));
  const postWords = postBody.map(item => item.split(/\s+/));

  const totalPostBodyLength = postWords.map(item => item.length);

  const totalPostWords = totalPostBodyLength.reduce((acc, val) => acc + val);
  const timeToRead = Math.round(totalPostWords / 200) + ' min';

  return (
    <div>
      <Header />
      <img src={post.data.banner.url} className={styles.postBanner} />
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
            <FiClock />
            {timeToRead}
          </div>
        </div>
        {post.data.content.map(({ heading, body }) => (
          <div key={heading}>
            {heading && <h2>{heading}</h2>}

            <div
              className={styles.postSection}
              dangerouslySetInnerHTML={{ __html: RichText.asHtml(body) }}
            />
          </div>
        ))}
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
    paths: [
      { params: { slug: 'mapas-com-react-usando-leaflet' } },
      { params: { slug: 'como-utilizar-hooks' } },
    ],
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
      content: response.data.content,
    },
  };

  return {
    props: { post },
  };
};
