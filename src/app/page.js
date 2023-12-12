"use client"

import Image from 'next/image'
import React, { useState, useEffect, useRef } from 'react';

const HighlightTextArea = ({ highlightData, origin, onSnippetClick }) => {
  const [text, setText] = useState(origin);
  const highlightsRef = useRef(null);
  const textAreaRef = useRef(null);

  const getHighlightedText = () => {
    const splitText = text.split(new RegExp(`(${highlightData.map(data => data.snippet).join('|')})`, 'gi'));
    return splitText.map((part, index) => {
      const highlight = highlightData.find(data => new RegExp(data.snippet, 'gi').test(part));
      return highlight ? (
        <mark key={index} style={{ background: (index - 1)/2 == onSnippetClick ? highlight.color : 'none', textDecorationColor: highlight.color + " !important", textDecoration: 'underline' }}>
          {part}
        </mark>
      ) : (
        <span key={index}>{part}</span>
      );
    });
  };

  const handleScroll = () => {
    if (highlightsRef.current) {
      highlightsRef.current.scrollTop = textAreaRef.current.scrollTop;
    }
  };

  const handleClick = (e) => {
    const cursorPosition = textAreaRef.current.selectionStart;
    const textUpToCursor = text.substring(0, cursorPosition);
    const lastIndexOfSnippet = highlightData.reduce((lastIndex, data) => {
      const index = textUpToCursor.lastIndexOf(data.snippet);
      return index > lastIndex ? index : lastIndex;
    }, -1);

    if (lastIndexOfSnippet !== -1 && lastIndexOfSnippet + text.substring(lastIndexOfSnippet).indexOf('\n') >= cursorPosition) {
      const clickedData = highlightData.find(data => textUpToCursor.includes(data.snippet));
      if (clickedData) {
        //alert(`Clicked on highlight: ${clickedData.snippet}`);
      }
    }
  };

  return (
    <div className="container relative w-full h-full grow">
      <div
        ref={highlightsRef}
        className="highlights"
        style={{ whiteSpace: 'pre-wrap', wordWrap: 'break-word', overflow: 'hidden', position: 'absolute', zIndex: 1, padding: '10px', width: '100%', height: '100%' }}
      >
        {getHighlightedText()}
      </div>
      <textarea
        ref={textAreaRef}
        value={text}
        onChange={(e) => setText(e.target.value)}
        onClick={handleClick}
        onScroll={handleScroll}
        style={{ whiteSpace: 'pre-wrap', wordWrap: 'break-word',position: 'absolute', zIndex: 2, width: '100%', height: '100%', margin: 0, border: '0px', padding: '10px', fontSize: '16px', resize: 'none', color: 'black', caretColor: 'black', opacity: .5 }}
      />
    </div>
  );
};


