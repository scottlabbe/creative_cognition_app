import React from 'react';

interface FormattedTextProps {
  text: string;
}

const FormattedText: React.FC<FormattedTextProps> = ({ text }) => {
  const [mainParagraph, ...restOfText] = text.split('\n\n');
  
  // Get all points including the first line after main paragraph
  const allPoints = [
    mainParagraph,
    ...(restOfText.length > 0 ? restOfText[0].split('\n') : [])
  ].filter(point => point.trim());

  return (
    <div className="space-y-4">
      {allPoints.length > 0 && (
        <div>
          {/* First point without bullet */}
          <p className="text-muted-foreground">{allPoints[0]}</p>
          
          {/* Remaining points with bullets if any */}
          {allPoints.length > 1 && (
            <ul className="list-disc pl-6 space-y-2 mt-2">
              {allPoints.slice(1).map((point, index) => (
                <li key={index} className="text-muted-foreground">
                  {point}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

export default FormattedText;