import React from 'react';
import './index.css';

type Props = {
  children: React.ReactNode;
};

const ScrollBar = ({ children }: Props) => {
  return (
    <div className="custom-scrollbar-container">
      {children}
    </div>
  );
};

export default ScrollBar;