const text = "The morning sun peeked through the curtains, casting a warm glow in the room. I usually enjoys a hearty breakfast, it energizes me for the day. Today's breakfast included scrambled eggs and a slice of whole grain toast, accompanied by a cup of freshly brewed coffee. The coffee was rich and aromatic, making the kitchen smell inviting. After breakfast, I decided to take a walk in the nearby park, it's always refreshing. The park was bustling with early risers, joggers, and people walking their dogs.\nAs I walked, I noticed the vibrant flowers, their colors bright against the green backdrop. The roses and tulips were in full bloom, creating a picturesque scene. I saw a small bird, possibly a sparrow, perching on a tree branch. The birds song was melodious, adding to the park's peaceful ambiance. In the distance, children played on the swings, their laughter echoing in the air.\nThe sky was a clear blue, with only a few wispy clouds scattered about. The weather forecast had predicted a sunny day, perfect for outdoor activities. I planned to meet my friend for lunch at our favorite cafe, located just outside the park. We often meet there to catch up and enjoy the cafe's delightful sandwiches and salads.\nOn my way to the cafe, I passed by a small bookstore, its windows displaying an array of books. I remembered that I needed to pick up a new novel, as I had finished my last one. The bookstore was cozy and welcoming, filled with the scent of paper and ink. I browsed through the shelves, eventually selecting a mystery novel that caught my eye.\nAfter purchasing the book, I continued to the cafe, where my friend was already waiting. We greeted each other and ordered our meals, enjoying the cafe's relaxed atmosphere. Our conversation ranged from recent events to plans for the upcoming weekend. We discussed possibly going to the beach, as the weather was expected to remain sunny.\nFollowing lunch, I returned home, feeling content and relaxed. The rest of the day was spent reading my new book and enjoying the tranquility of the afternoon. As the sun began to set, casting a golden light, I reflected on the day's simple pleasures. The evening was quiet, the perfect end to a peaceful day."
export default function Home() {

  const [activeHighlight, setActiveHighlight] = useState(null);

  const handleSnippetClick = (data) => {
    setActiveHighlight(data);
  };

  const highlightData = [
    {
      "snippet": "I usually enjoys a hearty breakfast, it energizes me for the day.",
      "color": "red",
      "reason": "Subject-verb agreement error; change 'enjoys' to 'enjoy'"
    },
    {
      "snippet": "it's always refreshing.",
      "color": "red",
      "reason": "Incorrect conjunction; replace 'it's' with 'which is' for clarity"
    },
    {
      "snippet": "The birds song was melodious,",
      "color": "green",
      "reason": "Possessive error; change 'birds' to 'bird's'"
    },
    {
      "snippet": "The sky was a clear blue, with only a few wispy clouds scattered about.",
      "color": "blue",
      "reason": "Ambiguity; consider 'The sky was clear blue' for conciseness"
    },
    {
      "snippet": "I planned to meet my friend for lunch at our favorite cafe, located just outside the park.",
      "color": "orange",
      "reason": "Redundant information; 'located just outside the park' could be omitted"
    },
    {
      "snippet": "We often meet there to catch up and enjoy the cafe's delightful sandwiches and salads.",
      "color": "blue",
      "reason": "Redundancy; 'delightful' can be omitted for more concise description"
    },
    {
      "snippet": "I passed by a small bookstore, its windows displaying an array of books.",
      "color": "orange",
      "reason": "Redundant description; consider removing 'displaying an array of books'"
    },
    {
      "snippet": "I remembered that I needed to pick up a new novel, as I had finished my last one.",
      "color": "blue",
      "reason": "Verbose; consider shortening to 'I needed a new novel, having finished my last one'"
    },
    {
      "snippet": "The bookstore was cozy and welcoming, filled with the scent of paper and ink.",
      "color": "green",
      "reason": "Descriptive clarity; consider 'The bookstore's cozy and welcoming atmosphere was filled with the scent of paper and ink'"
    },
    {
      "snippet": "The rest of the day was spent reading my new book and enjoying the tranquility of the afternoon.",
      "color": "orange",
      "reason": "Passive voice; consider 'I spent the rest of the day reading my new book and enjoying the afternoon's tranquility'"
    },
    {
      "snippet": "score",
      "reason": "8/10. Try working on passive voice."
    }
  ]  


  return (
    <div className='outline-1'>
      <div className='flex w-screen'>
      <div className='relative h-screen w-full flex justify-center items-center place-items-center place-content-center'>
        <div className='relative shadow-sm h-5/6 w-5/6 rounded-md bg-slate-200/20 pb-2'>
      <HighlightTextArea highlightData={highlightData} origin={text} onSnippetClick={activeHighlight} />
      </div>
      </div>
      <div className='relative h-screen w-full max-w-md flex justify-center items-center place-items-center place-content-center'>
        <div className="h-5/6 w-5/6 overflow-y-scroll">
        {highlightData.map((reason, index)=>(
          <div className={`transition-all rounded-md bg-slate-200/20 p-2 m-2 cursor-pointer shadow-sm ${activeHighlight === index ? 'bg-blue-300 font-bold scale-95' : 'bg-slate-200/20'}`}
          onClick={()=>{setActiveHighlight(index)}}
          >
            <div className='italic'>{reason.snippet}</div>
            <div className='font-light text-sm'>{reason.reason}</div>
            </div>
        ))}
        </div>
      </div>
      </div>
    </div>
  )
}
