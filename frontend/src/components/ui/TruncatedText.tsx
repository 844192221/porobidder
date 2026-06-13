import { Tooltip } from 'antd';
import type { CSSProperties, ElementType } from 'react';

type TruncatedTextProps = {
  text: string;
  as?: ElementType;
  className?: string;
  style?: CSSProperties;
};

const ellipsisStyle: CSSProperties = {
  display: 'block',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  minWidth: 0,
  maxWidth: '100%',
};

export function TruncatedText({ text, as: Tag = 'span', className, style }: TruncatedTextProps) {
  return (
    <Tooltip title={text} placement="topLeft" mouseEnterDelay={0.35}>
      <Tag className={className} style={{ ...ellipsisStyle, ...style }}>
        {text}
      </Tag>
    </Tooltip>
  );
}
