import React from 'react';

import styles from './FloatingControls.module.css';

export interface Props {
  children: React.ReactNode;
}

export function FloatingControls({children}: Props) {
  return <div className={(styles.FloatingControls)}>{children}</div>;
}
