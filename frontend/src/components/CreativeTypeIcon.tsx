import React from 'react';
import type { CognitiveStyle } from "../types/questions";

interface Props {
  style: CognitiveStyle;
  size?: number;
  className?: string;
}

export const CreativeTypeIcon: React.FC<Props> = ({ 
  style, 
  size = 48, 
  className = "" 
}) => {
  // Use require for images to avoid TypeScript errors
  const getIconSrc = () => {
    switch (style) {
      case 'intuitive':
        return require('../assets/Icons-3-Intuitive Creative Style.png');
      case 'conceptual':
        return require('../assets/Icons-2-Conceptual Creative Style.png');
      case 'pragmatic':
        return require('../assets/Icons-1-Pragmatic Creative Style.png');
      case 'deductive':
        return require('../assets/Icons-4-Deductive Creative Style.png');
      default:
        return require('../assets/Icons-3-Intuitive Creative Style.png'); // Default fallback
    }
  };

  return (
    <div 
      className={`relative flex items-center justify-center ${className}`}
      style={{ width: `${size}px`, height: `${size}px` }}
    >
      <img
        src={getIconSrc()}
        alt={`${style.charAt(0).toUpperCase() + style.slice(1)} Creator`}
        className="w-full h-full"
        style={{ objectFit: 'contain' }}
      />
    </div>
  );
};

export default CreativeTypeIcon;