import React from 'react';
import clsx from 'clsx';
import styles from './styles.module.css';

const FeatureList = [
  {
    title: 'No Fuss',
    description: (
      <>
        Serverless Sharp is built to be deployed by novices and pros
      </>
    ),
  },
  {
    title: 'Serve Modern Formats',
    description: (
      <>
        Serverless Sharp can detect browser support for WEBP and automatically serve it.
      </>
    ),
  },
  {
    title: 'AWS Free-Tier Eligible',
    description: (
      <>
        All services have free tiers available within AWS and can often cover basic deployments entirely.
      </>
    ),
  },
];

function Feature({title, description}) {
  return (
    <div className={clsx('col col--4')}>
      <div className="text--center padding-horiz--md">
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
    </div>
  );
}

export default function HomepageFeatures() {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}
