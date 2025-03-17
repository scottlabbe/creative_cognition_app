import React from 'react';
import {
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  ReferenceArea,
  ReferenceLine
} from 'recharts';
import type { CognitiveStyle } from "../types/questions";
import { CreativeTypeIcon } from "./CreativeTypeIcon";

interface StyleGraphProps {
  learningScore: number;
  applicationScore: number;
  cognitiveStyle?: CognitiveStyle;
}

const StyleGraph: React.FC<StyleGraphProps> = ({ 
  learningScore, 
  applicationScore,
  cognitiveStyle = 'intuitive' // Default value if not provided
}) => {
  // Position data for the user's point
  const data = [{
    x: applicationScore, // Matching AssessmentGraph's axis orientation
    y: learningScore,
  }];

  // Function to determine quadrant style
  const getQuadrantStyle = (style: CognitiveStyle) => {
    const isActive = style === cognitiveStyle;
    return {
      fill: isActive ? '#016D77' : '#F0EDD8',
      fillOpacity: isActive ? 0.2 : 0.05,
      stroke: 'none',
    };
  };

  // Custom dot component using CreativeTypeIcon
  const CustomDot = (props: any) => {
    const { cx, cy } = props;
    if (typeof cx !== 'number' || typeof cy !== 'number') return null;

    return (
      <foreignObject
        x={cx - 12}
        y={cy - 12}
        width={24}
        height={24}
      >
        <div className="w-full h-full">
          <CreativeTypeIcon 
            style={cognitiveStyle} 
            size={24}
            className="text-primary" 
          />
        </div>
      </foreignObject>
    );
  };

  return (
    <div className="w-full aspect-square max-w-[300px] sm:max-w-[400px] mx-auto">
      <ResponsiveContainer width="100%" height="100%">
        <ScatterChart
          margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
          style={{ background: '#f6f5ee', borderRadius: '8px' }}
        >
          <XAxis
            type="number"
            dataKey="x"
            domain={[-30, 30]}
            hide={true}
          />
          <YAxis
            type="number"
            dataKey="y"
            domain={[-30, 30]}
            hide={true}
          />

          {/* Quadrant areas - matching orientation from AssessmentGraph */}
          <ReferenceArea 
            x1={0} 
            x2={30} 
            y1={0} 
            y2={30} 
            {...getQuadrantStyle('intuitive')}
          />
          <ReferenceArea 
            x1={-30} 
            x2={0} 
            y1={0} 
            y2={30} 
            {...getQuadrantStyle('deductive')}
          />
          <ReferenceArea 
            x1={-30} 
            x2={0} 
            y1={-30} 
            y2={0} 
            {...getQuadrantStyle('pragmatic')}
          />
          <ReferenceArea 
            x1={0} 
            x2={30} 
            y1={-30} 
            y2={0} 
            {...getQuadrantStyle('conceptual')}
          />

          {/* Axis lines */}
          <ReferenceLine 
            x={0} 
            stroke="#006d77" 
            strokeWidth={2}
          />
          <ReferenceLine 
            y={0} 
            stroke="#006d77" 
            strokeWidth={2}
          />

          {/* Quadrant labels */}
          <foreignObject x="75%" y="75%" width="20%" height="20%">
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-sm font-medium text-gray-700">Conceptual</span>
            </div>
          </foreignObject>
          <foreignObject x="5%" y="75%" width="20%" height="20%">
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-sm font-medium text-gray-700">Pragmatic</span>
            </div>
          </foreignObject>
          <foreignObject x="5%" y="5%" width="20%" height="20%">
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-sm font-medium text-gray-700">Deductive</span>
            </div>
          </foreignObject>
          <foreignObject x="75%" y="5%" width="20%" height="20%">
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-sm font-medium text-gray-700">Intuitive</span>
            </div>
          </foreignObject>

          {/* User's point */}
          <Scatter
            data={data}
            shape={<CustomDot />}
            isAnimationActive={false}
          />
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
};

export default StyleGraph;