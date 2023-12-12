"use client"
import React, { useState, useEffect, useRef } from 'react';

const HighlightTextArea = ({ highlightData }) => {
  const [text, setText] = useState("");
  const [tooltip, setTooltip] = useState({ show: false, content: '', x: 0, y: 0 });
  const highlightsRef = useRef(null);

  useEffect(() => {
    applyHighlights();
  }, [text]);

  const applyHighlights = () => {
    let highlightedText = text;
    highlightData.forEach(data => {
      const regex = new RegExp(data.snippet, 'gi');
      highlightedText = highlightedText.replace(regex, 
        `<mark style="background-color: ${data.color};"
        onmouseover="this.style.cursor='pointer';"
        onmousemove="(event) => { setTooltip({ show: true, content: '${data.snippet}', x: event.clientX, y: event.clientY }) }"
        onmouseout="setTooltip({ show: false, content: '', x: 0, y: 0 })">
        ${data.snippet}
        </mark>`);
    });
    if (highlightsRef.current) {
      highlightsRef.current.innerHTML = highlightedText;
    }
  };

  const handleScroll = (e) => {
    if (highlightsRef.current) {
      highlightsRef.current.scrollTop = e.target.scrollTop;
    }
  };

  const Tooltip = () => (
    <div
      className="tooltip"
      style={{
        display: tooltip.show ? 'block' : 'none',
        position: 'absolute',
        top: `${tooltip.y}px`,
        left: `${tooltip.x}px`,
        backgroundColor: 'white',
        border: '1px solid black',
        padding: '5px',
        zIndex: 10,
      }}
    >
      {tooltip.content}
    </div>
  );

  return (
    <div className="container" style={{ position: 'relative', width: '300px' }}>
      <Tooltip />
      <div
        ref={highlightsRef}
        className="highlights"
        style={{ whiteSpace: 'pre-wrap', wordWrap: 'break-word', overflow: 'hidden', position: 'absolute', zIndex: 1, padding: '10px', width: '100%', height: '200px' }}
      />
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        onScroll={handleScroll}
        style={{ background: 'transparent', position: 'absolute', zIndex: 2, width: '100%', height: '200px', margin: 0, border: '0px', padding: '10px', fontSize: '16px', resize: 'none' }}
      />
    </div>
  );
};