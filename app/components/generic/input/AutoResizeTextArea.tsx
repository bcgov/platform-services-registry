'use client';

import classnames from 'classnames';
import React, { useEffect, useRef } from 'react';

interface AutoResizeTextAreaProps {
  id?: string;
  value: string;
  className?: string;
}

export default function AutoResizeTextArea({ id, value, className = '' }: AutoResizeTextAreaProps) {
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textAreaRef.current) {
      textAreaRef.current.style.height = 'auto';
      textAreaRef.current.style.height = `${textAreaRef.current.scrollHeight}px`;
    }
  }, [value]);

  if (!value) return null;

  return (
    <textarea
      ref={textAreaRef}
      id={id}
      className={classnames(
        'border-none bg-transparent resize-none outline-none w-full font-inherit text-inherit p-0 overflow-hidden',
        className,
      )}
      value={value}
      readOnly
    />
  );
}
