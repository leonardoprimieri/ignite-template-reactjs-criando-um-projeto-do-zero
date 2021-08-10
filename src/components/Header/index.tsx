/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import Image from 'next/image';
import Link from 'next/link';

import styles from './header.module.scss';

export default function Header() {
  return (
    <header className={styles.headerContainer}>
      <Link href="/">
        <a>
          <Image
            src="/logo.svg"
            width="292px"
            height="40px"
            objectFit="contain"
            alt="logo"
          />
        </a>
      </Link>
    </header>
  );
}
